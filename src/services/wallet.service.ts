import { SecretNetworkClient, toBase64, toUtf8 } from 'secretjs'
import { FeeGrantStatus } from 'types/FeeGrantStatus'
import { Nullable } from 'types/Nullable'
import {
  allTokens,
  batchQueryCodeHash,
  batchQueryContractAddress,
  debugModeOverride,
  faucetURL,
  sleep
} from 'utils/commons'
import { Chain, SECRET_CHAIN_ID, SECRET_LCD, Token } from 'utils/config'
import { WalletAPIType } from 'types/WalletAPIType'
import BigNumber from 'bignumber.js'
import { QueryAllBalancesResponse } from 'secretjs/dist/grpc_gateway/cosmos/bank/v1beta1/query.pb'
import { IbcService } from './ibc.service'
import { BatchQueryParsedResponse, batchQuery } from '@shadeprotocol/shadejs'
import { useUserPreferencesStore } from 'store/UserPreferences'
import { GetBalanceError } from 'types/GetBalanceError'
import { TokenBalances } from 'types/TokenBalances'
import { NotificationService } from './notification.service'

const connectKeplr = async (lcd: string, chainID: string) => {
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  while (!window.keplr || !window.getEnigmaUtils || !window.getOfflineSignerOnlyAmino) {
    await sleep(50)
  }

  await window.keplr.enable(chainID)
  window.keplr.defaultOptions = {
    sign: {
      preferNoSetFee: true,
      disableBalanceCheck: true,
      preferNoSetMemo: false
    }
  }

  const keplrOfflineSigner = window.getOfflineSignerOnlyAmino(chainID)
  const accounts = await keplrOfflineSigner.getAccounts()

  const walletAddress = accounts[0].address

  const secretjs: SecretNetworkClient = new SecretNetworkClient({
    url: lcd,
    chainId: chainID,
    wallet: keplrOfflineSigner,
    walletAddress,
    encryptionUtils: window.getEnigmaUtils(chainID)
  })

  window.wallet = window.keplr

  return { walletAddress, secretjs }
}

const connectLeap = async (lcd: string, chainID: string) => {
  while (!window.leap || !window.leap.getEnigmaUtils || !window.leap.getOfflineSignerOnlyAmino) {
    await sleep(50)
  }

  await window.leap.enable(chainID)

  const wallet = window.leap.getOfflineSignerOnlyAmino(chainID)
  const [{ address: walletAddress }] = await wallet.getAccounts()

  const secretjs: SecretNetworkClient = new SecretNetworkClient({
    url: lcd,
    chainId: chainID,
    wallet,
    walletAddress,
    encryptionUtils: window.leap.getEnigmaUtils(chainID)
  })

  window.wallet = window.leap

  return { walletAddress, secretjs }
}

const connectWallet = async (
  walletAPIType: WalletAPIType = 'keplr',
  lcd: string = SECRET_LCD,
  chainID: string = SECRET_CHAIN_ID
) => {
  let walletAddress: string
  let secretNetworkClient: SecretNetworkClient
  if (walletAPIType === 'leap') {
    ;({ walletAddress, secretjs: secretNetworkClient } = await connectLeap(lcd, chainID))
  } else {
    ;({ walletAddress, secretjs: secretNetworkClient } = await connectKeplr(lcd, chainID))
  }
  return { walletAddress, secretjs: secretNetworkClient }
}

const requestFeeGrantService = async (feeGrantStatus: FeeGrantStatus, walletAddress: String) => {
  const { debugMode } = useUserPreferencesStore.getState()
  let newFeeGrantStatus: FeeGrantStatus = feeGrantStatus

  if (feeGrantStatus === 'success') {
    if (debugMode || debugModeOverride) {
      console.log('User requested Fee Grant. Fee Grant has already been granted. Therefore doing nothing...')
    }
  } else {
    try {
      const result = await (await fetch(`${faucetURL}/${walletAddress}`)).json()
      if (result?.feegrant) {
        newFeeGrantStatus = 'success'
        NotificationService.notify(`Successfully sent new fee grant (0.05 SCRT) to address ${walletAddress}`, 'success')
      } else {
        console.error(result?.error)
        newFeeGrantStatus = 'fail'
        NotificationService.notify(
          `Fee Grant for address ${walletAddress} failed with status code: ${result.status}`,
          'error'
        )
      }
    } catch (error) {
      console.error(error)
      newFeeGrantStatus = 'fail'
      NotificationService.notify(`Fee Grant for address ${walletAddress} failed with error: ${error}`, 'error')
    }
  }
  return newFeeGrantStatus
}

const setWalletViewingKey = async (token: string) => {
  if (!window.keplr && !window.leap) {
    console.error('Wallet not present')
    return
  }
  await window.wallet.suggestToken(SECRET_CHAIN_ID, token)
}

const getWalletViewingKey = async (token: string): Promise<Nullable<string>> => {
  const { debugMode } = useUserPreferencesStore.getState()

  if (!window.keplr && !window.leap) {
    console.error('Wallet not present')
    return null
  }
  try {
    return await window.wallet?.getSecret20ViewingKey(SECRET_CHAIN_ID, token)
  } catch (error) {
    if (debugMode || debugModeOverride) {
      console.debug('Error in getWalletViewingKey', error)
    }
    return null
  }
}

const isViewingKeyAvailable = async (token: Token) => {
  const key = await getWalletViewingKey(token.address)
  return key ? true : false
}

const getBatchsTokenBalance = async (
  secretNetworkClient: any,
  walletAddress: string,
  tokens: Token[],
  debugMode: boolean = false
): Promise<Nullable<Map<Token, string>>> => {
  if (!secretNetworkClient) {
    return null
  }

  const viewingKeys = new Map<Token, string>()
  const balances = new Map<Token, string>()

  let validTokens: Token[] = []

  // Collect valid tokens and viewing keys
  for (const token of tokens) {
    const key = await getWalletViewingKey(token.address)

    if (!key) {
      viewingKeys.set(token, 'viewingKeyError')
      balances.set(token, 'viewingKeyError')
      continue
    }

    if (debugMode || debugModeOverride) {
      console.log(`Found viewing key: ${key} for token ${token.name}`)
    }
    viewingKeys.set(token, key)
    validTokens.push(token)
  }

  // Prepare batch queries for valid tokens
  const queries = validTokens.map((token) => ({
    id: token.address,
    contract: {
      address: token.address,
      codeHash: token.code_hash
    },
    queryMsg: {
      balance: { address: walletAddress, key: viewingKeys.get(token) }
    }
  }))

  // Execute batch query
  let batchQueryResults: BatchQueryParsedResponse
  try {
    batchQueryResults = await batchQuery({
      contractAddress: batchQueryContractAddress,
      codeHash: batchQueryCodeHash,
      queries: queries,
      lcdEndpoint: SECRET_LCD,
      batchSize: 12
    })
  } catch (error) {
    console.error('Error executing batch query: ', error)
    return null
  }

  // Process batch query results
  batchQueryResults.forEach(({ id, response }) => {
    const token = validTokens.find((token) => token.address === id)
    if (token) {
      if (response.viewing_key_error) {
        console.error(response.viewing_key_error.msg)
        balances.set(token, 'viewingKeyError')
      } else {
        balances.set(token, response.balance.amount)
      }
    }
  })

  return balances
}

interface IGetIBCBalancesForTokensProps {
  chain: Chain
  tokens: Token[]
}
interface IGetBalancesForTokensProps {
  secretNetworkClient: SecretNetworkClient
  walletAddress: string
  tokens: Token[]
}

async function fetchIbcChainBalances(
  props: IGetIBCBalancesForTokensProps
): Promise<Nullable<Map<Token, TokenBalances>>> {
  const sourceChain = await IbcService.getChainSecretJs(props.chain)

  const { balances }: QueryAllBalancesResponse = await sourceChain.query.bank.allBalances({
    address: sourceChain.address,
    pagination: { limit: '100' }
  })

  let newBalanceMapping = new Map<Token, TokenBalances>()

  const tokenMap = new Map<string, Token>()

  allTokens.forEach((token) => {
    const fromDenom = token.deposits.find((deposit) => deposit.chain_name === props.chain.chain_name)?.denom
    if (fromDenom) {
      tokenMap.set(fromDenom, token)
    }
  })

  // Iterate through the response and update the balance mapping
  balances.forEach((balance) => {
    const token = tokenMap.get(balance.denom)
    newBalanceMapping.set(token, {
      balance: token ? new BigNumber(balance.amount) : new BigNumber(0)
    })
  })

  //exception for Terra CW20 Tokens
  const tokensToCheck = ['ampLUNA', 'bLUNA']

  tokensToCheck.forEach(async (tokenName) => {
    const token = allTokens.find((token: Token) => token.name === tokenName)

    if (token && props.chain.chain_name === 'Terra') {
      const tokenDeposits = token.deposits.filter((deposit: any) => deposit.chain_name === props.chain.chain_name)
      const denom = tokenDeposits[0]?.denom

      if (denom) {
        const url = `${props.chain.lcd}/cosmwasm/wasm/v1/contract/${denom.substring('cw20:'.length)}/smart/${toBase64(
          toUtf8(`{"balance":{"address":"${sourceChain.address}"}}`)
        )}`
        const { data } = await (await fetch(url)).json()
        const balance = data?.balance || 0

        newBalanceMapping.set(token, {
          balance: new BigNumber(balance)
        })
      }
    }
  })

  for (const token of props.tokens) {
    const currentEntry = newBalanceMapping.get(token)

    if (!currentEntry) {
      newBalanceMapping.set(token, {
        balance: new BigNumber(0)
      })
    }
  }

  return newBalanceMapping
}

async function getBalancesForTokens(props: IGetBalancesForTokensProps): Promise<Nullable<Map<Token, TokenBalances>>> {
  if (!props.secretNetworkClient) {
    return null
  }

  try {
    const { balances }: QueryAllBalancesResponse = await props.secretNetworkClient.query.bank.allBalances({
      address: props.secretNetworkClient.address,
      pagination: { limit: '300' }
    })

    let newBalanceMapping = new Map<Token, TokenBalances>()

    const tokenMap = new Map<string, Token>()

    allTokens.forEach((token) => {
      const fromDenom = token.withdrawals[0]?.denom
      if (fromDenom) {
        tokenMap.set(fromDenom, token)
      }
    })

    // Iterate through the response and update the balance mapping
    balances.forEach((balance) => {
      const token = tokenMap.get(balance.denom)
      if (token) {
        newBalanceMapping.set(token, {
          balance: new BigNumber(balance.amount),
          secretBalance: null
        })
      }
    })

    const secretBalances = await getBatchsTokenBalance(props.secretNetworkClient, props.walletAddress, allTokens, true)

    for (const token of allTokens) {
      const secretBalance = secretBalances.get(token)
      const currentEntry = newBalanceMapping.get(token)

      if (currentEntry) {
        if (
          secretBalance === ('viewingKeyError' as GetBalanceError) ||
          secretBalance === ('GenericFetchError' as GetBalanceError)
        ) {
          newBalanceMapping.set(token, {
            ...currentEntry,
            secretBalance: secretBalance
          })
        } else {
          newBalanceMapping.set(token, {
            ...currentEntry,
            secretBalance: secretBalance !== null ? new BigNumber(secretBalance) : null
          })
        }
      } else {
        if (
          secretBalance === ('viewingKeyError' as GetBalanceError) ||
          secretBalance === ('GenericFetchError' as GetBalanceError)
        ) {
          newBalanceMapping.set(token, {
            balance: new BigNumber(0),
            secretBalance: 'viewingKeyError'
          })
        } else {
          newBalanceMapping.set(token, {
            balance: new BigNumber(0),
            secretBalance: secretBalance !== null ? new BigNumber(secretBalance) : null
          })
        }
      }
    }

    return newBalanceMapping
  } catch (error) {
    console.error(`Error getting balance: `, error)
    return null
  }
}

export const WalletService = {
  connectWallet,
  requestFeeGrantService,
  setWalletViewingKey,
  getWalletViewingKey,
  isViewingKeyAvailable,
  getBalancesForTokens,
  fetchIbcChainBalances
}

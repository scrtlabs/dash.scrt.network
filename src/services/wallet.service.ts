import { SecretNetworkClient, toBase64, toUtf8 } from 'secretjs'
import { FeeGrantStatus } from 'types/FeeGrantStatus'
import { Nullable } from 'types/Nullable'
import { allTokens, batchQueryCodeHash, batchQueryContractAddress, faucetURL, sleep } from 'utils/commons'
import { Chain, SECRET_CHAIN_ID, SECRET_LCD, Token } from 'utils/config'
import { isMobile } from 'react-device-detect'
import { scrtToken } from 'utils/tokens'
import { WalletAPIType } from 'types/WalletAPIType'
import BigNumber from 'bignumber.js'
import { QueryAllBalancesResponse } from 'secretjs/dist/grpc_gateway/cosmos/bank/v1beta1/query.pb'
import { GetBalanceError } from 'store/secretNetworkClient'
import { IbcService } from './ibc.service'
import { TokenBalances } from 'store/secretNetworkClient'
import { BatchQueryParsedResponse, batchQuery } from '@shadeprotocol/shadejs'

const connectKeplr = async (lcd: string, chainID: string) => {
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  while (!window.keplr || !window.getEnigmaUtils || !window.getOfflineSignerOnlyAmino) {
    await sleep(50)
  }

  await window.keplr.enable(SECRET_CHAIN_ID)
  window.keplr.defaultOptions = {
    sign: {
      preferNoSetFee: false,
      disableBalanceCheck: true
    }
  }

  const keplrOfflineSigner = window.getOfflineSignerOnlyAmino(SECRET_CHAIN_ID)
  const accounts = await keplrOfflineSigner.getAccounts()

  const walletAddress = accounts[0].address

  const secretjs: SecretNetworkClient = new SecretNetworkClient({
    url: lcd,
    chainId: SECRET_CHAIN_ID,
    wallet: keplrOfflineSigner,
    walletAddress,
    encryptionUtils: window.getEnigmaUtils(SECRET_CHAIN_ID)
  })

  window.wallet = window.keplr

  return { walletAddress, secretjs }
}

const connectLeap = async (lcd: string, chainID: string) => {
  if (!window.leap && isMobile) {
    // const urlSearchParams = new URLSearchParams();
    // urlSearchParams.append("network", chainId);
    // urlSearchParams.append("url", window.location.href);
    // window.open(`fina://wllet/dapps?${urlSearchParams.toString()}`, "_blank");
    // localStorage.setItem("preferedWalletApi", "Fina");
    // window.dispatchEvent(new Event("storage"));
  } else {
    while (!window.leap || !window.getEnigmaUtils || !window.getOfflineSignerOnlyAmino) {
      await sleep(50)
    }

    await window.leap.enable(SECRET_CHAIN_ID)

    const wallet = window.leap.getOfflineSignerOnlyAmino(SECRET_CHAIN_ID)
    const [{ address: walletAddress }] = await wallet.getAccounts()

    const secretjs: SecretNetworkClient = new SecretNetworkClient({
      url: lcd,
      chainId: chainID,
      wallet,
      walletAddress,
      encryptionUtils: window.leap.getEnigmaUtils(SECRET_CHAIN_ID)
    })

    window.wallet = window.leap

    return { walletAddress, secretjs }
  }
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
  let newFeeGrantStatus: FeeGrantStatus = feeGrantStatus

  if (feeGrantStatus === 'success') {
    console.debug('User requested Fee Grant. Fee Grant has already been granted. Therefore doing nothing...')
  } else {
    try {
      const result = await (await fetch(`${faucetURL}/${walletAddress}`)).json()
      if (result?.feegrant) {
        newFeeGrantStatus = 'success'
        // toast.success(
        //   `Successfully sent new fee grant (0.1 SCRT) to address ${secretAddress}`
        // );
      } else {
        console.error(result?.error)
        newFeeGrantStatus = 'fail'
        // toast.error(
        //   `Fee Grant for address ${secretAddress} failed with status code: ${result.status}`
        // );
      }
    } catch (error) {
      console.error(error)
      newFeeGrantStatus = 'fail'
      // toast.error(
      //   `Fee Grant for address ${secretAddress} failed with error: ${error}`
      // );
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
  if (!window.keplr && !window.leap) {
    console.error('Wallet not present')
    return null
  }
  try {
    return await window.wallet?.getSecret20ViewingKey(SECRET_CHAIN_ID, token)
  } catch (error) {
    console.error(error)
    return null
  }
}

const isViewingKeyAvailable = async (token: Token) => {
  const key = await getWalletViewingKey(token.address)
  return key ? true : false
}

const getsScrtTokenBalance = async (
  isConnected: boolean,
  secretNetworkClient: any,
  walletAddress: string
): Promise<Nullable<string>> => {
  if (!isConnected) {
    return null
  }

  let sScrtBalance: string | GetBalanceError

  const key = await getWalletViewingKey(scrtToken.address)
  if (!key) {
    sScrtBalance = 'viewingKeyError' as GetBalanceError
    return null
  }

  interface IResult {
    viewing_key_error: any
    balance: {
      amount: string
    }
  }

  try {
    const result: IResult = await secretNetworkClient?.query?.compute?.queryContract({
      contract_address: scrtToken.address,
      code_hash: scrtToken.code_hash,
      query: {
        balance: { address: walletAddress, key }
      }
    })

    if (result.viewing_key_error) {
      console.error(result.viewing_key_error.msg)
      sScrtBalance = 'viewingKeyError' as GetBalanceError
    } else {
      sScrtBalance = result.balance.amount
    }
  } catch (error) {
    console.error(`Error getting balance for s${scrtToken.name}: `, error)
    sScrtBalance = 'viewingKeyError' as GetBalanceError
  }

  return sScrtBalance
}

const getsTokenBalance = async (
  secretNetworkClient: any,
  walletAddress: string,
  token: Token
): Promise<Nullable<string>> => {
  if (!secretNetworkClient) {
    return null
  }

  let sBalance: string

  const key = await getWalletViewingKey(token.address)
  if (!key) {
    sBalance = 'viewingKeyError' as GetBalanceError
    return sBalance
  }

  interface IResult {
    viewing_key_error: any
    balance: {
      amount: string
    }
  }

  try {
    const result: IResult = await secretNetworkClient?.query?.compute?.queryContract({
      contract_address: token.address,
      code_hash: token.code_hash,
      query: {
        balance: { address: walletAddress, key }
      }
    })

    if (result.viewing_key_error) {
      console.error(result.viewing_key_error.msg)
      sBalance = 'viewingKeyError' as GetBalanceError
    } else {
      sBalance = result.balance.amount
    }
  } catch (error) {
    console.error(`Error getting balance for s${scrtToken.name}: `, error)
    sBalance = 'GenericFetchError' as GetBalanceError
  }

  return sBalance
}

const getBatchsTokenBalance = async (
  secretNetworkClient: any,
  walletAddress: string,
  tokens: Token[]
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
      queries: queries
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

const getScrtTokenBalance = async (secretNetworkClient: any, walletAddress: string) => {
  try {
    const response = await secretNetworkClient.query.bank.balance({
      address: walletAddress,
      denom: 'uscrt'
    })

    return response.balance.amount
  } catch (error) {
    console.error(`Error getting balance for SCRT: `, error)
    return null
  }
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
    pagination: { limit: '1000' }
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

  for (const token of props.tokens) {
    const currentEntry = newBalanceMapping.get(token)

    if (!currentEntry) {
      newBalanceMapping.set(token, {
        balance: new BigNumber(0)
      })
    }
  }

  //exception for AMPLuna
  if (allTokens.find((token: Token) => token.name === 'ampLUNA')) {
    const AmpLUNAToken = allTokens.find((token: Token) => token.name === 'ampLUNA')
    const AmpLUNADenom = AmpLUNAToken.deposits.filter(
      (deposit: any) => deposit.chain_name === props.chain.chain_name
    )[0].denom
    console.log(AmpLUNADenom)
    const url = `${props.chain.lcd}/cosmwasm/wasm/v1/contract/${AmpLUNADenom.substring(
      'cw20:'.length
    )}/smart/${toBase64(toUtf8(`{"balance":{"address":"${sourceChain.address}"}}`))}`
    const { data } = await (await fetch(url)).json()
    const balance = data.balance || 0
    newBalanceMapping.set(AmpLUNAToken, {
      balance: new BigNumber(balance)
    })
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
      pagination: { limit: '1000' }
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

    const secretBalances = await getBatchsTokenBalance(props.secretNetworkClient, props.walletAddress, allTokens)

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
  connectWallet: connectWallet,
  requestFeeGrantService,
  setWalletViewingKey,
  getWalletViewingKey,
  isViewingKeyAvailable,
  getsScrtTokenBalance,
  getsTokenBalance,
  getScrtTokenBalance,
  getBalancesForTokens,
  fetchIbcChainBalances
}

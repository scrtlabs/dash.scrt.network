import { AxelarAssetTransfer, AxelarQueryAPI, CHAINS, Environment } from '@axelar-network/axelarjs-sdk'
import { createTxIBCMsgTransfer } from '@tharsis/transactions'
import BigNumber from 'bignumber.js'
import { cosmos } from '@tharsis/proto/dist/proto/cosmos/tx/v1beta1/tx'
import { SkipRouter, SKIP_API_URL, Operation } from '@skip-router/core'
import {
  BroadcastMode,
  MsgExecuteContract,
  MsgTransfer,
  SecretNetworkClient,
  TxResponse,
  fromBase64,
  toBase64,
  toUtf8
} from 'secretjs'
import { FeeGrantStatus } from 'types/FeeGrantStatus'
import { IbcMode } from 'types/IbcMode'
import { Nullable } from 'types/Nullable'
import {
  sleep,
  faucetAddress,
  suggestCrescenttoWallet,
  suggestChihuahuatoWallet,
  suggestInjectivetoWallet,
  suggestKujiratoWallet,
  suggestTerratoWallet,
  suggestComposabletoWallet,
  randomPadding,
  viewingKeyErrorString,
  allTokens
} from 'utils/commons'
import { Chain, Deposit, Token, chains, tokens } from 'utils/config'
import Long from 'long'
import { TxRaw } from 'secretjs/dist/protobuf/cosmos/tx/v1beta1/tx'
import mixpanel from 'mixpanel-browser'

const sdk: AxelarAssetTransfer = new AxelarAssetTransfer({
  environment: Environment.MAINNET
})

interface IBaseProps {
  ibcMode: IbcMode
  chainName: string
  amount: string
  secretNetworkClient: SecretNetworkClient
  sourceChainNetworkClient: SecretNetworkClient
  feeGrantStatus: FeeGrantStatus
}

interface IPropsToken extends IBaseProps {
  token: Token
}

interface IPropsTokenName extends IBaseProps {
  tokenName: string
}

type TProps = IPropsToken | IPropsTokenName

async function getChainSecretJs(chain: Chain): Promise<SecretNetworkClient> {
  while (!(window as any).wallet || !(window as any).wallet.getOfflineSignerOnlyAmino) {
    await sleep(100)
  }
  if (chain.chain_name === 'Terra') {
    await suggestTerratoWallet((window as any).wallet)
  } else if (chain.chain_name === 'Injective') {
    await suggestInjectivetoWallet((window as any).wallet)
  } else if (chain.chain_name === 'Crescent') {
    await suggestCrescenttoWallet((window as any).wallet)
  } else if (chain.chain_name === 'Kujira') {
    await suggestKujiratoWallet((window as any).wallet)
  } else if (chain.chain_name === 'Chihuahua') {
    await suggestChihuahuatoWallet((window as any).wallet)
  } else if (chain.chain_name === 'Composable') {
    await suggestComposabletoWallet((window as any).wallet)
  }

  const { chain_id, lcd } = chains[chain.chain_name]

  await (window as any).wallet.enable(chain_id)

  if ((window as any).wallet) {
    ;(window as any).wallet.defaultOptions = {
      sign: {
        preferNoSetFee: false,
        disableBalanceCheck: true
      }
    }
  }

  let sourceOfflineSigner
  if (chain.chain_name === 'Composable') {
    sourceOfflineSigner = (window as any).wallet.getOfflineSigner(chain_id)
  } else {
    sourceOfflineSigner = (window as any).wallet.getOfflineSignerOnlyAmino(chain_id)
  }
  const depositFromAccounts = await sourceOfflineSigner.getAccounts()

  const secretNetworkClient = new SecretNetworkClient({
    url: lcd,
    chainId: chain_id,
    wallet: sourceOfflineSigner,
    walletAddress: depositFromAccounts[0].address
  })
  return secretNetworkClient
}

/**
 * Attempts to perform IBC Transfer via secret.js API
 *
 * @param {TProps} props
 * @returns {Promise<{success: boolean, errorMsg: Nullable<string>}>} A promise that resolves to an object containing:
 * - `success`: A boolean indicating whether the wrapping operation was successful.
 * - `errorMsg`: A string containing an error message if something went wrong, or null if there were no errors.
 * @async
 */

const performIbcTransfer = async (props: TProps): Promise<{ success: boolean; errorMsg: Nullable<string> }> => {
  let result: { success: boolean; errorMsg: Nullable<string> } = {
    success: false,
    errorMsg: null
  }

  let token: Nullable<Token>
  if ('tokenName' in props) {
    token = tokens.find((token) => token.name === props.tokenName)
  } else {
    token = props.token
  }

  if (!token) {
    result.success = false
    result.errorMsg = 'Token not found!'
    return result
  }

  if (props.ibcMode === 'withdrawal') {
    return performIbcWithdrawal(props, token)
  } else if (props.ibcMode === 'deposit') {
    return performIbcDeposit(props, token)
  }
}

const performIbcDeposit = async (
  props: TProps,
  token: Token
): Promise<{ success: boolean; errorMsg: Nullable<string> }> => {
  let result: { success: boolean; errorMsg: Nullable<string> } = {
    success: false,
    errorMsg: null
  }

  const selectedSource = chains[props.chainName]

  // IBC Logic
  let { deposit_channel_id, deposit_gas, deposit_gas_denom, lcd: lcdSrcChain } = selectedSource

  const deposit = token.deposits.filter((deposit: Deposit) => deposit.chain_name === props.chainName)[0]

  deposit_channel_id = deposit.channel_id || deposit_channel_id
  deposit_gas = deposit.gas || deposit_gas

  try {
    let tx: TxResponse
    if (
      !['Evmos', 'Injective'].includes(props.chainName) &&
      (!token.is_ics20 || deposit.axelar_chain_name == CHAINS.MAINNET.AXELAR)
    ) {
      // Regular cosmos chain (not ethermint signing)
      if (token.name === 'SCRT' || deposit.axelar_chain_name == CHAINS.MAINNET.AXELAR) {
        tx = await props.sourceChainNetworkClient.tx.ibc.transfer(
          {
            sender: props.sourceChainNetworkClient.address,
            receiver: props.secretNetworkClient.address,
            source_channel: deposit_channel_id,
            source_port: 'transfer',
            token: {
              amount: props.amount,
              denom: token.deposits.filter((deposit: Deposit) => deposit.chain_name === props.chainName)[0].denom
            },
            timeout_timestamp: String(Math.floor(Date.now() / 1000) + 10 * 60) // 10 minute timeout
          },
          {
            broadcastCheckIntervalMs: 10000,
            gasLimit: deposit_gas,
            feeDenom: deposit_gas_denom,
            ibcTxsOptions: {
              resolveResponses: true,
              resolveResponsesCheckIntervalMs: 250,
              resolveResponsesTimeoutMs: 12 * 60 * 1000
            },
            broadcastMode: BroadcastMode.Sync
          }
        )
      } else {
        tx = await props.sourceChainNetworkClient.tx.ibc.transfer(
          {
            sender: props.sourceChainNetworkClient.address,
            receiver: 'secret198lmmh2fpj3weqhjczptkzl9pxygs23yn6dsev',
            source_channel: deposit_channel_id,
            source_port: 'transfer',
            token: {
              amount: props.amount,
              denom: token.deposits.filter((deposit: any) => deposit.chain_name === props.chainName)[0].denom
            },
            timeout_timestamp: String(Math.floor(Date.now() / 1000) + 10 * 60), // 10 minute timeout
            memo: JSON.stringify({
              wasm: {
                contract: 'secret198lmmh2fpj3weqhjczptkzl9pxygs23yn6dsev',
                msg: {
                  wrap_deposit: {
                    snip20_address: token.address,
                    snip20_code_hash: token.code_hash,
                    recipient_address: props.secretNetworkClient.address
                  }
                }
              }
            })
          },
          {
            broadcastCheckIntervalMs: 10000,
            gasLimit: deposit_gas,
            feeDenom: deposit_gas_denom,
            ibcTxsOptions: {
              resolveResponses: true,
              resolveResponsesCheckIntervalMs: 250,
              resolveResponsesTimeoutMs: 12 * 60 * 1000
            },
            broadcastMode: BroadcastMode.Sync
          }
        )
      }
    } else if (token.is_ics20 && deposit.axelar_chain_name != CHAINS.MAINNET.AXELAR) {
      const fromChain = deposit.axelar_chain_name,
        toChain = 'secret-snip',
        destinationAddress = props.secretNetworkClient.address,
        asset = token.axelar_denom

      const depositAddress = await sdk.getDepositAddress({
        fromChain,
        toChain,
        destinationAddress,
        asset
      })
      tx = await props.sourceChainNetworkClient.tx.ibc.transfer(
        {
          sender: props.sourceChainNetworkClient.address,
          receiver: depositAddress,
          source_channel: deposit_channel_id,
          source_port: 'transfer',
          token: {
            amount: props.amount,
            denom: deposit.denom
          },
          timeout_timestamp: String(Math.floor(Date.now() / 1000) + 10 * 60) // 10 minute timeout
        },
        {
          broadcastCheckIntervalMs: 10000,
          gasLimit: deposit_gas,
          feeDenom: deposit_gas_denom,
          ibcTxsOptions: {
            resolveResponses: true,
            resolveResponsesCheckIntervalMs: 250,
            resolveResponsesTimeoutMs: 10.25 * 60 * 1000
          },
          broadcastMode: BroadcastMode.Sync
        }
      )
    } else {
      // Handle IBC transfers from Ethermint chains like Evmos & Injective

      // Get Evmos/Injective account_number & sequence
      const {
        account: {
          base_account: { account_number: accountNumber, sequence: accountSequence }
        }
      }: {
        account: {
          base_account: {
            account_number: string
            sequence: string
          }
        }
      } = await (
        await fetch(`${selectedSource.lcd}/cosmos/auth/v1beta1/accounts/${props.sourceChainNetworkClient.address}`)
      ).json()

      // Get account pubkey
      // Can't get it from the chain because an account without txs won't have its pubkey listed on-chain
      const evmosProtoSigner = window.getOfflineSigner!(selectedSource.chain_id)
      const [{ pubkey }] = await evmosProtoSigner.getAccounts()

      // Create IBC MsgTransfer tx
      const txIbcMsgTransfer = createTxIBCMsgTransfer(
        {
          chainId: 9001, // Evmos EIP155, this is ignored in Injective
          cosmosChainId: selectedSource.chain_id
        },
        {
          accountAddress: props.sourceChainNetworkClient.address,
          accountNumber: Number(accountNumber),
          sequence: Number(accountSequence),
          pubkey: toBase64(pubkey)
        },
        {
          gas: String(deposit_gas),
          amount: '0', // filled in by Keplr
          denom: 'aevmos' // filled in by Keplr
        },
        '',
        {
          sourcePort: 'transfer',
          sourceChannel: deposit_channel_id,
          amount: props.amount,
          denom: token.deposits.filter((deposit: Deposit) => deposit.chain_name === props.chainName)[0].denom,
          receiver: props.secretNetworkClient.address,
          revisionNumber: 0,
          revisionHeight: 0,
          timeoutTimestamp: `${Math.floor(Date.now() / 1000) + 10 * 60}000000000` // 10 minute timeout (ns)
        }
      )

      if (selectedSource.chain_name === 'Injective') {
        const signer_info = txIbcMsgTransfer.signDirect.authInfo.signer_infos[0].toObject()
        signer_info.public_key!.type_url = '/injective.crypto.v1beta1.ethsecp256k1.PubKey'

        txIbcMsgTransfer.signDirect.authInfo.signer_infos[0] = cosmos.tx.v1beta1.SignerInfo.fromObject(signer_info)
      }

      // Sign the tx
      const sig = await (window as any).wallet?.signDirect(
        selectedSource.chain_id,
        props.sourceChainNetworkClient.address,
        {
          bodyBytes: txIbcMsgTransfer.signDirect.body.serializeBinary(),
          authInfoBytes: txIbcMsgTransfer.signDirect.authInfo.serializeBinary(),
          chainId: selectedSource.chain_id,
          accountNumber: new Long(Number(accountNumber))
        },
        { isEthereum: true }
      )

      // Encode the Evmos tx to a TxRaw protobuf binary
      const txRaw = TxRaw.fromPartial({
        body_bytes: sig!.signed.bodyBytes,
        auth_info_bytes: sig!.signed.authInfoBytes,
        signatures: [fromBase64(sig!.signature.signature)]
      })
      const txBytes = TxRaw.encode(txRaw).finish()

      // cosmjs can broadcast to Ethermint but cannot handle the response

      // Broadcast the tx to Evmos
      tx = await props.sourceChainNetworkClient.tx.broadcastSignedTx(txBytes, {
        ibcTxsOptions: {
          resolveResponses: true,
          resolveResponsesCheckIntervalMs: 250,
          resolveResponsesTimeoutMs: 10.25 * 60 * 1000
        }
      })
    }

    if (tx.code !== 0) {
      // toast.update(toastId, {
      //   render: `Failed sending ${normalizedAmount} ${selectedToken.name} from ${selectedSource.chain_name} to Secret Network: ${tx.rawLog}`,
      //   type: 'error',
      //   isLoading: false
      // })
      return
    } else {
      // toast.update(toastId, {
      //   render: `Receiving ${normalizedAmount} ${selectedToken.name} on Secret Network from ${selectedSource.chain_name}`
      // })

      const ibcResp = await tx.ibcResponses[0]

      if (ibcResp.type === 'ack') {
        // updateCoinBalance()
        // toast.update(toastId, {
        //   render: `Received ${normalizedAmount} ${selectedToken.name} on Secret Network from ${selectedSource.chain_name}`,
        //   type: 'success',
        //   isLoading: false,
        //   closeOnClick: true
        // })
      } else {
        // toast.update(toastId, {
        //   render: `Timed out while waiting to receive ${normalizedAmount} ${selectedToken.name} on Secret Network from ${selectedSource.chain_name}`,
        //   type: 'warning',
        //   isLoading: false
        // })
      }
    }
  } catch (e) {
    if (import.meta.env.VITE_MIXPANEL_ENABLED === 'true') {
      mixpanel.init(import.meta.env.VITE_MIXPANEL_PROJECT_TOKEN, {
        debug: false
      })
      mixpanel.identify('Dashboard-App')
      mixpanel.track('IBC Transfer', {
        'Source Chain': props.ibcMode === 'deposit' ? props.chainName : 'Secret Network',
        'Target Chain': props.ibcMode === 'withdrawal' ? props.chainName : 'Secret Network',
        'Fee Grant used': props.feeGrantStatus === 'success' && props.ibcMode === 'withdrawal' ? true : false
      })
    }

    // toast.update(toastId, {
    //   render: `Failed sending ${normalizedAmount} ${selectedToken.name} from ${
    //     selectedSource.chain_name
    //   } to Secret Network: ${(e as any).message}`,
    //   type: 'error',
    //   isLoading: false
    // })
  } finally {
  }
}

const performIbcWithdrawal = async (
  props: TProps,
  token: Token
): Promise<{ success: boolean; errorMsg: Nullable<string> }> => {
  let result: { success: boolean; errorMsg: Nullable<string> } = {
    success: false,
    errorMsg: null
  }

  const selectedDest = chains[props.chainName]

  const amount = new BigNumber(props.amount).multipliedBy(`1e${token.decimals}`).toFixed(0, BigNumber.ROUND_DOWN)

  let { withdraw_channel_id, withdraw_gas, lcd: lcdDstChain } = selectedDest

  const withdrawalChain = token.withdrawals.filter(
    (withdrawal: any) => withdrawal.chain_name === selectedDest.chain_name
  )[0]

  withdraw_channel_id = withdrawalChain.channel_id || withdraw_channel_id
  withdraw_gas = withdrawalChain.gas || withdraw_gas

  // const toastId = toast.loading(
  //   `Sending ${normalizedAmount} ${selectedToken.name} from Secret Network to ${selectedSource.chain_name}`,
  //   {
  //     closeButton: true
  //   }
  // )

  const routing = await getSkipIBCRouting(selectedDest, 'withdrawal', token)

  try {
    let tx: TxResponse

    if (token.is_snip20) {
      tx = await props.secretNetworkClient.tx.compute.executeContract(
        {
          contract_address: token.address,
          code_hash: token.code_hash,
          sender: props.secretNetworkClient?.address,
          msg: {
            send: {
              recipient: 'secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4', // cw20-ics20
              recipient_code_hash: 'f85b413b547b9460162958bafd51113ac266dac96a84c33b9150f68f045f2641',
              amount,
              msg: toBase64(
                toUtf8(
                  JSON.stringify({
                    channel: withdraw_channel_id,
                    remote_address: props.sourceChainNetworkClient.address,
                    timeout: 600 // 10 minute timeout
                  })
                )
              )
            }
          }
        },
        {
          broadcastCheckIntervalMs: 10000,
          gasLimit: withdraw_gas,
          gasPriceInFeeDenom: 0.1,
          feeDenom: 'uscrt',
          feeGranter: props.feeGrantStatus === 'success' ? faucetAddress : '',
          ibcTxsOptions: {
            resolveResponses: true,
            resolveResponsesCheckIntervalMs: 250,
            resolveResponsesTimeoutMs: 12 * 60 * 1000
          },
          broadcastMode: BroadcastMode.Sync
        }
      )
    } else if (
      token.is_ics20 &&
      !(withdrawalChain?.axelar_chain_name === CHAINS.MAINNET.AXELAR && token.name === 'SCRT')
    ) {
      const fromChain = 'secret-snip',
        toChain = withdrawalChain.axelar_chain_name,
        destinationAddress = props.sourceChainNetworkClient.address,
        asset = token.axelar_denom

      let depositAddress = ''

      if (withdrawalChain?.axelar_chain_name === CHAINS.MAINNET.AXELAR) {
        depositAddress = destinationAddress
      } else {
        depositAddress = await sdk.getDepositAddress({
          fromChain,
          toChain,
          destinationAddress,
          asset
        })
      }

      tx = await props.secretNetworkClient.tx.compute.executeContract(
        {
          contract_address: token.address,
          code_hash: token.code_hash,
          sender: props.secretNetworkClient?.address,
          msg: {
            send: {
              recipient: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83', // ics20
              recipient_code_hash: '2976a2577999168b89021ecb2e09c121737696f71c4342f9a922ce8654e98662',
              amount,
              msg: toBase64(
                toUtf8(
                  JSON.stringify({
                    channel: withdraw_channel_id,
                    remote_address: depositAddress,
                    timeout: 600 // 10 minute timeout
                  })
                )
              )
            }
          }
        },
        {
          broadcastCheckIntervalMs: 10000,
          gasLimit: withdraw_gas,
          gasPriceInFeeDenom: 0.1,
          feeDenom: 'uscrt',
          feeGranter: props.feeGrantStatus === 'success' ? faucetAddress : '',
          ibcTxsOptions: {
            resolveResponses: true,
            resolveResponsesCheckIntervalMs: 10_000,
            resolveResponsesTimeoutMs: 12 * 60 * 1000
          },
          broadcastMode: BroadcastMode.Sync
        }
      )
    } else if (token.name === 'SCRT') {
      const source_channel_id =
        withdrawalChain?.axelar_chain_name == CHAINS.MAINNET.AXELAR && token.name !== 'SCRT'
          ? withdrawalChain.channel_id
          : withdraw_channel_id

      tx = await props.secretNetworkClient.tx.ibc.transfer(
        {
          sender: props.secretNetworkClient?.address,
          receiver: props.sourceChainNetworkClient.address,
          source_channel: source_channel_id,
          source_port: 'transfer',
          token: {
            amount,
            denom: withdrawalChain.denom
          },
          memo: routing.operations.length > 1 ? await composePMFMemo(routing.operations) : '',
          timeout_timestamp: String(Math.floor(Date.now() / 1000) + 10 * 60) // 10 minute timeout
        },
        {
          broadcastCheckIntervalMs: 10000,
          gasLimit: withdraw_gas,
          gasPriceInFeeDenom: 0.1,
          feeDenom: 'uscrt',
          feeGranter: props.feeGrantStatus === 'success' ? faucetAddress : '',
          ibcTxsOptions: {
            resolveResponses: true,
            resolveResponsesCheckIntervalMs: 250,
            resolveResponsesTimeoutMs: 12 * 60 * 1000
          },
          broadcastMode: BroadcastMode.Sync
        }
      )
    } else {
      tx = await props.secretNetworkClient.tx.broadcast(
        [
          new MsgExecuteContract({
            sender: props.secretNetworkClient?.address,
            contract_address: token.address,
            code_hash: token.code_hash,
            sent_funds: [],
            msg: {
              redeem: {
                amount,
                denom: token.withdrawals[0].denom,
                padding: randomPadding()
              }
            }
          } as any),
          new MsgTransfer({
            sender: props.secretNetworkClient?.address,
            receiver: props.sourceChainNetworkClient.address,
            source_channel: withdraw_channel_id,
            source_port: 'transfer',
            token: {
              amount,
              denom: withdrawalChain.denom
            },
            memo: routing.operations.length > 1 ? await composePMFMemo(routing.operations) : '',
            timeout_timestamp: String(Math.floor(Date.now() / 1000) + 10 * 60) // 10 minute timeout
          })
        ],
        {
          broadcastCheckIntervalMs: 10000,
          gasLimit: 150_000,
          gasPriceInFeeDenom: 0.1,
          feeDenom: 'uscrt',
          feeGranter: props.feeGrantStatus === 'success' ? faucetAddress : '',
          ibcTxsOptions: {
            resolveResponses: true,
            resolveResponsesCheckIntervalMs: 250,
            resolveResponsesTimeoutMs: 12 * 60 * 1000
          },
          broadcastMode: BroadcastMode.Sync
        }
      )
    }

    if (tx.code !== 0) {
      // toast.update(toastId, {
      //   render: `Failed sending ${normalizedAmount} ${selectedToken.name} from Secret Network to ${selectedSource.chain_name}: ${tx.rawLog}`,
      //   type: 'error',
      //   isLoading: false
      // })
    } else {
      // toast.update(toastId, {
      //   render: `Receiving ${normalizedAmount} ${selectedToken.name} on ${selectedSource.chain_name}`
      // })

      const ibcResp = await tx.ibcResponses[0]

      if (ibcResp.type === 'ack') {
        // updateCoinBalance()
        // toast.update(toastId, {
        //   render: `Received ${normalizedAmount} ${selectedToken.name} on ${selectedSource.chain_name}`,
        //   type: 'success',
        //   isLoading: false,
        //   closeOnClick: true
        // })
        result = {
          success: true,
          errorMsg: null
        }
      } else {
        // toast.update(toastId, {
        //   render: `Timed out while waiting to receive ${normalizedAmount} ${selectedToken.name} on ${selectedSource.chain_name} from Secret Network`,
        //   type: 'warning',
        //   isLoading: false
        // })
      }
    }
  } catch (e) {
    // toast.update(toastId, {
    //   render: `Failed sending ${normalizedAmount} ${
    //     selectedToken.name
    //   } from Secret Network to ${selectedSource.chain_name}: ${
    //     (e as any).message
    //   }`,
    //   type: 'error',
    //   isLoading: false
    // })
    result = {
      success: false,
      errorMsg: `Failed sending ${amount} ${token.name} from Secret Network to ${selectedDest.chain_name}: ${
        (e as any).message
      }`
    }
  } finally {
    return result
  }
}

async function getAxelarTransferFee(token: Token, chain: Chain, amount: number, ibcMode: IbcMode) {
  const axelarQuery = new AxelarQueryAPI({
    environment: Environment.MAINNET
  })

  // Ensure the chain is found before proceeding
  const filteredChain = token.deposits.find((deposit: Deposit) => deposit.chain_name === chain.chain_name)
  if (!filteredChain) {
    throw new Error('Chain not found')
  }

  // Define the fromChain and toChain based on ibcMode
  const isDeposit = ibcMode === 'deposit'
  const fromChain = isDeposit ? filteredChain.axelar_chain_name : 'secret-snip'
  const toChain = isDeposit ? 'secret-snip' : filteredChain.axelar_chain_name

  // Define the asset
  const asset = token.axelar_denom

  // Define the formatted amount
  const formattedAmount = new BigNumber(amount).multipliedBy(`1e${token.decimals}`).toNumber()

  // Get and return the transfer fee
  const fee = await axelarQuery.getTransferFee(fromChain, toChain, asset, formattedAmount)
  return fee
}

async function fetchSourceBalance(
  address: string,
  chain: Chain,
  ibcMode: IbcMode,
  token: Token
): Promise<number | 'Error'> {
  if (!address) {
    console.error('Address is required')
    return 'Error'
  }

  const url = `${chains[chain.chain_name].lcd}/cosmos/bank/v1beta1/balances/${address}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.statusText}`)
      return 'Error'
    }

    const { balances } = await response.json()

    const targetDenom = token.deposits.filter((deposit: any) => deposit.chain_name === chain.chain_name)[0]?.denom

    const balanceObj = balances.find((balance: any) => balance.denom === targetDenom)

    return balanceObj ? parseInt(balanceObj.amount, 10) : 0
  } catch (e) {
    console.error(`Error while trying to query ${url}:`, e)
    return 'Error'
  }
}

async function getSkipIBCRouting(chain: Chain, IbcMode: IbcMode, token: Token) {
  const client = new SkipRouter({
    apiURL: SKIP_API_URL
  })

  let dest
  let source
  if (IbcMode === 'deposit') {
    source = token.withdrawals[0]
    dest = token.withdrawals.find((withdrawal) => withdrawal.chain_name === chain.chain_name)
  }
  if (IbcMode === 'withdrawal') {
    dest = token.withdrawals[0]
    source = token.withdrawals.find((withdrawal) => withdrawal.chain_name === chain.chain_name)
  }

  const route = await client.route({
    amountIn: '1000',
    sourceAssetDenom: source.denom,
    sourceAssetChainID: IbcMode === 'withdrawal' ? chains['Secret Network'].chain_id : chain.chain_id,
    destAssetDenom: dest.denom,
    destAssetChainID: IbcMode === 'withdrawal' ? chain.chain_id : chains['Secret Network'].chain_id,
    cumulativeAffiliateFeeBPS: '0'
  })

  return route
}

interface Forward {
  receiver: string
  port: string
  channel: string
  timeout: number
  retries: number
  next?: string | Forward | null
}

interface MemoObject {
  forward: Forward
}

function composePMFMemo(allOperations: Operation[], finalMemo?: string | undefined): Promise<string> {
  async function getReceiverAddress(chainID: string): Promise<string> {
    const wallet = (window as any).wallet.getOfflineSignerOnlyAmino(chainID)
    const [{ address: walletAddress }] = await wallet.getAccounts()
    return walletAddress
  }

  async function generateMemo(operations: Operation[], finalNextContent: string): Promise<string> {
    // Base case: if there are no more operations, return the finalNextContent
    if (operations.length === 0) {
      return finalNextContent
    }

    // Take the first operation from the array
    const operation = operations[0]

    // Recursively process the rest of the operations array
    const next: string | Forward | null =
      operations.length > 1 ? JSON.parse(await generateMemo(operations.slice(1), finalNextContent)) : undefined

    const receiver = await getReceiverAddress((operation as any).transfer.chainID)

    // Construct the memo object for this operation
    const memoObject: MemoObject = {
      forward: {
        receiver: receiver, // Replace with the actual receiver address
        port: (operation as any).transfer.port,
        channel: (operation as any).transfer.channel,
        timeout: 0, // Adjust timeout as needed
        retries: 2, // Adjust retries as needed
        ...(next || finalNextContent ? { next: next } : {}) // Conditionally include the "next" field
      }
    }
    return JSON.stringify(memoObject)
  }

  const memo: Promise<string> = generateMemo(allOperations.slice(1), finalMemo)
  return memo
}

/**
Get supported chains for IBC transfers.
@returns An array of chains.
*/
function getSupportedChains(): { chain_name: string; chain_image: string }[] {
  const selectableChains = Object.keys(chains)
    .filter((chain_name) => chain_name !== 'Secret Network')
    .map((chain_name) => {
      const chain = chains[chain_name]
      return {
        chain_name: chain.chain_name,
        chain_image: chain.chain_image
      }
    })
  return selectableChains
}

/**
Get supported IBC tokens by the specified chain.
@param chain - The chain for which to retrieve supported IBC tokens.
@returns An array of supported IBC tokens (as Token) on the given chain.
*/
function getSupportedIbcTokensByChain(chain: Chain) {
  const supportedTokens = allTokens.filter((token: Token) => {
    return token.deposits.find((deposit: Deposit) => deposit.chain_name === chain.chain_name)
  })
  return supportedTokens
}

export const IbcService = {
  getSupportedChains,
  getSupportedIbcTokensByChain,
  performIbcTransfer,
  composePMFMemo,
  getSkipIBCRouting
}

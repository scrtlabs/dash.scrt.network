import {
  AxelarAssetTransfer,
  CHAINS,
  Environment
} from '@axelar-network/axelarjs-sdk'
import { createTxIBCMsgTransfer } from '@tharsis/transactions'
import BigNumber from 'bignumber.js'
import { cosmos } from '@tharsis/proto/dist/proto/cosmos/tx/v1beta1/tx'
import {
  BroadcastMode,
  MsgExecuteContract,
  SecretNetworkClient,
  TxResponse,
  fromBase64,
  toBase64
} from 'secretjs'
import { FeeGrantStatus } from 'shared/types/FeeGrantStatus'
import { IbcMode } from 'shared/types/IbcMode'
import { Nullable } from 'shared/types/Nullable'
import { faucetAddress, randomPadding } from 'shared/utils/commons'
import { Chain, Deposit, Token, chains, tokens } from 'shared/utils/config'
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
  feeGrantStatus: FeeGrantStatus
}

interface IPropsToken extends IBaseProps {
  token: Token
}

interface IPropsTokenName extends IBaseProps {
  tokenName: string
}

type TProps = IPropsToken | IPropsTokenName

/**
 * Attempts to perform IBC Transfer via secret.js API
 *
 * @param {TProps} props
 * @returns {Promise<{success: boolean, errorMsg: Nullable<string>}>} A promise that resolves to an object containing:
 * - `success`: A boolean indicating whether the wrapping operation was successful.
 * - `errorMsg`: A string containing an error message if something went wrong, or null if there were no errors.
 * @async
 */

const performIbcTransfer = async (
  props: TProps
): Promise<{ success: boolean; errorMsg: Nullable<string> }> => {
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

  // IBC Logic
  let {
    deposit_channel_id,
    deposit_gas,
    deposit_gas_denom,
    lcd: lcdSrcChain
  } = chains[props.chainName]

  const chain = token.deposits.filter(
    (deposit: Deposit) => deposit.chain_name === props.chainName
  )[0]

  deposit_channel_id = chain.channel_id || deposit_channel_id
  deposit_gas = chain.gas || deposit_gas

  try {
    let tx: TxResponse
    if (
      !['Evmos', 'Injective'].includes(props.chainName) &&
      (!token.is_ics20 || chain.axelar_chain_name == CHAINS.MAINNET.AXELAR)
    ) {
      // Regular cosmos chain (not ethermint signing)
      if (
        token.name === 'SCRT' ||
        chain.axelar_chain_name == CHAINS.MAINNET.AXELAR
      ) {
        tx = await sourceChainSecretjs.tx.ibc.transfer(
          {
            sender: sourceAddress,
            receiver: props.secretNetworkClient.address,
            source_channel: deposit_channel_id,
            source_port: 'transfer',
            token: {
              amount: props.amount,
              denom: token.deposits.filter(
                (deposit: Deposit) => deposit.chain_name === props.chainName
              )[0].from_denom
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
        tx = await sourceChainSecretjs.tx.ibc.transfer(
          {
            sender: sourceAddress,
            receiver: 'secret198lmmh2fpj3weqhjczptkzl9pxygs23yn6dsev',
            source_channel: deposit_channel_id,
            source_port: 'transfer',
            token: {
              amount: props.amount,
              denom: token.deposits.filter(
                (deposit: any) => deposit.chain_name === props.chainName
              )[0].from_denom
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
    } else if (
      token.is_ics20 &&
      chain.axelar_chain_name != CHAINS.MAINNET.AXELAR
    ) {
      const fromChain = chain.axelar_chain_name,
        toChain = 'secret-snip',
        destinationAddress = props.secretNetworkClient.address,
        asset = token.axelar_denom

      const depositAddress = await sdk.getDepositAddress({
        fromChain,
        toChain,
        destinationAddress,
        asset
      })
      tx = await sourceChainSecretjs.tx.ibc.transfer(
        {
          sender: sourceAddress,
          receiver: depositAddress,
          source_channel: deposit_channel_id,
          source_port: 'transfer',
          token: {
            amount: props.amount,
            denom: chain.from_denom
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
          base_account: {
            account_number: accountNumber,
            sequence: accountSequence
          }
        }
      }: {
        account: {
          base_account: {
            account_number: string
            sequence: string
          }
        }
      } = await (
        await fetch(
          `${
            chains[props.chainName].lcd
          }/cosmos/auth/v1beta1/accounts/${sourceAddress}`
        )
      ).json()

      // Get account pubkey
      // Can't get it from the chain because an account without txs won't have its pubkey listed on-chain
      const evmosProtoSigner = window.getOfflineSigner!(
        chains[props.chainName].chain_id
      )
      const [{ pubkey }] = await evmosProtoSigner.getAccounts()

      // Create IBC MsgTransfer tx
      const txIbcMsgTransfer = createTxIBCMsgTransfer(
        {
          chainId: 9001, // Evmos EIP155, this is ignored in Injective
          cosmosChainId: chains[props.chainName].chain_id
        },
        {
          accountAddress: sourceAddress,
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
          denom: token.deposits.filter(
            (deposit: Deposit) => deposit.chain_name === props.chainName
          )[0].from_denom,
          receiver: props.secretNetworkClient.address,
          revisionNumber: 0,
          revisionHeight: 0,
          timeoutTimestamp: `${
            Math.floor(Date.now() / 1000) + 10 * 60
          }000000000` // 10 minute timeout (ns)
        }
      )

      if (chains[props.chainName].chain_name === 'Injective') {
        const signer_info =
          txIbcMsgTransfer.signDirect.authInfo.signer_infos[0].toObject()
        signer_info.public_key!.type_url =
          '/injective.crypto.v1beta1.ethsecp256k1.PubKey'

        txIbcMsgTransfer.signDirect.authInfo.signer_infos[0] =
          cosmos.tx.v1beta1.SignerInfo.fromObject(signer_info)
      }

      // Sign the tx
      const sig = await (window as any).wallet?.signDirect(
        chains[props.chainName].chain_id,
        sourceAddress,
        {
          bodyBytes: txIbcMsgTransfer.signDirect.body.serializeBinary(),
          authInfoBytes: txIbcMsgTransfer.signDirect.authInfo.serializeBinary(),
          chainId: chains[props.chainName].chain_id,
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
      tx = await sourceChainSecretjs.tx.broadcastSignedTx(txBytes, {
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
        'Source Chain':
          props.ibcMode === 'deposit' ? props.chainName : 'Secret Network',
        'Target Chain':
          props.ibcMode === 'withdrawal' ? props.chainName : 'Secret Network',
        // "Amount": amountToTransfer,
        'Fee Grant used':
          props.feeGrantStatus === 'success' && props.ibcMode === 'withdrawal'
            ? true
            : false
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

  // if (props.ibcMode === 'withdrawal') {
  //   const amount = new BigNumber(props.amount)
  //     .multipliedBy(`1e${selectedToken.decimals}`)
  //     .toFixed(0, BigNumber.ROUND_DOWN)

  //   let {
  //     withdraw_channel_id,
  //     withdraw_gas,
  //     lcd: lcdDstChain
  //   } = chains[selectedSource.chain_name]

  //   const withdrawalChain = selectedToken.withdrawals.filter(
  //     (withdrawal: any) => withdrawal.chain_name === selectedSource.chain_name
  //   )[0]

  //   withdraw_channel_id = withdrawalChain.channel_id || withdraw_channel_id
  //   withdraw_gas = withdrawalChain.gas || withdraw_gas

  //   const toastId = toast.loading(
  //     `Sending ${normalizedAmount} ${selectedToken.name} from Secret Network to ${selectedSource.chain_name}`,
  //     {
  //       closeButton: true
  //     }
  //   )

  //   try {
  //     let tx: TxResponse

  //     if (selectedToken.is_snip20) {
  //       tx = await secretjs.tx.compute.executeContract(
  //         {
  //           contract_address: selectedToken.address,
  //           code_hash: selectedToken.code_hash,
  //           sender: secretjs?.address,
  //           msg: {
  //             send: {
  //               recipient: 'secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4', // cw20-ics20
  //               recipient_code_hash:
  //                 'f85b413b547b9460162958bafd51113ac266dac96a84c33b9150f68f045f2641',
  //               amount,
  //               msg: toBase64(
  //                 toUtf8(
  //                   JSON.stringify({
  //                     channel: withdraw_channel_id,
  //                     remote_address: sourceAddress,
  //                     timeout: 600 // 10 minute timeout
  //                   })
  //                 )
  //               )
  //             }
  //           }
  //         },
  //         {
  //           broadcastCheckIntervalMs: 10000,
  //           gasLimit: withdraw_gas,
  //           gasPriceInFeeDenom: 0.1,
  //           feeDenom: 'uscrt',
  //           feeGranter: feeGrantStatus === 'Success' ? faucetAddress : '',
  //           ibcTxsOptions: {
  //             resolveResponses: true,
  //             resolveResponsesCheckIntervalMs: 250,
  //             resolveResponsesTimeoutMs: 12 * 60 * 1000
  //           },
  //           broadcastMode: BroadcastMode.Sync
  //         }
  //       )
  //     } else if (
  //       selectedToken.is_ics20 &&
  //       !(
  //         withdrawalChain?.axelar_chain_name === CHAINS.MAINNET.AXELAR &&
  //         selectedToken.name === 'SCRT'
  //       )
  //     ) {
  //       const fromChain = 'secret-snip',
  //         toChain = withdrawalChain.axelar_chain_name,
  //         destinationAddress = sourceAddress,
  //         asset = selectedToken.axelar_denom

  //       let depositAddress = ''

  //       if (withdrawalChain?.axelar_chain_name === CHAINS.MAINNET.AXELAR) {
  //         depositAddress = destinationAddress
  //       } else {
  //         depositAddress = await sdk.getDepositAddress({
  //           fromChain,
  //           toChain,
  //           destinationAddress,
  //           asset
  //         })
  //       }

  //       console.log(
  //         JSON.stringify({
  //           channel: withdraw_channel_id,
  //           remote_address: depositAddress,
  //           timeout: 600 // 10 minute timeout
  //         })
  //       )
  //       tx = await secretjs.tx.compute.executeContract(
  //         {
  //           contract_address: selectedToken.address,
  //           code_hash: selectedToken.code_hash,
  //           sender: secretjs?.address,
  //           msg: {
  //             send: {
  //               recipient: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83', // ics20
  //               recipient_code_hash:
  //                 '2976a2577999168b89021ecb2e09c121737696f71c4342f9a922ce8654e98662',
  //               amount,
  //               msg: toBase64(
  //                 toUtf8(
  //                   JSON.stringify({
  //                     channel: withdraw_channel_id,
  //                     remote_address: depositAddress,
  //                     timeout: 600 // 10 minute timeout
  //                   })
  //                 )
  //               )
  //             }
  //           }
  //         },
  //         {
  //           broadcastCheckIntervalMs: 10000,
  //           gasLimit: withdraw_gas,
  //           gasPriceInFeeDenom: 0.1,
  //           feeDenom: 'uscrt',
  //           feeGranter: feeGrantStatus === 'Success' ? faucetAddress : '',
  //           ibcTxsOptions: {
  //             resolveResponses: true,
  //             resolveResponsesCheckIntervalMs: 10_000,
  //             resolveResponsesTimeoutMs: 12 * 60 * 1000
  //           },
  //           broadcastMode: BroadcastMode.Sync
  //         }
  //       )
  //     } else if (selectedToken.name === 'SCRT') {
  //       const source_channel_id =
  //         withdrawalChain?.axelar_chain_name == CHAINS.MAINNET.AXELAR &&
  //         selectedToken.name !== 'SCRT'
  //           ? withdrawalChain.channel_id
  //           : withdraw_channel_id
  //       tx = await secretjs.tx.ibc.transfer(
  //         {
  //           sender: secretjs?.address,
  //           receiver: sourceAddress,
  //           source_channel: source_channel_id,
  //           source_port: 'transfer',
  //           token: {
  //             amount,
  //             denom: withdrawalChain.from_denom
  //           },
  //           timeout_timestamp: String(Math.floor(Date.now() / 1000) + 10 * 60) // 10 minute timeout
  //         },
  //         {
  //           broadcastCheckIntervalMs: 10000,
  //           gasLimit: withdraw_gas,
  //           gasPriceInFeeDenom: 0.1,
  //           feeDenom: 'uscrt',
  //           feeGranter: feeGrantStatus === 'Success' ? faucetAddress : '',
  //           ibcTxsOptions: {
  //             resolveResponses: true,
  //             resolveResponsesCheckIntervalMs: 250,
  //             resolveResponsesTimeoutMs: 12 * 60 * 1000
  //           },
  //           broadcastMode: BroadcastMode.Sync
  //         }
  //       )
  //     } else {
  //       tx = await secretjs.tx.broadcast(
  //         [
  //           new MsgExecuteContract({
  //             sender: secretjs?.address,
  //             contract_address: selectedToken.address,
  //             code_hash: selectedToken.code_hash,
  //             sent_funds: [],
  //             msg: {
  //               redeem: {
  //                 amount,
  //                 denom: selectedToken.withdrawals[0].from_denom,
  //                 padding: randomPadding()
  //               }
  //             }
  //           } as any),
  //           new MsgTransfer({
  //             sender: secretjs?.address,
  //             receiver: sourceAddress,
  //             source_channel: withdraw_channel_id,
  //             source_port: 'transfer',
  //             token: {
  //               amount,
  //               denom: withdrawalChain.from_denom
  //             },
  //             timeout_timestamp: String(Math.floor(Date.now() / 1000) + 10 * 60) // 10 minute timeout
  //           })
  //         ],
  //         {
  //           broadcastCheckIntervalMs: 10000,
  //           gasLimit: 150_000,
  //           gasPriceInFeeDenom: 0.1,
  //           feeDenom: 'uscrt',
  //           feeGranter: feeGrantStatus === 'Success' ? faucetAddress : '',
  //           ibcTxsOptions: {
  //             resolveResponses: true,
  //             resolveResponsesCheckIntervalMs: 250,
  //             resolveResponsesTimeoutMs: 12 * 60 * 1000
  //           },
  //           broadcastMode: BroadcastMode.Sync
  //         }
  //       )
  //     }

  //     if (tx.code !== 0) {
  //       toast.update(toastId, {
  //         render: `Failed sending ${normalizedAmount} ${selectedToken.name} from Secret Network to ${selectedSource.chain_name}: ${tx.rawLog}`,
  //         type: 'error',
  //         isLoading: false
  //       })
  //     } else {
  //       toast.update(toastId, {
  //         render: `Receiving ${normalizedAmount} ${selectedToken.name} on ${selectedSource.chain_name}`
  //       })

  //       const ibcResp = await tx.ibcResponses[0]

  //       if (ibcResp.type === 'ack') {
  //         updateCoinBalance()
  //         toast.update(toastId, {
  //           render: `Received ${normalizedAmount} ${selectedToken.name} on ${selectedSource.chain_name}`,
  //           type: 'success',
  //           isLoading: false,
  //           closeOnClick: true
  //         })
  //       } else {
  //         toast.update(toastId, {
  //           render: `Timed out while waiting to receive ${normalizedAmount} ${selectedToken.name} on ${selectedSource.chain_name} from Secret Network`,
  //           type: 'warning',
  //           isLoading: false
  //         })
  //       }
  //     }
  //   } catch (e) {
  //     toast.update(toastId, {
  //       render: `Failed sending ${normalizedAmount} ${
  //         selectedToken.name
  //       } from Secret Network to ${selectedSource.chain_name}: ${
  //         (e as any).message
  //       }`,
  //       type: 'error',
  //       isLoading: false
  //     })
  //   } finally {
  //   }

  //   // End IBC Logic

  //   const baseAmount = props.amount
  //   const amount = new BigNumber(Number(baseAmount))
  //     .multipliedBy(`1e${token.decimals}`)
  //     .toFixed(0, BigNumber.ROUND_DOWN)

  //   if (amount === 'NaN') {
  //     console.error('NaN amount', baseAmount)
  //     result.success = false
  //     result.errorMsg = 'Amount is not a valid number!'
  //     return result
  //   }

  //   try {
  //     if (props.wrappingMode === 'wrap') {
  //       await props.secretNetworkClient.tx
  //         .broadcast(
  //           [
  //             new MsgExecuteContract({
  //               sender: props.secretNetworkClient.address,
  //               contract_address: token.address,
  //               code_hash: token.code_hash,
  //               sent_funds: [
  //                 { denom: token.withdrawals[0].from_denom, amount }
  //               ],
  //               msg: {
  //                 deposit: {
  //                   padding: randomPadding()
  //                 }
  //               }
  //             } as any)
  //           ],
  //           {
  //             gasLimit: 150_000,
  //             gasPriceInFeeDenom: 0.25,
  //             feeDenom: 'uscrt',
  //             feeGranter:
  //               props.feeGrantStatus === 'success' ? faucetAddress : '',
  //             broadcastMode: BroadcastMode.Sync
  //           }
  //         )
  //         .catch((error: any) => {
  //           console.error(error)
  //           result.success = false
  //           result.errorMsg = `Wrapping of ${token.name} failed: ${error.tx.rawLog}`
  //           return result
  //         })
  //         .then((tx: any) => {
  //           console.log(tx)
  //           if (tx) {
  //             if (tx.code === 0) {
  //               result.success = true
  //               result.errorMsg = null
  //               return result
  //             }
  //           }
  //         })
  //     }

  //     if (props.wrappingMode === 'unwrap') {
  //       await props.secretNetworkClient.tx
  //         .broadcast(
  //           [
  //             new MsgExecuteContract({
  //               sender: props.secretNetworkClient.address,
  //               contract_address: props.secretNetworkClient.address,
  //               // code_hash: props.secretNetworkClient.code_hash,
  //               sent_funds: [],
  //               msg: {
  //                 redeem: {
  //                   amount,
  //                   denom:
  //                     token.name === 'SCRT'
  //                       ? undefined
  //                       : token.withdrawals[0].from_denom,
  //                   padding: randomPadding()
  //                 }
  //               }
  //             } as any)
  //           ],
  //           {
  //             gasLimit: 150_000,
  //             gasPriceInFeeDenom: 0.25,
  //             feeDenom: 'uscrt',
  //             feeGranter:
  //               props.feeGrantStatus === 'success' ? faucetAddress : '',
  //             broadcastMode: BroadcastMode.Sync
  //           }
  //         )
  //         .catch((error: any) => {
  //           console.error(error)
  //           result.success = false
  //           result.errorMsg = `Unwrapping of s${token.name} failed: ${error.tx.rawLog}`
  //           return result
  //         })
  //         .then((tx: any) => {
  //           console.log(tx)
  //           if (tx) {
  //             if (tx.code === 0) {
  //               result.success = true
  //               result.errorMsg = null
  //               return result
  //             }
  //           }
  //         })
  //     }
  //   } catch (error: any) {
  //     console.error(error)
  //     result.success = false
  //     result.errorMsg = error
  //     return result
  //   }
  //   result.success = false
  //   result.errorMsg = 'Unwrapping failed!'
  //   return result
  // }
}

/**
Get supported chains for IBC transfers.
@returns An array of chains.
*/
function getSupportedChains(): Deposit[] {
  const supportedChains = tokens.find(
    (token: Token) => token.name === 'SCRT'
  ).deposits
  return supportedChains
}

/**
Get supported IBC tokens by the specified chain.
@param chain - The chain for which to retrieve supported IBC tokens.
@returns An array of supported IBC tokens (as Token) on the given chain.
*/
function getSupportedIbcTokensByChain(chain: Chain) {
  const supportedTokens = tokens.filter((token: Token) => {
    return token.deposits.find(
      (deposit: Deposit) => deposit.chain_name === chain.chain_name
    )
  })
  return supportedTokens
}

export const IbcService = {
  getSupportedChains,
  getSupportedIbcTokensByChain,
  performIbcTransfer
}

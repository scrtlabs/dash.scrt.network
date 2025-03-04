import { AxelarAssetTransfer, AxelarQueryAPI, CHAINS, Environment } from '@axelar-network/axelarjs-sdk'
import { createTxIBCMsgTransfer } from '@evmos/transactions'
import BigNumber from 'bignumber.js'
import { SkipClient, SKIP_API_URL, Operation } from '@skip-go/client'
import {
  BroadcastMode,
  MsgExecuteContract,
  MsgTransfer,
  SecretNetworkClient,
  fromBase64,
  toBase64,
  toUtf8
} from 'secretjs'
import { FeeGrantStatus } from 'types/FeeGrantStatus'
import { IbcMode } from 'types/IbcMode'
import { sleep, faucetAddress, randomPadding, allTokens, suggestChainToWallet, queryTxResult } from 'utils/commons'
import { Chain, Deposit, Token, Withdraw, chains } from 'utils/config'
import Long from 'long'
import { TxRaw } from 'secretjs/dist/protobuf/cosmos/tx/v1beta1/tx'
import mixpanel from 'mixpanel-browser'
import { NotificationService } from './notification.service'
import { GetBalanceError } from 'types/GetBalanceError'
import { GasPrice, MsgTransferEncodeObject, SigningStargateClient } from '@cosmjs/stargate'

const sdk: AxelarAssetTransfer = new AxelarAssetTransfer({
  environment: Environment.MAINNET
})

interface TProps {
  ibcMode: IbcMode
  chain: Chain
  token: Token
  amount: string
  secretNetworkClient: SecretNetworkClient
  feeGrantStatus: FeeGrantStatus
}

async function getChainSecretJs(chain: Chain): Promise<SecretNetworkClient> {
  while (!window.wallet || !window.wallet.getOfflineSignerAuto) {
    await sleep(100)
  }

  const { chain_id, lcd } = chains[chain.chain_name]

  try {
    await window.wallet.enable(chain_id)
  } catch {
    await suggestChainToWallet(window.wallet, chain_id)
    await window.wallet.enable(chain_id)
  }

  if (window.wallet) {
    window.wallet.defaultOptions = {
      sign: {
        preferNoSetFee: false,
        disableBalanceCheck: true
      }
    }
  }

  const sourceOfflineSigner = await window.wallet.getOfflineSignerAuto(chain_id)
  const depositFromAccounts = await sourceOfflineSigner.getAccounts()

  const secretNetworkClient = new SecretNetworkClient({
    url: lcd,
    chainId: chain_id,
    wallet: sourceOfflineSigner,
    walletAddress: depositFromAccounts[0].address
  })
  return secretNetworkClient
}

async function performIbcDeposit(
  props: TProps,
  token: Token,
  sourceChainNetworkClient: SecretNetworkClient
): Promise<string> {
  let tx

  const selectedSource = props.chain

  const toastId = NotificationService.notify(
    `Sending ${props.amount} ${token.name} from ${selectedSource.chain_name} to Secret Network`,
    'loading'
  )

  let { deposit_channel_id, deposit_gas, deposit_gas_denom } = selectedSource

  const deposit: Deposit = token.deposits.filter((deposit: Deposit) => deposit.chain_name === props.chain.chain_name)[0]

  const useSKIPRouting = deposit.needsSkip === true

  deposit_channel_id = deposit.channel_id || deposit_channel_id
  deposit_gas = deposit.gas || deposit_gas

  const amount: string = new BigNumber(props.amount)
    .multipliedBy(`1e${token.decimals}`)
    .toFixed(0, BigNumber.ROUND_DOWN)

  try {
    if (!['Evmos', 'Injective', 'Dymension'].includes(props.chain.chain_name) && !token.is_axelar_asset) {
      // Regular cosmos chain (not ethermint signing)
      if (token.name === 'ampLUNA' || token.name === 'bLUNA') {
        //@ts-ignore
        const contractMsg = new (Terra as any).MsgExecuteContract(
          sourceChainNetworkClient.address,
          token.deposits
            .find((deposit: Deposit) => deposit.chain_name === props.chain.chain_name)
            .denom.substring('cw20:'.length),
          {
            send: {
              amount: amount.toString(),
              msg: toBase64(
                toUtf8(
                  JSON.stringify({
                    channel: deposit_channel_id,
                    remote_address: 'secret198lmmh2fpj3weqhjczptkzl9pxygs23yn6dsev',
                    timeout: 900,
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
                  })
                )
              ),
              channel: deposit_channel_id,
              timeout: 900,
              contract: 'terra1e0mrzy8077druuu42vs0hu7ugguade0cj65dgtauyaw4gsl4kv0qtdf2au', //cw20-ics20 contract on Terra
              remote_address: 'secret198lmmh2fpj3weqhjczptkzl9pxygs23yn6dsev'
            }
          },
          []
        )

        //@ts-ignore
        const terra = new Terra.LCDClient({
          URL: props.chain.lcd,
          chainID: props.chain.chain_id,
          isClassic: false
        })

        const terraSigner = await window.wallet.getOfflineSignerAuto(props.chain.chain_id)
        const accounts = await terraSigner.getAccounts()

        // Create the transaction options with the corrected fee structure
        const txOptions = {
          msgs: [contractMsg],
          //@ts-ignore
          fee: new Terra.Fee(deposit_gas),
          memo: '' // Add a memo if needed, or keep it as an empty string
        }

        const { account } = await (
          await fetch(`${selectedSource.lcd}/cosmos/auth/v1beta1/accounts/${sourceChainNetworkClient.address}`)
        ).json()

        const txBody = await terra.tx.create(
          [{ address: accounts[0].address, sequenceNumber: account.sequence }],
          txOptions
        )

        const signerInfo = {
          public_key: { '@type': account.pub_key['@type'], key: account.pub_key.key },
          mode_info: {
            single: {
              //@ts-ignore
              mode: Terra.SignMode.SIGN_MODE_DIRECT
            }
          },
          sequence: account.sequence
        }
        //@ts-ignore
        txBody.auth_info.signer_infos[0] = Terra.SignerInfo.fromData(signerInfo)

        // Sign the tx
        const sig = await window.wallet?.signDirect(
          selectedSource.chain_id,
          sourceChainNetworkClient.address,
          {
            bodyBytes: txBody.body.toBytes(),
            authInfoBytes: txBody.auth_info.toBytes(),
            chainId: selectedSource.chain_id,
            accountNumber: new Long(Number(account.account_number))
          },
          { isEthereum: false }
        )

        // Encode the Terra tx to a TxRaw protobuf binary
        const txRaw = TxRaw.fromPartial({
          body_bytes: sig!.signed.bodyBytes,
          auth_info_bytes: sig!.signed.authInfoBytes,
          signatures: [fromBase64(sig!.signature.signature)]
        })
        const txBytes = TxRaw.encode(txRaw).finish()

        // Broadcast the tx to Terra
        tx = await sourceChainNetworkClient.tx.broadcastSignedTx(txBytes, {
          broadcastMode: BroadcastMode.Sync
        })
      } else if (token.name === 'SCRT' || token.is_snip20) {
        const routing = useSKIPRouting
          ? await getSkipIBCRouting(
              selectedSource,
              'deposit',
              token,
              new BigNumber(props.amount).multipliedBy(`1e${props.token.decimals}`)
            )
          : null

        const receiver = useSKIPRouting
          ? await getReceiverAddress((routing.operations[1] as any).transfer.chainID)
          : props.secretNetworkClient.address
        const forwardingMemo = useSKIPRouting
          ? await composePMFMemo(routing.operations, props.secretNetworkClient.address)
          : null

        const client = await SigningStargateClient.connectWithSigner(
          props.chain.rpc,
          (sourceChainNetworkClient as any).wallet,
          {
            gasPrice: GasPrice.fromString('1' + deposit_gas_denom)
          }
        )

        tx = await client.signAndBroadcast(
          sourceChainNetworkClient.address,
          [
            {
              value: {
                sender: sourceChainNetworkClient.address,
                // HACK: because of typescript issues with MsgTransferEncodeObject
                // expecting bigint in Timestamp
                timeoutTimestamp: (
                  BigInt(Math.floor(Date.now() / 1000) + 10 * 60) * BigInt(10 ** 9)
                ).toString() as unknown as bigint,
                memo: useSKIPRouting ? forwardingMemo : ' ',
                // make sure to send undefined or ' ' as otherwise secret nodes
                // will reject tx due to IBC hook logic of removing signer when memo is present
                // additionally make sure to send '' instead of undefined, if we use stargate
                token: {
                  amount,
                  denom: token.deposits.filter((deposit: Deposit) => deposit.chain_name === props.chain.chain_name)[0]
                    .denom
                },
                sourcePort: useSKIPRouting ? (routing.operations[0] as any).transfer.port : 'transfer',
                sourceChannel: useSKIPRouting ? (routing.operations[0] as any).transfer.channel : deposit_channel_id,
                receiver: receiver
              },
              typeUrl: '/ibc.applications.transfer.v1.MsgTransfer'
            } as MsgTransferEncodeObject
          ],
          'auto'
        )
      } else {
        const routing = useSKIPRouting
          ? await getSkipIBCRouting(
              selectedSource,
              'deposit',
              token,
              new BigNumber(props.amount).multipliedBy(`1e${props.token.decimals}`)
            )
          : null

        const autoWrapJsonString = JSON.stringify({
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

        const receiver = useSKIPRouting
          ? await getReceiverAddress((routing.operations[1] as any).transfer.chainID)
          : 'secret198lmmh2fpj3weqhjczptkzl9pxygs23yn6dsev'
        const forwardingMemo = useSKIPRouting
          ? await composePMFMemo(
              routing.operations,
              'secret198lmmh2fpj3weqhjczptkzl9pxygs23yn6dsev',
              autoWrapJsonString
            )
          : null

        const client = await SigningStargateClient.connectWithSigner(
          props.chain.rpc,
          (sourceChainNetworkClient as any).wallet,
          {
            gasPrice: GasPrice.fromString('1' + deposit_gas_denom)
          }
        )

        tx = await client.signAndBroadcast(
          sourceChainNetworkClient.address,
          [
            {
              value: {
                sender: sourceChainNetworkClient.address,
                // HACK: because of typescript issues with MsgTransferEncodeObject
                // expecting bigint in Timestamp
                timeoutTimestamp: (
                  BigInt(Math.floor(Date.now() / 1000) + 10 * 60) * BigInt(10 ** 9)
                ).toString() as unknown as bigint,
                memo: useSKIPRouting ? forwardingMemo : autoWrapJsonString,
                // make sure to send undefined or ' ' as otherwise secret nodes
                // will reject tx due to IBC hook logic of removing signer when memo is present
                // additionally make sure to send '' instead of undefined, if we use stargate
                token: {
                  amount,
                  denom: token.deposits.filter((deposit: Deposit) => deposit.chain_name === props.chain.chain_name)[0]
                    .denom
                },
                sourcePort: useSKIPRouting ? (routing.operations[0] as any).transfer.port : 'transfer',
                sourceChannel: useSKIPRouting ? (routing.operations[0] as any).transfer.channel : deposit_channel_id,
                receiver: receiver
              },
              typeUrl: '/ibc.applications.transfer.v1.MsgTransfer'
            } as MsgTransferEncodeObject
          ],
          'auto'
        )
      }
    } else if (token.is_axelar_asset) {
      const fromChain: string = deposit.axelar_chain_name,
        toChain = 'secret-snip',
        destinationAddress = props.secretNetworkClient.address,
        asset = token.axelar_denom

      let depositAddress
      if (deposit?.axelar_chain_name === CHAINS.MAINNET.AXELAR) {
        depositAddress = destinationAddress
      } else {
        NotificationService.notify(
          `Getting Axelar deposit address for sending to Secret Network from ${props.chain.chain_name}`,
          'loading',
          toastId
        )
        depositAddress = await sdk.getDepositAddress({
          fromChain,
          toChain,
          destinationAddress,
          asset
        })
      }
      NotificationService.notify(
        `Sending ${props.amount} ${token.name} from ${selectedSource.chain_name} to Secret Network`,
        'loading',
        toastId
      )

      const client = await SigningStargateClient.connectWithSigner(
        props.chain.rpc,
        (sourceChainNetworkClient as any).wallet,
        {
          gasPrice: GasPrice.fromString('1' + deposit_gas_denom)
        }
      )

      tx = await client.signAndBroadcast(
        sourceChainNetworkClient.address,
        [
          {
            value: {
              sender: sourceChainNetworkClient.address,
              // HACK: because of typescript issues with MsgTransferEncodeObject
              // expecting bigint in Timestamp
              timeoutTimestamp: (
                BigInt(Math.floor(Date.now() / 1000) + 10 * 60) * BigInt(10 ** 9)
              ).toString() as unknown as bigint,
              // make sure to send undefined or ' ' as otherwise secret nodes
              // will reject tx due to IBC hook logic of removing signer when memo is present
              // additionally make sure to send '' instead of undefined, if we use stargate
              token: {
                amount,
                denom: deposit.denom
              },
              sourcePort: 'transfer',
              sourceChannel: deposit_channel_id,
              receiver: depositAddress
            },
            typeUrl: '/ibc.applications.transfer.v1.MsgTransfer'
          } as MsgTransferEncodeObject
        ],
        'auto'
      )
    } else {
      // Handle IBC transfers from Ethermint chains like Evmos & Injective

      // Get account_number & sequence
      const account_data = await (
        await fetch(`${selectedSource.lcd}/cosmos/auth/v1beta1/accounts/${sourceChainNetworkClient.address}`)
      ).json()

      const accountNumber = ['Evmos', 'Injective'].includes(props.chain.chain_name)
        ? account_data.account.base_account.account_number
        : account_data.account.account_number
      const accountSequence = ['Evmos', 'Injective'].includes(props.chain.chain_name)
        ? account_data.account.base_account.sequence
        : account_data.account.sequence

      // Get account pubkey
      // Can't get it from the chain because an account without txs won't have its pubkey listed on-chain
      const evmosProtoSigner = await window.getOfflineSignerAuto!(selectedSource.chain_id)
      const [{ pubkey }]: readonly any[] = await evmosProtoSigner.getAccounts()

      const autoWrapJsonString = JSON.stringify({
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

      // Create IBC MsgTransfer tx
      const txIbcMsgTransfer = createTxIBCMsgTransfer(
        {
          chain: {
            chainId: 9001, // Evmos EIP155, this is ignored in Injective
            cosmosChainId: selectedSource.chain_id
          },
          sender: {
            accountAddress: sourceChainNetworkClient.address,
            accountNumber: Number(accountNumber),
            sequence: Number(accountSequence),
            pubkey: toBase64(pubkey)
          },
          fee: {
            gas: deposit_gas.toString(),
            amount: '0', // filled in by Keplr
            denom: 'inj' // filled in by Keplr
          },
          memo: ''
        },
        {
          sourcePort: 'transfer',
          sourceChannel: deposit_channel_id,
          amount: amount,
          denom: token.deposits.filter((deposit: Deposit) => deposit.chain_name === props.chain.chain_name)[0].denom,
          receiver:
            token.name == 'SCRT' ? props.secretNetworkClient.address : 'secret198lmmh2fpj3weqhjczptkzl9pxygs23yn6dsev',
          memo: token.name == 'SCRT' ? ' ' : autoWrapJsonString, //keep this empty " " there or signing might not work
          revisionNumber: 0,
          revisionHeight: 0,
          timeoutTimestamp: `${Math.floor(Date.now() / 1000) + 10 * 60}000000000` // 10 minute timeout (ns)
        }
      )

      if (selectedSource.chain_name === 'Injective') {
        const signer_info = txIbcMsgTransfer.signDirect.authInfo.signerInfos[0]
        signer_info.publicKey!.typeUrl = '/injective.crypto.v1beta1.ethsecp256k1.PubKey'
      }

      // Sign the tx
      const sig = await window.wallet?.signDirect(
        selectedSource.chain_id,
        sourceChainNetworkClient.address,
        {
          bodyBytes: txIbcMsgTransfer.signDirect.body.toBinary(),
          authInfoBytes: txIbcMsgTransfer.signDirect.authInfo.toBinary(),
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
      tx = await sourceChainNetworkClient.tx.broadcastSignedTx(txBytes, {
        ibcTxsOptions: {
          resolveResponses: false
        },
        broadcastMode: BroadcastMode.Sync,
        waitForCommit: false
      })
    }

    tx = await queryTxResult(sourceChainNetworkClient, tx.transactionHash, 5000, 10)

    if (tx.code !== 0) {
      console.error(
        `Failed sending ${props.amount} ${token.name} from ${props.chain.chain_name} to Secret Network: ${tx.rawLog}`
      )
      NotificationService.notify(
        `Failed sending ${props.amount} ${token.name} from ${props.chain.chain_name} to Secret Network: ${tx.rawLog}`,
        'error',
        toastId
      )
    } else {
      NotificationService.notify(
        `Send ${props.amount} ${token.name} from ${selectedSource.chain_name} from Secret Network`,
        'success',
        toastId
      )
    }
  } catch (e: any) {
    if (import.meta.env.VITE_MIXPANEL_ENABLED === 'true') {
      mixpanel.init(import.meta.env.VITE_MIXPANEL_PROJECT_TOKEN, {
        debug: false
      })
      mixpanel.identify('Dashboard-App')
      mixpanel.track('IBC Transfer', {
        'Source Chain': props.ibcMode === 'deposit' ? props.chain.chain_name : 'Secret Network',
        'Target Chain': props.ibcMode === 'withdrawal' ? props.chain.chain_name : 'Secret Network',
        'Fee Grant used': props.feeGrantStatus === 'success' && props.ibcMode === 'withdrawal' ? true : false
      })
    }
    console.error(
      `Failed sending ${props.amount} ${token.name} from ${props.chain.chain_name} to Secret Network: ${
        (e as any).message
      }`
    )
    NotificationService.notify(
      `Failed sending ${props.amount} ${token.name} from ${props.chain.chain_name} to Secret Network: ${
        (e as any).message
      }`,
      'error',
      toastId
    )
  }
  return
}

async function performIbcWithdrawal(
  props: TProps,
  token: Token,
  sourceChainNetworkClient: SecretNetworkClient
): Promise<string> {
  let tx

  const selectedDest: Chain = chains[props.chain.chain_name]

  const amount: string = new BigNumber(props.amount)
    .multipliedBy(`1e${token.decimals}`)
    .toFixed(0, BigNumber.ROUND_DOWN)

  let { withdraw_channel_id, withdraw_gas } = selectedDest

  const withdrawalChain: Withdraw = token.withdrawals.filter(
    (withdrawal: Withdraw) => withdrawal.chain_name === selectedDest.chain_name
  )[0]

  const useSKIPRouting = withdrawalChain.needsSkip === true

  withdraw_channel_id = withdrawalChain.channel_id || withdraw_channel_id
  withdraw_gas = withdrawalChain.gas || withdraw_gas

  const toastId = NotificationService.notify(
    `Sending ${props.amount} ${token.name} from Secret Network to ${selectedDest.chain_name}`,
    'loading'
  )

  try {
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
                    remote_address: sourceChainNetworkClient.address,
                    timeout: 600 // 10 minute timeout
                  })
                )
              )
            }
          }
        },
        {
          broadcastCheckIntervalMs: 1000,
          gasLimit: withdraw_gas,
          gasPriceInFeeDenom: 0.25,
          feeDenom: 'uscrt',
          feeGranter: props.feeGrantStatus === 'success' ? faucetAddress : '',
          ibcTxsOptions: {
            resolveResponses: false
          },
          broadcastMode: BroadcastMode.Sync,
          waitForCommit: false
        }
      )
    } else if (token.is_axelar_asset) {
      const fromChain = 'secret-snip',
        toChain = withdrawalChain.axelar_chain_name,
        destinationAddress = sourceChainNetworkClient.address,
        asset = token.axelar_denom

      let depositAddress = ''

      if (withdrawalChain?.axelar_chain_name === CHAINS.MAINNET.AXELAR) {
        depositAddress = destinationAddress
      } else {
        NotificationService.notify(
          `Getting Axelar deposit address for sending to Secret Network from ${props.chain.chain_name}`,
          'loading',
          toastId
        )
        depositAddress = await sdk.getDepositAddress({
          fromChain,
          toChain,
          destinationAddress,
          asset
        })
      }
      NotificationService.notify(
        `Sending ${props.amount} ${token.name} from Secret Network to ${selectedDest.chain_name}`,
        'loading',
        toastId
      )

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
          broadcastCheckIntervalMs: 1000,
          gasLimit: withdraw_gas,
          gasPriceInFeeDenom: 0.25,
          feeDenom: 'uscrt',
          feeGranter: props.feeGrantStatus === 'success' ? faucetAddress : '',
          ibcTxsOptions: {
            resolveResponses: false
          },
          broadcastMode: BroadcastMode.Sync,
          waitForCommit: false
        }
      )
    } else {
      const routing = useSKIPRouting
        ? await getSkipIBCRouting(
            selectedDest,
            'withdrawal',
            token,
            new BigNumber(props.amount).multipliedBy(`1e${props.token.decimals}`)
          )
        : null

      const receiver = useSKIPRouting
        ? await getReceiverAddress((routing.operations[1] as any).transfer.chainID)
        : sourceChainNetworkClient.address

      // KEEP this " " inside of the quotes, otherwise singing will fail (don't ask me why)
      const forwardingMemo = useSKIPRouting
        ? await composePMFMemo(routing.operations, sourceChainNetworkClient.address)
        : ' '

      const redeemMsg = new MsgExecuteContract({
        sender: props.secretNetworkClient?.address,
        contract_address: token.address,
        code_hash: token.code_hash,
        sent_funds: [],
        msg: {
          redeem: {
            amount,
            denom: withdrawalChain.denom,
            padding: randomPadding()
          }
        }
      })

      // Construct the IBC timeout height object
      const timeout_height = {
        revision_number: '100',
        revision_height: '1000000000000000000'
      }

      const transferMsg = new MsgTransfer({
        sender: props.secretNetworkClient?.address,
        receiver: receiver,
        source_channel: useSKIPRouting ? (routing.operations[0] as any).transfer.channel : withdraw_channel_id,
        source_port: useSKIPRouting ? (routing.operations[0] as any).transfer.port : 'transfer',
        token: {
          amount,
          denom: withdrawalChain.denom
        },
        memo: forwardingMemo,
        timeout_height: timeout_height,
        timeout_timestamp: String(Math.floor(Date.now() / 1000) + 10 * 60) // 10 minute timeout
      })
      tx = await props.secretNetworkClient.tx.broadcast(
        token.name === 'SCRT' ? [transferMsg] : [redeemMsg, transferMsg],
        {
          broadcastCheckIntervalMs: 1000,
          gasLimit: withdraw_gas,
          gasPriceInFeeDenom: 0.25,
          feeDenom: 'uscrt',
          feeGranter: props.feeGrantStatus === 'success' ? faucetAddress : '',
          ibcTxsOptions: {
            resolveResponses: false
          },
          broadcastMode: BroadcastMode.Sync,
          waitForCommit: false
        }
      )
    }

    tx = await queryTxResult(props.secretNetworkClient, tx.transactionHash, 5000, 10)

    if (tx.code !== 0) {
      console.error(
        `Failed sending ${props.amount} ${token.name} from Secret Network to ${selectedDest.chain_name}: ${tx.rawLog}`
      )
      NotificationService.notify(
        `Failed sending ${props.amount} ${token.name} from Secret Network to ${selectedDest.chain_name}: ${tx.rawLog}`,
        'error',
        toastId
      )
    } else {
      NotificationService.notify(`Sent ${props.amount} ${token.name} to ${selectedDest.chain_name}`, 'success', toastId)
    }
  } catch (error: any) {
    console.error(
      `Failed sending ${props.amount} ${token.name} from Secret Network to ${selectedDest.chain_name}: ${error?.message}`
    )
    NotificationService.notify(
      `Failed sending ${props.amount} ${token.name} from Secret Network to ${selectedDest.chain_name}: ${error?.message}`,
      'error',
      toastId
    )
  }
  return
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

async function fetchSourceBalance(address: string, chain: Chain, token: Token): Promise<BigNumber | GetBalanceError> {
  if (!address) {
    console.error('Address is required')
    return 'GenericFetchError' as GetBalanceError
  }

  const url = `${chains[chain.chain_name].lcd}/cosmos/bank/v1beta1/balances/${address}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.statusText}`)
      return 'GenericFetchError' as GetBalanceError
    }

    const { balances } = await response.json()
    const targetDenom = token.deposits.filter((deposit: any) => deposit.chain_name === chain.chain_name)[0]?.denom
    const balanceObj = balances.find((balance: any) => balance.denom === targetDenom)

    return balanceObj ? BigNumber(balanceObj.amount) : BigNumber(0)
  } catch (e) {
    console.error(`Error while trying to query ${url}:`, e)
    return 'GenericFetchError' as GetBalanceError
  }
}

async function getSkipIBCRouting(chain: Chain, IbcMode: IbcMode, token: Token, amount: BigNumber) {
  const client = new SkipClient({
    apiURL: SKIP_API_URL
  })

  let dest
  let source
  if (IbcMode === 'deposit') {
    source = token.deposits.find((deposit) => deposit.chain_name === chain.chain_name)
    dest = token.withdrawals.find((withdrawals) => withdrawals.chain_name === chain.chain_name)
  }
  if (IbcMode === 'withdrawal') {
    dest = token.deposits.find((deposit) => deposit.chain_name === chain.chain_name)
    source = token.withdrawals.find((withdrawal) => withdrawal.chain_name === chain.chain_name)
  }

  try {
    const route = await client.route({
      amountIn: amount.toString(),
      sourceAssetDenom: source.denom,
      sourceAssetChainID: IbcMode === 'withdrawal' ? chains['Secret Network'].chain_id : chain.chain_id,
      destAssetDenom: dest.denom,
      destAssetChainID: IbcMode === 'withdrawal' ? chain.chain_id : chains['Secret Network'].chain_id,
      cumulativeAffiliateFeeBPS: '0'
    })
    return route
  } catch (error) {
    console.error(error)
    throw error
  }
}

async function getReceiverAddress(chainID: string): Promise<string> {
  const wallet = await window.wallet.getOfflineSignerAuto(chainID)
  const [{ address: walletAddress }] = await wallet.getAccounts()
  return walletAddress
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

function composePMFMemo(
  allOperations: Operation[],
  lastReceiver: string,
  finalMemo?: string | undefined
): Promise<string> {
  async function generateMemo(operations: Operation[], finalNextContent: string): Promise<string> {
    // Base case: if there are no more operations, return the finalNextContent
    if (operations.length === 0) {
      return finalNextContent
    }

    // Recursively process the rest of the operations array
    const nextMemo: string = await generateMemo(operations.slice(1), finalNextContent)

    // Take the first operation from the array
    const operation = operations[0]

    let receiver
    if (operations.length === 1) {
      receiver = lastReceiver
    } else {
      receiver = await getReceiverAddress((operations[1] as any).transfer.chainID)
    }

    // If this is the last operation and there are no more operations, use finalNextContent as the next memo
    const next = operations.length > 1 ? JSON.parse(nextMemo) : finalNextContent

    // Construct the memo object for this operation
    const memoObject: MemoObject = {
      forward: {
        receiver: receiver,
        port: (operation as any).transfer.port,
        channel: (operation as any).transfer.channel,
        timeout: 0,
        retries: 2,
        next: next // Unconditionally include the "next" field, as we've handled the base case above
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
function getSupportedChains(): Chain[] {
  const selectableChains: Chain[] = Object.values(chains).filter((chain) => chain.chain_name !== 'Secret Network')
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

/**
 * Get the chain name that supports the specified IBC token.
 * @param tokenName - The name of the token to check.
 * @returns The name of the supported chain, or undefined if no chain supports the token.
 */
function getSupportedChainByIbcTokenName(tokenName: string): string | undefined {
  const token = allTokens.find((token) => token.name.toLowerCase() === tokenName.toLowerCase())

  if (!token) return undefined

  const supportedDeposit = token.deposits.find((deposit) =>
    allTokens.some((t) => t.deposits.some((d) => d.chain_name === deposit.chain_name))
  )

  return supportedDeposit?.chain_name
}

async function performIbcTransfer(props: TProps): Promise<string> {
  const sourceChainNetworkClient = await IbcService.getChainSecretJs(props.chain)
  if (props.ibcMode === 'withdrawal') {
    return performIbcWithdrawal(props, props.token, sourceChainNetworkClient)
  } else if (props.ibcMode === 'deposit') {
    return performIbcDeposit(props, props.token, sourceChainNetworkClient)
  }
}

export const IbcService = {
  getSupportedChains,
  getSupportedIbcTokensByChain,
  getSupportedChainByIbcTokenName,
  performIbcTransfer,
  composePMFMemo,
  getSkipIBCRouting,
  getChainSecretJs,
  fetchSourceBalance,
  getAxelarTransferFee
}

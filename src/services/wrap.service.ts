import BigNumber from 'bignumber.js'
import { BroadcastMode, MsgExecuteContract, SecretNetworkClient } from 'secretjs'
import { FeeGrantStatus } from 'types/FeeGrantStatus'
import { Nullable } from 'types/Nullable'
import { WrappingMode } from 'types/WrappingMode'
import { faucetAddress, queryTxResult, randomPadding } from 'utils/commons'
import { Token, tokens } from 'utils/config'

interface IBaseProps {
  wrappingMode: WrappingMode
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

interface IBatchItem {
  token: Token
  amount: string
  wrappingMode: WrappingMode
}

/**
 * Batch props
 */
interface IBatchProps {
  secretNetworkClient: SecretNetworkClient
  feeGrantStatus: FeeGrantStatus
  items: IBatchItem[]
}

type TProps = IPropsToken | IPropsTokenName

async function performWrapping(props: TProps): Promise<string> {
  let token: Nullable<Token>
  if ('tokenName' in props) {
    token = tokens.find((token) => token.name === props.tokenName)
  } else {
    token = props.token
  }

  if (!token) {
    console.error('token', token)
    throw new Error('Token not found')
  }

  const baseAmount = props.amount
  const amount = new BigNumber(Number(baseAmount)).multipliedBy(`1e${token.decimals}`).toFixed(0, BigNumber.ROUND_DOWN)

  if (amount === 'NaN') {
    console.error('NaN amount', baseAmount)
    throw new Error('Amount is not a valid number')
  }

  // Broadcast the transaction
  const broadcastResult = await props.secretNetworkClient.tx.broadcast(
    [
      props.wrappingMode === 'wrap'
        ? new MsgExecuteContract({
            sender: props.secretNetworkClient.address,
            contract_address: token.address,
            code_hash: token.code_hash,
            sent_funds: [{ denom: token.withdrawals[0].denom, amount }],
            msg: {
              deposit: {
                padding: randomPadding()
              }
            }
          })
        : new MsgExecuteContract({
            sender: props.secretNetworkClient.address,
            contract_address: token.address,
            code_hash: token.code_hash,
            sent_funds: [],
            msg: {
              redeem: {
                amount,
                denom: token.name === 'SCRT' ? undefined : token.withdrawals[0].denom,
                padding: randomPadding()
              }
            }
          })
    ],
    {
      gasLimit: 150_000,
      gasPriceInFeeDenom: 0.25,
      feeDenom: 'uscrt',
      feeGranter: props.feeGrantStatus === 'success' ? faucetAddress : '',
      broadcastMode: BroadcastMode.Sync,
      waitForCommit: false
    }
  )

  // Poll the LCD for the transaction result every 10 seconds, 10 retries
  await queryTxResult(props.secretNetworkClient, broadcastResult.transactionHash, 6000, 10)
    .catch((error: any) => {
      console.error(error)
      if (error?.tx?.rawLog) {
        throw new Error(`${error?.tx?.rawLog}`)
      } else {
        throw error
      }
    })
    .then((tx: any) => {
      if (tx) {
        if (tx.code === 0) {
          return 'success'
        } else {
          console.error(tx.rawLog)
          throw new Error(tx.rawLog)
        }
      }
    })
  return
}
/**
 * Perform a single broadcast with multiple wrap/unwrap messages
 */
export async function performBatchWrapping(props: IBatchProps): Promise<void> {
  if (!props.items?.length) {
    throw new Error('No items to wrap or unwrap.')
  }

  // Build an array of messages
  const messages: any[] = []

  // Create each MsgExecuteContract
  for (const batchItem of props.items) {
    // Convert “display” amount to on-chain integer
    const bigAmount = new BigNumber(batchItem.amount)
    const baseAmount = bigAmount.multipliedBy(`1e${batchItem.token.decimals}`).toFixed(0, BigNumber.ROUND_DOWN)

    if (baseAmount === 'NaN') {
      throw new Error(`Invalid amount: ${batchItem.amount}`)
    }

    if (batchItem.wrappingMode === 'wrap') {
      // Wrap
      messages.push(
        new MsgExecuteContract({
          sender: props.secretNetworkClient.address,
          contract_address: batchItem.token.address,
          code_hash: batchItem.token.code_hash,
          sent_funds: [
            {
              denom: batchItem.token.withdrawals[0].denom,
              amount: baseAmount
            }
          ],
          msg: {
            deposit: {
              padding: randomPadding()
            }
          }
        })
      )
    } else {
      // Unwrap
      messages.push(
        new MsgExecuteContract({
          sender: props.secretNetworkClient.address,
          contract_address: batchItem.token.address,
          code_hash: batchItem.token.code_hash,
          sent_funds: [],
          msg: {
            redeem: {
              amount: baseAmount,
              // For SCRT, denom is optional
              denom: batchItem.token.name === 'SCRT' ? undefined : batchItem.token.withdrawals[0].denom,
              padding: randomPadding()
            }
          }
        })
      )
    }
  }

  // Broadcast all messages in a single transaction
  const broadcastResult = await props.secretNetworkClient.tx.broadcast(messages, {
    gasLimit: 50_000 + 40_000 * messages.length,
    gasPriceInFeeDenom: 0.25,
    feeDenom: 'uscrt',
    feeGranter: props.feeGrantStatus === 'success' ? faucetAddress : '',
    broadcastMode: BroadcastMode.Sync,
    waitForCommit: false
  })

  // Poll for the transaction result
  await queryTxResult(
    props.secretNetworkClient,
    broadcastResult.transactionHash,
    6_000, // poll interval
    10 // number of retries
  )
    .catch((error: any) => {
      // If we fail to find or confirm the tx
      if (error?.tx?.rawLog) {
        throw new Error(`${error.tx.rawLog}`)
      } else {
        throw error
      }
    })
    .then((tx: any) => {
      if (tx) {
        if (tx.code !== 0) {
          throw new Error(tx.rawLog || 'Batch wrap error')
        }
      }
    })
}

export const WrapService = {
  performWrapping,
  performBatchWrapping
}

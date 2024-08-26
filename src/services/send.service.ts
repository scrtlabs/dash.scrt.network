import BigNumber from 'bignumber.js'
import { BroadcastMode, MsgExecuteContract, MsgSend, SecretNetworkClient } from 'secretjs'
import { FeeGrantStatus } from 'types/FeeGrantStatus'
import { Nullable } from 'types/Nullable'
import { allTokens, faucetAddress, queryTxResult, randomPadding } from 'utils/commons'
import { Token, tokens } from 'utils/config'

function getSupportedTokens() {
  return [allTokens[0]].concat(
    allTokens.map((token: Token) => (token.name === 'SCRT' ? { ...token, address: 'native' } : token))
  )
}

interface IBaseProps {
  amount: string
  recipient: string
  memo?: string
  secretNetworkClient: SecretNetworkClient
  feeGrantStatus: FeeGrantStatus
}

interface IPropsToken extends IBaseProps {
  token: Token
}

// Main function to perform the sending
async function performSending(props: IPropsToken): Promise<string> {
  let token = props.token

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

  try {
    // Broadcast the transaction
    const broadcastResult = await props.secretNetworkClient.tx.broadcast(
      [
        token.address === 'native'
          ? new MsgSend({
              from_address: props.secretNetworkClient?.address,
              to_address: props.recipient,
              amount: [
                {
                  amount: amount,
                  denom: 'uscrt'
                }
              ]
            })
          : new MsgExecuteContract({
              sender: props.secretNetworkClient?.address,
              contract_address: token.address,
              code_hash: token.code_hash,
              sent_funds: [],
              msg: {
                transfer: {
                  recipient: props.recipient,
                  amount: amount,
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
        memo: props.memo,
        waitForCommit: false
      }
    )

    // Poll the LCD for the transaction result every 10 seconds, 10 retries
    await queryTxResult(props.secretNetworkClient, broadcastResult.transactionHash, 10000, 10)

    // Return success if everything went fine
    return 'success'
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const SendService = {
  performSending,
  getSupportedTokens
}

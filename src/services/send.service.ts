import BigNumber from 'bignumber.js'
import { BroadcastMode, MsgExecuteContract, MsgSend, SecretNetworkClient } from 'secretjs'
import { FeeGrantStatus } from 'types/FeeGrantStatus'
import { Nullable } from 'types/Nullable'
import { allTokens, faucetAddress, randomPadding } from 'utils/commons'
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

  await props.secretNetworkClient.tx
    .broadcast(
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
            } as any)
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
            } as any)
      ],
      {
        gasLimit: 150_000,
        gasPriceInFeeDenom: 0.25,
        feeDenom: 'uscrt',
        feeGranter: props.feeGrantStatus === 'success' ? faucetAddress : '',
        broadcastMode: BroadcastMode.Sync,
        memo: props.memo
      }
    )
    .catch((error: any) => {
      console.error(error)
      throw error
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

export const SendService = {
  performSending,
  getSupportedTokens
}

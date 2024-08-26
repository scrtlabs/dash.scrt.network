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

  try {
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
    await queryTxResult(props.secretNetworkClient, broadcastResult.transactionHash, 10000, 10)

    // Return success if everything went fine
    return 'success'
  } catch (error) {
    console.error(error)
    throw error
  }
  return
}

export const WrapService = {
  performWrapping
}

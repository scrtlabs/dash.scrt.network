import BigNumber from 'bignumber.js'
import mixpanel from 'mixpanel-browser'
import {
  BroadcastMode,
  MsgExecuteContract,
  MsgSend,
  SecretNetworkClient
} from 'secretjs'
import { FeeGrantStatus } from 'shared/types/FeeGrantStatus'
import { Nullable } from 'shared/types/Nullable'
import { faucetAddress, randomPadding } from 'shared/utils/commons'
import { Token, tokens } from 'shared/utils/config'

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

interface IPropsTokenName extends IBaseProps {
  tokenName: string
}

type TProps = IPropsToken | IPropsTokenName

/**
 * Attempts to perform sending via secret.js API
 *
 * @param {TProps} props
 * @returns {Promise<{success: boolean, errorMsg: Nullable<string>}>} A promise that resolves to an object containing:
 * - `success`: A boolean indicating whether the wrapping operation was successful.
 * - `errorMsg`: A string containing an error message if something went wrong, or null if there were no errors.
 * @async
 */

const performSending = async (
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

  const baseAmount = props.amount
  const amount = new BigNumber(Number(baseAmount))
    .multipliedBy(`1e${token.decimals}`)
    .toFixed(0, BigNumber.ROUND_DOWN)

  if (amount === 'NaN') {
    console.error('NaN amount', baseAmount)
    result.success = false
    result.errorMsg = 'Amount is not a valid number!'
    return result
  }

  // TODO: Add logic for send
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
        // feeGranter: feeGrantStatus === "Success" ? faucetAddress : "",
        broadcastMode: BroadcastMode.Sync,
        memo: props.memo
      }
    )
    .catch((error: any) => {
      console.error(error)
      result.success = false

      if (error?.tx?.rawLog) {
        result.errorMsg = error?.tx?.rawLog
      } else {
        result.errorMsg = error.message
      }
      return result
    })
    .then((tx: any) => {
      console.log(tx)
      if (tx) {
        if (tx.code === 0) {
          result.success = true
          result.errorMsg = null
          return result
        } else {
          result.success = false
          result.errorMsg = tx.rawLog
          return result
        }
      }
    })
}

export const SendService = {
  performSending
}

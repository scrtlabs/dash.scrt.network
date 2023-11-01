import BigNumber from 'bignumber.js'
import {
  BroadcastMode,
  MsgExecuteContract,
  SecretNetworkClient
} from 'secretjs'
import { FeeGrantStatus } from 'shared/types/FeeGrantStatus'
import { IbcMode } from 'shared/types/IbcMode'
import { Nullable } from 'shared/types/Nullable'
import { faucetAddress, randomPadding } from 'shared/utils/commons'
import { Token, tokens } from 'shared/utils/config'

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

  try {
    if (props.wrappingMode === 'wrap') {
      await props.secretNetworkClient.tx
        .broadcast(
          [
            new MsgExecuteContract({
              sender: props.secretNetworkClient.address,
              contract_address: token.address,
              code_hash: token.code_hash,
              sent_funds: [{ denom: token.withdrawals[0].from_denom, amount }],
              msg: {
                deposit: {
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
            broadcastMode: BroadcastMode.Sync
          }
        )
        .catch((error: any) => {
          console.error(error)
          result.success = false
          result.errorMsg = `Wrapping of ${token.name} failed: ${error.tx.rawLog}`
          return result
        })
        .then((tx: any) => {
          console.log(tx)
          if (tx) {
            if (tx.code === 0) {
              result.success = true
              result.errorMsg = null
              return result
            }
          }
        })
    }

    if (props.wrappingMode === 'unwrap') {
      await props.secretNetworkClient.tx
        .broadcast(
          [
            new MsgExecuteContract({
              sender: props.secretNetworkClient.address,
              contract_address: props.secretNetworkClient.address,
              // code_hash: props.secretNetworkClient.code_hash,
              sent_funds: [],
              msg: {
                redeem: {
                  amount,
                  denom:
                    token.name === 'SCRT'
                      ? undefined
                      : token.withdrawals[0].from_denom,
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
            broadcastMode: BroadcastMode.Sync
          }
        )
        .catch((error: any) => {
          console.error(error)
          result.success = false
          result.errorMsg = `Unwrapping of s${token.name} failed: ${error.tx.rawLog}`
          return result
        })
        .then((tx: any) => {
          console.log(tx)
          if (tx) {
            if (tx.code === 0) {
              result.success = true
              result.errorMsg = null
              return result
            }
          }
        })
    }
  } catch (error: any) {
    console.error(error)
    result.success = false
    result.errorMsg = error
    return result
  }
  result.success = false
  result.errorMsg = 'Unwrapping failed!'
  return result
}

export const IbcService = {
  performIbcTransfer
}

import BigNumber from 'bignumber.js'
import mixpanel from 'mixpanel-browser'
import { BroadcastMode, MsgExecuteContract, MsgSend, MsgWithdrawDelegationReward, SecretNetworkClient } from 'secretjs'
import { FeeGrantStatus } from 'types/FeeGrantStatus'
import { Nullable } from 'types/Nullable'
import { faucetAddress, randomPadding } from 'utils/commons'
import { Token, tokens } from 'utils/config'

interface Props {
  delegatorDelegations: any
  secretNetworkClient: SecretNetworkClient
  feeGrantStatus: FeeGrantStatus
}

/**
 * Attempts to perform staking via secret.js API
 *
 * @param {TProps} props
 * @returns {Promise<{success: boolean, errorMsg: Nullable<string>}>} A promise that resolves to an object containing:
 * - `success`: A boolean indicating whether the wrapping operation was successful.
 * - `errorMsg`: A string containing an error message if something went wrong, or null if there were no errors.
 * @async
 */

const performClaimStakingRewards = async (props: Props) => {
  let result: { success: boolean; errorMsg: Nullable<string> } = {
    success: false,
    errorMsg: null
  }

  try {
    const txs = props.delegatorDelegations.map((delegation: any) => {
      return new MsgWithdrawDelegationReward({
        delegator_address: props.secretNetworkClient.address,
        validator_address: delegation?.delegation?.validator_address
      })
    })

    await props.secretNetworkClient.tx
      .broadcast(txs, {
        gasLimit: 100_000 * txs.length,
        gasPriceInFeeDenom: 0.25,
        feeDenom: 'uscrt',
        feeGranter: props.feeGrantStatus === 'success' ? faucetAddress : ''
      })
      .catch((error: any) => {
        console.error(error)
        if (error?.tx?.rawLog) {
          // toast.update(toastId, {
          //   render: `Claiming staking rewards failed: ${error.tx.rawLog}`,
          //   type: 'error',
          //   isLoading: false,
          //   closeOnClick: true
          // })
        } else {
          // toast.update(toastId, {
          //   render: `Claiming staking rewards failed: ${error.message}`,
          //   type: 'error',
          //   isLoading: false,
          //   closeOnClick: true
          // })
        }
      })
      .then((tx: any) => {
        console.log(tx)
        if (tx) {
          if (tx.code === 0) {
            // toast.update(toastId, {
            //   render: `Claiming staking rewards successful`,
            //   type: 'success',
            //   isLoading: false,
            //   closeOnClick: true
            // })
          } else {
            // toast.update(toastId, {
            //   render: `Claiming staking rewards failed: ${tx.rawLog}`,
            //   type: 'error',
            //   isLoading: false,
            //   closeOnClick: true
            // })
          }
        }
      })
  } catch (e: any) {
    console.error(e)
  }
}

export const StakingService = {
  performClaimStakingRewards
}

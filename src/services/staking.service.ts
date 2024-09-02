import { MsgWithdrawDelegationReward, SecretNetworkClient } from 'secretjs'
import { FeeGrantStatus } from 'types/FeeGrantStatus'
import { faucetAddress, queryTxResult } from 'utils/commons'
import { NotificationService } from './notification.service'

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
  const toastId = NotificationService.notify(`Claiming Staking Rewards`, 'loading')

  try {
    const txs = props.delegatorDelegations.map((delegation: any) => {
      return new MsgWithdrawDelegationReward({
        delegator_address: props.secretNetworkClient.address,
        validator_address: delegation?.delegation?.validator_address
      })
    })

    const broadcastResult = await props.secretNetworkClient.tx.broadcast(txs, {
      gasLimit: 100_000 * txs.length,
      gasPriceInFeeDenom: 0.25,
      feeDenom: 'uscrt',
      feeGranter: props.feeGrantStatus === 'success' ? faucetAddress : '',
      waitForCommit: false
    })

    // Poll the LCD for the transaction result every 10 seconds, 10 retries
    await queryTxResult(props.secretNetworkClient, broadcastResult.transactionHash, 6000, 10)
      .catch((error: any) => {
        console.error(error)
        if (error?.tx?.rawLog) {
          NotificationService.notify(`Claiming staking rewards failed: ${error.tx.rawLog}`, 'error', toastId)
        } else {
          NotificationService.notify(`Claiming staking rewards failed: ${error.message}`, 'error', toastId)
        }
      })
      .then((tx: any) => {
        if (tx) {
          if (tx.code === 0) {
            NotificationService.notify(`Claimed staking rewards successfully`, 'success', toastId)
          } else {
            NotificationService.notify(`Claiming staking rewards failed: ${tx.rawLog}`, 'error', toastId)
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

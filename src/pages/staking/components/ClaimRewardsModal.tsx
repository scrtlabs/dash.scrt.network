import { useContext, useState } from 'react'
import { toast } from 'react-toastify'
import { MsgWithdrawDelegationReward } from 'secretjs'
import { faucetAddress } from 'utils/commons'
import { StakingContext } from 'pages/staking/Staking'
import FeeGrant from '../../../components/FeeGrant/FeeGrant'
import BigNumber from 'bignumber.js'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { scrtToken } from 'utils/tokens'
import Modal from 'components/UI/Modal/Modal'
import { StakingService } from 'services/staking.service'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import Button from 'components/UI/Button/Button'

interface Props {
  open: boolean
  onClose: any
}

export default function ClaimRewardsModal(props: Props) {
  const [generalSuccessMessage, setGeneralSuccessMessage] = useState<String>('')
  const [generalErrorMessage, setGeneralErrorMessage] = useState<String>('')
  const [isLoading, setIsWaiting] = useState<boolean>(false)

  const { secretNetworkClient, scrtBalance, feeGrantStatus, requestFeeGrant, isConnected } =
    useSecretNetworkClientStore()

  const { delegatorDelegations, delegationTotalRewards } = useContext(StakingContext)

  if (!props.open) return null

  const totalPendingRewards = () => {
    return BigNumber(delegationTotalRewards?.total[0]?.amount)
      .dividedBy(`1e${scrtToken.decimals}`)
      .toFormat(scrtToken.decimals)
  }

  async function handleClaimRewards() {
    setIsWaiting(true)
    const result: any = await StakingService.performClaimStakingRewards({
      delegatorDelegations: delegatorDelegations,
      secretNetworkClient: secretNetworkClient,
      feeGrantStatus: 'success'
    })
    setIsWaiting(false)
  }

  return (
    <>
      <Modal
        isOpen={props.open}
        onClose={props.onClose}
        title="Your Staking Rewards"
        subTitle="Claim your staking rewards"
      >
        {/* Body */}
        <div className="flex flex-col gap-4">
          <div className="my-4 text-lg text-center text-black dark:text-white">
            <div className="font-bold">Claimable Amount</div>
            <div className="mt-2 text-emerald-500 dark:text-emerald-500">
              <span className="font-semibold">{totalPendingRewards()}</span>
              <span className="text-sm">{` SCRT`}</span>
            </div>
          </div>
          <div>
            <FeeGrant />
          </div>
          <div>
            {isLoading ? (
              <div className="text-sm font-normal flex items-center gap-2 justify-center">
                <svg
                  className="animate-spin h-5 w-5 text-black dark:text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Processing...</span>
              </div>
            ) : null}

            {generalSuccessMessage && (
              <div className="text-emerald-500 dark:text-emerald-500 text-sm font-normal flex items-center gap-2 justify-center">
                <FontAwesomeIcon icon={faCircleCheck} />
                <span>{generalSuccessMessage}</span>
              </div>
            )}

            {generalErrorMessage && (
              <div className="text-red-500 dark:text-red-500 text-sm font-normal flex items-center gap-2 justify-center">
                <FontAwesomeIcon icon={faTriangleExclamation} />
                <span>{generalErrorMessage}</span>
              </div>
            )}
          </div>
          <Button onClick={handleClaimRewards} color="emerald" size="large">
            Claim Rewards
          </Button>
        </div>
      </Modal>
    </>
  )
}

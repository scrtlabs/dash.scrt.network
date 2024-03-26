import { useContext, useState } from 'react'
import { StakingContext } from 'pages/staking/Staking'
import FeeGrant from '../../../components/FeeGrant/FeeGrant'
import BigNumber from 'bignumber.js'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { scrtToken } from 'utils/tokens'
import Modal from 'components/UI/Modal/Modal'
import { StakingService } from 'services/staking.service'
import Button from 'components/UI/Button/Button'

interface Props {
  open: boolean
  onClose: any
}

export default function ClaimRewardsModal(props: Props) {
  const [generalSuccessMessage, setGeneralSuccessMessage] = useState<String>('')
  const [generalErrorMessage, setGeneralErrorMessage] = useState<String>('')

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
    await StakingService.performClaimStakingRewards({
      delegatorDelegations: delegatorDelegations,
      secretNetworkClient: secretNetworkClient,
      feeGrantStatus: feeGrantStatus
    })
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
              <span className="font-medium font-mono">{totalPendingRewards()}</span>
              <span className="text-sm">{` SCRT`}</span>
            </div>
          </div>
          <div>
            <FeeGrant />
          </div>
          <Button onClick={handleClaimRewards} color="emerald" size="default">
            Claim Rewards
          </Button>
        </div>
      </Modal>
    </>
  )
}

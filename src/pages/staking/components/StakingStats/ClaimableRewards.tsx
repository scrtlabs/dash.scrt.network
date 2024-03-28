import Button from 'components/UI/Button/Button'
import { StakingContext } from 'pages/staking/Staking'
import { useContext } from 'react'

function ClaimableRewards() {
  const { setIsClaimRewardsModalOpen, totalPendingRewards } = useContext(StakingContext)

  function openClaimRewardsModal() {
    setIsClaimRewardsModalOpen(true)
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl dark:bg-neutral-800 bg-white">
      <div className="flex-1">
        <div className="font-bold mb-2">Claimable Rewards</div>
        <div className="mb-1">
          <span className="font-medium font-mono">{totalPendingRewards}</span>
          <span className="text-xs font-semibold text-neutral-400"> SCRT</span>
        </div>
        <div className="text-xs text-neutral-400 font-medium font-mono">$0.00</div>
      </div>
      <div>
        <Button type="button" onClick={openClaimRewardsModal} color="emerald">
          Claim
        </Button>
      </div>
    </div>
  )
}

export default ClaimableRewards

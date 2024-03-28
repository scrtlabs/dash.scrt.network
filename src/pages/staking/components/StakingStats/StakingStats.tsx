import { useContext } from 'react'
import StakingAmount from './StakingAmount'
import AvailableBalance from './AvailableBalance'
import ClaimableRewards from './ClaimableRewards'
import { StakingContext } from 'pages/staking/Staking'

function StakingStats() {
  const { getTotalAmountStaked } = useContext(StakingContext)

  const stakedAmount = getTotalAmountStaked() || null

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-12">
        {/* Staking Amount */}
        <div className="col-span-12 md:col-span-3 lg:col-span-12 xl:col-span-3 py-4">
          <StakingAmount stakedAmount={stakedAmount} />
        </div>

        {/* Available Balance */}
        <div className="col-span-12 md:col-span-3 lg:col-span-12 xl:col-span-3 py-4">
          <AvailableBalance />
        </div>

        {/* Claimable Rewards */}
        <div className="col-span-12 md:col-span-6 lg:col-span-12 xl:col-span-6">
          <ClaimableRewards />
        </div>
      </div>
    </div>
  )
}

export default StakingStats

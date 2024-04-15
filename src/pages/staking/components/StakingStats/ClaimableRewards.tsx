import BigNumber from 'bignumber.js'
import Button from 'components/UI/Button/Button'
import { APIContext } from 'context/APIContext'
import { StakingContext } from 'pages/staking/Staking'
import { useContext, useEffect, useState } from 'react'
import { useTokenPricesStore } from 'store/TokenPrices'
import { useUserPreferencesStore } from 'store/UserPreferences'
import { Nullable } from 'types/Nullable'
import { toCurrencyString } from 'utils/commons'
import { scrtToken } from 'utils/tokens'

function ClaimableRewards() {
  const { setIsClaimRewardsModalOpen, totalPendingRewards } = useContext(StakingContext)
  const { convertCurrency } = useContext(APIContext)
  const { getValuePrice, priceMapping } = useTokenPricesStore()
  const { currency } = useUserPreferencesStore()

  const [claimableRewardsInUsd, setClaimableRewardsInUsd] = useState<string>('')

  useEffect(() => {
    if (priceMapping !== null && totalPendingRewards !== null) {
      const valuePrice = getValuePrice(scrtToken, BigNumber(totalPendingRewards))
      if (valuePrice) {
        const priceInCurrency = convertCurrency('USD', valuePrice, currency)
        if (priceInCurrency !== null) {
          setClaimableRewardsInUsd(toCurrencyString(priceInCurrency, currency))
        }
      } else {
      }
    }
  }, [priceMapping, totalPendingRewards])

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
        <div className="text-xs text-neutral-400 font-medium font-mono">
          {true ? (
            <>{claimableRewardsInUsd}</>
          ) : (
            <div className="animate-pulse inline-block">
              <div className="h-5 w-12 bg-white dark:bg-neutral-700 rounded-xl"></div>
            </div>
          )}
        </div>
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

import BigNumber from 'bignumber.js'
import React, { useContext, useEffect, useState } from 'react'
import { APIContext } from 'context/APIContext'
import { formatNumber, toUsdString, faucetAddress } from 'utils/commons'
import { StakingContext } from 'pages/staking/Staking'
import FeeGrant from '../../../../components/FeeGrant/FeeGrant'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { scrtToken } from 'utils/tokens'
import PercentagePicker from 'components/PercentagePicker'
import Button from 'components/UI/Button/Button'
import toast from 'react-hot-toast'

export default function StakingForm() {
  const { selectedValidator, setView } = useContext(StakingContext)
  const { secretNetworkClient, walletAddress, scrtBalance, feeGrantStatus, isConnected } = useSecretNetworkClientStore()
  const { currentPrice } = useContext(APIContext)

  const [amountString, setAmountString] = useState<string>('0')
  const [amountInDollarString, setAmountInDollarString] = useState<string>('')

  const handleInputChange = (e: any) => {
    setAmountString(e.target.value)
  }

  useEffect(() => {
    const scrtBalanceUsdString = toUsdString(new BigNumber(amountString!).multipliedBy(Number(currentPrice)).toNumber())
    setAmountInDollarString(scrtBalanceUsdString)
  }, [amountString])

  const handleSubmit = () => {
    async function submit() {
      if (!isConnected) return

      try {
        const toastId = toast.loading(
          `Staking ${amountString} SCRT with validator: ${selectedValidator?.description?.moniker}`
        )
        await secretNetworkClient.tx.staking
          .delegate(
            {
              delegator_address: walletAddress,
              validator_address: selectedValidator?.operator_address,
              amount: {
                amount: BigNumber(amountString)
                  .multipliedBy(`1e${scrtToken.decimals}`)
                  .toFixed(0, BigNumber.ROUND_DOWN),
                denom: 'uscrt'
              }
            },
            {
              gasLimit: 100_000,
              gasPriceInFeeDenom: 0.25,
              feeDenom: 'uscrt',
              feeGranter: feeGrantStatus === 'success' ? faucetAddress : ''
            }
          )
          .catch((error: any) => {
            console.error(error)
            toast.dismiss(toastId)
            if (error?.tx?.rawLog) {
              toast.error(`Staking failed: ${error.tx.rawLog}`)
            } else {
              toast.error(`Staking failed: ${error.message}`)
            }
          })
          .then((tx: any) => {
            console.log(tx)
            if (tx) {
              if (tx.code === 0) {
                toast.success(
                  `Staking ${amountString} SCRT successfully with validator: ${selectedValidator?.description?.moniker}`
                )
              } else {
                toast.error(`Staking failed: ${tx.rawLog}`)
              }
            }
          })
      } catch (e: any) {
        console.error(e)
      }
    }
    submit()
  }

  function setAmountByPercentage(percentage: number) {
    if (scrtBalance) {
      let availableAmount = new BigNumber(scrtBalance).dividedBy(`1e${scrtToken.decimals}`)
      let potentialInput = availableAmount.toNumber() * (percentage * 0.01)
      potentialInput = potentialInput - 0.05
      if (Number(potentialInput) < 0) {
        setAmountString('')
      } else {
        setAmountString(potentialInput.toFixed(scrtToken.decimals))
      }
    }
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 p-4 rounded-xl bg-gray-200 dark:bg-neutral-700 text-black dark:text-white">
        <div className="font-semibold mb-2 text-center sm:text-left">Amount to Stake</div>

        <input
          value={amountString}
          onChange={handleInputChange}
          type="number"
          min="0"
          step="0.000001"
          className={
            'block flex-1 min-w-0 w-full bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white px-4 py-4 rounded-lg disabled:placeholder-neutral-300 dark:disabled:placeholder-neutral-700 transition-colors font-medium focus:outline-0 focus:ring-2 ring-sky-500/40'
          }
          name="toValue"
          id="toValue"
          placeholder="0"
          disabled={!isConnected}
        />
        <div className="mt-2 flex flex-col sm:flex-row gap-2">
          <div className="flex-1 text-sm text-center sm:text-left">
            {amountInDollarString !== '$NaN' ? amountInDollarString : '$ -'}
          </div>
          <div className="text-center sm:text-left flex-initial">
            <PercentagePicker setAmountByPercentage={setAmountByPercentage} disabled={!secretNetworkClient?.address} />
          </div>
        </div>
      </div>

      {/* Fee Grant */}
      <div className="col-span-12">
        <FeeGrant />
      </div>

      {/* Footer */}
      <div className="col-span-12 flex flex-col sm:flex-row-reverse justify-start gap-2">
        <Button size="large" color="primary" onClick={handleSubmit}>
          Delegate
        </Button>
        <Button
          size="large"
          color="secondary"
          onClick={() => setView(null)}
          className="bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 font-semibold px-4 py-2 rounded-md transition-colors"
        >
          Back
        </Button>
      </div>
    </div>
  )
}

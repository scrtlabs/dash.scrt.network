import BigNumber from 'bignumber.js'
import { useContext, useEffect, useState } from 'react'
import { APIContext } from 'context/APIContext'
import { faucetAddress, toCurrencyString } from 'utils/commons'
import { StakingContext } from 'pages/staking/Staking'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { scrtToken } from 'utils/tokens'
import Button from 'components/UI/Button/Button'
import toast from 'react-hot-toast'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tooltip from '@mui/material/Tooltip'
import ActionableStatus from 'components/FeeGrant/components/ActionableStatus'
import { NotificationService } from 'services/notification.service'

export default function UndelegateForm() {
  const { delegatorDelegations, selectedValidator, setView } = useContext(StakingContext)
  const { secretNetworkClient, walletAddress, feeGrantStatus, isConnected } = useSecretNetworkClientStore()
  const { currentPrice } = useContext(APIContext)

  const [amountString, setAmountString] = useState<string>('0')
  const [amountInDollarString, setAmountInCurrencyString] = useState<string>('')

  const handleInputChange = (e: any) => {
    setAmountString(e.target.value)
  }

  useEffect(() => {
    const scrtBalanceCurrencyString = toCurrencyString(
      new BigNumber(amountString!).multipliedBy(Number(currentPrice)).toNumber()
    )
    setAmountInCurrencyString(scrtBalanceCurrencyString)
  }, [amountString])

  const handleSubmit = () => {
    async function submit() {
      if (!isConnected) return

      try {
        const toastId = NotificationService.notify(
          `Unstaking ${amountString} SCRT from validator: ${selectedValidator?.description?.moniker}`,
          'loading'
        )
        await secretNetworkClient.tx.staking
          .undelegate(
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
          .catch((e: any) => {
            console.error(e)
            if (e?.tx?.rawLog) {
              NotificationService.notify(`Undelegation failed: ${e.tx.rawLog}`, 'error')
            } else {
              NotificationService.notify(`Undelegation failed: ${e.message}`, 'error')
            }
          })
          .then((tx: any) => {
            toast.dismiss(toastId)
            if (tx) {
              if (tx.code === 0) {
                NotificationService.notify(
                  `Undelegated ${amountString} SCRT successfully from validator: ${selectedValidator?.description?.moniker}`,
                  'success'
                )
              } else {
                NotificationService.notify(`Undelegation failed: ${tx.rawLog}`, 'error')
              }
            }
          })
      } catch (e: any) {
        console.error(e)
        NotificationService.notify('An unexpected error occurred', 'error')
      }
    }
    submit()
  }
  function setAmountByPercentage(percentage: number) {
    const maxValue = delegatorDelegations?.find(
      (delegatorDelegation: any) =>
        selectedValidator?.operator_address == delegatorDelegation.delegation.validator_address
    )?.balance?.amount

    if (maxValue) {
      let availableAmount = new BigNumber(maxValue).dividedBy(`1e${scrtToken.decimals}`)
      let potentialInput = availableAmount.toNumber() * (percentage * 0.01)
      if (Number(potentialInput) < 0) {
        setAmountString('')
      } else {
        setAmountString(potentialInput.toFixed(scrtToken.decimals))
      }
    }
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 p-4 rounded-xl bg-gray-100 dark:bg-neutral-800 text-black dark:text-white">
        <div className="font-semibold mb-2 text-center sm:text-left">Amount to Undelegate</div>
        <input
          value={amountString}
          onChange={handleInputChange}
          type="number"
          min="0"
          step="0.000001"
          className={
            'remove-arrows block flex-1 min-w-0 w-full bg-white dark:bg-neutral-900 text-black dark:text-white px-4 py-4 rounded-lg disabled:placeholder-neutral-300 dark:disabled:placeholder-neutral-700 transition-colors font-medium focus:outline-0 focus:ring-2 ring-sky-500/40'
          }
          name="toValue"
          id="toValue"
          placeholder="0"
          disabled={!secretNetworkClient?.address}
        />
        <div className="mt-2 flex flex-col sm:flex-row gap-2">
          <div className="flex-1 text-center sm:text-left font-mono text-sm text-neutral-500 dark:text-neutral-400">
            {amountInDollarString !== '$NaN' ? amountInDollarString : '$ -'}
          </div>
          <div className="text-center sm:text-left flex-initial">
            <div className="inline-flex rounded-full text-xs font-extrabold">
              <button
                type="button"
                onClick={() => setAmountByPercentage(25)}
                className="bg-gray-300 dark:bg-neutral-700 py-1.5 px-2.5 rounded-l-lg enabled:hover:bg-gray-400 enabled:dark:hover:bg-neutral-600 transition"
                disabled={!secretNetworkClient?.address}
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => setAmountByPercentage(50)}
                className="bg-gray-300 dark:bg-neutral-700 py-1.5 px-2.5 enabled:hover:bg-gray-400 enabled:dark:hover:bg-neutral-600 transition"
                disabled={!secretNetworkClient?.address}
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => setAmountByPercentage(75)}
                className="bg-gray-300 dark:bg-neutral-700 py-1.5 px-2.5 enabled:hover:bg-gray-400 enabled:dark:hover:bg-neutral-600 transition"
                disabled={!secretNetworkClient?.address}
              >
                75%
              </button>
              <button
                type="button"
                onClick={() => setAmountByPercentage(100)}
                className="bg-gray-300 dark:bg-neutral-700 py-1.5 px-2.5 rounded-r-lg enabled:hover:bg-gray-400 enabled:dark:hover:bg-neutral-600 transition"
                disabled={!secretNetworkClient?.address}
              >
                100%
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Grant */}
      <div className="col-span-12">
        <div className="bg-gray-100 dark:bg-neutral-800 text-black dark:text-white p-4 rounded-xl select-none flex items-center">
          <div className="flex-1">
            <Tooltip
              title={`Request Fee Grant so that you don't have to pay gas fees (up to 0.1 SCRT)`}
              placement="right"
              arrow
            >
              <span className="group inline-flex gap-2 items-center">
                <span className="font-semibold text-sm">Fee Grant</span>
                <span className="text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors cursor-pointer">
                  <FontAwesomeIcon icon={faInfoCircle} className="text-sm" />
                </span>
              </span>
            </Tooltip>
          </div>
          <div className="flex-initial">
            <ActionableStatus />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="col-span-12 flex flex-col sm:flex-row-reverse justify-start gap-2">
        <Button onClick={handleSubmit} color="primary" size="default">
          Undelegate
        </Button>

        <Button onClick={() => setView(null)} color="secondary" size="default">
          Back
        </Button>
      </div>
    </div>
  )
}

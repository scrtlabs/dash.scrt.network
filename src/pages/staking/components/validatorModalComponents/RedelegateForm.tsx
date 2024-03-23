import BigNumber from 'bignumber.js'
import { useContext, useEffect, useState } from 'react'
import { APIContext } from 'context/APIContext'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { faucetAddress, shuffleArray, toCurrencyString } from 'utils/commons'
import { StakingContext } from 'pages/staking/Staking'
import Select, { components } from 'react-select'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { scrtToken } from 'utils/tokens'
import PercentagePicker from 'components/PercentagePicker'
import Button from 'components/UI/Button/Button'
import toast from 'react-hot-toast'
import { Validator } from 'types/Validator'
import { useUserPreferencesStore } from 'store/UserPreferences'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import Tooltip from '@mui/material/Tooltip'
import ActionableStatus from 'components/FeeGrant/components/ActionableStatus'

export default function RedelegateForm() {
  const { delegatorDelegations, validators, selectedValidator, setView, reload, setReload } = useContext(StakingContext)

  const { secretNetworkClient, walletAddress, feeGrantStatus, isConnected } = useSecretNetworkClientStore()

  const { currentPrice } = useContext(APIContext)

  const { theme } = useUserPreferencesStore()

  const [redelegateValidator, setRedelegateValidator] = useState<any>()

  const [amountString, setAmountString] = useState<string>('0')
  const [amountInDollarString, setAmountInDollarString] = useState<string>('')

  const handleInputChange = (e: any) => {
    setAmountString(e.target.value)
  }

  useEffect(() => {
    const scrtBalanceUsdString = toCurrencyString(
      new BigNumber(amountString!).multipliedBy(Number(currentPrice)).toNumber()
    )
    setAmountInDollarString(scrtBalanceUsdString)
  }, [amountString])

  const handleSubmit = () => {
    async function submit() {
      if (!isConnected) return

      try {
        const toastId = toast.loading(
          `Redelegating ${amountString} SCRT from ${selectedValidator?.description?.moniker} to ${redelegateValidator?.description?.moniker}`
        )
        await secretNetworkClient.tx.staking
          .beginRedelegate(
            {
              delegator_address: walletAddress,
              validator_src_address: selectedValidator?.operator_address,
              validator_dst_address: redelegateValidator?.operator_address,
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
              toast.error(`Redelegating failed: ${error.tx.rawLog}`)
            } else {
              toast.error(`Redelegating failed: ${error.message}`)
            }
          })
          .then((tx: any) => {
            if (tx) {
              if (tx.code === 0) {
                toast.success(
                  `Successfully redelegated ${amountString} SCRT from ${selectedValidator?.description?.moniker} to ${redelegateValidator?.description?.moniker}`
                )
              } else {
                toast.error(`Redelegating failed: ${tx.rawLog}`)
              }
            }
          })
      } finally {
        setReload(!reload)
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

  const customFilter = (option: any, searchText: any) => {
    if (searchText.length == 0) return true
    if (!option || !option?.data?.name) return false
    const name = option?.data?.name.toLowerCase()
    const search = searchText.toLowerCase()

    return name.includes(search)
  }

  const CustomInput = (props: any) => {
    return (
      <div style={{ display: 'flex', alignItems: 'left' }}>
        <FontAwesomeIcon icon={faSearch} style={{ marginRight: '8px' }} />
        <components.Input {...props} />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 bg-gray-200 dark:bg-neutral-800 text-black dark:text-white p-4 rounded-xl">
        <div className="font-semibold mb-2 text-center sm:text-left">Amount</div>

        <input
          value={amountString}
          onChange={handleInputChange}
          type="number"
          min="0"
          step="0.000001"
          className={
            'remove-arrows block flex-1 min-w-0 w-full bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white px-4 py-4 rounded-lg disabled:placeholder-neutral-300 dark:disabled:placeholder-neutral-700 transition-colors font-medium focus:outline-0 focus:ring-2 ring-sky-500/40'
          }
          name="toValue"
          id="toValue"
          placeholder="0"
          disabled={!isConnected}
        />
        <div className="mt-2 flex flex-col sm:flex-row gap-2">
          <div className="flex-1 text-center sm:text-left  font-mono text-sm text-neutral-400">
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
        <div className="mt-4">
          <div className="font-semibold mb-2 text-center sm:text-left">Redelegate to</div>
          <Select
            isDisabled={!isConnected}
            options={shuffleArray(
              validators
                ?.filter((validator: Validator) => validator.status === 'BOND_STATUS_BONDED')
                .map((validator: Validator) => {
                  return {
                    name: validator?.description?.moniker,
                    value: validator?.operator_address
                  }
                })
            )}
            onChange={(item: Validator) => {
              setRedelegateValidator(
                validators.find((validator: Validator) => validator.operator_address === item.value)
              )
            }}
            isSearchable={true}
            filterOption={customFilter}
            formatOptionLabel={(validator: Validator) => {
              return (
                <div className="flex items-center">
                  <span className="font-semibold text-base">{validator?.name}</span>
                </div>
              )
            }}
            styles={{
              input: (base) => ({
                ...base,
                color: theme === 'light' ? 'black' : 'white',
                fontWeight: 'bold'
              })
            }}
            className="react-select-container"
            classNamePrefix="react-select-inset"
          />
        </div>
      </div>

      {/* Fee Grant */}
      <div className="col-span-12">
        {/* <FeeGrant /> */}
        <div className="bg-gray-200 dark:bg-neutral-800 text-black dark:text-white p-4 rounded-xl select-none flex items-center">
          <div className="flex-1 flex items-center">
            <span className="font-semibold text-sm">Fee Grant</span>
            <div className="flex items-center ml-2">
              <Tooltip
                title={`Request Fee Grant so that you don't have to pay gas fees (up to 0.1 SCRT)`}
                placement="right"
                arrow
              >
                <span className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
                  <FontAwesomeIcon icon={faInfoCircle} />
                </span>
              </Tooltip>
            </div>
          </div>
          <div className="flex-initial">
            <ActionableStatus />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="col-span-12 flex flex-col sm:flex-row-reverse justify-start gap-2">
        <Button onClick={handleSubmit} color="primary" size="default">
          Redelegate
        </Button>

        <Button onClick={() => setView(null)} color="secondary" size="default">
          Back
        </Button>
      </div>
    </div>
  )
}

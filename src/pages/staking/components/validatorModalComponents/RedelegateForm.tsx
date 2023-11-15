import BigNumber from 'bignumber.js'
import React, { useContext, useEffect, useState } from 'react'
import { APIContext } from 'context/APIContext'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { formatNumber, toUsdString, faucetAddress, shuffleArray } from 'utils/commons'
import { StakingContext } from 'pages/staking/Staking'
import FeeGrant from '../../../../components/FeeGrant/FeeGrant'
import Select, { components } from 'react-select'
import { ThemeContext } from 'context/ThemeContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { scrtToken } from 'utils/tokens'
import PercentagePicker from 'components/PercentagePicker'
import Button from 'components/UI/Button/Button'
import toast from 'react-hot-toast'

export default function RedelegateForm() {
  const { delegatorDelegations, validators, selectedValidator, setView, reload, setReload } = useContext(StakingContext)

  const { secretNetworkClient, walletAddress, feeGrantStatus, isConnected } = useSecretNetworkClientStore()

  const { currentPrice } = useContext(APIContext)

  const { theme, setTheme } = useContext(ThemeContext)

  const [redelegateValidator, setRedelegateValidator] = useState<any>()

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
            console.log(tx)
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
      <div className="col-span-12 bg-gray-200 dark:bg-neutral-700 text-black dark:text-white p-4 rounded-xl">
        <div className="font-semibold mb-2 text-center sm:text-left">Amount</div>

        <input
          value={amountString}
          onChange={handleInputChange}
          type="number"
          min="0"
          step="0.000001"
          className={
            'remove-arrows block flex-1 min-w-0 w-full bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white px-4 py-4 rounded-lg disabled:placeholder-neutral-300 dark:disabled:placeholder-neutral-700 transition-colors font-medium focus:outline-0 focus:ring-2 ring-sky-500/40'
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
        <div className="mt-4">
          <div className="font-semibold mb-2 text-center sm:text-left">Redelegate to</div>
          <Select
            isDisabled={!isConnected}
            options={shuffleArray(
              validators
                ?.filter((item: any) => item.status === 'BOND_STATUS_BONDED')
                .map((validator: any) => {
                  return {
                    name: validator?.description?.moniker,
                    value: validator?.operator_address
                  }
                })
            )}
            onChange={(item: any) => {
              setRedelegateValidator(validators.find((validator: any) => validator.operator_address === item.value))
            }}
            isSearchable={true}
            filterOption={customFilter}
            formatOptionLabel={(validator: any) => {
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
        <FeeGrant />
      </div>

      {/* Footer */}
      <div className="col-span-12 flex flex-col sm:flex-row-reverse justify-start gap-2">
        <Button onClick={handleSubmit} color="primary" size="large">
          Redelegate
        </Button>

        <Button onClick={() => setView(null)} color="secondary" size="large">
          Back
        </Button>
      </div>
    </div>
  )
}

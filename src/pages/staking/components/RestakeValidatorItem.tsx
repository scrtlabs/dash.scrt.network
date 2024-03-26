import { useEffect, useState, useContext, useRef } from 'react'
import BigNumber from 'bignumber.js'
import { StakingContext } from '../Staking'
import { restakeThreshold } from 'utils/commons'
import Tooltip from '@mui/material/Tooltip'
import { scrtToken } from 'utils/tokens'

interface Props {
  name: string
  stakedAmount: number
  identity?: string
  validator: any
}

const RestakeValidatorItem = (props: Props) => {
  const stakedAmountString = BigNumber(props.stakedAmount!).dividedBy(`1e6`).toString()

  const { restakeChoices, setRestakeChoices } = useContext(StakingContext)

  const [imgUrl, setImgUrl] = useState<any>()

  const identityRef = useRef(props.identity)

  const [isChecked, setIsChecked] = useState<boolean>(false)

  const isAboveRestakeThreshold = (stakedAmount: number) => {
    return stakedAmount >= restakeThreshold
  }

  useEffect(() => {
    identityRef.current = props.identity
    const fetchKeybaseImgUrl = async () => {
      const url = `https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${props.identity}&fields=pictures`
      await fetch(url)
        .then((response) => response.json())
        .catch((e) => {})
        .then((response) => {
          if (identityRef.current === props.identity) {
            if (response?.them[0]) {
              setImgUrl(response?.them[0].pictures?.primary?.url)
            } else {
              setImgUrl(undefined)
            }
          }
        })
        .catch((e) => {})
    }
    if (props.identity) {
      setImgUrl(undefined)
      fetchKeybaseImgUrl()
    }
  }, [props.identity, identityRef])

  useEffect(() => {
    const existingEntry = restakeChoices?.find(
      (item: any) => item.validatorAddress === props.validator.operator_address
    )
    if (existingEntry?.autoRestake) {
      setIsChecked(existingEntry?.autoRestake)
    }
  }, [restakeChoices])

  function handleButtonClick() {
    const currentValue = !isChecked

    const existingEntry = restakeChoices?.find(
      (item: any) => item.validatorAddress === props.validator.operator_address
    )

    if (existingEntry) {
      existingEntry.autoRestake = currentValue
      setIsChecked(currentValue)
    }
  }

  return (
    <div>
      {/* Item */}

      {isAboveRestakeThreshold(props.stakedAmount) ? (
        <button
          onClick={handleButtonClick}
          className={`w-full flex items-center text-left py-8 sm:py-4 gap-4 px-4 ${
            isChecked ? 'bg-emerald-500/30 dark:bg-emerald-500/30' : 'bg-red-500/30 dark:bg-red-500/30'
          }`}
        >
          {/* Image */}
          <span
            className={`border rounded-full border-gray-400 relative ${
              isChecked ? 'text-emerald-200 bg-emerald-800' : 'text-red-200 bg-red-800'
            }`}
          >
            {/* Adjust width and height for the outer container */}
            <div className={`box block h-6 w-12 rounded-full ${isChecked ? 'bg-primary' : 'bg-dark'}`}></div>

            {/* Adjust width, height, and position for the inner circle */}
            <div
              className={`absolute left-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white transition ${
                isChecked ? 'translate-x-[1.5rem]' : ''
              }`}
            ></div>
          </span>

          <div className="image">
            {imgUrl ? (
              <>
                <img src={imgUrl} alt={`validator logo`} className="rounded-full w-10" />
              </>
            ) : (
              <>
                <div className="relative bg-blue-500 rounded-full w-10 h-10">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold">
                    {/* .charAt(0) or .slice(0,1) won't work here with emojis! */}
                    {[...props.name][0].toUpperCase()}
                  </div>
                </div>
              </>
            )}
          </div>
          {/* Title */}
          <div className="flex-1">
            <span className="font-semibold">{props.name}</span>
          </div>
          <div className="flex flex-col items-right">
            <div className="description text-xs text-gray-500 mb-2 text-right">Your stake</div>
            <div>
              <div>
                <span className="font-medium font-mono">{stakedAmountString}</span>
                <span className="text-xs font-semibold text-neutral-400"> SCRT</span>
              </div>
            </div>
          </div>
        </button>
      ) : (
        <Tooltip
          title={`Autorestake is unavailable (below threshold of ${BigNumber(restakeThreshold)
            .dividedBy(`1e${scrtToken.decimals}`)
            .toFormat()} SCRT)`}
          placement="right"
          arrow
        >
          <button
            className={`first:rounded-t-lg last:rounded-b-lg w-full flex items-center text-left py-8 sm:py-4 gap-4 px-4 even:bg-gray-100 odd:bg-white dark:even:bg-neutral-900 dark:odd:bg-neutral-800 even:border-x dark:even:border-neutral-800 even:border-white dark:hover:bg-neutral-750 hover:bg-gray-300 transition-colors`}
          >
            <span className={`border rounded-full border-gray-400 relative text-gray-200 bg-gray-800`}>
              {/* Adjust width and height for the outer container */}
              <div className={`box block h-6 w-12 rounded-full ${isChecked ? 'bg-primary' : 'bg-dark'}`}></div>

              {/* Adjust width, height, and position for the inner circle */}
              <div
                className={`absolute left-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white transition ${
                  isChecked ? 'translate-x-[1.5rem]' : ''
                }`}
              ></div>
            </span>

            {/* Image */}
            <div className="image">
              {imgUrl ? (
                <>
                  <img src={imgUrl} alt={`validator logo`} className="rounded-full w-10" />
                </>
              ) : (
                <>
                  <div className="relative bg-blue-500 rounded-full w-10 h-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold">
                      {/* .charAt(0) or .slice(0,1) won't work here with emojis! */}
                      {[...props.name][0].toUpperCase()}
                    </div>
                  </div>
                </>
              )}
            </div>
            {/* Title */}
            <div className="flex-1">
              <span className="font-semibold">{props.name}</span>
            </div>
            <div className="flex flex-col items-right">
              <div className="description text-xs text-gray-500 mb-2 text-right">Your stake</div>
              <div>
                <div>
                  <span className="font-semibold">{stakedAmountString}</span>
                  <span className="text-xs font-semibold text-neutral-400"> SCRT</span>
                </div>
              </div>
            </div>
          </button>
        </Tooltip>
      )}
    </div>
  )
}

export default RestakeValidatorItem

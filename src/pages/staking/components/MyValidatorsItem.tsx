import { useEffect, useState, useRef, useContext } from 'react'
import { faGlobe, faRepeat } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tooltip from '@mui/material/Tooltip'
import { randomDelay, restakeThreshold, sleep } from 'utils/commons'
import BigNumber from 'bignumber.js'
import { formatNumber } from 'utils/commons'
import { scrtToken } from 'utils/tokens'
import { Validator } from 'secretjs/dist/grpc_gateway/cosmos/staking/v1beta1/staking.pb'
import { Nullable } from 'types/Nullable'
import { ValidatorRestakeStatus } from 'types/ValidatorRestakeStatus'

interface Props {
  name: string
  commissionPercentage: number
  stakedAmount: number
  identity?: string
  setSelectedValidator: any
  restakeEntries: any
  validator: Validator
  openModal: any
}

const MyValidatorsItem = (props: Props) => {
  const stakedAmountString = BigNumber(props.stakedAmount!).dividedBy(`1e6`).toString()

  const [imgUrl, setImgUrl] = useState<Nullable<string>>()

  const identityRef = useRef(props.identity)

  useEffect(() => {
    identityRef.current = props.identity
    const fetchKeybaseImgUrl = async () => {
      try {
        const url = `https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${props.identity}&fields=pictures`

        // Introduce a delay here (e.g., 1000ms or 1 second)

        await sleep(randomDelay(0, 2000))

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()

        if (identityRef.current === props.identity) {
          if (data?.them[0]) {
            setImgUrl(data.them[0].pictures?.primary?.url)
          } else {
            setImgUrl(undefined)
          }
        }
      } catch (e) {
        console.error(e) // handle error appropriately
      }
    }
    if (props.identity) {
      setImgUrl(undefined)
      fetchKeybaseImgUrl()
    }
  }, [props.identity, identityRef])

  const isRestakeEnabled = (validator: Validator) => {
    return props.restakeEntries.find(
      (restakeValidator: ValidatorRestakeStatus) => restakeValidator.validatorAddress === validator.operator_address
    )
  }

  const isAboveRestakeThreshold = (stakedAmount: number) => {
    return Number(stakedAmount) >= restakeThreshold
  }

  return (
    <>
      {/* Item */}
      <button
        onClick={() => {
          props.openModal(true)
          props.setSelectedValidator(props.validator)
        }}
        className="last-of-type:even:border-b first:rounded-t-lg last:rounded-b-lg group flex flex-col sm:flex-row items-center text-left even:bg-gray-100 odd:bg-white dark:even:bg-neutral-900 dark:odd:bg-neutral-800 even:border-x dark:even:border-neutral-800 even:border-white dark:hover:bg-neutral-750 hover:bg-gray-300 transition-colors py-8 sm:py-4 gap-4 pl-4 pr-8  w-full min-w-full "
      >
        {/* Auto Restake */}
        <div className="auto-restake">
          <Tooltip
            title={`Auto restake ${
              isAboveRestakeThreshold(props.stakedAmount)
                ? isRestakeEnabled(props.validator)
                  ? 'enabled'
                  : 'disabled'
                : `unavailable (${BigNumber(restakeThreshold)
                    .dividedBy(`1e${scrtToken.decimals}`)
                    .toFormat()} SCRT threshold)`
            }`}
            placement="right"
            arrow
          >
            <span
              className={`font-semibold text-xs p-1 rounded-full ${
                isAboveRestakeThreshold(props.stakedAmount)
                  ? isRestakeEnabled(props.validator)
                    ? 'text-emerald-200 bg-emerald-800'
                    : 'text-red-200 bg-red-800'
                  : 'text-gray-200 bg-gray-800'
              }`}
            >
              <FontAwesomeIcon icon={faRepeat} className="fa-fw" />
            </span>
          </Tooltip>
        </div>
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
          {props.validator?.description?.website ? (
            <a
              onClick={(e) => e.stopPropagation()}
              href={props.validator?.description?.website}
              target="_blank"
              className="group/website font-medium text-sm hidden sm:inline-block ml-2"
            >
              <FontAwesomeIcon
                icon={faGlobe}
                size="sm"
                className="text-neutral-500 dark:group-hover/website:text-white group-hover/website:text-black"
              />
            </a>
          ) : null}
        </div>
        {props.validator.status === 'BOND_STATUS_UNBONDED' && (
          <div className="border border-red-500 bg-transparent text-red-500 text-sm rounded px-4 py-2 cursor-not-allowed flex items-center justify-start">
            Inactive
          </div>
        )}
        <div className="flex flex-col items-center">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Your stake</div>
          <div>
            <div>
              <span className="font-medium font-mono">{stakedAmountString}</span>
              <span className="text-xs font-semibold text-neutral-400"> SCRT</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Commission</div>
          <div className="font-medium font-mono">{formatNumber(props.commissionPercentage * 100, 2)}%</div>
        </div>
        {/*         <div className="flex items-center font-semibold border-b border-white/0 hover:border-white transition-colors">
          <FontAwesomeIcon icon={faChevronRight} size="sm" className="ml-1" />
        </div> */}
      </button>
    </>
  )
}

export default MyValidatorsItem

import { useEffect, useState, useContext, useRef } from 'react'
import { faGlobe } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { formatNumber, randomDelay, sleep } from 'utils/commons'
import { APIContext } from 'context/APIContext'
import { Nullable } from 'types/Nullable'
import Tooltip from '@mui/material/Tooltip'
import { Validator } from 'types/Validator'

interface Props {
  name: string
  commissionPercentage: number
  votingPower: number
  identity?: string
  position: number
  website?: string
  setSelectedValidator: any
  validator: any
  openModal: any
}

const ValidatorItem = (props: Props) => {
  const { inflation, communityTax, totalSupply, bondedToken, secretFoundationTax } = useContext(APIContext)

  const [imgUrl, setImgUrl] = useState<any>()
  const [stakingAPR, setStakingAPR] = useState<any>()
  const votingPowerString = `${formatNumber(props.votingPower / 1e6)}`

  const maxVPThreshold: number = 0.1

  useEffect(() => {
    if (
      inflation &&
      secretFoundationTax >= 0 &&
      props.commissionPercentage &&
      communityTax &&
      bondedToken &&
      totalSupply
    ) {
      const I = inflation // inflation
      const F = secretFoundationTax // foundation tax
      const C = props.commissionPercentage // validator commision rate; median is 5%
      const T = parseFloat(communityTax) // community tax
      const R = bondedToken / totalSupply // bonded ratio
      setStakingAPR((I / R) * (1 - F - T) * (1 - C) * 100)
    }
  }, [inflation, secretFoundationTax, props.commissionPercentage, communityTax, bondedToken, totalSupply])

  const identityRef = useRef(props.identity)

  useEffect(() => {
    identityRef.current = props.identity
    const fetchKeybaseImgUrl = async () => {
      try {
        const url = `https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${props.identity}&fields=pictures`

        // Introduce a delay here (e.g., 1000ms or 1 second)

        await sleep(randomDelay(0, 2500))

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

  const hasTooMuchVotingPower = (validator: Nullable<Validator>) => {
    return (
      validator?.delegator_shares && bondedToken && validator?.delegator_shares / 1e6 / bondedToken > maxVPThreshold
    )
  }

  return (
    <>
      <button
        onClick={() => {
          props.openModal(true)
          props.setSelectedValidator(props.validator)
        }}
        className="first:rounded-t-lg last:rounded-b-lg group flex flex-col sm:flex-row items-center text-left even:bg-gray-100 odd:bg-white dark:even:bg-neutral-900 dark:odd:bg-neutral-800 even:border-x dark:even:border-neutral-800 even:border-white dark:hover:bg-neutral-750 hover:bg-gray-300 transition-colors py-8 sm:py-4 gap-4 pl-4 pr-8  w-full min-w-full "
      >
        {/* Image */}
        <div className="relative">
          {/* active | inactive */}
          {props.validator?.status === 'BOND_STATUS_UNBONDED' ? (
            <div className="absolute -top-1.5 right-0 z-10">
              <Tooltip title={'Inactive'} placement="right" arrow>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 dark:bg-red-500"></span>
              </Tooltip>
            </div>
          ) : (
            <div className="absolute -top-1.5 right-0 z-10">
              <Tooltip title={'Active'} placement="right" arrow>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 dark:bg-emerald-500"></span>
              </Tooltip>
            </div>
          )}
          {hasTooMuchVotingPower(props.validator) ? (
            <Tooltip
              title={'This validator has more than 10% voting power. Avoid this validator to promote decentralization.'}
              placement="right"
              arrow
            >
              <div className="absolute w-5 sm:w-2.5 h-5 sm:h-2.5 bg-red-500 rounded-full right-0 top-0 z-10"></div>
            </Tooltip>
          ) : null}
          {imgUrl ? (
            <img src={imgUrl} alt={`validator logo`} className="rounded-full w-20 sm:w-10" />
          ) : (
            <div className="relative bg-blue-500 rounded-full sm:w-10 w-20 sm:h-10 h-20">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold">
                {/* .charAt(0) or .slice(0,1) won't work here with emojis! */}
                {[...props.name][0]?.toUpperCase()}
              </div>
            </div>
          )}
        </div>
        {/* Title */}
        <div className="flex-1">
          <span className="font-semibold text-lg sm:text-base">{props.name}</span>
          {props.website ? (
            <a
              onClick={(e) => e.stopPropagation()}
              href={props.website}
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
        <div className="flex flex-col items-center">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Voting Power</div>

          {props.votingPower ? (
            <div className="voting-power font-semibold">
              <span className="font-medium font-mono">{votingPowerString}</span>
              <span className="text-neutral-500 dark:text-neutral-400 text-xs"> SCRT</span>
            </div>
          ) : (
            <div className="animate-pulse bg-neutral-300/40 dark:bg-neutral-700/40 rounded col-span-2 w-16 h-7 mx-auto"></div>
          )}
        </div>
        <div className="flex flex-col items-center">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Commission</div>
          {props.commissionPercentage && (
            <div className="commission font-medium font-mono">{formatNumber(props.commissionPercentage * 100, 2)}%</div>
          )}
          {!props.commissionPercentage && (
            <div className="animate-pulse bg-neutral-300/40 dark:bg-neutral-700/40 rounded col-span-2 w-16 h-7 mx-auto"></div>
          )}
        </div>
        <div className="flex flex-col items-center">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Staking APR</div>
          {stakingAPR || stakingAPR === 0 ? (
            <div className="font-medium font-mono">{`${formatNumber(stakingAPR, 2)}%`}</div>
          ) : (
            <div className="animate-pulse bg-neutral-300/40 dark:bg-neutral-700/40 rounded col-span-2 w-16 h-7 mx-auto"></div>
          )}
        </div>
      </button>
    </>
  )
}

export default ValidatorItem

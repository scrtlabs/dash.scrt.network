import React, { useEffect, useState, useContext, useRef } from 'react'
import { faChevronRight, faGlobe } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { formatNumber, sleep } from 'shared/utils/commons'
import { APIContext } from 'shared/context/APIContext'
import { IValidator } from 'staking/Staking'
import { Nullable } from 'shared/types/Nullable'
import Tooltip from '@mui/material/Tooltip'

interface IValidatorProps {
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

export const Validator = (props: IValidatorProps) => {
  const {
    inflation,
    communityTax,
    communityPool,
    pool,
    totalSupply,
    bondedToken,
    notBondedToken,
    secretFoundationTax
  } = useContext(APIContext)

  const [imgUrl, setImgUrl] = useState<any>()
  const [stakingAPR, setStakingAPR] = useState<any>()
  const votingPowerString = `${formatNumber(props.votingPower / 1e6)}`

  const maxVPThreshold = 0.1

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
  }, [
    inflation,
    secretFoundationTax,
    props.commissionPercentage,
    communityTax,
    bondedToken,
    totalSupply
  ])

  const identityRef = useRef(props.identity)

  useEffect(() => {
    identityRef.current = props.identity
    const fetchKeybaseImgUrl = async () => {
      try {
        const url = `https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${props.identity}&fields=pictures`

        // Introduce a delay here (e.g., 1000ms or 1 second)
        const randomDelay = (min: any, max: any) => {
          return Math.floor(Math.random() * (max - min + 1)) + min
        }

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

  const hasTooMuchVotingPower = (validator: Nullable<IValidator>) => {
    return (
      validator?.delegator_shares &&
      bondedToken &&
      validator?.delegator_shares / 1e6 / bondedToken > maxVPThreshold
    )
  }

  return (
    <>
      <button
        onClick={() => {
          props.openModal(true)
          props.setSelectedValidator(props.validator)
        }}
        className="group flex flex-col sm:flex-row items-center text-left even:bg-white odd:bg-neutral-200 dark:even:bg-neutral-800 dark:odd:bg-neutral-700 py-8 sm:py-4 gap-4 pl-4 pr-8  w-full min-w-full "
      >
        {/* Image */}
        <div className="relative">
          {hasTooMuchVotingPower(props.validator) ? (
            <Tooltip
              title={
                'This validator has more than 10% voting power. Avoid this validator to promote decentralization.'
              }
              placement="right"
              arrow
            >
              <div className="absolute w-5 sm:w-2.5 h-5 sm:h-2.5 bg-red-500 rounded-full right-0 top-0 z-10"></div>
            </Tooltip>
          ) : null}
          {imgUrl ? (
            <>
              <img
                src={imgUrl}
                alt={`validator logo`}
                className="rounded-full w-20 sm:w-10"
              />
            </>
          ) : (
            <>
              <div className="relative bg-blue-500 rounded-full sm:w-10 w-20 sm:h-10 h-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold">
                  {/* .charAt(0) or .slice(0,1) won't work here with emojis! */}
                  {[...props.name][0]?.toUpperCase()}
                </div>
              </div>
            </>
          )}
        </div>
        {/* Title */}
        <div className="flex-1">
          <span className="font-bold text-lg sm:text-base">{props.name}</span>
          {props.website && (
            <a
              onClick={(e) => e.stopPropagation()}
              href={props.website}
              target="_blank"
              className="group font-medium text-sm hidden sm:inline-block"
            >
              <FontAwesomeIcon
                icon={faGlobe}
                size="sm"
                className="ml-3 mr-1 text-neutral-500 dark:group-hover:text-white group-hover:text-black"
              />
              <span className="hidden group-hover:inline-block">Website</span>
            </a>
          )}
        </div>

        {props.validator?.status === 'BOND_STATUS_UNBONDED' && (
          <div className="border border-red-500 bg-transparent text-red-500 text-sm rounded px-4 py-2 cursor-not-allowed flex items-center justify-start">
            Inactive
          </div>
        )}
        <div className="flex flex-col items-center">
          <div className="description text-xs text-gray-500 mb-2">
            Voting Power
          </div>

          {props.votingPower && (
            <>
              <div className="voting-power font-semibold">
                <span className="">{votingPowerString}</span>
                <span className="text-neutral-400 text-xs"> SCRT</span>
              </div>
            </>
          )}
          {!props.votingPower && (
            <div className="animate-pulse bg-neutral-300/40 dark:bg-neutral-700/40 rounded col-span-2 w-16 h-7 mx-auto"></div>
          )}
        </div>
        <div className="flex flex-col items-center">
          <div className="description text-xs text-gray-500 mb-2">
            Commission
          </div>
          {props.commissionPercentage && (
            <div className="commission font-semibold">
              {formatNumber(props.commissionPercentage * 100, 2)}%
            </div>
          )}
          {!props.commissionPercentage && (
            <div className="animate-pulse bg-neutral-300/40 dark:bg-neutral-700/40 rounded col-span-2 w-16 h-7 mx-auto"></div>
          )}
        </div>
        <div className="flex flex-col items-center">
          <div className="description text-xs text-gray-500 mb-2">
            Staking APR
          </div>
          {stakingAPR !== undefined && (
            <div className="apr font-semibold">
              {`${formatNumber(stakingAPR, 2)} %`}
            </div>
          )}
          {stakingAPR === undefined && (
            <div className="animate-pulse bg-neutral-300/40 dark:bg-neutral-700/40 rounded col-span-2 w-16 h-7 mx-auto"></div>
          )}
        </div>
      </button>
    </>
  )
}

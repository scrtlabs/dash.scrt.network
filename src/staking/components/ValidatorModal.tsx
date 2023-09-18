import {
  faGlobe,
  faLink,
  faXmark,
  faInfoCircle,
  faMagnifyingGlass,
  faXmarkCircle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useContext, useEffect, useState } from 'react'
import { APIContext } from 'shared/context/APIContext'
import { usdString, formatNumber } from 'shared/utils/commons'
import BigNumber from 'bignumber.js'
import { SECRET_LCD, SECRET_CHAIN_ID } from 'shared/utils/config'
import CopyToClipboard from 'react-copy-to-clipboard'
import { toast } from 'react-toastify'
import { faCopy } from '@fortawesome/free-solid-svg-icons'
import Tooltip from '@mui/material/Tooltip'
import { chains } from 'shared/utils/config'
import {
  SecretNetworkClient,
  validatorAddressToSelfDelegatorAddress
} from 'secretjs'
import { Nullable } from 'shared/types/Nullable'
import { StakingContext } from 'staking/Staking'
import StakingForm from './validatorModalComponents/StakingForm'
import { SecretjsContext } from 'shared/context/SecretjsContext'
import UndelegateForm from './validatorModalComponents/UndelegateForm'
import RedelegateForm from './validatorModalComponents/RedelegateForm'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { scrtToken } from 'shared/utils/tokens'

interface IValidatorModalProps {
  open: boolean
  onClose: any
  restakeEntries: any
}

const ValidatorModal = (props: IValidatorModalProps) => {
  const [imgUrl, setImgUrl] = useState<Nullable<string>>(null)

  const {
    currentPrice,
    setCurrentPrice,
    inflation,
    communityTax,
    communityPool,
    pool,
    totalSupply,
    bondedToken,
    notBondedToken,
    secretFoundationTax
  } = useContext(APIContext)

  const {
    scrtBalance,
    feeGrantStatus,
    requestFeeGrant,
    secretNetworkClient,
    walletAddress,
    isConnected
  } = useSecretNetworkClientStore()

  const [realYield, setRealYield] = useState<Nullable<number>>(null)

  const { delegatorDelegations, selectedValidator, view, setView } =
    useContext(StakingContext)

  useEffect(() => {
    if (
      inflation &&
      secretFoundationTax >= 0 &&
      selectedValidator?.commission?.commission_rates?.rate &&
      communityTax &&
      bondedToken &&
      totalSupply
    ) {
      const I = inflation // inflation
      const F = secretFoundationTax // foundation tax
      const C = selectedValidator?.commission?.commission_rates?.rate // validator commision rate; median is 5%
      const T = parseFloat(communityTax) // community tax
      const R = bondedToken / totalSupply // bonded ratio
      setRealYield((I / R) * (1 - F - T) * (1 - C) * 100)
    }
  }, [
    inflation,
    secretFoundationTax,
    selectedValidator?.commission?.commission_rates?.rate,
    communityTax,
    bondedToken,
    totalSupply
  ])

  const [validatorSelfDelegation, setValidatorSelfDelegation] = useState<any>()

  // disable body scroll on open
  useEffect(() => {
    if (props.open) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }

    const fetchValidatorSelfDelegations = async () => {
      const selfDelegatingAddr = validatorAddressToSelfDelegatorAddress(
        selectedValidator?.operator_address
      )
      const secretjsquery = new SecretNetworkClient({
        url: SECRET_LCD,
        chainId: SECRET_CHAIN_ID
      })
      const { delegation_response } =
        await secretjsquery.query.staking.delegation({
          delegator_addr: selfDelegatingAddr,
          validator_addr: selectedValidator?.operator_address
        })
      setValidatorSelfDelegation(delegation_response?.balance.amount)
    }
    const fetchKeybaseImgUrl = async () => {
      const url = `https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${selectedValidator?.description?.identity}&fields=pictures`
      await fetch(url)
        .then((response) => response.json())
        .catch((e) => {})
        .then((response) => {
          if (response?.them[0]) {
            setImgUrl(response?.them[0].pictures?.primary?.url)
          } else {
            setImgUrl(undefined)
          }
        })
        .catch((e) => {})
    }
    if (selectedValidator?.description?.identity) {
      setImgUrl(undefined)
      fetchKeybaseImgUrl()
    }
    if (selectedValidator?.operator_address) {
      setValidatorSelfDelegation(undefined)
      fetchValidatorSelfDelegations()
    }
  }, [props])

  if (!props.open) return null

  return (
    <>
      {/* Outer */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 z-50 flex justify-center items-center"
        onClick={props.onClose}
      >
        {/* Inner */}
        <div className="absolute top-[10%] w-full onEnter_fadeInDown">
          <div className="mx-auto max-w-4xl px-4">
            <div
              className="bg-white dark:bg-neutral-900 p-8 rounded-2xl"
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              {/* Header */}
              <div className="mb-0 text-right">
                <button
                  onClick={props.onClose}
                  className="text-neutral-500 dark:text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors px-1.5 py-1 rounded-lg text-xl"
                >
                  <FontAwesomeIcon icon={faXmark} className="fa-fw" />
                </button>
              </div>
              <div className="max-h-[80vh] overflow-y-auto">
                {/* Header */}

                {/* Body */}
                <div className="grid grid-cols-12 gap-4">
                  {/* Picture | Title | Info */}
                  <div className="col-span-12">
                    <div className="flex gap-4 items-center">
                      <div className="image">
                        {imgUrl ? (
                          <>
                            <img
                              src={imgUrl}
                              alt={`validator logo`}
                              className="rounded-full w-10"
                            />
                          </>
                        ) : (
                          <>
                            <div className="relative bg-blue-500 dark:bg-blue-500 rounded-full w-10 h-10">
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold">
                                {/* .charAt(0) or .slice(0,1) won't work here with emojis! */}
                                {[
                                  ...selectedValidator?.description?.moniker
                                ][0].toUpperCase()}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      <div>
                        <div className="mb-1">
                          <span className="font-semibold">
                            {selectedValidator?.description?.moniker}
                          </span>
                          {selectedValidator?.description?.website && (
                            <a
                              href={selectedValidator?.description?.website}
                              target="_blank"
                              className="group font-medium text-sm"
                            >
                              <FontAwesomeIcon
                                icon={faGlobe}
                                size="sm"
                                className="ml-3 mr-1 text-neutral-500 dark:group-hover:text-white group-hover:text-black"
                              />
                              <span className="text-neutral-500 dark:group-hover:text-white group-hover:text-black">
                                Website
                              </span>
                            </a>
                          )}
                        </div>
                        <div className="flex gap-4 items-center">
                          {selectedValidator?.status ===
                            'BOND_STATUS_UNBONDED' && (
                            <div className="border border-red-500 bg-transparent text-red-500 text-sm rounded px-4 py-2 flex items-center justify-start">
                              Inactive
                            </div>
                          )}
                        </div>
                        <div className="text-neutral-400 font-medium text-sm">
                          <div className="commission font-semibold">
                            Commission{' '}
                            {(
                              selectedValidator?.commission?.commission_rates
                                ?.rate * 100
                            ).toFixed(2)}
                            % | APR {formatNumber(realYield, 2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedValidator?.description?.details ? (
                    <div className="col-span-12">
                      <div className="text-sm border dark:border-neutral-700 rounded-md p-4 text-center sm:text-left">
                        <div className="font-semibold text-black dark:text-white mb-1">
                          Description
                        </div>
                        <div className="italic text-neutral-600 dark:text-neutral-400">
                          {selectedValidator?.description?.details}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {view === null ? (
                    <>
                      <div className="col-span-12">
                        {/* Properties of the Val */}
                        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-8 rounded-md grid grid-cols-12 gap-6">
                          {/* First Item */}
                          {selectedValidator?.description?.identity && (
                            <div className="col-span-12 sm:col-span-6 flex flex-col gap-0.5 text-neutral-800 dark:text-neutral-300 font-semibold">
                              <div className="text-xs">Identity</div>
                              <div className="text-sm">
                                {`${selectedValidator?.description?.identity}  `}

                                <CopyToClipboard
                                  text={
                                    selectedValidator?.description?.identity
                                  }
                                  onCopy={() => {
                                    toast.success(
                                      'Validator identity copied to clipboard!'
                                    )
                                  }}
                                >
                                  <Tooltip
                                    title={'Copy to clipboard'}
                                    placement="bottom"
                                    arrow
                                  >
                                    <button className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-300 transition-colors">
                                      <FontAwesomeIcon icon={faCopy} />
                                    </button>
                                  </Tooltip>
                                </CopyToClipboard>
                              </div>
                            </div>
                          )}

                          {/* Second Item */}
                          {selectedValidator?.description?.security_contact && (
                            <div className="col-span-12 sm:col-span-6 flex flex-col gap-0.5 text-neutral-800 dark:text-neutral-300 font-semibold">
                              <div className="text-xs">Contact</div>
                              <div className="text-sm">
                                {`${selectedValidator?.description?.security_contact}  `}

                                <CopyToClipboard
                                  text={
                                    selectedValidator?.description
                                      ?.security_contact
                                  }
                                  onCopy={() => {
                                    toast.success(
                                      'Validator security contact copied to clipboard!'
                                    )
                                  }}
                                >
                                  <Tooltip
                                    title={'Copy to clipboard'}
                                    placement="bottom"
                                    arrow
                                  >
                                    <button className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-300 transition-colors">
                                      <FontAwesomeIcon icon={faCopy} />
                                    </button>
                                  </Tooltip>
                                </CopyToClipboard>
                              </div>
                            </div>
                          )}
                          {/* Third Item */}
                          <div className="col-span-12 sm:col-span-6 flex flex-col gap-0.5 text-neutral-800 dark:text-neutral-300 font-semibold">
                            <div className="text-xs">Staked Tokens</div>
                            <div className="text-sm">
                              {`${formatNumber(
                                selectedValidator?.tokens / 1e6,
                                2
                              )} SCRT`}
                            </div>
                          </div>
                          {/* Fourth Item */}

                          <div className="col-span-12 sm:col-span-6 flex flex-col gap-0.5 text-neutral-800 dark:text-neutral-300 font-semibold">
                            <div className="text-xs">Self Delegation</div>
                            <div className="text-sm">
                              {' '}
                              {validatorSelfDelegation &&
                                `${formatNumber(
                                  validatorSelfDelegation / 1e6,
                                  2
                                )} SCRT`}{' '}
                              {!validatorSelfDelegation && (
                                <div className="animate-pulse bg-neutral-700/40 rounded col-span-2 w-16 h-8"></div>
                              )}
                            </div>
                          </div>
                          {/* Fifth Item */}
                          <div className="col-span-12 sm:col-span-6 flex flex-col gap-0.5 text-neutral-800 dark:text-neutral-300 font-semibold">
                            <div className="text-xs">Operator Address</div>
                            <div className="text-sm">
                              {`${
                                selectedValidator?.operator_address.slice(
                                  0,
                                  15
                                ) +
                                '...' +
                                selectedValidator?.operator_address.slice(-15)
                              } `}
                              <CopyToClipboard
                                text={selectedValidator?.operator_address}
                                onCopy={() => {
                                  toast.success(
                                    'Operator address copied to clipboard!'
                                  )
                                }}
                              >
                                <Tooltip
                                  title={'Copy to clipboard'}
                                  placement="bottom"
                                  arrow
                                >
                                  <button className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-300 transition-colors">
                                    <FontAwesomeIcon icon={faCopy} />
                                  </button>
                                </Tooltip>
                              </CopyToClipboard>
                            </div>
                          </div>
                          {/* Sixth Item */}
                          <div className="col-span-12 sm:col-span-6 flex flex-col gap-0.5 text-neutral-800 dark:text-neutral-300 font-semibold">
                            <div className="text-xs">Validator Address</div>

                            <div className="text-sm">
                              <a
                                href={`${
                                  chains['Secret Network'].explorer_account
                                }${validatorAddressToSelfDelegatorAddress(
                                  selectedValidator?.operator_address
                                )}`}
                                target="_blank"
                              >
                                {`${
                                  validatorAddressToSelfDelegatorAddress(
                                    selectedValidator?.operator_address
                                  ).slice(0, 15) +
                                  '...' +
                                  validatorAddressToSelfDelegatorAddress(
                                    selectedValidator?.operator_address
                                  ).slice(-15)
                                } `}
                              </a>
                              <CopyToClipboard
                                text={validatorAddressToSelfDelegatorAddress(
                                  selectedValidator?.operator_address
                                )}
                                onCopy={() => {
                                  toast.success(
                                    'Validator address copied to clipboard!'
                                  )
                                }}
                              >
                                <Tooltip
                                  title={'Copy to clipboard'}
                                  placement="bottom"
                                  arrow
                                >
                                  <button className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-300 transition-colors">
                                    <FontAwesomeIcon icon={faCopy} />
                                  </button>
                                </Tooltip>
                              </CopyToClipboard>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : null}

                  {/* Available to Stake */}
                  {isConnected && (
                    <div className="bg-white/5 col-span-12 border border-neutral-200 dark:border-neutral-700 md:col-span-6 rounded-xl px-4 py-8 mt-4 text-center sm:text-left">
                      <div className="font-bold mb-2">Available to Stake</div>
                      <div className="font-semibold">
                        {new BigNumber(scrtBalance!)
                          .dividedBy(`1e${scrtToken.decimals}`)
                          .toFormat()}
                        <span className="text-neutral-400 text-xs">{` SCRT`}</span>
                      </div>
                      <div className="font-semibold text-neutral-400 mt-0.5 text-sm">
                        {usdString.format(
                          new BigNumber(scrtBalance!)
                            .dividedBy(`1e${scrtToken.decimals}`)
                            .multipliedBy(Number(currentPrice))
                            .toNumber()
                        )}
                      </div>
                    </div>
                  )}

                  {/* Your Delegation */}
                  {secretNetworkClient &&
                    walletAddress &&
                    (delegatorDelegations?.find(
                      (delegatorDelegation: any) =>
                        selectedValidator?.operator_address ==
                        delegatorDelegation.delegation.validator_address
                    ) ? (
                      <div className="bg-white/5 col-span-12 border border-neutral-200 dark:border-neutral-700 md:col-span-6 rounded-xl px-4 py-8 mt-4 text-center sm:text-left">
                        <div className="font-bold mb-2">Your Delegation</div>
                        <div className="font-semibold">
                          {delegatorDelegations?.find(
                            (delegatorDelegation: any) =>
                              selectedValidator?.operator_address ==
                              delegatorDelegation.delegation.validator_address
                          )?.balance?.amount / 1e6}
                          <span className="text-neutral-400 text-xs">{` SCRT`}</span>
                        </div>
                        <div className="font-semibold text-neutral-400 mt-0.5 text-sm">
                          {usdString.format(
                            new BigNumber(
                              delegatorDelegations?.find(
                                (delegatorDelegation: any) =>
                                  selectedValidator?.operator_address ==
                                  delegatorDelegation.delegation
                                    .validator_address
                              )?.balance?.amount
                            )
                              .dividedBy(`1e${scrtToken.decimals}`)
                              .multipliedBy(Number(currentPrice))
                              .toNumber()
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/5 col-span-12 border border-neutral-200 dark:border-neutral-700 md:col-span-6 rounded-xl px-4 py-8 mt-4 text-center sm:text-left">
                        <div className="font-bold mb-2">Your Delegation</div>
                        <div className="font-semibold">
                          {0}
                          <span className="text-neutral-400 text-xs">{` SCRT`}</span>
                        </div>
                        <div className="font-semibold text-neutral-400 mt-0.5 text-sm">
                          {usdString.format(0)}
                        </div>
                      </div>
                    ))}

                  {view !== null ? (
                    <div className="col-span-12">
                      {view === 'delegate' ? <StakingForm /> : null}
                      {view === 'undelegate' ? <UndelegateForm /> : null}
                      {view === 'redelegate' ? <RedelegateForm /> : null}
                    </div>
                  ) : null}

                  {isConnected && view === null ? (
                    <>
                      <div className="col-span-12">
                        {/* Navigation */}
                        <div className="flex flex-col sm:flex-row-reverse justify-start mt-4 gap-2">
                          <button
                            onClick={() => setView('delegate')}
                            className="text-white dark:text-white bg-sky-600 dark:bg-sky-600 hover:bg-sky-700 dark:hover:bg-sky-700 font-semibold px-4 py-2 rounded-md transition-colors"
                          >
                            Delegate
                          </button>
                          {delegatorDelegations?.find(
                            (delegatorDelegation: any) =>
                              selectedValidator?.operator_address ==
                              delegatorDelegation.delegation.validator_address
                          ) ? (
                            <>
                              <button
                                onClick={() => setView('redelegate')}
                                className="text-black dark:text-white bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors font-semibold px-4 py-2 rounded-md"
                              >
                                Redelegate
                              </button>
                              <button
                                onClick={() => setView('undelegate')}
                                className="text-black dark:text-white bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors font-semibold px-4 py-2 rounded-md"
                              >
                                Undelegate
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ValidatorModal

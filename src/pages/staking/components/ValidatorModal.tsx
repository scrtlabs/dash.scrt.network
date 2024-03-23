import { faGlobe } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useContext, useEffect, useState } from 'react'
import { APIContext } from 'context/APIContext'
import { formatNumber, toCurrencyString } from 'utils/commons'
import BigNumber from 'bignumber.js'
import { SECRET_LCD, SECRET_CHAIN_ID } from 'utils/config'
import CopyToClipboard from 'react-copy-to-clipboard'
import { faCopy } from '@fortawesome/free-solid-svg-icons'
import Tooltip from '@mui/material/Tooltip'
import { chains } from 'utils/config'
import { SecretNetworkClient, validatorAddressToSelfDelegatorAddress } from 'secretjs'
import { Nullable } from 'types/Nullable'
import { StakingContext } from 'pages/staking/Staking'
import StakingForm from './validatorModalComponents/StakingForm'
import UndelegateForm from './validatorModalComponents/UndelegateForm'
import RedelegateForm from './validatorModalComponents/RedelegateForm'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { scrtToken } from 'utils/tokens'
import Button from 'components/UI/Button/Button'
import Modal from 'components/UI/Modal/Modal'
import { NotificationService } from 'services/notification.service'
import { useUserPreferencesStore } from 'store/UserPreferences'

interface Props {
  open: boolean
  onClose: any
  restakeEntries: any
  onAutoRestake?: any
}

const ValidatorModal = (props: Props) => {
  const [imgUrl, setImgUrl] = useState<Nullable<string>>(null)
  const { convertCurrency, currentPrice, inflation, communityTax, totalSupply, bondedToken, secretFoundationTax } =
    useContext(APIContext)
  const { currency } = useUserPreferencesStore()

  const { scrtBalance, feeGrantStatus, requestFeeGrant, secretNetworkClient, walletAddress, isConnected } =
    useSecretNetworkClientStore()

  const [realYield, setRealYield] = useState<Nullable<number>>(null)

  const { delegatorDelegations, selectedValidator, view, setView } = useContext(StakingContext)

  function handleAutoRestake() {
    props.onAutoRestake()
    props.onClose()
  }

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
      const selfDelegatingAddr = validatorAddressToSelfDelegatorAddress(selectedValidator?.operator_address)
      const secretjsquery = new SecretNetworkClient({
        url: SECRET_LCD,
        chainId: SECRET_CHAIN_ID
      })
      const { delegation_response } = await secretjsquery.query.staking.delegation({
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

  function customTitle() {
    return (
      <div className="flex-1 flex gap-4 items-center">
        <div className="image">
          {imgUrl ? (
            <img src={imgUrl} alt={`validator logo`} className="rounded-full w-10" />
          ) : (
            <div className="relative bg-blue-500 dark:bg-blue-500 rounded-full w-10 h-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold">
                {/* .charAt(0) or .slice(0,1) won't work here with emojis! */}
                {[...selectedValidator?.description?.moniker][0].toUpperCase()}
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="mb-1">
            <span className="font-semibold">{selectedValidator?.description?.moniker}</span>
            {selectedValidator?.description?.website && (
              <a href={selectedValidator?.description?.website} target="_blank" className="group font-medium text-sm">
                <FontAwesomeIcon
                  icon={faGlobe}
                  size="sm"
                  className="ml-3 mr-1 text-neutral-500 dark:group-hover:text-white group-hover:text-black"
                />
              </a>
            )}
          </div>
          <div className="flex gap-4 items-center">
            {selectedValidator?.status === 'BOND_STATUS_UNBONDED' && (
              <div className="border border-red-500 bg-transparent text-red-500 text-sm rounded px-4 py-2 flex items-center justify-start">
                Inactive
              </div>
            )}
          </div>
          <div className="text-neutral-400 font-medium text-sm">
            <div className="commission font-semibold">
              Commission {(selectedValidator?.commission?.commission_rates?.rate * 100)?.toFixed(2)}% | APR{' '}
              {formatNumber(realYield, 2)}%
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Modal title={customTitle()} onClose={props.onClose} isOpen={props.open} size="lg">
      <div className="max-h-[80vh] overflow-y-auto">
        {/* Header */}

        {/* Body */}
        <div className="grid grid-cols-12 gap-4">
          {selectedValidator?.description?.details && (
            <div className="col-span-12">
              <div className="text-sm rounded-xl p-4 text-center sm:text-left bg-gray-200 dark:bg-neutral-800 text-black dark:text-white">
                <div className="font-bold mb-2">Description</div>
                <div className="text-sm font-medium font-mono text-neutral-400">
                  {selectedValidator?.description?.details}
                </div>
              </div>
            </div>
          )}

          {view === null && (
            <>
              <div className="col-span-12">
                {/* Properties of the Val */}
                <div className="p-8 rounded-xl grid grid-cols-12 gap-6 bg-gray-200 dark:bg-neutral-800 text-black dark:text-white">
                  {/* First Item */}
                  {selectedValidator?.description?.identity && (
                    <div className="col-span-12 sm:col-span-6 flex flex-col text-neutral-800 dark:text-neutral-300 font-semibold">
                      <div className="font-bold mb-2">Identity</div>
                      <div className="text-sm font-medium font-mono text-neutral-400">
                        {`${selectedValidator?.description?.identity}  `}

                        <CopyToClipboard
                          text={selectedValidator?.description?.identity}
                          onCopy={() => NotificationService.notify('Identity copied to Clipboard!', 'success')}
                        >
                          <Tooltip title={'Copy to clipboard'} placement="bottom" arrow>
                            <button
                              type="button"
                              className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-300 transition-colors"
                            >
                              <FontAwesomeIcon icon={faCopy} />
                            </button>
                          </Tooltip>
                        </CopyToClipboard>
                      </div>
                    </div>
                  )}

                  {/* Second Item */}
                  {selectedValidator?.description?.security_contact && (
                    <div className="col-span-12 sm:col-span-6 flex flex-col text-neutral-800 dark:text-neutral-300 font-semibold">
                      <div className="font-bold mb-2">Contact</div>
                      <div className="text-sm font-medium font-mono text-neutral-400">
                        {`${selectedValidator?.description?.security_contact}  `}

                        <CopyToClipboard
                          text={selectedValidator?.description?.security_contact}
                          onCopy={() => {
                            NotificationService.notify('Validator security contact copied to clipboard!', 'success')
                          }}
                        >
                          <Tooltip title={'Copy to clipboard'} placement="bottom" arrow>
                            <button
                              type="button"
                              onClick={() => NotificationService.notify('Copied to Clipboard!', 'success')}
                              className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-300 transition-colors"
                            >
                              <FontAwesomeIcon icon={faCopy} />
                            </button>
                          </Tooltip>
                        </CopyToClipboard>
                      </div>
                    </div>
                  )}
                  {/* Third Item */}
                  <div className="col-span-12 sm:col-span-6 flex flex-col text-neutral-800 dark:text-neutral-300 font-semibold">
                    <div className="font-bold mb-2">Staked Tokens</div>
                    <div className="text-sm font-medium font-mono text-neutral-400">{`${formatNumber(
                      selectedValidator?.tokens / 1e6,
                      2
                    )} SCRT`}</div>
                  </div>
                  {/* Fourth Item */}

                  <div className="col-span-12 sm:col-span-6 flex flex-col text-neutral-800 dark:text-neutral-300 font-semibold">
                    <div className="font-bold mb-2">Self Delegation</div>
                    <div className="text-sm font-medium font-mono text-neutral-400">
                      {' '}
                      {validatorSelfDelegation && `${formatNumber(validatorSelfDelegation / 1e6, 2)} SCRT`}{' '}
                      {!validatorSelfDelegation && (
                        <div className="animate-pulse bg-neutral-700/40 rounded col-span-2 w-16 h-8"></div>
                      )}
                    </div>
                  </div>
                  {/* Fifth Item */}
                  <div className="col-span-12 sm:col-span-6 flex flex-col text-neutral-800 dark:text-neutral-300 font-semibold">
                    <div className="font-bold mb-2">Operator Address</div>
                    <div className="text-sm font-medium font-mono text-neutral-400">
                      {`${
                        selectedValidator?.operator_address.slice(0, 15) +
                        '...' +
                        selectedValidator?.operator_address.slice(-15)
                      } `}
                      <CopyToClipboard
                        text={selectedValidator?.operator_address}
                        onCopy={() => NotificationService.notify('Operator Address copied to Clipboard!', 'success')}
                      >
                        <Tooltip title={'Copy to clipboard'} placement="bottom" arrow>
                          <button className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-300 transition-colors">
                            <FontAwesomeIcon icon={faCopy} />
                          </button>
                        </Tooltip>
                      </CopyToClipboard>
                    </div>
                  </div>
                  {/* Sixth Item */}
                  <div className="col-span-12 sm:col-span-6 flex flex-col text-neutral-800 dark:text-neutral-300 font-semibold">
                    <div className="font-bold mb-2">Validator Address</div>

                    <div className="text-sm font-medium font-mono text-neutral-400">
                      <a
                        href={`${chains['Secret Network'].explorer_account}${validatorAddressToSelfDelegatorAddress(
                          selectedValidator?.operator_address
                        )}`}
                        target="_blank"
                      >
                        {`${
                          validatorAddressToSelfDelegatorAddress(selectedValidator?.operator_address).slice(0, 15) +
                          '...' +
                          validatorAddressToSelfDelegatorAddress(selectedValidator?.operator_address).slice(-15)
                        } `}
                      </a>
                      <CopyToClipboard
                        text={validatorAddressToSelfDelegatorAddress(selectedValidator?.operator_address)}
                        onCopy={() => NotificationService.notify('Validator Address copied to Clipboard!', 'success')}
                      >
                        <Tooltip title={'Copy to clipboard'} placement="bottom" arrow>
                          <button
                            type="button"
                            className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-300 transition-colors"
                          >
                            <FontAwesomeIcon icon={faCopy} />
                          </button>
                        </Tooltip>
                      </CopyToClipboard>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Available to Stake */}
          {isConnected && (
            <div className="col-span-12 md:col-span-6 rounded-xl p-6 text-center sm:text-left bg-gray-200 dark:bg-neutral-800 text-black dark:text-white">
              <div className="flex-1">
                <div className="font-bold mb-2">Available to Stake</div>
                <div className="mb-1">
                  <span className="text-base font-medium font-mono">
                    {new BigNumber(scrtBalance!).dividedBy(`1e${scrtToken.decimals}`).toFormat()}
                  </span>
                  <span className="text-xs font-semibold text-neutral-400"> SCRT</span>
                </div>
                <div className="text-xs text-neutral-400 font-medium font-mono">
                  {toCurrencyString(
                    convertCurrency(
                      'USD',
                      new BigNumber(scrtBalance!)
                        .dividedBy(`1e${scrtToken.decimals}`)
                        .multipliedBy(Number(currentPrice))
                        .toNumber(),
                      'EUR'
                    ),
                    'EUR'
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Your Delegation */}
          {secretNetworkClient &&
            walletAddress &&
            (delegatorDelegations?.find(
              (delegatorDelegation: any) =>
                selectedValidator?.operator_address == delegatorDelegation.delegation.validator_address
            ) ? (
              <div className="col-span-12 md:col-span-6 rounded-xl px-4 py-8 text-center sm:text-left bg-gray-200 dark:bg-neutral-800 text-black dark:text-white">
                <div className="flex-1">
                  <div className="font-bold mb-2">Your Delegation</div>
                  <div className="mb-1">
                    <span className="text-base font-medium font-mono">
                      {delegatorDelegations?.find(
                        (delegatorDelegation: any) =>
                          selectedValidator?.operator_address == delegatorDelegation.delegation.validator_address
                      )?.balance?.amount / 1e6}
                    </span>
                    <span className="text-xs font-semibold text-neutral-400"> SCRT</span>
                  </div>
                  <div className="text-xs text-neutral-400 font-medium font-mono">
                    {toCurrencyString(
                      new BigNumber(
                        delegatorDelegations?.find(
                          (delegatorDelegation: any) =>
                            selectedValidator?.operator_address == delegatorDelegation.delegation.validator_address
                        )?.balance?.amount
                      )
                        .dividedBy(`1e${scrtToken.decimals}`)
                        .multipliedBy(Number(currentPrice))
                        .toNumber()
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="col-span-12 md:col-span-6 rounded-xl px-4 py-8 text-center sm:text-left bg-gray-200 dark:bg-neutral-800 text-black dark:text-white">
                <div className="flex-1">
                  <div className="font-bold mb-2">Your Delegation</div>
                  <div className="mb-1">
                    <span className="text-base font-medium font-mono">0</span>
                    <span className="text-xs font-semibold text-neutral-400"> SCRT</span>
                  </div>
                  <div className="text-xs text-neutral-400 font-medium font-mono">{toCurrencyString(0)}</div>
                </div>
              </div>
            ))}

          {view !== null && (
            <div className="col-span-12">
              {view === 'delegate' && <StakingForm />}
              {view === 'undelegate' && <UndelegateForm />}
              {view === 'redelegate' && <RedelegateForm />}
            </div>
          )}

          {view === null && secretNetworkClient?.address && (
            <div className="col-span-12">
              {/* Navigation */}
              <div className="flex flex-col sm:flex-row-reverse justify-start gap-2">
                <Button onClick={() => setView('delegate')} size="default">
                  Delegate
                </Button>
                {delegatorDelegations?.find(
                  (delegatorDelegation: any) =>
                    selectedValidator?.operator_address == delegatorDelegation.delegation.validator_address
                ) ? (
                  <>
                    <Button onClick={() => setView('redelegate')} color="secondary" size="default">
                      Redelegate
                    </Button>
                    <Button onClick={() => setView('undelegate')} color="secondary" size="default">
                      Undelegate
                    </Button>
                    <Button onClick={handleAutoRestake} color="secondary" size="default">
                      Auto Restake
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default ValidatorModal

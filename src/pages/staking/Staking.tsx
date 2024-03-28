import { faInfoCircle, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { createContext, useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import MyValidatorsItem from './components/MyValidatorsItem'
import { shuffleArray, stakingPageTitle, stakingPageDescription, stakingJsonLdSchema, isMac } from 'utils/commons'
import Tooltip from '@mui/material/Tooltip'
import NoScrtWarning from './components/NoScrtWarning'
import ValidatorModal from './components/ValidatorModal'
import { SECRET_LCD, SECRET_CHAIN_ID, tokens } from 'utils/config'
import { SecretNetworkClient } from 'secretjs'
import Title from '../../components/Title'
import { useSearchParams } from 'react-router-dom'
import { Nullable } from 'types/Nullable'
import BigNumber from 'bignumber.js'
import { StakingView, isStakingView } from 'types/StakingView'
import ClaimRewardsModal from './components/ClaimRewardsModal'
import ManageAutoRestakeModal from './components/ManageAutoRestakeModal'
import { scrtToken } from 'utils/tokens'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import ValidatorItem from './components/ValidatorItem'
import { Validator } from 'types/Validator'
import Button from 'components/UI/Button/Button'
import StakingStats from './components/StakingStats/StakingStats'

export interface ValidatorRestakeStatus {
  validatorAddress: string
  autoRestake: boolean
  stakedAmount: string
}

export const StakingContext = createContext(null)

function Staking() {
  // URL params
  const [searchParams, setSearchParams] = useSearchParams()
  const validatorUrlParam = searchParams.get('validator') // selected validator
  const viewUrlParam: Nullable<string> = searchParams.get('view') // "undelegate" | "redelegate" | "delegate"

  const [view, setView] = useState<Nullable<StakingView>>(null)

  const [reload, setReload] = useState(false)

  const handleStakingModalClose = () => {
    setIsValidatorModalOpen(false)

    searchParams.get('validator') ? searchParams.delete('validator') : null
    searchParams.get('view') ? searchParams.delete('view') : null
    setSearchParams(searchParams)

    setSelectedValidator(null)
    setView(null)

    document.body.classList.remove('overflow-hidden')
  }

  const handleClaimRewardsModal = () => {
    setIsClaimRewardsModalOpen(false)

    document.body.classList.remove('overflow-hidden')
  }

  const { secretNetworkClient, scrtBalance, getBalance } = useSecretNetworkClientStore()

  const [validators, setValidators] = useState<Nullable<Validator[]>>(null)
  const [activeValidators, setActiveValidators] = useState<Nullable<Validator[]>>(null)
  const [inactiveValidators, setInactiveValidators] = useState<Validator[]>(null)

  //Delegations that a Delegetor has
  const [delegatorDelegations, setDelegatorDelegations] = useState<any>()

  //Rewards for each delegator
  const [delegationTotalRewards, setDelegationTotalRewards] = useState<any>()

  function getTotalPendingRewards() {
    return BigNumber(delegationTotalRewards?.total[0]?.amount)
      .dividedBy(`1e${scrtToken.decimals}`)
      .toFormat(scrtToken.decimals)
  }

  const totalPendingRewards = getTotalPendingRewards()

  const getTotalAmountStaked = () => {
    return delegatorDelegations
      ?.reduce((sum: any, delegation: any) => {
        const amount = new BigNumber(delegation?.balance?.amount || 0)
        return sum.plus(amount)
      }, new BigNumber(0))
      .dividedBy(`1e${scrtToken.decimals}`)
      .toFormat(scrtToken.decimals)
  }

  const [selectedValidator, setSelectedValidator] = useState<Nullable<Validator>>(null)

  const [shuffledActiveValidators, setShuffledActiveValidators] = useState<Nullable<Validator[]>>(null)
  const [validatorsBySearch, setValidatorsBySearch] = useState<Nullable<Validator>>(null)

  type ValidatorDisplayStatus = 'active' | 'inactive'
  const [validatorDisplayStatus, setValidatorDisplayStatus] = useState<ValidatorDisplayStatus>('active')

  //Auto Restake
  const [restakeChoices, setRestakeChoices] = useState<ValidatorRestakeStatus[]>([])
  const [restakeEntries, setRestakeEntries] = useState<ValidatorRestakeStatus[]>([])

  //Search Query
  const [searchQuery, setSearchQuery] = useState<string>('')
  const searchInput = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        searchInput.current?.focus()
      }

      // Check for ESC key to blur the search input
      if (event.key === 'Escape') {
        event.preventDefault()
        if (document.activeElement === searchInput.current) {
          searchInput.current?.blur()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const [isValidatorModalOpen, setIsValidatorModalOpen] = useState<boolean>(false)

  const [isClaimRewardsModalOpen, setIsClaimRewardsModalOpen] = useState<boolean>(false)

  const [isManageAutoRestakeModalOpen, setIsManageAutoRestakeModalOpen] = useState<boolean>(false)

  const getValByAddressStringSnippet = (addressSnippet: String) => {
    return (
      validators.find((val) => {
        return (
          val.operator_address.toLowerCase().includes(addressSnippet) ||
          val.description.moniker.toLowerCase().includes(addressSnippet)
        )
      }) || null
    )
  }

  useEffect(() => {
    if (validatorUrlParam && validators) {
      if (getValByAddressStringSnippet(validatorUrlParam.toLowerCase())) {
        setSelectedValidator(getValByAddressStringSnippet(validatorUrlParam.toLowerCase()))
      } else {
        searchParams.delete('validator')
        searchParams.delete('view')
        setSearchParams(searchParams)
      }
    }
  }, [validatorUrlParam, validators])

  useEffect(() => {
    if (viewUrlParam && !validatorUrlParam) {
    }
  }, [validatorUrlParam, viewUrlParam])

  // sets view by url param
  useEffect(() => {
    if (viewUrlParam && validators) {
      if (isStakingView(viewUrlParam)) {
        setView(viewUrlParam as StakingView)
      } else {
        setView(null)
        searchParams.delete('view')
        setSearchParams(searchParams)
      }
    }
  }, [viewUrlParam, validators])

  // sets url param by view
  useEffect(() => {
    var params = {}
    if (selectedValidator || view) {
      if (selectedValidator) {
        params = { ...params, validator: selectedValidator.operator_address }
      }
      if (view) {
        params = { ...params, view: view }
      }
      setSearchParams(params)
    }
  }, [selectedValidator, view])

  function getViewByString(input: string): Nullable<StakingView> {
    return isStakingView(input.toLowerCase()) ? (input.toLowerCase() as StakingView) : null
  }

  useEffect(() => {
    if (viewUrlParam && validators && validators.length > 0) {
      const viewByUrlParam: Nullable<StakingView> = getViewByString(viewUrlParam)
      if (viewByUrlParam !== null) {
        setView(viewByUrlParam)
      }
    }
  }, [validators])

  useEffect(() => {
    const fetchDelegatorValidators = async () => {
      if (secretNetworkClient?.address) {
        const { delegation_responses } = await secretNetworkClient.query.staking.delegatorDelegations({
          delegator_addr: secretNetworkClient?.address,
          pagination: { limit: '1000' }
        })
        const { validators } = await secretNetworkClient.query.distribution.restakingEntries({
          delegator: secretNetworkClient?.address
        })
        //Restake Entries are the restake entries from the chain, these stay and will not be changed.
        setRestakeEntries(
          delegation_responses.map((validator: any) => ({
            validatorAddress: validator?.delegation?.validator_address,
            autoRestake: validators.some((item: any) => {
              return item === validator?.delegation?.validator_address
            }),
            stakedAmount: validator?.balance?.amount
          }))
        )
        //Restake Entries INITALLY are the restake entries from the chain, user changes these.
        setRestakeChoices(
          delegation_responses.map((validator: any) => ({
            validatorAddress: validator?.delegation?.validator_address,
            autoRestake: validators.some((item: any) => {
              return item === validator?.delegation?.validator_address
            }),
            stakedAmount: validator?.balance?.amount
          }))
        )
        setDelegatorDelegations(delegation_responses)
        const result = await secretNetworkClient.query.distribution.delegationTotalRewards({
          delegator_address: secretNetworkClient?.address
        })
        setDelegationTotalRewards(result)
      }
    }
    fetchDelegatorValidators()
  }, [secretNetworkClient?.address, reload])

  useEffect(() => {
    const fetchValidators = async () => {
      const secretjsquery = new SecretNetworkClient({
        url: SECRET_LCD,
        chainId: SECRET_CHAIN_ID
      })
      const { validators } = await secretjsquery.query.staking.validators({
        status: '',
        pagination: {
          limit: '1000'
        }
      })
      setValidators(validators)
      const activeValidators = validators.filter((validator: Validator) => validator.status === 'BOND_STATUS_BONDED')
      setActiveValidators(activeValidators)
      setShuffledActiveValidators(shuffleArray(activeValidators))
      setInactiveValidators(validators.filter((validator: Validator) => validator.status === 'BOND_STATUS_UNBONDED'))
    }
    fetchValidators()
  }, [])

  useEffect(() => {
    if (!searchQuery) {
      setValidatorsBySearch(null)
      return
    }
    if (shuffledActiveValidators && validatorDisplayStatus == 'active') {
      setValidatorsBySearch(
        shuffledActiveValidators.filter(
          (validator: Validator) => validator?.description?.moniker.toLowerCase().includes(searchQuery?.toLowerCase())
        )
      )
    }
    if (inactiveValidators && validatorDisplayStatus == 'inactive') {
      setValidatorsBySearch(
        inactiveValidators.filter(
          (validator: any) => validator?.description?.moniker.toLowerCase().includes(searchQuery?.toLowerCase())
        )
      )
    }
  }, [searchQuery, validatorDisplayStatus])

  function handleManageAutoRestakeModal() {
    setIsManageAutoRestakeModalOpen(false)
  }

  const providerValue = {
    validators,
    setValidators,
    delegatorDelegations,
    setDelegatorDelegations,
    selectedValidator,
    setSelectedValidator,
    delegationTotalRewards,
    setDelegationTotalRewards,
    view,
    setView,
    reload,
    setReload,
    restakeChoices,
    setRestakeChoices,
    restakeEntries,
    setRestakeEntries,
    totalPendingRewards,
    getTotalAmountStaked,
    setIsClaimRewardsModalOpen
  }

  return (
    <StakingContext.Provider value={providerValue}>
      <>
        <Helmet>
          <title>{stakingPageTitle}</title>

          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />

          <meta name="title" content={stakingPageTitle} />
          <meta name="application-name" content={stakingPageTitle} />
          <meta name="description" content={stakingPageDescription} />
          <meta name="robots" content="index,follow" />

          <meta property="og:title" content={stakingPageTitle} />
          <meta property="og:description" content={stakingPageDescription} />
          <meta property="og:image" content={`/img/secret_dashboard_preview.png`} />

          <meta name="twitter:title" content={stakingPageTitle} />
          <meta name="twitter:description" content={stakingPageDescription} />
          <meta property="twitter:image" content={`/img/secret_dashboard_preview.png`} />

          <script type="application/ld+json">{JSON.stringify(stakingJsonLdSchema)}</script>
        </Helmet>
        <ManageAutoRestakeModal open={isManageAutoRestakeModalOpen} onClose={handleManageAutoRestakeModal} />
        <ClaimRewardsModal open={isClaimRewardsModalOpen} onClose={handleClaimRewardsModal} />
        <ValidatorModal
          open={!!selectedValidator}
          restakeEntries={restakeEntries}
          onClose={handleStakingModalClose}
          onAutoRestake={() => setIsManageAutoRestakeModalOpen(true)}
        />
        {/* Title */}
        <Title title={'Staking'} className="pb-12" />
        {secretNetworkClient?.address && scrtBalance === '0' && <NoScrtWarning />}

        {/* My Validators */}
        {secretNetworkClient?.address && delegatorDelegations && delegatorDelegations?.length != 0 && validators && (
          <>
            <StakingStats />

            <hr className="h-px my-8 bg-neutral-200 border-0 dark:bg-neutral-700" />

            <div className="max-w-6xl mx-auto">
              <div className="font-semibold text-xl mb-4 px-4">My Validators</div>
            </div>
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col px-4">
                {delegatorDelegations?.map((delegation: any, i: number) => {
                  const validator = validators.find(
                    (validator: Validator) => validator.operator_address == delegation.delegation.validator_address
                  )
                  return (
                    <MyValidatorsItem
                      key={i}
                      name={validator?.description?.moniker}
                      commissionPercentage={validator?.commission.commission_rates?.rate}
                      validator={validator}
                      identity={validator?.description?.identity}
                      restakeEntries={restakeEntries}
                      stakedAmount={delegation?.balance?.amount}
                      setSelectedValidator={setSelectedValidator}
                      openModal={setIsValidatorModalOpen}
                    />
                  )
                })}
              </div>

              {/* Total Staked | Auto Restake */}
              <div className="px-4 mt-4 flex flex-col sm:flex-row gap-2 sm:gap-4 text-center sm:text-left">
                <div className="flex-initial">
                  <Button onClick={() => setIsManageAutoRestakeModalOpen(true)}>Manage Auto Restake</Button>
                </div>
              </div>
            </div>

            <hr className="h-px my-8 bg-neutral-200 border-0 dark:bg-neutral-700" />
          </>
        )}

        {/* All Validators */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="font-semibold text-xl mb-4 px-4">
            <Tooltip
              title={'To promote decentralization, all validators are ordered randomly.'}
              placement="right"
              arrow
            >
              <span className="inline-flex items-center gap-2">
                All Validators
                <FontAwesomeIcon icon={faInfoCircle} className="text-sm text-neutral-400 cursor-pointer" />
              </span>
            </Tooltip>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row items-center px-4 mb-4">
            {/* Search */}
            <div className="flex-1 w-full lg:w-auto">
              <div className="w-full xs:w-auto">
                <div className="relative sm:w-72">
                  <div className="absolute right-0 pr-3 inset-y-0 pointer-events-none text-sm flex items-center">
                    <div className="bg-gray-100 dark:bg-neutral-700 px-1 rounded flex items-center gap-0.5">
                      <kbd>{isMac ? '⌘' : 'CTRL+'}</kbd>
                      <kbd>K</kbd>
                    </div>
                  </div>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="" />
                  </div>
                  <input
                    ref={searchInput}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    type="text"
                    id="search"
                    className="block w-full p-2.5 pl-10 text-sm rounded-lg text-neutral-800 dark:text-white bg-white dark:bg-neutral-800 placeholder-neutral-600 dark:placeholder-neutral-400 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-500"
                    placeholder="Search"
                  />
                </div>
              </div>
            </div>
            <div className="flex-initial items-center rounded-md" role="group">
              <button
                disabled={validatorDisplayStatus === 'active'}
                onClick={() => setValidatorDisplayStatus('active')}
                type="button"
                className="disabled:text-white px-3 text-xs font-semibold rounded-l-lg py-2 enabled:bg-gray-300 disabled:bg-emerald-500 dark:disabled:bg-emerald-600 dark:enabled:bg-neutral-700 enabled:hover:bg-gray-400 dark:enabled:hover:bg-neutral-750 transition"
              >
                {`Active Set${activeValidators ? ` (${activeValidators?.length})` : ''}`}
              </button>
              <button
                onClick={() => setValidatorDisplayStatus('inactive')}
                disabled={validatorDisplayStatus === 'inactive'}
                type="button"
                className="px-3 text-xs font-semibold rounded-r-lg py-2 disabled:bg-red-600 disabled:text-white enabled:bg-gray-300 dark:enabled:bg-neutral-700 enabled:hover:bg-gray-400 dark:enabled:hover:bg-neutral-750 transition"
              >
                {`Inactive Set${inactiveValidators ? ` (${inactiveValidators?.length})` : ''}`}
              </button>
            </div>
          </div>

          <div className="flex flex-col px-4 ">
            {validatorsBySearch || shuffledActiveValidators || inactiveValidators ? (
              (validatorsBySearch
                ? validatorsBySearch
                : validatorDisplayStatus == 'active'
                ? shuffledActiveValidators
                : inactiveValidators
              )?.map((validator: Validator, i: number) => (
                <ValidatorItem
                  key={i}
                  position={i}
                  validator={validator}
                  name={validator?.description?.moniker}
                  commissionPercentage={validator?.commission.commission_rates?.rate}
                  votingPower={validator?.tokens}
                  identity={validator?.description?.identity}
                  website={validator?.description?.website}
                  setSelectedValidator={setSelectedValidator}
                  openModal={setIsValidatorModalOpen}
                />
              ))
            ) : (
              <div className="animate-pulse flex">
                <ValidatorItem
                  position={0}
                  validator={undefined}
                  name={''}
                  commissionPercentage={undefined}
                  votingPower={undefined}
                  identity={undefined}
                  website={undefined}
                  setSelectedValidator={null}
                  openModal={null}
                />
              </div>
            )}
          </div>

          {validators ? (
            <div className="italic text-center mt-4 px-4 text-sm text-neutral-500 dark:text-neutral-500">
              All validators are ordered randomly to promote decentralization
            </div>
          ) : null}
        </div>
      </>
    </StakingContext.Provider>
  )
}

export default Staking

import { useFormik } from 'formik'
import { ibcSchema } from './ibcSchema'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { useEffect, useState } from 'react'
import { IbcMode } from 'types/IbcMode'
import Select from 'react-select'
import { Chain, Token, chains, tokens } from 'utils/config'
import IbcSelect from './IbcSelect'
import Tooltip from '@mui/material/Tooltip'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faRightLeft } from '@fortawesome/free-solid-svg-icons'
import AddressInfo from './AddressInfo'
import PercentagePicker from 'components/PercentagePicker'
import { IbcService } from 'services/ibc.service'
import FeeGrant from 'components/FeeGrant/FeeGrant'
import NewBalanceUI from 'components/NewBalanceUI'
import { FeeGrantStatus } from 'types/FeeGrantStatus'

export default function IbcForm() {
  const { feeGrantStatus, secretNetworkClient, walletAddress, isConnected } = useSecretNetworkClientStore()

  const [isLoading, setIsWaiting] = useState<boolean>(false)
  const [generalSuccessMessage, setGeneralSuccessMessage] = useState<String>('')
  const [generalErrorMessage, setGeneralErrorMessage] = useState<String>('')

  // handles [25% | 50% | 75% | Max] Button-Group
  function setAmountByPercentage(percentage: number) {
    formik.setFieldValue('amount', percentage.toString()) // TODO: Fix
  }

  function toggleIbcMode() {
    if (formik.values.ibcMode === 'deposit') {
      formik.setFieldValue('ibcMode', 'withdrawal')
    } else {
      formik.setFieldValue('ibcMode', 'deposit')
    }
  }

  const selectableChains = IbcService.getSupportedChains()

  const ChainSelect = () => {
    return (
      <Select
        options={selectableChains}
        value={formik.values.chain}
        onChange={(chain: Chain) => {
          formik.setFieldValue('chain', chain)
        }}
        isSearchable={false}
        isDisabled={!isConnected}
        formatOptionLabel={(option) => (
          <IbcSelect
            imgSrc={`/img/assets/${chains[option.chain_name].chain_image}`}
            altText={`/img/assets/${chains[option.chain_name].chain_name} asset logo`}
            optionName={option.chain_name}
          />
        )}
        className="react-select-container"
        classNamePrefix="react-select"
      />
    )
  }

  interface IFormValues {
    chain: Chain
    token: Token
    ibcMode: IbcMode
    amount: string
    feeGrantStatus: FeeGrantStatus
  }

  const formik = useFormik<IFormValues>({
    initialValues: {
      chain: selectableChains.find((chain: Chain) => chain.chain_name === 'Osmosis'),
      token: IbcService.getSupportedIbcTokensByChain(
        selectableChains.find((chain: Chain) => chain.chain_name === 'Osmosis')
      ).find((token: Token) => token.name === 'SCRT'),
      ibcMode: 'deposit',
      amount: '',
      feeGrantStatus: feeGrantStatus
    },
    validationSchema: ibcSchema,
    validateOnBlur: false,
    validateOnChange: true,
    onSubmit: async (values) => {
      try {
        setGeneralErrorMessage('')
        setGeneralSuccessMessage('')
        setIsWaiting(true)
        const res = await IbcService.performIbcTransfer({
          ...values,
          secretNetworkClient: secretNetworkClient
        })
        setIsWaiting(false)
        if (res.success) {
          setGeneralSuccessMessage(`IBC transfer successful!`)
        } else {
          throw new Error()
        }
      } catch (error: any) {
        console.error(error)
        setGeneralErrorMessage(`IBC transfer failed!`)
      }
    }
  })

  function getSupportedTokens(): Token[] {
    let tempSelectedChain = formik.values.chain
    let supportedTokens = IbcService.getSupportedIbcTokensByChain(tempSelectedChain)
    return supportedTokens
  }

  const [supportedTokens, setSupportedTokens] = useState(getSupportedTokens())
  const [sourceChainAddress, setSourceChainAddress] = useState<string>('')

  useEffect(() => {
    const supportedTokensBySelectedChain: Token[] = getSupportedTokens()
    setSupportedTokens(supportedTokensBySelectedChain)
    formik.setFieldValue('token', supportedTokensBySelectedChain[0])

    async function fetchSourceChainAddress() {
      const sourceChainAddr = await IbcService.getChainSecretJs(formik.values.chain)
      setSourceChainAddress(sourceChainAddr.address)
    }
    fetchSourceChainAddress()
  }, [formik.values.chain])

  // return <Deposit />
  return (
    <>
      <form
        onSubmit={formik.handleSubmit}
        className="w-full flex flex-col gap-4 text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800"
      >
        {/* [From|To] Picker */}
        <div className="flex flex-col md:flex-row mb-8">
          {/* *** From *** */}
          <div className="flex-initial w-full md:w-1/3">
            {/* circle */}
            <div
              className="w-full relative rounded-full overflow-hidden border-2 border-cyan-500 hidden md:block"
              style={{ paddingTop: '100%' }}
            >
              <div className="img-wrapper absolute top-1/2 left-0 right-0 -translate-y-1/2 text-center">
                <div className="w-1/2 inline-block">
                  <div className="relative">
                    <div
                      className={`absolute inset-0 bg-cyan-500 blur-md rounded-full overflow-hidden ${
                        secretNetworkClient?.address ? 'fadeInAndOutLoop' : 'opacity-40'
                      }`}
                    ></div>
                    <img
                      src={
                        '/img/assets/' +
                        (formik.values.ibcMode === 'deposit' ? formik.values.chain.chain_image : 'scrt.svg')
                      }
                      className="w-full relative inline-block rounded-full overflow-hiden"
                      alt={`${formik.values.ibcMode === 'deposit' ? formik.values.chain.chain_name : 'SCRT'} logo`}
                    />
                  </div>
                </div>
              </div>
              <div
                className="absolute left-1/2 -translate-x-1/2 text-center text-sm font-semibold text-black dark:text-white"
                style={{ bottom: '10%' }}
              >
                From
              </div>
            </div>
            {/* Chain Picker */}
            <div className="-mt-3 relative z-10 w-full">
              {/* {value} */}
              {formik.values.ibcMode === 'deposit' && <ChainSelect />}
              {formik.values.ibcMode === 'withdrawal' && (
                <div
                  style={{ paddingTop: '.76rem', paddingBottom: '.76rem' }}
                  className="flex items-center w-full text-sm font-semibold select-none bg-white dark:bg-neutral-800 rounded text-neutral-800 dark:text-neutral-200 focus:bg-neutral-300 dark:focus:bg-neutral-700 disabled:hover:bg-neutral-200 dark:disabled:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-600"
                >
                  <div className="flex-1 px-3 text-center">
                    <span>Secret Network</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 py-2 md:py-0">
            <div className="md:relative" id="ibcSwitchButton">
              <div className="md:absolute md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 text-center md:text-left">
                <Tooltip
                  title={`Switch chains`}
                  placement="bottom"
                  disableHoverListener={!secretNetworkClient?.address}
                  arrow
                >
                  <span>
                    <button
                      onClick={toggleIbcMode}
                      className={
                        'focus:outline-none focus-visible:ring-2 ring-sky-500/40 inline-block bg-neutral-200 dark:bg-neutral-700 px-3 py-2 text-cyan-500 dark:text-cyan-500 transition-colors rounded-xl disabled:text-neutral-500 dark:disabled:text-neutral-500' +
                        (secretNetworkClient?.address ? 'hover:text-cyan-700 dark:hover:text-cyan-300' : '')
                      }
                      disabled={!isConnected}
                    >
                      <FontAwesomeIcon icon={faRightLeft} className="rotate-90 md:rotate-0" />
                    </button>
                  </span>
                </Tooltip>
              </div>
            </div>
          </div>
          {/* *** To *** */}
          <div className="flex-initial w-full md:w-1/3">
            <div
              className="w-full relative rounded-full overflow-hidden border-2 border-violet-500 hidden md:block"
              style={{ paddingTop: '100%' }}
            >
              <div className="img-wrapper absolute top-1/2 left-0 right-0 -translate-y-1/2 text-center">
                <div className="w-1/2 inline-block">
                  <div className="relative">
                    <div
                      className={`absolute inset-0 bg-violet-500 blur-md rounded-full overflow-hidden ${
                        secretNetworkClient?.address ? 'fadeInAndOutLoop' : 'opacity-40'
                      }`}
                    ></div>
                    <img
                      src={
                        '/img/assets/' +
                        (formik.values.ibcMode === 'withdrawal' ? formik.values.chain.chain_image : 'scrt.svg')
                      }
                      className="w-full relative inline-block rounded-full overflow-hiden"
                      alt={`${formik.values.ibcMode === 'withdrawal' ? formik.values.chain.chain_name : 'SCRT'} logo`}
                    />
                  </div>
                </div>
              </div>
              <div
                className="absolute left-0 right-0 text-center text-sm font-semibold text-black dark:text-white"
                style={{ bottom: '10%' }}
              >
                To
              </div>
            </div>
            {/* Chain Picker */}
            <div className="md:-mt-3 md:relative z-10 w-full">
              {formik.values.ibcMode === 'withdrawal' && <ChainSelect />}
              {formik.values.ibcMode === 'deposit' && (
                <div
                  style={{ paddingTop: '.76rem', paddingBottom: '.76rem' }}
                  className="flex items-center w-full text-sm font-semibold select-none bg-neutral-200 dark:bg-neutral-800 rounded text-neutral-800 dark:text-neutral-200 focus:bg-neutral-300 dark:focus:bg-neutral-700 disabled:hover:bg-neutral-200 dark:disabled:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-600"
                >
                  <div className="flex-1 px-3 text-center">
                    <span>Secret Network</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <AddressInfo
          srcChain={formik.values.ibcMode === 'withdrawal' ? chains['Secret Network'] : formik.values.chain}
          srcAddress={formik.values.ibcMode === 'withdrawal' ? walletAddress : sourceChainAddress}
          destChain={formik.values.ibcMode === 'withdrawal' ? formik.values.chain : chains['Secret Network']}
          destAddress={formik.values.ibcMode === 'withdrawal' ? sourceChainAddress : walletAddress}
        />

        <div className="bg-neutral-200 dark:bg-neutral-700 p-4 rounded-xl">
          {/* Title Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-2 text-center sm:text-left">
            <span className="font-extrabold">Token</span>
            {formik.touched.amount && formik.errors.amount ? (
              <span className="text-red-500 dark:text-red-500 text-xs font-normal">{formik.errors.amount}</span>
            ) : null}
          </div>
          <div className="flex" id="inputWrapper">
            <Select
              options={supportedTokens}
              value={formik.values.token}
              onChange={(token: Token) => formik.setFieldValue('token', token)}
              isSearchable={false}
              isDisabled={!secretNetworkClient?.address}
              formatOptionLabel={(token: Token) => (
                <div className="flex items-center">
                  <img
                    src={`/img/assets/${token.image}`}
                    alt={`${token.name} asset logo`}
                    className="w-6 h-6 mr-2 rounded-full"
                  />
                  <span className="font-semibold text-sm">
                    {!(token.is_snip20 || token.name === 'SCRT') && formik.values.ibcMode == 'withdrawal' ? 's' : null}
                    {token.name}
                  </span>
                </div>
              )}
              className="react-select-wrap-container"
              classNamePrefix="react-select-wrap"
            />
            <input
              id="amount"
              name="amount"
              type="text"
              value={formik.values.amount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={
                'dark:placeholder-neutral-600 remove-arrows text-right focus:z-10 block flex-1 min-w-0 w-full bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white px-4 rounded-r-lg disabled:placeholder-neutral-300 dark:disabled:placeholder-neutral-700 transition-colors font-medium focus:outline-0 focus:ring-2 ring-sky-500/40' +
                (false ? '  border border-red-500 dark:border-red-500' : '')
              }
              placeholder="0"
              disabled={!secretNetworkClient?.address}
            />
          </div>

          {/* Balance | [25%|50%|75%|Max] */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 mt-3">
            <div className="flex-1 text-xs">
              <NewBalanceUI
                token={formik.values.token}
                chain={formik.values.ibcMode === 'withdrawal' ? chains['Secret Network'] : formik.values.chain}
                isSecretToken={formik.values.ibcMode === 'withdrawal' && formik.values.token.name !== 'SCRT'}
              />
            </div>
            <div className="sm:flex-initial text-xs">
              <PercentagePicker setAmountByPercentage={setAmountByPercentage} disabled={!isConnected} />
            </div>
          </div>
        </div>

        {/* Fee Grant */}
        {formik.values.ibcMode === 'withdrawal' ? <FeeGrant /> : null}

        {isLoading ? (
          <div className="text-sm font-normal flex items-center gap-2 justify-center">
            <svg
              className="animate-spin h-5 w-5 text-black dark:text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Processing...</span>
          </div>
        ) : null}

        {generalSuccessMessage ? (
          <div className="text-emerald-500 dark:text-emerald-500 text-sm font-normal flex items-center gap-2 justify-center">
            <FontAwesomeIcon icon={faCircleCheck} />
            <span>{generalSuccessMessage}</span>
          </div>
        ) : null}

        {generalSuccessMessage ? (
          <div className="text-emerald-500 dark:text-emerald-500 text-sm font-normal flex items-center gap-2 justify-center">
            <FontAwesomeIcon icon={faCircleCheck} />
            <span>{generalSuccessMessage}</span>
          </div>
        ) : null}

        {/* Submit Button */}
        <button
          className={
            'enabled:bg-gradient-to-r enabled:from-cyan-600 enabled:to-purple-600 enabled:hover:from-cyan-500 enabled:hover:to-purple-500 transition-colors text-white font-extrabold py-3 w-full rounded-lg disabled:bg-neutral-500 focus:outline-none focus-visible:ring-4 ring-sky-500/40'
          }
          disabled={!isConnected}
          type="submit"
        >
          {`Execute Transfer`}
        </button>

        {/* Debug Info */}
        {import.meta.env.VITE_DEBUG_MODE === 'true' ? (
          <div className="text-sky-500 text-xs p-2 bg-blue-500/20 rounded">
            <div className="mb-4 font-semibold">Debug Info (Dev Mode)</div>
            formik.errors: {JSON.stringify(formik.errors)}
          </div>
        ) : null}
      </form>
    </>
  )
}

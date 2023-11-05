import { useEffect, useState, useContext, createContext } from 'react'
import { MsgExecuteContract, BroadcastMode } from 'secretjs'
import { Token, tokens } from 'utils/config'
import {
  sleep,
  faucetURL,
  faucetAddress,
  viewingKeyErrorString,
  wrapPageTitle,
  wrapPageDescription,
  wrapJsonLdSchema,
  randomPadding
} from 'utils/commons'
import BigNumber from 'bignumber.js'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faKey, faArrowRightArrowLeft, faRightLeft, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import Select from 'react-select'
import Tooltip from '@mui/material/Tooltip'
import { Helmet } from 'react-helmet-async'
import UnknownBalanceModal from './components/UnknownBalanceModal'
import FeeGrantInfoModal from './components/FeeGrantInfoModal'
import mixpanel from 'mixpanel-browser'
import { useSearchParams } from 'react-router-dom'
import { WrappingMode, isWrappingMode } from 'types/WrappingMode'
import { APIContext } from 'context/APIContext'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import FeeGrant from 'components/FeeGrant/FeeGrant'
import Title from 'components/Title'
import { NativeTokenBalanceUi, WrappedTokenBalanceUi } from 'components/BalanceUI'
import PercentagePicker from 'components/PercentagePicker'
import { useFormik } from 'formik'
import { wrapSchema } from './wrapSchema'
import WrapForm from './components/WrapForm'

export const WrapContext = createContext(null)

export function Wrap() {
  const { setViewingKey } = useSecretNetworkClientStore()

  const { secretNetworkClient, walletAddress } = useSecretNetworkClientStore()

  const { prices } = useContext(APIContext)

  const secretToken: Token = tokens.find((token) => token.name === 'SCRT')
  const [selectedToken, setSelectedToken] = useState<Token>(secretToken)
  const [selectedTokenPrice, setSelectedTokenPrice] = useState<number>(0)
  const [amountString, setAmountString] = useState<string>('0')
  const [wrappingMode, setWrappingMode] = useState<WrappingMode>('wrap')

  // useEffect(() => {
  //   setSelectedTokenPrice(
  //     prices.find((price: { coingecko_id: string }) => price.coingecko_id === selectedToken.coingecko_id)?.priceUsd
  //   )
  // }, [selectedToken, prices])

  useEffect(() => {
    if (import.meta.env.VITE_MIXPANEL_ENABLED === 'true') {
      mixpanel.init(import.meta.env.VITE_MIXPANEL_PROJECT_TOKEN, {
        debug: false
      })
      mixpanel.identify('Dashboard-App')
      mixpanel.track('Open Wrap Tab')
    }
  }, [])

  // URL params
  const [searchParams, setSearchParams] = useSearchParams()
  const modeUrlParam = searchParams.get('mode')
  const tokenUrlParam = searchParams.get('token')

  const isValidTokenParam = () => {
    return tokens.find((token) => token.name.toLowerCase() === tokenUrlParam.toLowerCase()) ? true : false
  }

  useEffect(() => {
    if (isWrappingMode(modeUrlParam?.toLowerCase())) {
      setWrappingMode(modeUrlParam.toLowerCase() as WrappingMode)
    }
  }, [])

  useEffect(() => {
    if (tokenUrlParam && isValidTokenParam()) {
      setSelectedToken(tokens.find((token) => token.name.toLowerCase() === tokenUrlParam.toLowerCase()))
    }
  }, [])

  useEffect(() => {
    var params = {}
    if (wrappingMode) {
      params = { ...params, mode: wrappingMode.toLowerCase() }
    }
    if (selectedToken) {
      params = { ...params, token: selectedToken.name.toLowerCase() }
    }
    setSearchParams(params)
  }, [wrappingMode, selectedToken])

  const infoMsg =
    wrappingMode === 'wrap'
      ? `Converting publicly visible ${selectedToken.name} into its privacy-preserving equivalent s${selectedToken.name}. These tokens are not publicly visible and require a viewing key!`
      : `Converting privacy-preserving s${selectedToken.name} into its publicly visible equivalent ${selectedToken.name}!`

  const [isUnknownBalanceModalOpen, setIsUnknownBalanceModalOpen] = useState(false)
  const [isFeeGrantInfoModalOpen, setIsFeeGrantInfoModalOpen] = useState(false)

  // UI
  const [isValidAmount, setisValidAmount] = useState<boolean>(false)
  const [validationMessage, setValidationMessage] = useState<string>('')
  const [isValidationActive, setIsValidationActive] = useState<boolean>(false)
  // function validateForm() {
  //   let isValid = false
  //   const availableAmount = new BigNumber(
  //     wrappingMode === 'wrap' ? nativeBalance : tokenBalance
  //   ).dividedBy(`1e${selectedToken.decimals}`)

  //   const numberRegex = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/

  //   function matchExact(r: any, str: any) {
  //     const match = str.match(r)
  //     return match && str === match[0]
  //   }

  //   if (
  //     new BigNumber(amountString).isGreaterThan(
  //       new BigNumber(availableAmount)
  //     ) &&
  //     !(tokenBalance === viewingKeyErrorString && wrappingMode === 'unwrap') &&
  //     amountString !== ''
  //   ) {
  //     setValidationMessage('Not enough balance')
  //     setisValidAmount(false)
  //   } else if (!matchExact(numberRegex, amountString) || amountString === '') {
  //     setValidationMessage('Please enter a valid amount')
  //     setisValidAmount(false)
  //   } else {
  //     setisValidAmount(true)
  //     isValid = true
  //   }
  //   return isValid
  // }

  // useEffect(() => {
  //   // setting amountToWrap to max. value, if entered value is > available
  //   const availableAmount =
  //     wrappingMode === 'wrap'
  //       ? new BigNumber(nativeBalance).dividedBy(`1e${selectedToken.decimals}`)
  //       : new BigNumber(tokenBalance).dividedBy(`1e${selectedToken.decimals}`)
  //   if (
  //     !new BigNumber(amountString).isNaN() &&
  //     availableAmount.isGreaterThan(new BigNumber(0)) &&
  //     new BigNumber(amountString).isGreaterThan(
  //       new BigNumber(availableAmount)
  //     ) &&
  //     !(tokenBalance === viewingKeyErrorString && wrappingMode === 'unwrap') &&
  //     amountString !== ''
  //   ) {
  //     setAmountString(availableAmount.toString())
  //   }

  //   if (isValidationActive) {
  //     validateForm()
  //   }
  // }, [amountString, wrappingMode, isValidationActive])

  // useEffect(() => {
  //   setAmountString('')
  // }, [selectedToken, wrappingMode])

  function handleInputChange(e: any) {
    const filteredValue = e.target.value.replace(/[^0-9.]+/g, '')
    setAmountString(filteredValue)
  }

  // function showModal() {
  //   setIsUnknownBalanceModalOpen(true)
  //   document.body.classList.add('overflow-hidden')
  // }

  // async function setBalance() {
  //   try {
  //     setNativeBalance(undefined)
  //     setTokenBalance(undefined)
  //     await updateCoinBalance()
  //     await updateTokenBalance()
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }

  // const updateTokenBalance = async () => {
  //   if (!selectedToken.address || !secretNetworkClient) {
  //     return
  //   }

  //   const key = await WalletService.getWalletViewingKey(selectedToken.address)
  //   if (!key) {
  //     setTokenBalance(viewingKeyErrorString)
  //     return
  //   }

  //   try {
  //     const result: {
  //       viewing_key_error: any
  //       balance: {
  //         amount: string
  //       }
  //     } = await secretNetworkClient.query.compute.queryContract({
  //       contract_address: selectedToken.address,
  //       code_hash: selectedToken.code_hash,
  //       query: {
  //         balance: { address: secretNetworkClient?.address, key }
  //       }
  //     })

  //     if (result.viewing_key_error) {
  //       setTokenBalance(viewingKeyErrorString)
  //       return
  //     }

  //     setTokenBalance(result.balance.amount)
  //   } catch (e) {
  //     console.error(`Error getting balance for s${selectedToken.name}`, e)

  //     setTokenBalance(viewingKeyErrorString)
  //   }
  // }

  // const updateCoinBalance = async () => {
  //   setNativeBalance(undefined)
  //   try {
  //     const {
  //       balance: { amount }
  //     } = await secretNetworkClient.query.bank.balance({
  //       address: secretNetworkClient?.address,
  //       denom: selectedToken.withdrawals[0]?.from_denom
  //     })
  //     setNativeBalance(amount)
  //   } catch (e) {
  //     console.error(`Error while trying to query ${selectedToken.name}:`, e)
  //   }
  // }

  // useEffect(() => {
  //   if (!secretNetworkClient?.address) return
  //   ;(async () => {
  //     setBalance()
  //   })()

  //   const interval = setInterval(setBalance, 10000)
  //   return () => {
  //     clearInterval(interval)
  //   }
  // }, [
  //   secretNetworkClient?.address,
  //   secretNetworkClient,
  //   selectedToken,
  //   feeGrantStatus
  // ])

  return (
    <>
      <Helmet>
        <title>{wrapPageTitle}</title>

        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="title" content={wrapPageTitle} />
        <meta name="application-name" content={wrapPageTitle} />
        <meta name="description" content={wrapPageDescription} />
        <meta name="robots" content="index,follow" />

        <meta property="og:title" content={wrapPageTitle} />
        <meta property="og:description" content={wrapPageDescription} />
        {/* <meta property="og:image" content="Image URL Here"/> */}

        <meta name="twitter:title" content={wrapPageTitle} />
        <meta name="twitter:description" content={wrapPageDescription} />
        {/* <meta name="twitter:image" content="Image URL Here"/> */}

        <script type="application/ld+json">{JSON.stringify(wrapJsonLdSchema)}</script>
      </Helmet>

      <FeeGrantInfoModal
        open={isFeeGrantInfoModalOpen}
        onClose={() => {
          setIsFeeGrantInfoModalOpen(false)
          document.body.classList.remove('overflow-hidden')
        }}
      />
      <UnknownBalanceModal
        open={isUnknownBalanceModalOpen}
        onClose={() => {
          setIsUnknownBalanceModalOpen(false)
          document.body.classList.remove('overflow-hidden')
        }}
      />

      {/* Content */}
      <div className="container w-full max-w-xl mx-auto px-4">
        {/* Title: Secret Wrap / Secret Unwrap */}
        <Title className="mb-6" title={`Secret ${wrappingMode === 'wrap' ? 'Wrap' : 'Unwrap'}`}>
          <Tooltip title={infoMsg} placement="right" arrow>
            <span className="ml-2 relative -top-1.5 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
              <FontAwesomeIcon icon={faInfoCircle} />
            </span>
          </Tooltip>
        </Title>
        {/* Content */}
        <div className="rounded-3xl px-6 py-6 text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800">
          <WrapForm />
        </div>
      </div>
    </>
  )
}

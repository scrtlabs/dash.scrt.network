import { faCircleCheck, faRightLeft, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Select from 'react-select'
import BigNumber from 'bignumber.js'
import { useFormik } from 'formik'
import React, { useEffect, useState } from 'react'
import FeeGrant from 'components/FeeGrant/FeeGrant'
import PercentagePicker from 'components/PercentagePicker'
import { WrappingMode } from 'types/WrappingMode'
import { Token, tokens } from 'utils/config'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { wrapSchema } from 'pages/wrap/wrapSchema'
import Tooltip from '@mui/material/Tooltip'
import { WrapService } from 'services/wrap.service'
import BalanceUI from 'components/BalanceUI'
import { FeeGrantStatus } from 'types/FeeGrantStatus'

function WrapForm() {
  const {
    secretNetworkClient,
    walletAddress,
    feeGrantStatus,
    requestFeeGrant,
    isConnected,
    connectWallet,
    scrtBalance
  } = useSecretNetworkClientStore()

  const handleClick = () => {
    if (!isConnected) {
      connectWallet()
    }
  }

  function toggleWrappingMode() {
    if (formik.values.wrappingMode === 'wrap') {
      formik.setFieldValue('wrappingMode', 'unwrap')
    } else {
      formik.setFieldValue('wrappingMode', 'wrap')
    }
  }

  const [nativeBalance, setNativeBalance] = useState<any>()
  const [tokenBalance, setTokenBalance] = useState<any>()

  const secretToken: Token = tokens.find((token) => token.name === 'SCRT')
  const [selectedToken, setSelectedToken] = useState<Token>(secretToken)
  const [selectedTokenPrice, setSelectedTokenPrice] = useState<number>(0)
  const [amountString, setAmountString] = useState<string>('0')

  // handles [25% | 50% | 75% | Max] Button-Group
  function setAmountByPercentage(percentage: number) {
    let maxValue = '0'
    if (formik.values.wrappingMode === 'wrap') {
      maxValue = nativeBalance
    } else {
      maxValue = tokenBalance
    }

    if (maxValue) {
      let availableAmount = new BigNumber(maxValue).dividedBy(`1e${selectedToken.decimals}`)
      let potentialInput = availableAmount.toNumber() * (percentage * 0.01)
      if (percentage === 100 && potentialInput > 0.05 && selectedToken.name === 'SCRT') {
        potentialInput = potentialInput - 0.05
      }
      if (Number(potentialInput) < 0) {
        setAmountString('')
      } else {
        setAmountString(potentialInput.toFixed(selectedToken.decimals))
      }
    }
  }

  // auto focus on connect
  useEffect(() => {
    if (isConnected) {
      document.getElementById('amount-top').focus()
    }
  }, [isConnected])

  const [isLoading, setIsWaiting] = useState<boolean>(false)
  const [generalSuccessMessage, setGeneralSuccessMessage] = useState<String>('')
  const [generalErrorMessage, setGeneralErrorMessage] = useState<String>('')

  interface IFormValues {
    amount: string
    token: Token
    wrappingMode: WrappingMode
    feeGrantStatus: FeeGrantStatus
  }

  const formik = useFormik<IFormValues>({
    initialValues: {
      amount: '',
      token: tokens.find((token: Token) => token.name === 'SCRT'),
      wrappingMode: 'wrap',
      feeGrantStatus: feeGrantStatus
    },
    validationSchema: wrapSchema,
    validateOnBlur: false,
    validateOnChange: true,
    onSubmit: async (values) => {
      try {
        setGeneralErrorMessage('')
        setGeneralSuccessMessage('')
        setIsWaiting(true)
        const res = await WrapService.performWrapping({
          ...values,
          secretNetworkClient
        })
        setIsWaiting(false)

        if (res.success) {
          setGeneralSuccessMessage(`${formik.values.wrappingMode === 'wrap' ? 'Wrapping' : 'Unwrapping'} Successful!`)
        } else {
          throw new Error()
        }
      } catch (error: any) {
        console.error(error)
        setGeneralErrorMessage(`${formik.values.wrappingMode === 'wrap' ? 'Wrapping' : 'Unwrapping'} unsuccessful!`)
      }
    }
  })

  // reset messages on form change
  useEffect(() => {
    setGeneralErrorMessage('')
    setGeneralSuccessMessage('')
  }, [formik.values])

  function handleTokenSelect(token: Token) {
    formik.setFieldValue('token', token)
    formik.setFieldValue('amount', '')
    formik.setFieldTouched('amount', false)
  }

  return (
    <div onClick={handleClick}>
      <form onSubmit={formik.handleSubmit} className="w-full flex flex-col gap-4">
        {/* *** From *** */}
        <div className="bg-neutral-200 dark:bg-neutral-700 p-4 rounded-xl">
          {/* Title Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-2 text-center sm:text-left">
            <span className="font-extrabold">From</span>
            {formik.touched.amount && formik.errors.amount ? (
              <span className="text-red-500 dark:text-red-500 text-xs font-normal">{formik.errors.amount}</span>
            ) : null}
          </div>

          {/* Input Field */}
          <div className="flex" id="fromInputWrapper">
            <Select
              isDisabled={!isConnected}
              name="tokenName"
              options={tokens.sort((a: Token, b: Token) => a.name.localeCompare(b.name))}
              value={formik.values.token}
              onChange={(token: Token) => handleTokenSelect(token)}
              onBlur={formik.handleBlur}
              isSearchable={false}
              formatOptionLabel={(token: Token) => (
                <div className="flex items-center">
                  <img
                    src={`/img/assets/${token.image}`}
                    alt={`${token.name} logo`}
                    className="w-6 h-6 mr-2 rounded-full"
                  />
                  <span className="font-semibold text-sm">
                    {formik.values.wrappingMode === 'unwrap' && 's'}
                    {token.name}
                  </span>
                </div>
              )}
              className="react-select-wrap-container"
              classNamePrefix="react-select-wrap"
            />
            <input
              id="amount-top"
              name="amount"
              type="text"
              value={formik.values.amount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={
                'dark:placeholder-neutral-600 text-right focus:z-10 block flex-1 min-w-0 w-full bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white px-4 rounded-r-lg disabled:placeholder-neutral-300 dark:disabled:placeholder-neutral-700 transition-colors font-medium focus:outline-0 focus-visible:ring-2 focus-visible:ring-sky-500/60' +
                (formik.touched.amount && formik.errors.amount ? '  border border-red-500 dark:border-red-500' : '')
              }
              placeholder="0"
              disabled={!isConnected}
            />
          </div>

          {/* Balance | [25%|50%|75%|Max] */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 mt-2">
            <div className="flex-1 text-xs">
              <span className="font-bold">{`Balance: `}</span>
              <BalanceUI
                token={tokens.find((token) => token.name.toLowerCase() === 'scrt')}
                isSecretToken={formik.values.wrappingMode === 'unwrap'}
              />
            </div>
            <div className="sm:flex-initial text-xs">
              <PercentagePicker setAmountByPercentage={setAmountByPercentage} disabled={!isConnected} />
            </div>
          </div>
        </div>

        {/* Wrapping Mode Switch */}
        <div className="text-center">
          <Tooltip
            disableHoverListener={!isConnected}
            title={`Switch to ${formik.values.wrappingMode === 'wrap' ? 'Unwrapping' : 'Wrapping'}`}
            placement="right"
            arrow
          >
            <>
              <button
                onClick={toggleWrappingMode}
                type="button"
                disabled={!isConnected}
                className={
                  'inline-block bg-neutral-200 dark:bg-neutral-700 px-3 py-2 text-cyan-500 dark:text-cyan-500 transition-colors rounded-xl disabled:text-neutral-500 dark:disabled:text-neutral-500 focus:outline-0 focus:ring-2 ring-sky-500/40' +
                  (isConnected ? ' hover:text-cyan-600 dark:hover:text-cyan-300' : '')
                }
              >
                <FontAwesomeIcon icon={faRightLeft} className="fa-rotate-90" />
              </button>
            </>
          </Tooltip>
        </div>

        <div className="bg-neutral-200 dark:bg-neutral-700 p-4 rounded-xl">
          <div className="mb-2 text-center sm:text-left">
            <span className="font-extrabold">To</span>
          </div>

          <div className="flex">
            <Select
              isDisabled={!isConnected}
              name="tokenName"
              options={tokens.sort((a, b) => a.name.localeCompare(b.name))}
              value={formik.values.token}
              onChange={(token: Token) => handleTokenSelect(token)}
              onBlur={formik.handleBlur}
              isSearchable={false}
              formatOptionLabel={(token) => (
                <div className="flex items-center">
                  <img
                    src={`/img/assets/${token.image}`}
                    alt={`${token.name} logo`}
                    className="w-6 h-6 mr-2 rounded-full"
                  />
                  <span className="font-semibold text-sm">
                    {formik.values.wrappingMode === 'wrap' && 's'}
                    {token.name}
                  </span>
                </div>
              )}
              className="react-select-wrap-container"
              classNamePrefix="react-select-wrap"
            />
            <input
              name="amount"
              type="text"
              value={formik.values.amount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={
                'dark:placeholder-neutral-600 text-right focus:z-10 block flex-1 min-w-0 w-full bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white px-4 rounded-r-lg disabled:placeholder-neutral-300 dark:disabled:placeholder-neutral-700 transition-colors font-medium focus:outline-0 focus-visible:ring-2 ring-sky-500/60'
              }
              placeholder="0"
              disabled={!isConnected}
            />
          </div>
          <div className="flex-1 text-xs mt-3 text-center sm:text-left h-[1rem]">
            <BalanceUI token={formik.values.token} isSecretToken={formik.values.wrappingMode === 'wrap'} />
          </div>
        </div>

        {/* Fee Grant */}
        <FeeGrant />

        {isLoading ? (
          <div className="text-sm font-normal flex items-center gap-2 justify-center">
            <svg
              className="animate-spin h-5 w-5 text-black dark:text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Processing...</span>
          </div>
        ) : null}

        {generalSuccessMessage && (
          <div className="text-emerald-500 dark:text-emerald-500 text-sm font-normal flex items-center gap-2 justify-center">
            <FontAwesomeIcon icon={faCircleCheck} />
            <span>{generalSuccessMessage}</span>
          </div>
        )}

        {generalErrorMessage && (
          <div className="text-red-500 dark:text-red-500 text-sm font-normal flex items-center gap-2 justify-center">
            <FontAwesomeIcon icon={faTriangleExclamation} />
            <span>{generalErrorMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          className={
            'enabled:bg-gradient-to-r enabled:from-cyan-600 enabled:to-purple-600 enabled:hover:from-cyan-500 enabled:hover:to-purple-500 transition-colors text-white font-extrabold py-3 w-full rounded-lg disabled:bg-neutral-500 focus:outline-none focus-visible:ring-4 ring-sky-500/40'
          }
          disabled={!isConnected}
          type="submit"
        >
          {`Execute ${formik.values.wrappingMode === 'wrap' ? 'Wrap' : 'Unwrap'}`}
        </button>

        {/* Debug Info */}
        {import.meta.env.VITE_DEBUG_MODE === 'true' ? (
          <div className="text-sky-500 text-xs p-2 bg-blue-500/20 rounded">
            <div className="mb-4 font-semibold">Debug Info (Dev Mode)</div>
            formik.errors: {JSON.stringify(formik.errors)}
          </div>
        ) : null}

        {/* amount={amountString}
              nativeCurrency={selectedToken.name}
              wrappedAmount={amountString}
              wrappedCurrency={'s' + selectedToken.name}
              wrappingMode={wrappingMode} */}
      </form>
    </div>
  )
}

export default WrapForm

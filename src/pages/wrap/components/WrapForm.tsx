import { faRightLeft, faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Select, { components } from 'react-select'
import BigNumber from 'bignumber.js'
import { useFormik } from 'formik'
import { useEffect } from 'react'
import FeeGrant from 'components/FeeGrant/FeeGrant'
import PercentagePicker from 'components/PercentagePicker'
import { WrappingMode, isWrappingMode } from 'types/WrappingMode'
import { Token, tokens } from 'utils/config'
import { GetBalanceError, useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { wrapSchema } from 'pages/wrap/wrapSchema'
import Tooltip from '@mui/material/Tooltip'
import { WrapService } from 'services/wrap.service'
import BalanceUI from 'components/BalanceUI'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'
import { Nullable } from 'types/Nullable'
import { useUserPreferencesStore } from 'store/UserPreferences'

export default function WrapForm() {
  const { debugMode } = useUserPreferencesStore()
  const { secretNetworkClient, feeGrantStatus, isConnected, scrtBalance, getBalance } = useSecretNetworkClientStore()

  const { theme } = useUserPreferencesStore()

  const formik = useFormik<IFormValues>({
    initialValues: {
      amount: '',
      token: tokens.find((token: Token) => token.name === 'SCRT'),
      wrappingMode: 'wrap'
    },
    validationSchema: wrapSchema,
    validateOnBlur: false,
    validateOnChange: true,
    onSubmit: async (values) => {
      try {
        const res = WrapService.performWrapping({
          ...values,
          secretNetworkClient,
          feeGrantStatus
        })
        toast.promise(res, {
          loading: `Waiting to ${formik.values.wrappingMode === 'wrap' ? 'wrap' : 'unwrap'} ${formik.values.amount} ${
            formik.values.token.name
          }...`,
          success: `${formik.values.wrappingMode === 'wrap' ? 'Wrapping' : 'Unwrapping'} successful!`,
          error: `${formik.values.wrappingMode === 'wrap' ? 'Wrapping' : 'Unwrapping'} unsuccessful!`
        })
      } catch (error: any) {
        console.error(error)
        toast.error(`${formik.values.wrappingMode === 'wrap' ? 'Wrapping' : 'Unwrapping'} unsuccessful!`)
      }
    }
  })

  function handleTokenSelect(token: Token) {
    formik.setFieldValue('token', token)
    formik.setFieldValue('amount', '')
    formik.setFieldTouched('amount', false)
  }

  // URL params
  const [searchParams, setSearchParams] = useSearchParams()
  const wrappingModeUrlParam = searchParams.get('mode')
  const tokenUrlParam = searchParams.get('token')

  useEffect(() => {
    // sets token by searchParam
    let foundToken: Nullable<Token> = null
    if (tokenUrlParam) {
      foundToken = tokens.find((token: Token) => token.name.toLowerCase() === tokenUrlParam)
    }
    if (foundToken) {
      formik.setFieldValue('token', foundToken)
    }

    // sets wrappingMode by searchParam
    if (wrappingModeUrlParam && isWrappingMode(wrappingModeUrlParam)) {
      formik.setFieldValue('wrappingMode', wrappingModeUrlParam)
      formik.setFieldTouched('wrappingMode')
    }
  }, [])

  useEffect(() => {
    var params = {}
    if (formik.values.wrappingMode) {
      params = { ...params, mode: formik.values.wrappingMode.toLowerCase() }
    }
    if (formik.values.token) {
      params = { ...params, token: formik.values.token.name.toLowerCase() }
    }
    setSearchParams(params)
  }, [formik.values.wrappingMode, formik.values.token])

  function toggleWrappingMode() {
    if (formik.values.wrappingMode === 'wrap') {
      formik.setFieldValue('wrappingMode', 'unwrap')
    } else {
      formik.setFieldValue('wrappingMode', 'wrap')
    }
  }

  const secretToken: Token = tokens.find((token) => token.name === 'SCRT')

  useEffect(() => {
    if (Number(scrtBalance) === 0 && scrtBalance !== null) {
      formik.setFieldValue('wrappingMode', 'unwrap')
      formik.setFieldValue('token', secretToken)
    }
  }, [scrtBalance])

  function setAmountByPercentage(percentage: number) {
    const balance = getBalance(formik.values.token, formik.values.wrappingMode === 'unwrap')
    if (
      (balance !== ('viewingKeyError' as GetBalanceError) || balance !== ('GenericFetchError' as GetBalanceError)) &&
      balance !== null
    ) {
      formik.setFieldValue(
        'amount',
        Number((balance as BigNumber).dividedBy(`1e${formik.values.token.decimals}`).times(percentage / 100)).toFixed(
          formik.values.token.decimals
        )
      )
    }
    formik.setFieldTouched('amount', true)
  }

  // auto focus on connect
  useEffect(() => {
    if (isConnected) {
      document.getElementById('amount-top').focus()
    }
  }, [isConnected])

  const customTokenFilterOption = (option: any, inputValue: string) => {
    const tokenName = option.data.name.toLowerCase()
    return (
      tokenName?.toLowerCase().includes(inputValue?.toLowerCase()) ||
      ('s' + tokenName)?.toLowerCase().includes(inputValue?.toLowerCase())
    )
  }

  const customTokenSelectStyle = {
    input: (styles: any) => ({
      ...styles,
      color: theme === 'light' ? 'black !important' : 'white !important',
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 600,
      fontSize: '14px'
    }),
    container: (container: any) => ({
      ...container,
      width: 'auto',
      minWidth: '30%'
    })
  }

  const CustomControl = ({ children, ...props }: any) => {
    const menuIsOpen = props.selectProps.menuIsOpen
    return (
      <components.Control {...props}>
        <div className="flex items-center justify-end w-full">
          {menuIsOpen && <FontAwesomeIcon icon={faSearch} className="w-5 h-5 ml-2" />}
          {children}
        </div>
      </components.Control>
    )
  }

  interface IFormValues {
    amount: string
    token: Token
    wrappingMode: WrappingMode
  }

  return (
    <div>
      <form onSubmit={formik.handleSubmit} className="w-full flex flex-col gap-4">
        {/* *** From *** */}
        <div className="bg-gray-200 dark:bg-neutral-700 p-4 rounded-xl">
          {/* Title Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-2 text-center sm:text-left">
            <span className="font-extrabold">From</span>
            {formik.touched.amount && formik.errors.amount && (
              <span className="text-red-500 dark:text-red-500 text-xs font-normal">{formik.errors.amount}</span>
            )}
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
              isSearchable={true}
              components={{ Control: CustomControl }}
              filterOption={customTokenFilterOption}
              styles={customTokenSelectStyle}
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
              type="number"
              value={formik.values.amount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={
                '[-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none dark:placeholder-neutral-600 text-right focus:z-10 block flex-1 min-w-0 w-full bg-white dark:bg-neutral-800 text-black dark:text-white px-4 rounded-r-lg disabled:placeholder-neutral-300 dark:disabled:placeholder-neutral-700 transition-colors font-medium focus:outline-0 focus-visible:ring-2 focus-visible:ring-sky-500/60' +
                (formik.touched.amount && formik.errors.amount ? '  border border-red-500 dark:border-red-500' : '')
              }
              placeholder="0"
              disabled={!isConnected}
            />
          </div>

          {/* Balance | [25%|50%|75%|Max] */}
          {(Number(scrtBalance) !== 0 && scrtBalance !== null) || formik.values.wrappingMode !== 'unwrap' ? (
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 mt-2">
              <div className="flex-1 text-xs">
                <BalanceUI token={formik.values.token} isSecretToken={formik.values.wrappingMode === 'unwrap'} />
              </div>
              <div className="sm:flex-initial text-xs">
                <PercentagePicker setAmountByPercentage={setAmountByPercentage} disabled={!isConnected} />
              </div>
            </div>
          ) : null}
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
                  'inline-block bg-gray-200 dark:bg-neutral-700 px-3 py-2 text-cyan-500 dark:text-cyan-500 transition-colors rounded-xl disabled:text-neutral-500 dark:disabled:text-neutral-500 focus:outline-0 focus:ring-2 ring-sky-500/40' +
                  (isConnected ? ' hover:text-cyan-600 dark:hover:text-cyan-300' : '')
                }
              >
                <FontAwesomeIcon icon={faRightLeft} className="fa-rotate-90" />
              </button>
            </>
          </Tooltip>
        </div>

        <div className="bg-gray-200 dark:bg-neutral-700 p-4 rounded-xl">
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
              isSearchable={true}
              components={{ Control: CustomControl }}
              filterOption={customTokenFilterOption}
              styles={customTokenSelectStyle}
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
              type="number"
              value={formik.values.amount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={
                '[-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none dark:placeholder-neutral-600 text-right focus:z-10 block flex-1 min-w-0 w-full bg-white dark:bg-neutral-800 text-black dark:text-white px-4 rounded-r-lg disabled:placeholder-neutral-300 dark:disabled:placeholder-neutral-700 transition-colors font-medium focus:outline-0 focus-visible:ring-2 ring-sky-500/60'
              }
              placeholder="0"
              disabled={!isConnected}
            />
          </div>
          {(Number(scrtBalance) !== 0 && scrtBalance !== null) || formik.values.wrappingMode !== 'wrap' ? (
            <div className="flex-1 text-xs mt-3 text-center sm:text-left h-[1rem]">
              <BalanceUI
                token={formik.values.token}
                isSecretToken={
                  Number(scrtBalance) !== 0 && scrtBalance !== null && formik.values.wrappingMode === 'wrap'
                }
              />
            </div>
          ) : null}
        </div>

        {/* Fee Grant */}
        <FeeGrant />

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
        {debugMode && (
          <div className="text-sky-500 text-xs p-2 bg-blue-500/20 rounded">
            <div className="mb-4 font-semibold">Debug Info (Dev Mode)</div>
            formik.errors: {JSON.stringify(formik.errors)}
          </div>
        )}
      </form>
    </div>
  )
}

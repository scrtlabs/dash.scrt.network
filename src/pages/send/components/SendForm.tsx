import { useFormik } from 'formik'
import { useEffect, useState } from 'react'
import { sendSchema } from 'pages/send/sendSchema'
import { GetBalanceError, useSecretNetworkClientStore } from 'store/secretNetworkClient'
import Select from 'react-select'
import { Token, chains } from 'utils/config'
import BalanceUI from 'components/BalanceUI'
import PercentagePicker from 'components/PercentagePicker'
import Tooltip from '@mui/material/Tooltip'
import { faCircleCheck, faInfoCircle, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { SendService } from 'services/send.service'
import FeeGrant from 'components/FeeGrant/FeeGrant'
import { allTokens } from 'utils/commons'
import { FeeGrantStatus } from 'types/FeeGrantStatus'
import BigNumber from 'bignumber.js'
import toast, { Toaster } from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'
import { Nullable } from 'types/Nullable'

export default function SendForm() {
  // URL params
  const [searchParams, setSearchParams] = useSearchParams()
  const tokenUrlParam = searchParams.get('token')
  const recipientUrlParam = searchParams.get('recipient')
  const memoUrlParam = searchParams.get('memo')

  const tokenSelectOptions = SendService.getSupportedTokens()

  useEffect(() => {
    // sets token by searchParam
    let foundToken: Nullable<Token> = null
    if (tokenUrlParam) {
      foundToken = tokenSelectOptions.find((token: Token) => token.name.toLowerCase() === tokenUrlParam)
    }
    if (foundToken) {
      formik.setFieldValue('token', foundToken)
    }

    // sets recipient by searchParam
    if (recipientUrlParam) {
      formik.setFieldValue('recipient', recipientUrlParam)
      formik.setFieldTouched('recipient')
    }

    // sets memo by SearchParam
    if (memoUrlParam) {
      formik.setFieldValue('memo', memoUrlParam)
      formik.setFieldTouched('memo')
    }
  }, [])

  const {
    secretNetworkClient,
    walletAddress,
    feeGrantStatus,
    requestFeeGrant,
    isConnected,
    connectWallet,
    getBalance
  } = useSecretNetworkClientStore()

  const [isLoading, setIsWaiting] = useState<boolean>(false)

  interface IFormValues {
    amount: string
    token: Token
    recipient: string
    memo: string
    feeGrantStatus: FeeGrantStatus
  }

  const formik = useFormik<IFormValues>({
    initialValues: {
      amount: '',
      token: tokenSelectOptions[1],
      recipient: '',
      memo: '',
      feeGrantStatus: feeGrantStatus
    },
    validationSchema: sendSchema,
    validateOnBlur: false,
    validateOnChange: true,
    onSubmit: async (values) => {
      try {
        const res = SendService.performSending({
          ...values,
          secretNetworkClient
        })
        toast.promise(res, {
          loading: `Waiting to send ${formik.values.amount} ${formik.values.token.name}...`,
          success: 'Sending successful!',
          error: 'Sending unsuccessful!'
        })
      } catch (error: any) {
        console.error(error)
        toast.error(`Sending unsuccessful!`)
      }
    }
  })

  // handles [25% | 50% | 75% | Max] Button-Group
  function setAmountByPercentage(percentage: number) {
    const balance = getBalance(
      allTokens.find((token: Token) => token.name === formik.values.token.name),
      formik.values.token.address !== 'native'
    )
    if (
      (balance !== ('viewingKeyError' as GetBalanceError) || balance !== ('GenericFetchError' as GetBalanceError)) &&
      balance !== null
    ) {
      formik.setFieldValue(
        'amount',
        (balance as BigNumber)
          .dividedBy(`1e${formik.values.token.decimals}`)
          .times(percentage / 100)
          .toFormat()
      )
    }
    formik.setFieldTouched('amount', true)
  }

  function handleTokenSelect(token: Token) {
    formik.setFieldValue('token', token)
    formik.setFieldTouched('token', true)
    formik.setFieldValue('amount', '')
    formik.setFieldTouched('amount', false)
  }

  function TokenSelectFormatOptionLabel({ token }: { token: Token }) {
    return (
      <div className="flex items-center">
        <img src={`/img/assets/${token.image}`} alt={`${token.name} logo`} className="w-6 h-6 mr-2 rounded-full" />
        <span className="font-semibold text-sm">
          {token.address === 'native' || token.is_snip20 ? null : 's'}
          {token.name}
        </span>
      </div>
    )
  }

  return (
    <form onSubmit={formik.handleSubmit} className="w-full flex flex-col gap-4">
      {/* Amount */}
      <div className="bg-gray-200 dark:bg-neutral-700 p-4 rounded-xl">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-2 text-center sm:text-left">
          <span className="font-extrabold">Amount</span>
          {/* Validation Error Message */}
          {formik.touched.amount && formik.errors.amount ? (
            <span className="text-red-500 dark:text-red-500 text-xs font-normal">{formik.errors.amount}</span>
          ) : null}
        </div>
        {/* Input Fields */}
        <div className="flex">
          {/* Token */}
          <Select
            isDisabled={!isConnected}
            name="tokenName"
            options={tokenSelectOptions}
            value={formik.values.token}
            onChange={(token: Token) => handleTokenSelect(token)}
            onBlur={formik.handleBlur}
            isSearchable={false}
            formatOptionLabel={(token: Token) => <TokenSelectFormatOptionLabel token={token} />}
            className="react-select-wrap-container"
            classNamePrefix="react-select-wrap"
          />
          {/* Amount */}
          <input
            id="amount"
            name="amount"
            type="text"
            value={formik.values.amount}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={
              'dark:placeholder-neutral-600 text-right focus:z-10 block flex-1 min-w-0 w-full bg-white dark:bg-neutral-800 text-black dark:text-white px-4 rounded-r-lg disabled:placeholder-neutral-300 dark:disabled:placeholder-neutral-700 transition-colors font-medium focus:outline-0 focus:ring-2 ring-sky-500/40' +
              (formik.touched.amount && formik.errors.amount ? '  border border-red-500 dark:border-red-500' : '')
            }
            placeholder="0"
            disabled={!isConnected}
          />
        </div>

        {/* Balance | [25%|50%|75%|100%] */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 mt-2">
          <div className="flex-1 text-xs">
            <BalanceUI
              token={allTokens.find((token: Token) => token.name === formik.values.token.name)}
              chain={chains['Secret Network']}
              isSecretToken={formik.values.token.address !== 'native'}
            />
          </div>
          <div className="sm:flex-initial text-xs">
            <PercentagePicker setAmountByPercentage={setAmountByPercentage} disabled={!isConnected} />
          </div>
        </div>
      </div>

      {/* *** Recipient *** */}
      <div className="bg-gray-200 dark:bg-neutral-700 p-4 rounded-xl">
        {/* Title Bar */}
        <div className="flex justify-between items-center mb-2">
          <span className="flex-1 font-semibold mb-2 text-center sm:text-left">
            Recipient
            <Tooltip title={`The wallet address you want to transfer your assets to.`} placement="right" arrow>
              <span className="ml-2 mt-1 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
                <FontAwesomeIcon icon={faInfoCircle} />
              </span>
            </Tooltip>
          </span>

          {/* Validation Error Message */}
          {formik.touched.recipient && formik.errors.recipient ? (
            <span className="text-red-500 dark:text-red-500 text-xs font-normal">{formik.errors.recipient}</span>
          ) : null}
        </div>

        {/* Input Field */}
        <div className="flex">
          <input
            id="recipient"
            name="recipient"
            value={formik.values.recipient}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            type="text"
            className={
              'dark:placeholder-neutral-600 py-2 text-left focus:z-10 block flex-1 min-w-0 w-full bg-white dark:bg-neutral-800 text-black dark:text-white px-4 rounded-md disabled:placeholder-neutral-300 dark:disabled:placeholder-neutral-700 transition-colors font-medium focus:outline-0 focus:ring-2 ring-sky-500/40' +
              (formik.touched.recipient && formik.errors.recipient
                ? ' ring-1 ring-red-500 dark:ring-red-500 text-red-500 dark:text-red-500'
                : '')
            }
            placeholder="secret1..."
            disabled={!isConnected}
          />
        </div>
      </div>

      {/* *** Memo *** */}
      <div className="bg-gray-200 dark:bg-neutral-700 p-4 rounded-xl">
        {/* Title Bar */}
        <div className="flex justify-between items-center mb-2">
          <span className="flex-1 font-semibold mb-2 text-center sm:text-left">
            Memo (optional)
            <Tooltip title={`Add a message to your transaction. Beware: Messages are public!`} placement="right" arrow>
              <span className="ml-2 mt-1 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
                <FontAwesomeIcon icon={faInfoCircle} />
              </span>
            </Tooltip>
          </span>

          {/* Validation Error Message */}
          {formik.touched.memo && formik.errors.memo ? (
            <span className="text-red-500 dark:text-red-500 text-xs font-normal">{formik.errors.memo}</span>
          ) : null}
        </div>

        {/* Input Field */}
        <div className="flex">
          <input
            id="memo"
            name="memo"
            value={formik.values.memo}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            type="text"
            className={
              'dark:placeholder-neutral-600 py-2 text-left focus:z-10 block flex-1 min-w-0 w-full bg-white dark:bg-neutral-800 text-black dark:text-white px-4 rounded-md disabled:placeholder-neutral-300 dark:disabled:placeholder-neutral-700 transition-colors font-medium focus:outline-0 focus:ring-2 ring-sky-500/40' +
              (formik.touched.memo && formik.errors.memo ? '  border border-red-500 dark:border-red-500' : '')
            }
            disabled={!isConnected}
          />
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

      {/* Submit Button */}
      <button
        className={
          'enabled:bg-gradient-to-r enabled:from-cyan-600 enabled:to-purple-600 enabled:hover:from-cyan-500 enabled:hover:to-purple-500 transition-colors text-white font-extrabold py-3 w-full rounded-lg disabled:bg-neutral-500 focus:outline-none focus-visible:ring-4 ring-sky-500/40'
        }
        disabled={!isConnected}
        type="submit"
      >
        {`Send`}
      </button>

      {/* Debug Info */}
      {import.meta.env.VITE_DEBUG_MODE === 'true' ? (
        <div className="text-sky-500 text-xs p-2 bg-blue-500/20 rounded">
          <div className="mb-4 font-semibold">Debug Info (Dev Mode)</div>
          formik.errors: {JSON.stringify(formik.errors)}
        </div>
      ) : null}
    </form>
  )
}

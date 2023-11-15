import React, { useState } from 'react'
import { faCheckCircle, faXmarkCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Button from 'components/UI/Button/Button'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { sleep } from 'utils/commons'
import toast from 'react-hot-toast'

export default function ActionableStatus() {
  const { feeGrantStatus, requestFeeGrant, isConnected } = useSecretNetworkClientStore()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function handleRequestFeeGrant() {
    setIsLoading(true)
    const res = requestFeeGrant()
    toast.promise(res, {
      loading: `Requesting Fee Grant`,
      success: `Request for Fee Grant successful!`,
      error: `Request for Fee Grant failed!`
    })
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="text-sm">
        <svg
          className="inline-block animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
        <span>Requesting...</span>
      </div>
    )
  }

  // Untouched
  if (feeGrantStatus === 'untouched') {
    return (
      <Button
        type="button"
        color="secondary"
        onClick={handleRequestFeeGrant}
        className="font-semibold text-xs bg-neutral-100 dark:bg-neutral-900 px-1.5 py-1 rounded-md transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-100 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40"
        disabled={!isConnected}
      >
        Request Fee Grant
      </Button>
    )
  }

  // Success
  if (feeGrantStatus === 'success') {
    return (
      <div className="font-semibold text-sm flex items-center h-[1.6rem]">
        <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500 mr-1.5" />
        Fee Granted
      </div>
    )
  }

  // Fail
  if (feeGrantStatus === 'fail') {
    return (
      <div className="font-semibold text-sm h-[1.6rem]">
        <FontAwesomeIcon icon={faXmarkCircle} className="text-red-500 mr-1.5" />
        Request failed
      </div>
    )
  }
}

import { faKey } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { usdString } from 'shared/utils/commons'
import { Token } from 'shared/utils/config'

interface IProps {
  token: Token
  secureSecret?: boolean
}

function NewBalanceUI({ secureSecret = false, ...props }: IProps) {
  const setViewingKey = () => {
    // TODO: Do something with props.token;
  }

  const balanceString = '0.000134'
  const usdPriceString = '$5.50'
  const tokenName = (secureSecret ? 's' : '') + props.token.name

  return (
    <>
      <div className="flex items-center gap-1.5">
        <span className="font-bold">Balance: </span>
        <span className="font-medium">
          {`${balanceString} ${tokenName} (${usdPriceString})`}
        </span>
        {!balanceString || !usdPriceString ? (
          <span className="animate-pulse bg-neutral-300/40 dark:bg-neutral-700/40 rounded w-20 h-5 ml-2"></span>
        ) : null}

        {/* <button
          onClick={setViewingKey}
          className="text-left flex items-center font-semibold bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-md border-neutral-300 dark:border-neutral-700 transition hover:bg-neutral-300 dark:hover:bg-neutral-700 focus:bg-neutral-500 dark:focus:bg-neutral-500 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-100 dark:disabled:hover:bg-neutral-900 disabled:cursor-default"
        >
          <FontAwesomeIcon icon={faKey} className="mr-2" />
          <span className="text-left">Set Viewing Key</span>
        </button> */}
      </div>
    </>
  )
}

export default NewBalanceUI

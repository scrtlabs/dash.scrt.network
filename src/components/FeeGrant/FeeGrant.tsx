import { faInfoCircle, faCheckCircle, faXmarkCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tooltip from '@mui/material/Tooltip'
import ActionableStatus from './components/ActionableStatus'
import { useEffect } from 'react'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'

export default function FeeGrant() {
  const { feeGrantStatus } = useSecretNetworkClientStore()

  // useEffect(() => {
  //   if (feeGrantStatus === "")
  // }, [feeGrantStatus])

  return (
    <>
      <div className="bg-gray-200 dark:bg-neutral-700 p-4 rounded-xl select-none flex items-center">
        <div className="flex-1 flex items-center">
          <span className="font-semibold text-sm">Fee Grant</span>
          <div className="flex items-center ml-2">
            <Tooltip
              title={`Request Fee Grant so that you don't have to pay gas fees (up to 0.1 SCRT)`}
              placement="right"
              arrow
            >
              <span className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
                <FontAwesomeIcon icon={faInfoCircle} />
              </span>
            </Tooltip>
          </div>
        </div>
        <div className="flex-initial">
          <ActionableStatus />
        </div>
      </div>
    </>
  )
}

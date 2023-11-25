import Tooltip from '@mui/material/Tooltip'
import React from 'react'
import { ApiStatus } from 'types/ApiStatus'

type Props = {
  apiStatus?: ApiStatus
}

function ApiStatusIcon({ apiStatus = 'loading', ...props }: Props) {
  const colorClass: Record<ApiStatus, string> = {
    online: 'bg-emerald-500',
    offline: 'bg-rose-500',
    loading: '',
    unknown: 'bg-neutral-500'
  }

  const tooltipText: Record<ApiStatus, string> = {
    online: 'Online',
    offline: 'Offline',
    loading: 'Loading',
    unknown: 'Unknown'
  }

  return (
    <>
      <Tooltip title={tooltipText[apiStatus]} placement="bottom" arrow>
        <span>
          {apiStatus === 'loading' ? (
            <span>
              <svg
                className="animate-spin h-5 w-5 text-white"
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
            </span>
          ) : (
            <span className={`flex w-3 h-3 rounded-full ${colorClass[apiStatus]}`}></span>
          )}
        </span>
      </Tooltip>
    </>
  )
}

export default ApiStatusIcon

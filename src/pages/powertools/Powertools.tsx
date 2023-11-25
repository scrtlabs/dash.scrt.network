import React, { useState } from 'react'
import Header from 'components/Header'
import { ApiStatus } from 'types/ApiStatus'
import ApiStatusIcon from './components/ApiStatusIcon'
import Message from './components/Message'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import Tooltip from '@mui/material/Tooltip'
import Button from 'components/UI/Button/Button'

function Powertools() {
  const [apiUrl, setApiUrl] = useState<string>('https://lcd.secret.express')
  const [apiStatus, setApiStatus] = useState<ApiStatus>('online')

  function handleAddMessage() {
    alert('Add Message: WIP')
  }

  function handleSendTx() {
    alert('Send Tx: WIP')
  }

  return (
    <div className="container mx-auto px-4">
      <Header title={'Power Tools'} description="Send complex transactions." />
      <div className="flex items-center gap-4">
        <input
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          type="text"
          className="block w-full sm:w-72 p-2.5 px-4 text-sm rounded-lg text-neutral-800 dark:text-white bg-white dark:bg-neutral-800 placeholder-neutral-600 dark:placeholder-neutral-400 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-500"
          placeholder="API URL"
        />
        <ApiStatusIcon apiStatus={apiStatus} />
        <div className="flex items-center gap-4">
          <div>Chain: secret-4</div>
          <div>Block: 11,696,061</div>
          <div>Gas price: 0.1uscrt</div>
        </div>
      </div>

      <div className="inline-flex items-center justify-center w-full mt-8">
        <hr className="w-full h-px my-8 bg-gray-200 border-0 dark:bg-neutral-700" />
        <span className="inline-flex items-center gap-2 select-none absolute px-3 text-black -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-neutral-900 text-sm font-bold">
          {/* Draggable to change order */}
          {/* <Tooltip title={`Drag'n'Drop to change Order`} arrow enterDelay={500}>
            <button
              type="button"
              className="text-neutral-500 dark:text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
            >
              <FontAwesomeIcon icon={faGripVertical} />
            </button>
          </Tooltip> */}
          <span>Message #1</span>
          <Tooltip title="Delete Message">
            <button
              type="button"
              className="text-neutral-500 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-500 transition-colors"
            >
              <FontAwesomeIcon icon={faTrash} className="" />
            </button>
          </Tooltip>
        </span>
      </div>
      <Message />
      <div className="inline-flex justify-center w-full mb-8">
        <Button type="button" color="secondary" onClick={handleAddMessage}>
          Add Message
        </Button>
      </div>
      <Button className="w-full" size="large" onClick={handleSendTx}>
        Send Tx
      </Button>
    </div>
  )
}

export default Powertools

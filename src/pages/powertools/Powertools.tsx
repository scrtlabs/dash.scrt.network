import React, { useState } from 'react'
import Header from 'components/Header'
import { ApiStatus } from 'types/ApiStatus'
import ApiStatusIcon from './components/ApiStatusIcon'
import Message from './components/Message'
import Button from 'components/UI/Button/Button'

function Powertools() {
  const [apiUrl, setApiUrl] = useState<string>('https://lcd.secret.express')
  const [apiStatus, setApiStatus] = useState<ApiStatus>('online')

  function handleSendTx() {
    alert('Send Tx: WIP')
  }

  const [messages, setMessages] = useState<any[]>([''])

  function deleteMessage(i: number) {
    if (messages.length > 1) {
      setMessages((prevMessages) => prevMessages.filter((_, index) => index !== i))
    }
  }

  function handleAddMessage() {
    setMessages((prevMessages) => [...prevMessages, ''])
  }

  return (
    <div className="container max-w-6xl mx-auto px-4">
      <Header title={'Power Tools'} description="Send complex transactions." />
      <div className="flex items-center gap-4">
        <input
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          type="text"
          className="block w-full sm:w-72 p-2.5 text-sm rounded-lg text-neutral-800 dark:text-white bg-white dark:bg-neutral-800 placeholder-neutral-600 dark:placeholder-neutral-400 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-500"
          placeholder="API URL"
        />
        <ApiStatusIcon apiStatus={apiStatus} />
        <div className="flex items-center gap-4">
          <div>Chain: secret-4</div>
          <div>Block: 11,696,061</div>
          <div>Gas price: 0.1uscrt</div>
        </div>
      </div>

      {messages.map((item: any, i: number) => {
        return <Message message={item} number={i + 1} onDelete={() => deleteMessage(i)} />
      })}

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

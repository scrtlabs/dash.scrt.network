import React, { useEffect, useState } from 'react'
import Header from 'components/Header'
import { ApiStatus } from 'types/ApiStatus'
import ApiStatusIcon from './components/ApiStatusIcon'
import Message from './components/Message'
import Button from 'components/UI/Button/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { BroadcastMode, SecretNetworkClient } from 'secretjs'
import { MessageDefinitions, balanceFormat } from './components/Messages'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { Nullable } from 'types/Nullable'
import { WalletService } from 'services/wallet.service'
import { SECRET_LCD } from 'utils/config'
import { useSearchParams } from 'react-router-dom'
import { NotificationService } from 'services/notification.service'
import Modal from 'components/UI/Modal/Modal'
import CopyToClipboard from 'react-copy-to-clipboard'

export type TMessage = {
  type: string
  content: string
}

function Powertools() {
  const [secretjs, setSecretjs] = useState<Nullable<SecretNetworkClient>>(null)
  const [apiUrl, setApiUrl] = useState<string>(SECRET_LCD)
  const [apiStatus, setApiStatus] = useState<ApiStatus>('loading')
  const [denom, setDenom] = useState<string>('uscrt')
  const [chainId, setChainId] = useState<string>('')
  const [blockHeight, setBlockHeight] = useState<string>('')
  const [gasPrice, setGasPrice] = useState<string>('')
  const [prefix, setPrefix] = useState<string>('secret')

  const [searchParams, setSearchParams] = useSearchParams()
  const initialMessages = parseSearchParams(searchParams)

  function parseSearchParams(params: any) {
    const messagesParam = params.get('messages')
    if (!messagesParam) {
      return [{ type: '', content: '' }]
    }
    try {
      return JSON.parse(decodeURIComponent(messagesParam))
    } catch (e) {
      console.error('Error parsing messages from URL:', e)
      return [{ type: '', content: '' }]
    }
  }

  const [messages, setMessages] = useState<Nullable<TMessage>[]>(initialMessages)

  async function handleSendTx() {
    const toastId = NotificationService.notify('Sending transaction...', 'loading')
    try {
      const hasEmptyTypeAndContent = messages.some(
        (message) => message && message.type === '' && message.content === ''
      )
      if (hasEmptyTypeAndContent) {
        throw Error('Messages must not be empty!')
      }
      const txMessages = messages.map((message) => {
        return MessageDefinitions[message.type].converter(JSON.parse(message.content), prefix, denom)
      })
      const tx = await secretjs.tx.broadcast(txMessages, {
        gasLimit: 300_000,
        broadcastCheckIntervalMs: 10000,
        gasPriceInFeeDenom: 0.1,
        feeDenom: 'uscrt',
        broadcastMode: BroadcastMode.Sync
      })

      if (tx.code === 0) {
        NotificationService.notify('Transaction sent successfully!', 'success', toastId)
      } else {
        NotificationService.notify(`Transaction failed to send with error: ${tx.rawLog}`, 'error', toastId)
      }
    } catch (error: any) {
      NotificationService.notify(`An error occurred: ${error.message}`, 'error', toastId)
    } finally {
    }
  }

  const updateMessageType = (index: number, newType: string) => {
    setMessages((currentMessages) =>
      currentMessages.map((message, i) => (i === index ? { ...message, type: newType } : message))
    )
  }

  const updateMessageContent = (index: number, newContent: string) => {
    setMessages((currentMessages) =>
      currentMessages.map((message, i) => (i === index ? { ...message, content: newContent } : message))
    )
  }

  // Serialize and update the URL when messages state changes
  useEffect(() => {
    const serializedMessages = encodeURIComponent(JSON.stringify(messages))
    setSearchParams({ messages: serializedMessages })
  }, [messages, setSearchParams])

  function deleteMessage(index: number): void {
    if (messages.length > 1 && index >= 0 && index < messages.length) {
      // Create a new array without the message at the specified index
      const updatedMessages = [...messages.slice(0, index), ...messages.slice(index + 1)]

      // Update the state with the new array
      setMessages(updatedMessages)
    } else {
      setMessages([{ type: '', content: '' }])
    }
  }
  function handleAddMessage() {
    const emptyMessage: TMessage = { type: '', content: '' }
    setMessages((prevMessages) => [...prevMessages, emptyMessage])
  }

  const { walletAPIType } = useSecretNetworkClientStore()

  const refreshNodeStatus = async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setApiStatus('loading')
      }

      const secretjsquery = new SecretNetworkClient({
        url: apiUrl,
        chainId: ''
      })
      const { block } = await secretjsquery.query.tendermint.getLatestBlock({})
      let minimum_gas_price: string | undefined
      try {
        ;({ minimum_gas_price } = await secretjsquery.query.node.config({}))
      } catch (error) {
        // Bug on must chains - this endpoint isn't connected
      }
      const { params } = await secretjsquery.query.staking.params({})

      setDenom(params!.bond_denom!)

      const newChainId = block?.header?.chain_id!

      if (newChainId != 'secret-4' && newChainId != 'pulsar-3') {
        throw Error('Chain-ID must be secret-4 or pulsar-3. You cannot use a different chain than Secret Network.')
      }

      const newBlockHeight = balanceFormat(Number(block?.header?.height))

      let newGasPrice: string | undefined
      if (minimum_gas_price) {
        newGasPrice = minimum_gas_price.replace(/0*([a-z]+)$/, '$1')
      }

      const { walletAddress, secretjs: importedSecretjs } = await WalletService.connectWallet(
        walletAPIType,
        apiUrl,
        newChainId
      )
      setPrefix(importedSecretjs.address.replace(/^([a-z]+)1.*$/, '$1'))
      setSecretjs(importedSecretjs)
      setChainId(newChainId)
      setApiStatus('online')
      setBlockHeight(newBlockHeight)
      setGasPrice(newGasPrice)
    } catch (error) {
      let errorMessage: string
      if (error instanceof Error) {
        errorMessage = error.message
      } else {
        errorMessage = JSON.stringify(error)
      }

      setApiStatus('offline')
      setChainId('')
      setBlockHeight('')
      setGasPrice('')
    }
  }

  useEffect(() => {
    refreshNodeStatus(true)
  }, [apiUrl])

  const [isViewMessageModalOpen, setIsViewMessageModalOpen] = useState<boolean>(false)

  return (
    <>
      <Modal
        title={'Power Tools – Full Message'}
        isOpen={isViewMessageModalOpen}
        onClose={() => {
          setIsViewMessageModalOpen(false)
          document.body.classList.remove('overflow-hidden')
        }}
      >
        <div className="my-4 dark:bg-neutral-800 bg-neutral-200 p-2 rounded text-sm text-black dark:text-white">
          {JSON.stringify(messages)}
        </div>
        <div className="flex gap-4 items-center justify-end">
          <CopyToClipboard
            text={JSON.stringify(messages)}
            onCopy={() => {
              NotificationService.notify('Message copied to clipboard!', 'success')
            }}
          >
            <Button type="button">Copy to Clipboard</Button>
          </CopyToClipboard>
          <Button
            type="button"
            color="secondary"
            onClick={() => {
              setIsViewMessageModalOpen(false)
              document.body.classList.remove('overflow-hidden')
            }}
          >
            Close
          </Button>
        </div>
      </Modal>
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
          {apiStatus !== 'loading' && apiStatus !== 'offline' ? (
            <div className="flex items-center gap-4">
              <div>Chain-ID: {chainId}</div>
              <div>Block Height: {blockHeight}</div>
              <div>Gas Price: {gasPrice}</div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 my-4">
          {messages.map((item: any, i: number) => {
            return (
              <Message
                key={i}
                type={messages[i].type}
                content={messages[i].content}
                updateType={(type: string) => updateMessageType(i, type)}
                updateContent={(content: string) => updateMessageContent(i, content)}
                number={i + 1}
                secretjs={secretjs}
                prefix={prefix}
                denom={denom}
                onDelete={() => deleteMessage(i)}
              />
            )
          })}
        </div>

        <div className="inline-flex justify-center w-full mb-8">
          <Button type="button" color="secondary" onClick={handleAddMessage}>
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add Message
          </Button>
        </div>

        <div className="flex">
          <Button
            type="button"
            className="mb-4 mx-auto"
            color="secondary"
            onClick={() => setIsViewMessageModalOpen(true)}
          >
            View full message
          </Button>
        </div>

        <Button
          type="submit"
          className={
            'enabled:bg-gradient-to-r enabled:from-cyan-600 enabled:to-purple-600 enabled:hover:from-cyan-500 enabled:hover:to-purple-500 transition-colors text-white font-extrabold py-3 w-full rounded-lg disabled:bg-neutral-500 focus:outline-none focus-visible:ring-4 ring-sky-500/40'
          }
          size="large"
          onClick={handleSendTx}
        >
          Send Tx
        </Button>
      </div>
    </>
  )
}

export default Powertools

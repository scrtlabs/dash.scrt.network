import React, { useEffect, useState } from 'react'
import Header from 'components/Header'
import { ApiStatus } from 'types/ApiStatus'
import ApiStatusIcon from './components/ApiStatusIcon'
import Message from './components/Message'
import Button from 'components/UI/Button/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { SecretNetworkClient } from 'secretjs'
import { balanceFormat } from './components/imported/Messages'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { reconnectWallet } from './components/imported/WalletStuff'
import { Nullable } from 'types/Nullable'

function Powertools() {
  const [secretjs, setSecretjs] = useState<Nullable<SecretNetworkClient>>(null)
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [apiUrl, setApiUrl] = useState<string>('https://lcd.mainnet.secretsaturn.net')
  const [apiStatus, setApiStatus] = useState<ApiStatus>('loading')
  const [denom, setDenom] = useState<string>('uscrt')
  const [chainId, setChainId] = useState<string>('')
  const [blockHeight, setBlockHeight] = useState<string>('')
  const [gasPrice, setGasPrice] = useState<string>('')

  function handleSendTx() {
    alert('Send Tx: WIP')
  }

  const [messages, setMessages] = useState<any[]>([''])

  const { secretNetworkClient } = useSecretNetworkClientStore()

  function deleteMessage(i: number) {
    if (messages.length > 1) {
      setMessages((prevMessages) => prevMessages.filter((_, index) => index !== i))
    }
  }

  function handleAddMessage() {
    setMessages((prevMessages) => [...prevMessages, ''])
  }

  const refreshNodeStatus = async (querySecretjs: SecretNetworkClient, showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setApiStatus('loading')
      }

      const { block } = await querySecretjs.query.tendermint.getLatestBlock({})
      let minimum_gas_price: string | undefined
      try {
        ;({ minimum_gas_price } = await querySecretjs.query.node.config({}))
      } catch (error) {
        // Bug on must chains - this endpoint isn't connected
      }
      const { params } = await querySecretjs.query.staking.params({})

      setDenom(params!.bond_denom!)

      const newChainId = block?.header?.chain_id!
      const newBlockHeight = balanceFormat(Number(block?.header?.height))

      let newGasPrice: string | undefined
      if (minimum_gas_price) {
        newGasPrice = minimum_gas_price.replace(/0*([a-z]+)$/, '$1')
      }

      const blockTimeAgo = Math.floor((Date.now() - Date.parse(block?.header?.time as string)) / 1000)
      let blockTimeAgoString = `${blockTimeAgo}s ago`
      if (blockTimeAgo <= 0) {
        blockTimeAgoString = 'now'
      }

      setChainId(newChainId)
      setApiStatus('online') // TODO: why always runs here??
      setBlockHeight(newBlockHeight)
      setGasPrice(newGasPrice)

      if (secretjs) {
        reconnectWallet(setSecretjs, setWalletAddress, apiUrl, newChainId)
      }
    } catch (error) {
      let errorMessage: string
      if (error instanceof Error) {
        errorMessage = error.message
      } else {
        errorMessage = JSON.stringify(error)
      }

      setApiStatus('offline')
      setChainId('')
      setApiStatus('online')
      setBlockHeight('')
      setGasPrice('')
      // setChainStatus(
      //   <div style={{ display: 'flex', placeItems: 'center', gap: '0.5rem' }}>
      //     <ErrorIcon />
      //     <span>Error: {errorMessage}</span>
      //   </div>
      // )
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setApiUrl((apiUrl) => {
        const secretjs = new SecretNetworkClient({
          url: apiUrl,
          chainId: ''
        })

        refreshNodeStatus(secretjs, false)

        return apiUrl
      })
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const secretjs = new SecretNetworkClient({
      url: apiUrl,
      chainId: ''
    })

    refreshNodeStatus(secretjs, true)
  }, [apiUrl])

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
        {apiStatus !== 'loading' ? (
          <div className="flex items-center gap-4">
            <div>Chain: {chainId}</div>
            <div>Block Height: {blockHeight}</div>
            <div>Gas Price: {gasPrice}</div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 my-4">
        {messages.map((item: any, i: number) => {
          return <Message key={i} message={item} number={i + 1} onDelete={() => deleteMessage(i)} />
        })}
      </div>

      <div className="inline-flex justify-center w-full mb-8">
        <Button type="button" color="secondary" onClick={handleAddMessage}>
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
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

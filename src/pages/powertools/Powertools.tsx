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
import { Nullable } from 'types/Nullable'
import { WalletService } from 'services/wallet.service'
import { isWalletAPIType } from 'types/WalletAPIType'
import { SECRET_LCD } from 'utils/config'

function Powertools() {
  const [secretjs, setSecretjs] = useState<Nullable<SecretNetworkClient>>(null)
  const [apiStatus, setApiStatus] = useState<ApiStatus>('loading')
  const [denom, setDenom] = useState<string>('uscrt')
  const [chainId, setChainId] = useState<string>('')
  const [blockHeight, setBlockHeight] = useState<string>('')
  const [gasPrice, setGasPrice] = useState<string>('')

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

  const {
    isConnected,
    walletAddress,
    connectWallet,
    disconnectWallet,
    isGetWalletModalOpen,
    setIsGetWalletModalOpen,
    isConnectWalletModalOpen,
    setIsConnectWalletModalOpen,
    walletAPIType
  } = useSecretNetworkClientStore()

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

      const blockTimeAgo = Math.floor((Date.now() - Date.parse(block?.header?.time as string)) / 1000)
      const blockTimeAgoString = blockTimeAgo <= 0 ? 'now' : `${blockTimeAgo}s ago`

      const { walletAddress, secretjs } = await WalletService.connectWallet(walletAPIType, apiUrl, newChainId)
      setSecretjs(secretjs)

      setChainId(newChainId)
      setApiStatus('online') // TODO: why always runs here??
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
      // setChainStatus(
      //   <div style={{ display: 'flex', placeItems: 'center', gap: '0.5rem' }}>
      //     <ErrorIcon />
      //     <span>Error: {errorMessage}</span>
      //   </div>
      // )
    }
  }

  useEffect(() => {
    refreshNodeStatus(true)
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
            <div>Chain-ID: {chainId}</div>
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
      <Button
        className={
          'enabled:bg-gradient-to-r enabled:from-cyan-600 enabled:to-purple-600 enabled:hover:from-cyan-500 enabled:hover:to-purple-500 transition-colors text-white font-extrabold py-3 w-full rounded-lg disabled:bg-neutral-500 focus:outline-none focus-visible:ring-4 ring-sky-500/40'
        }
        size="large"
        onClick={handleSendTx}
      >
        Send Tx
      </Button>
    </div>
  )
}

export default Powertools

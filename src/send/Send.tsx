import { useEffect, useState, useContext } from 'react'
import {
  MsgExecuteContract,
  BroadcastMode,
  MsgSend,
  validateAddress
} from 'secretjs'
import { Token } from 'shared/utils/config'
import {
  sleep,
  faucetAddress,
  viewingKeyErrorString,
  sendPageTitle,
  sendPageDescription,
  sendJsonLdSchema,
  allTokens,
  randomPadding
} from 'shared/utils/commons'
import Title from 'shared/components/Title'
import BigNumber from 'bignumber.js'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import Tooltip from '@mui/material/Tooltip'
import { Helmet } from 'react-helmet-async'
import mixpanel from 'mixpanel-browser'
import { useSearchParams } from 'react-router-dom'
import { APIContext } from 'shared/context/APIContext'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import SendForm from './components/SendForm'
import { WalletService } from 'shared/services/wallet.service'

export function Send() {
  const { feeGrantStatus, secretNetworkClient, connectWallet, isConnected } =
    useSecretNetworkClientStore()

  const { prices } = useContext(APIContext)

  let tokens = JSON.parse(JSON.stringify(allTokens))
  const tokenToModify = tokens.find((token: any) => token.name === 'SCRT')
  if (tokenToModify) {
    tokenToModify.address = 'native'
  }

  const SCRT = allTokens[0]

  tokens = [SCRT, ...tokens]

  const secretToken: Token = tokens.find(
    (token: any) =>
      token.name === 'SCRT' &&
      token.address === 'secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8fzek'
  )

  const [selectedToken, setSelectedToken] = useState<Token>(secretToken)
  const [selectedTokenPrice, setSelectedTokenPrice] = useState<number>(0)
  const [amountString, setAmountString] = useState<string>('0')

  const [destinationAddress, setDestinationAddress] = useState<string>('')
  const [memo, setMemo] = useState<string>('')

  const [nativeBalance, setNativeBalance] = useState<any>()
  const [tokenBalance, setTokenBalance] = useState<any>()

  useEffect(() => {
    setSelectedTokenPrice(
      prices.find(
        (price: { coingecko_id: string }) =>
          price.coingecko_id === selectedToken.coingecko_id
      )?.priceUsd
    )
  }, [selectedToken, prices])

  useEffect(() => {
    if (import.meta.env.VITE_MIXPANEL_ENABLED === 'true') {
      mixpanel.init(import.meta.env.VITE_MIXPANEL_PROJECT_TOKEN, {
        debug: false
      })
      mixpanel.identify('Dashboard-App')
      mixpanel.track('Open Wrap Tab')
    }
  }, [])

  // URL params
  const [searchParams, setSearchParams] = useSearchParams()
  const tokenUrlParam = searchParams.get('token')

  const isValidTokenParam = () => {
    return tokens.find(
      (token: any) => token.name.toLowerCase() === tokenUrlParam.toLowerCase()
    )
      ? true
      : false
  }

  useEffect(() => {
    if (tokenUrlParam && isValidTokenParam()) {
      setSelectedToken(
        tokens.find(
          (token: any) =>
            token.name.toLowerCase() === tokenUrlParam.toLowerCase()
        )
      )
    }
  }, [])

  // UI
  const [isValidAmount, setIsValidAmount] = useState<boolean>(false)
  const [isValidDestination, setIsValidDestination] = useState<boolean>(false)
  const [amountValidationMessage, setAmountValidationMessage] =
    useState<string>('')
  const [destinationValidationMessage, setDestinationValidationMessage] =
    useState<string>('')
  const [isValidationActive, setIsValidationActive] = useState<boolean>(false)
  function validateForm() {
    let isValidAmount = false
    let isValidDestination = false

    const availableAmount = new BigNumber(
      selectedToken.address === 'native' ? nativeBalance : tokenBalance
    ).dividedBy(`1e${selectedToken.decimals}`)

    if (
      new BigNumber(amountString).isGreaterThan(
        new BigNumber(availableAmount)
      ) &&
      !(tokenBalance == viewingKeyErrorString) &&
      amountString !== ''
    ) {
      setAmountValidationMessage('Not enough balance')
    } else if (amountString === '') {
      setAmountValidationMessage('Please enter a valid amount')
    } else {
      isValidAmount = true
    }
    setIsValidAmount(isValidAmount)

    if (validateAddress(destinationAddress).isValid) {
      isValidDestination = true
    } else {
      setDestinationValidationMessage('Please enter a valid address')
    }
    setIsValidDestination(isValidDestination)

    return isValidAmount && isValidDestination
  }

  useEffect(() => {
    // setting amountToWrap to max. value, if entered value is > available
    const availableAmount =
      selectedToken.address === 'native'
        ? new BigNumber(nativeBalance).dividedBy(`1e${selectedToken.decimals}`)
        : new BigNumber(tokenBalance).dividedBy(`1e${selectedToken.decimals}`)
    if (
      !new BigNumber(amountString).isNaN() &&
      availableAmount.isGreaterThan(new BigNumber(0)) &&
      new BigNumber(amountString).isGreaterThan(
        new BigNumber(availableAmount)
      ) &&
      !(
        tokenBalance == viewingKeyErrorString &&
        selectedToken.address !== 'native'
      ) &&
      amountString !== ''
    ) {
      setAmountString(availableAmount.toString())
    }

    if (isValidationActive) {
      validateForm()
    }
  }, [amountString, selectedToken, isValidationActive])

  useEffect(() => {
    setAmountString('')
  }, [selectedToken])

  function handleInputChange(e: any) {
    const filteredValue = e.target.value.replace(/[^0-9.]+/g, '')
    setAmountString(filteredValue)
  }

  // handles [25% | 50% | 75% | Max] Button-Group
  function setAmountByPercentage(percentage: number) {
    let maxValue = '0'
    if (selectedToken.address === 'native') {
      maxValue = nativeBalance
    } else {
      maxValue = tokenBalance
    }

    if (maxValue) {
      let availableAmount = new BigNumber(maxValue).dividedBy(
        `1e${selectedToken.decimals}`
      )
      let potentialInput = availableAmount.toNumber() * (percentage * 0.01)
      if (
        percentage == 100 &&
        potentialInput > 0.05 &&
        selectedToken.address === 'native'
      ) {
        potentialInput = potentialInput - 0.05
      }
      if (Number(potentialInput) < 0) {
        setAmountString('')
      } else {
        setAmountString(potentialInput.toFixed(selectedToken.decimals))
      }

      validateForm()
    }
  }

  async function setBalance() {
    try {
      await updateCoinBalance()
      await updateTokenBalance()
    } catch (e) {
      console.log(e)
    }
  }

  const updateTokenBalance = async () => {
    if (!selectedToken.address || !secretNetworkClient) {
      return
    }

    const key = await WalletService.getWalletViewingKey(selectedToken.address)
    if (!key) {
      setTokenBalance(viewingKeyErrorString)
      return
    }

    try {
      const result: {
        viewing_key_error: any
        balance: {
          amount: string
        }
      } = await secretNetworkClient.query.compute.queryContract({
        contract_address: selectedToken.address,
        code_hash: selectedToken.code_hash,
        query: {
          balance: { address: secretNetworkClient?.address, key }
        }
      })

      if (result.viewing_key_error) {
        setTokenBalance(viewingKeyErrorString)
        return
      }

      setTokenBalance(result.balance.amount)
    } catch (e) {
      console.error(`Error getting balance for s${selectedToken.name}`, e)

      setTokenBalance(viewingKeyErrorString)
    }
  }

  function SubmitButton(props: {
    disabled: boolean
    amount: string | undefined
    currency: string
  }) {
    const disabled = props.disabled
    const amount = props.amount
    const currency = props.currency

    function uiFocusInput() {
      document
        .getElementById('fromInputWrapper')
        ?.classList.add('animate__animated')
      document
        .getElementById('fromInputWrapper')
        ?.classList.add('animate__headShake')
      setTimeout(() => {
        document
          .getElementById('fromInputWrapper')
          ?.classList.remove('animate__animated')
        document
          .getElementById('fromInputWrapper')
          ?.classList.remove('animate__headShake')
      }, 1000)
    }

    async function submit() {
      setIsValidationActive(true)
      const isValidForm = validateForm()
      if (!secretNetworkClient?.address) return

      if (!isValidForm || amountString === '') {
        uiFocusInput()
        return
      }

      const baseAmount = amountString
      const amount = new BigNumber(Number(baseAmount))
        .multipliedBy(`1e${selectedToken.decimals}`)
        .toFixed(0, BigNumber.ROUND_DOWN)

      if (amount === 'NaN') {
        console.error('NaN amount', baseAmount)
        return
      }

      try {
        const toastId = toast.loading(`Sending s${selectedToken.name}`, {
          closeButton: true
        })
        secretNetworkClient?.address
        destinationAddress
        amount
        await secretNetworkClient.tx
          .broadcast(
            [
              selectedToken.address === 'native'
                ? new MsgSend({
                    from_address: secretNetworkClient?.address,
                    to_address: destinationAddress,
                    amount: [
                      {
                        amount: amount,
                        denom: 'uscrt'
                      }
                    ]
                  } as any)
                : new MsgExecuteContract({
                    sender: secretNetworkClient?.address,
                    contract_address: selectedToken.address,
                    code_hash: selectedToken.code_hash,
                    sent_funds: [],
                    msg: {
                      transfer: {
                        recipient: destinationAddress,
                        amount: amount,
                        padding: randomPadding()
                      }
                    }
                  } as any)
            ],
            {
              gasLimit: 150000,
              gasPriceInFeeDenom: 0.25,
              feeDenom: 'uscrt',
              feeGranter: feeGrantStatus === 'success' ? faucetAddress : '',
              broadcastMode: BroadcastMode.Sync,
              memo: memo
            }
          )
          .catch((error: any) => {
            console.error(error)
            if (error?.tx?.rawLog) {
              toast.update(toastId, {
                render: `Sending of s${selectedToken.name} failed: ${error.tx.rawLog}`,
                type: 'error',
                isLoading: false,
                closeOnClick: true
              })
            } else {
              toast.update(toastId, {
                render: `Sending of s${selectedToken.name} failed: ${error.message}`,
                type: 'error',
                isLoading: false,
                closeOnClick: true
              })
            }
          })
          .then((tx: any) => {
            console.log(tx)
            if (tx) {
              if (tx.code === 0) {
                setAmountString('')
                toast.update(toastId, {
                  render: `Sent s${selectedToken.name} to ${destinationAddress} successfully`,
                  type: 'success',
                  isLoading: false,
                  closeOnClick: true
                })
                setIsValidationActive(false)
              } else {
                toast.update(toastId, {
                  render: `Sending of s${selectedToken.name} failed: ${tx.rawLog}`,
                  type: 'error',
                  isLoading: false,
                  closeOnClick: true
                })
              }
            }
          })
      } finally {
        if (import.meta.env.VITE_MIXPANEL_ENABLED === 'true') {
          mixpanel.init(import.meta.env.VITE_MIXPANEL_PROJECT_TOKEN, {
            debug: false
          })
          mixpanel.identify('Dashboard-App')
          mixpanel.track('Secret Send', {
            'Fee Grant used': feeGrantStatus === 'success' ? true : false
          })
        }
        try {
          await sleep(1000) // sometimes query nodes lag
          await setBalance()
        } finally {
        }
      }
    }

    return (
      <>
        <div className="flex flex-col gap-4 items-center">
          <button
            className={
              'enabled:bg-gradient-to-r enabled:from-cyan-600 enabled:to-purple-600 enabled:hover:from-cyan-500 enabled:hover:to-purple-500 transition-colors text-white font-semibold py-3 w-full rounded-lg disabled:bg-neutral-500 focus:outline-none focus-visible:ring-4 ring-sky-500/40'
            }
            disabled={disabled}
            onClick={() => submit()}
          >
            {secretNetworkClient?.address && secretNetworkClient && amount ? (
              <>{`Send ${amount} ${currency}`}</>
            ) : null}

            {/* general text without value */}
            {!amount || !secretNetworkClient?.address ? 'Send' : null}
          </button>
        </div>
      </>
    )
  }

  const updateCoinBalance = async () => {
    try {
      const {
        balance: { amount }
      } = await secretNetworkClient.query.bank.balance({
        address: secretNetworkClient?.address,
        denom: selectedToken.withdrawals[0]?.from_denom
      })
      setNativeBalance(amount)
    } catch (e) {
      console.error(`Error while trying to query ${selectedToken.name}:`, e)
    }
  }

  useEffect(() => {
    if (!secretNetworkClient?.address) return
    ;(async () => {
      setBalance()
    })()

    const interval = setInterval(setBalance, 10000)
    return () => {
      clearInterval(interval)
    }
  }, [
    secretNetworkClient?.address,
    secretNetworkClient,
    selectedToken,
    feeGrantStatus
  ])

  const handleClick = () => {
    if (!secretNetworkClient?.address || !secretNetworkClient) {
      connectWallet()
    }
  }

  return (
    <>
      <Helmet>
        <title>{sendPageTitle}</title>

        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="title" content={sendPageTitle} />
        <meta name="application-name" content={sendPageTitle} />
        <meta name="description" content={sendPageDescription} />
        <meta name="robots" content="index,follow" />

        <meta property="og:title" content={sendPageTitle} />
        <meta property="og:description" content={sendPageDescription} />
        {/* <meta property="og:image" content="Image URL Here"/> */}

        <meta name="twitter:title" content={sendPageTitle} />
        <meta name="twitter:description" content={sendPageDescription} />
        {/* <meta name="twitter:image" content="Image URL Here"/> */}

        <script type="application/ld+json">
          {JSON.stringify(sendJsonLdSchema)}
        </script>
      </Helmet>

      {/* Content */}
      <div className="container w-full max-w-xl mx-auto px-4">
        {/* Content */}
        <div className="rounded-3xl px-6 py-6 text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900">
          {/* Title: Secret Wrap / Secret Unwrap */}
          <div className="mb-8">
            <Title title={`Send`}>
              <Tooltip
                title={'Transfer your assets to a given address'}
                placement="right"
                arrow
              >
                <span className="ml-2 relative -top-1.5 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
                  <FontAwesomeIcon icon={faInfoCircle} />
                </span>
              </Tooltip>
            </Title>
          </div>
          <SendForm />
        </div>
      </div>
    </>
  )
}

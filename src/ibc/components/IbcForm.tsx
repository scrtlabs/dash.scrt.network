import { useFormik } from 'formik'
import { ibcSchema } from './ibcSchema'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { useState } from 'react'
import { IbcMode } from 'shared/types/IbcMode'
import Select from 'react-select'
import { Token, chains, tokens } from 'shared/utils/config'
import IbcSelect from './IbcSelect'
import Tooltip from '@mui/material/Tooltip'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightLeft } from '@fortawesome/free-solid-svg-icons'
import AddressInfo from './AddressInfo'
import {
  NativeTokenBalanceUi,
  WrappedTokenBalanceUi
} from 'shared/components/BalanceUI'
import PercentagePicker from 'shared/components/PercentagePicker'

export default function IbcForm() {
  const {
    feeGrantStatus,
    requestFeeGrant,
    secretNetworkClient,
    walletAddress,
    isConnected
  } = useSecretNetworkClientStore()

  const [ibcMode, setIbcMode] = useState<IbcMode>('deposit')

  // refactor start
  const [srcAddress, setSrcAddress] = useState<string>('')
  const [availableBalance, setAvailableBalance] = useState<string>('')
  const [amountToTransfer, setAmountToTransfer] = useState<string>('')
  function handleInputChange(e: any) {
    setAmountToTransfer(e.target.value)
  }
  // refactor end

  function toggleIbcMode() {
    if (ibcMode === 'deposit') {
      setIbcMode('withdrawal')
    } else {
      setIbcMode('deposit')
    }
  }

  const selectableChains = tokens.find(
    (token) => token.name === 'SCRT'
  ).deposits

  const [selectedToken, setSelectedToken] = useState<Token>(
    tokens.filter((token: Token) => token.name === 'SCRT')[0]
  )

  const [selectedSource, setSelectedSource] = useState<any>(
    selectedToken.deposits.find(
      (deposit: any) => deposit.chain_name.toLowerCase() === 'osmosis'
    )
  )

  const ChainSelect = () => {
    return (
      <>
        <Select
          options={selectableChains}
          value={selectedSource}
          onChange={setSelectedSource}
          isSearchable={false}
          isDisabled={!isConnected}
          formatOptionLabel={(option) => (
            <IbcSelect
              imgSrc={`/img/assets/${chains[option.chain_name].chain_image}`}
              altText={`/img/assets/${
                chains[option.chain_name].chain_name
              } asset logo`}
              optionName={option.chain_name}
            />
          )}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </>
    )
  }

  const formik = useFormik({
    initialValues: {
      amount: '',
      tokenName: 'AKT',
      wrappingMode: 'wrap'
    },
    validationSchema: ibcSchema,
    validateOnBlur: false,
    validateOnChange: true,
    onSubmit: async (values) => {
      // try {
      //   setGeneralErrorMessage('')
      //   setGeneralSuccessMessage('')
      //   setIsWaiting(true)
      //   const res = await WrapService.performWrapping({
      //     ...values,
      //     secretNetworkClient,
      //     feeGrantStatus
      //   })
      //   setIsWaiting(false)
      //   if (res.success) {
      //     setGeneralSuccessMessage(
      //       `${
      //         formik.values.wrappingMode === 'wrap' ? 'Wrapping' : 'Unwrapping'
      //       } Successful!`
      //     )
      //   } else {
      //     throw new Error()
      //   }
      // } catch (error: any) {
      //   console.error(error)
      //   setGeneralErrorMessage(
      //     `${
      //       formik.values.wrappingMode === 'wrap' ? 'Wrapping' : 'Unwrapping'
      //     } unsuccessful!`
      //   )
      // }
    }
  })

  // return <Deposit />
  return (
    <>
      <form
        onSubmit={formik.handleSubmit}
        className="w-full flex flex-col gap-4 text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900"
      >
        {/* [From|To] Picker */}
        <div className="flex flex-col md:flex-row mb-8">
          {/* *** From *** */}
          <div className="flex-initial w-full md:w-1/3">
            {/* circle */}
            <div
              className="w-full relative rounded-full overflow-hidden border-2 border-cyan-500 hidden md:block"
              style={{ paddingTop: '100%' }}
            >
              <div className="img-wrapper absolute top-1/2 left-0 right-0 -translate-y-1/2 text-center">
                <div className="w-1/2 inline-block">
                  <div className="relative">
                    <div
                      className={`absolute inset-0 bg-cyan-500 blur-md rounded-full overflow-hidden ${
                        secretNetworkClient?.address
                          ? 'fadeInAndOutLoop'
                          : 'opacity-40'
                      }`}
                    ></div>
                    <img
                      src={
                        '/img/assets/' +
                        (ibcMode === 'deposit'
                          ? chains[selectedSource.chain_name].chain_image
                          : 'scrt.svg')
                      }
                      className="w-full relative inline-block rounded-full overflow-hiden"
                      alt={`${
                        ibcMode === 'deposit'
                          ? chains[selectedSource.chain_name].chain_name
                          : 'SCRT'
                      } logo`}
                    />
                  </div>
                </div>
              </div>
              <div
                className="absolute left-1/2 -translate-x-1/2 text-center text-sm font-semibold text-black dark:text-white"
                style={{ bottom: '10%' }}
              >
                From
              </div>
            </div>
            {/* Chain Picker */}
            <div className="-mt-3 relative z-10 w-full">
              {/* {value} */}
              {ibcMode === 'deposit' && <ChainSelect />}
              {ibcMode === 'withdrawal' && (
                <div
                  style={{ paddingTop: '.76rem', paddingBottom: '.76rem' }}
                  className="flex items-center w-full text-sm font-semibold select-none bg-white dark:bg-neutral-800 rounded text-neutral-800 dark:text-neutral-200 focus:bg-neutral-300 dark:focus:bg-neutral-700 disabled:hover:bg-neutral-200 dark:disabled:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-600"
                >
                  <div className="flex-1 px-3 text-center">
                    <span>Secret Network</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 py-2 md:py-0">
            <div className="md:relative" id="ibcSwitchButton">
              <div className="md:absolute md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 text-center md:text-left">
                <Tooltip
                  title={`Switch chains`}
                  placement="bottom"
                  disableHoverListener={!secretNetworkClient?.address}
                  arrow
                >
                  <span>
                    <button
                      onClick={toggleIbcMode}
                      className={
                        'focus:outline-none focus-visible:ring-2 ring-sky-500/40 inline-block bg-neutral-200 dark:bg-neutral-800 px-3 py-2 text-cyan-500 dark:text-cyan-500 transition-colors rounded-xl disabled:text-neutral-500 dark:disabled:text-neutral-500' +
                        (secretNetworkClient?.address
                          ? 'hover:text-cyan-700 dark:hover:text-cyan-300'
                          : '')
                      }
                      disabled={!isConnected}
                    >
                      <FontAwesomeIcon
                        icon={faRightLeft}
                        className="rotate-90 md:rotate-0"
                      />
                    </button>
                  </span>
                </Tooltip>
              </div>
            </div>
          </div>
          {/* *** To *** */}
          <div className="flex-initial w-full md:w-1/3">
            <div
              className="w-full relative rounded-full overflow-hidden border-2 border-violet-500 hidden md:block"
              style={{ paddingTop: '100%' }}
            >
              <div className="img-wrapper absolute top-1/2 left-0 right-0 -translate-y-1/2 text-center">
                <div className="w-1/2 inline-block">
                  <div className="relative">
                    <div
                      className={`absolute inset-0 bg-violet-500 blur-md rounded-full overflow-hidden ${
                        secretNetworkClient?.address
                          ? 'fadeInAndOutLoop'
                          : 'opacity-40'
                      }`}
                    ></div>
                    <img
                      src={
                        '/img/assets/' +
                        (ibcMode === 'withdrawal'
                          ? chains[selectedSource.chain_name].chain_image
                          : 'scrt.svg')
                      }
                      className="w-full relative inline-block rounded-full overflow-hiden"
                      alt={`${
                        ibcMode === 'withdrawal'
                          ? chains[selectedSource.chain_name].chain_name
                          : 'SCRT'
                      } logo`}
                    />
                  </div>
                </div>
              </div>
              <div
                className="absolute left-0 right-0 text-center text-sm font-semibold text-black dark:text-white"
                style={{ bottom: '10%' }}
              >
                To
              </div>
            </div>
            {/* Chain Picker */}
            <div className="md:-mt-3 md:relative z-10 w-full">
              {ibcMode === 'withdrawal' && <ChainSelect />}
              {ibcMode === 'deposit' && (
                <div
                  style={{ paddingTop: '.76rem', paddingBottom: '.76rem' }}
                  className="flex items-center w-full text-sm font-semibold select-none bg-neutral-200 dark:bg-neutral-800 rounded text-neutral-800 dark:text-neutral-200 focus:bg-neutral-300 dark:focus:bg-neutral-700 disabled:hover:bg-neutral-200 dark:disabled:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-600"
                >
                  <div className="flex-1 px-3 text-center">
                    <span>Secret Network</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <AddressInfo
          srcChain={chains['Secret Network']}
          srcAddress={`iowerg8035089ty354u890-2t490u34t9034ty8080rih3240r`}
          destChain={chains['Secret Network']}
          destAddress={`iowerg8035089ty354u890-2t490u34t9034ty8080rih3240r`}
        />

        <div className="bg-neutral-200 dark:bg-neutral-800 p-4 rounded-xl">
          <div className="flex" id="inputWrapper">
            <Select
              options={tokens} // TODO: was "supportedTokens"
              value={selectedToken}
              onChange={setSelectedToken}
              isSearchable={false}
              isDisabled={!secretNetworkClient?.address}
              formatOptionLabel={(token) => (
                <div className="flex items-center">
                  <img
                    src={`/img/assets/${token.image}`}
                    alt={`${token.name} asset logo`}
                    className="w-6 h-6 mr-2 rounded-full"
                  />
                  <span className="font-semibold text-sm">
                    {token.is_ics20 && ibcMode === 'withdrawal' && 's'}
                    {token.name}
                  </span>
                </div>
              )}
              className="react-select-wrap-container"
              classNamePrefix="react-select-wrap"
            />
            <input
              type="number"
              min="0"
              step="0.000001"
              value={amountToTransfer}
              onChange={handleInputChange}
              className={
                'remove-arrows text-right focus:z-10 block flex-1 min-w-0 w-full bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white px-4 rounded-r-lg disabled:placeholder-neutral-300 dark:disabled:placeholder-neutral-700 transition-colors font-medium focus:outline-0 focus:ring-2 ring-sky-500/40' +
                (false ? '  border border-red-500 dark:border-red-500' : '')
              }
              name="amount"
              id="amount"
              placeholder="0"
              disabled={!secretNetworkClient?.address}
            />
          </div>

          {/* Balance | [25%|50%|75%|Max] */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 mt-3">
            <div className="flex-1 text-xs">
              {/* {(selectedToken.is_ics20 || selectedToken.is_snip20) &&
              ibcMode == 'withdrawal'
                ? WrappedTokenBalanceUi(
                    availableBalance,
                    selectedToken,
                    selectedTokenPrice
                  )
                : NativeTokenBalanceUi(
                    availableBalance,
                    selectedToken,
                    selectedTokenPrice
                  )} */}
            </div>
            <div className="sm:flex-initial text-xs">
              {/* {PercentagePicker(setAmountByPercentage, !walletAddress)} */}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          className={
            'enabled:bg-gradient-to-r enabled:from-cyan-600 enabled:to-purple-600 enabled:hover:from-cyan-500 enabled:hover:to-purple-500 transition-colors text-white font-extrabold py-3 w-full rounded-lg disabled:bg-neutral-500 focus:outline-none focus-visible:ring-4 ring-sky-500/40'
          }
          disabled={!isConnected}
          type="submit"
        >
          {`Execute Transfer`}
        </button>
      </form>
    </>
  )
}

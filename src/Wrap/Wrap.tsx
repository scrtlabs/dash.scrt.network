import React, { useEffect, useState, useContext, createContext } from 'react';
import { MsgExecuteContract } from 'secretjs';
import { Token, tokens } from 'General/Utils/config';
import { sleep, faucetURL, faucetAddress, viewingKeyErrorString, usdString } from 'General/Utils/commons';
import { KeplrContext, FeeGrantContext } from 'General/Layouts/defaultLayout';
import BigNumber from 'bignumber.js';
import { toast} from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faArrowRightArrowLeft, faRightLeft, faCircleInfo, faInfoCircle, faCaretDown, faCog, faCheckCircle, faXmarkCircle } from '@fortawesome/free-solid-svg-icons'
import { getKeplrViewingKey, setKeplrViewingKey } from 'General/Components/Keplr';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import Tooltip from '@mui/material/Tooltip';
import {Helmet} from 'react-helmet';
import { websiteName } from 'App';
import UnknownBalanceModal from './Components/UnknownBalanceModal';
import FeeGrantInfoModal from './Components/FeeGrantInfoModal';
import { FeeGrant, requestFeeGrant } from 'General/Components/FeeGrant';

export const WrapContext = createContext(null);

export function Wrap() {

  const {feeGrantStatus, setFeeGrantStatus} = useContext(FeeGrantContext);

  const [isUnknownBalanceModalOpen, setIsUnknownBalanceModalOpen] = useState(false);
  const [isFeeGrantInfoModalOpen, setIsFeeGrantInfoModalOpen] = useState(false);

  type WrappingMode = 'Wrap' | 'Unwrap';

  const queryParams = new URLSearchParams(window.location.search);
  const tokenByQueryParam = queryParams.get('token'); // 'scrt', 'akash', etc.
  const modeByQueryParam = queryParams.get('mode'); // 'wrap' or 'unwrap'
  const tokenPreselection = tokens.filter(token => token.name === tokenByQueryParam?.toUpperCase())[0] ? tokenByQueryParam?.toUpperCase() : 'SCRT';
  const modePreselection = modeByQueryParam?.toLowerCase() === 'unwrap' ? 'Unwrap' : 'Wrap';

  const {secretjs, secretAddress} = useContext(KeplrContext);
  const {useFeegrant, setUseFeegrant} = useContext(FeeGrantContext);

  const [amountToWrap, setAmountToWrap] = useState<string>('');
  const [wrappingMode, setWrappingMode] = useState<WrappingMode>(modePreselection);
  const [selectedToken, setselectedToken] = useState<Token>(tokens.filter(token => token.name === tokenPreselection)[0]);

  // UI
  const [price, setPrice] = useState <number>();
  const [isValidAmount, setisValidAmount] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [isValidationActive, setIsValidationActive] = useState<boolean>(false);

  const [loadingWrapOrUnwrap, setLoadingWrapOrUnwrap] = useState<boolean>(false);
  const [loadingTokenBalance, setLoadingTokenBalance] = useState<boolean>(false);
  const [loadingCoinBalance, setLoadingCoinBalance] = useState<boolean>(false);

  const [tokenNativeBalance, setTokenNativeBalance] = useState<string>('');
  const [tokenWrappedBalance, setTokenWrappedBalance] = useState<string>('');

  function validateForm() {
    const availableAmount = new BigNumber(wrappingMode === 'Wrap' ? tokenNativeBalance : tokenWrappedBalance).dividedBy(`1e${selectedToken.decimals}`);

    const numberRegex = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;

    function matchExact(r, str) {
      var match = str.match(r);
      return match && str === match[0];
    }

    if (new BigNumber(amountToWrap).isGreaterThan(new BigNumber(availableAmount)) && !(tokenWrappedBalance == viewingKeyErrorString && wrappingMode === 'Unwrap') && amountToWrap !== '') {
      setValidationMessage('Not enough balance');
      setisValidAmount(false);
    } else if (!matchExact(numberRegex, amountToWrap) || amountToWrap === '') {
      setValidationMessage('Please enter a valid amount');
      setisValidAmount(false);
    } else {
      setisValidAmount(true);
    }
  }

  useEffect(() => {
    // setting amountToWrap to max. value, if entered value is > available
    const availableAmount = wrappingMode === 'Wrap' ? new BigNumber(tokenNativeBalance).dividedBy(`1e${selectedToken.decimals}`) : new BigNumber(tokenWrappedBalance).dividedBy(`1e${selectedToken.decimals}`);
    if (!(new BigNumber(amountToWrap).isNaN()) && availableAmount.isGreaterThan(new BigNumber(0)) && new BigNumber(amountToWrap).isGreaterThan(new BigNumber(availableAmount)) && !(tokenWrappedBalance == viewingKeyErrorString && wrappingMode === 'Unwrap') && amountToWrap !== '') {
      setAmountToWrap(availableAmount.toString());
    }

    if (isValidationActive) {
      validateForm();
    }
}, [amountToWrap, wrappingMode, isValidationActive]);

// reset amountToWrap on selectedToken change
useEffect(() => {
  setAmountToWrap('');
}, [selectedToken, wrappingMode])

  function handleInputChange(e: any) {
    const filteredValue = e.target.value.replace(
      /[^0-9.]+/g, ''
    );
    setAmountToWrap(filteredValue);
  }

  function showModal() {
    setIsUnknownBalanceModalOpen(true);
    document.body.classList.add('overflow-hidden');
  }

  const updateFeeGrantButton = (text: string, color: string) => {
    let btnFeeGrant = document.getElementById('grantButton');
    if (btnFeeGrant != null) {
      btnFeeGrant.style.color = color;
      btnFeeGrant.textContent = text;
    }
  }

  function toggleWrappingMode() {
    if (wrappingMode === 'Wrap') {
      setWrappingMode('Unwrap');
    } else {
      setWrappingMode('Wrap');
    }
  }


  const message = (wrappingMode === 'Wrap') ?
  `Converting publicly visible ${selectedToken.name} into its privacy-preserving equivalent s${selectedToken.name}. These tokens are not publicly visible and require a viewing key!` :
  `Convert privacy-preserving s${selectedToken.name} into its publicly visible equivalent ${selectedToken.name}!`;

  {new BigNumber(tokenWrappedBalance!)
    .dividedBy(`1e${selectedToken.decimals}`)
    .toFormat()}

  // handles [25% | 50% | 75% | Max] Button-Group
  function setAmountByPercentage(percentage: number) {
    let maxValue = '0';
    if (wrappingMode === 'Wrap') {
      maxValue = tokenNativeBalance;
    } else {
      maxValue = tokenWrappedBalance;
    }

    if (maxValue) {
      let availableAmount = new BigNumber(maxValue).dividedBy(`1e${selectedToken.decimals}`);
      let potentialInput = availableAmount.toNumber() * (percentage * 0.01);
      console.log('availableAmount', availableAmount);
      console.log('potentialInput', potentialInput);
      if (Number(potentialInput) == 0) {
        setAmountToWrap('');
      } else {
        setAmountToWrap(potentialInput.toString());
      }
      
      validateForm();
    }
  }

  async function setBalance() {
    try {
      setLoadingCoinBalance(true);
      setLoadingTokenBalance(true);
      await updateCoinBalance();
      await updateTokenBalance();
    } finally {
      setLoadingCoinBalance(false);
      setLoadingTokenBalance(false);
    }
  }

  async function updateBalance() {
    try {
      await updateCoinBalance();
      await updateTokenBalance();
    } catch (e) {
      console.log(e);
    }
  }

  const updateTokenBalance = async () => {
    if (!selectedToken.address || !secretjs) {
      return;
    }

    const key = await getKeplrViewingKey(selectedToken.address);
    if (!key) {
      setTokenWrappedBalance(viewingKeyErrorString);
      return;
    }

    try {
      const result: {
        viewing_key_error: any;
        balance: {
          amount: string;
        };
      } = await secretjs.query.compute.queryContract({
        contract_address: selectedToken.address,
        code_hash: selectedToken.code_hash,
        query: {
          balance: { address: secretAddress, key },
        },
      });

      if (result.viewing_key_error) {
        setTokenWrappedBalance(viewingKeyErrorString);
        return;
      }

      setTokenWrappedBalance(result.balance.amount);
    } catch (e) {
      console.error(`Error getting balance for s${selectedToken.name}`, e);

      setTokenWrappedBalance(viewingKeyErrorString);
    }
  };


  function PercentagePicker() {
    return (
      <div className='inline-flex rounded-full text-xs font-bold'>
        <button onClick={() => setAmountByPercentage(25)} className='bg-neutral-900 px-1.5 py-0.5 rounded-l-md transition-colors hover:bg-neutral-700 focus:bg-neutral-500 cursor-pointer disabled:text-neutral-500 disabled:hover:bg-neutral-900 disabled:cursor-default' disabled={!secretjs || !secretAddress || (wrappingMode === 'Unwrap' && tokenWrappedBalance == viewingKeyErrorString)}>25%</button>
        <button onClick={() => setAmountByPercentage(50)} className='bg-neutral-900 px-1.5 py-0.5 border-l border-neutral-700 transition-colors hover:bg-neutral-700 focus:bg-neutral-500 cursor-pointer disabled:text-neutral-500 disabled:hover:bg-neutral-900 disabled:cursor-default' disabled={!secretjs || !secretAddress || (wrappingMode === 'Unwrap' && tokenWrappedBalance == viewingKeyErrorString)}>50%</button>
        <button onClick={() => setAmountByPercentage(75)} className='bg-neutral-900 px-1.5 py-0.5 border-l border-neutral-700 transition-colors hover:bg-neutral-700 focus:bg-neutral-500 cursor-pointer disabled:text-neutral-500 disabled:hover:bg-neutral-900 disabled:cursor-default' disabled={!secretjs || !secretAddress || (wrappingMode === 'Unwrap' && tokenWrappedBalance == viewingKeyErrorString)}>75%</button>
        <button onClick={() => setAmountByPercentage(100)} className='bg-neutral-900 px-1.5 py-0.5 rounded-r-md border-l border-neutral-700 transition-colors hover:bg-neutral-700 focus:bg-neutral-500 cursor-pointer disabled:text-neutral-500 disabled:hover:bg-neutral-900 disabled:cursor-default' disabled={!secretjs || !secretAddress || (wrappingMode === 'Unwrap' && tokenWrappedBalance == viewingKeyErrorString)}>MAX</button>
      </div>
    )
  }

  function NativeTokenBalanceUi() {
    if (!loadingCoinBalance && secretjs && secretAddress) {
      return (
        <>
          <span className='font-semibold'>Available:</span>
          <span className='font-medium'>
            {' ' + new BigNumber(tokenNativeBalance!)
              .dividedBy(`1e${selectedToken.decimals}`)
              .toFormat()} {selectedToken.name} ({usdString.format(
            new BigNumber(tokenNativeBalance!)
              .dividedBy(`1e${selectedToken.decimals}`)
              .multipliedBy(Number(price))
              .toNumber()
            )})
          </span>

          <Tooltip title={`IBC Transfer`} placement='bottom' arrow>
            <Link to='/ibc' className='ml-2 hover:text-white transition-colors hover:bg-neutral-900 px-1.5 py-0.5 rounded'>
              <FontAwesomeIcon icon={faArrowRightArrowLeft} />
            </Link>
          </Tooltip>
        </>
      );
    } else {
      return (
        <></>
      )
    }
  }

  function WrappedTokenBalanceUi() {
    if (!secretjs || loadingTokenBalance) {
      return (<></>);
    } else if (tokenWrappedBalance == viewingKeyErrorString) {
      return (
        <>
          <span className='font-semibold'>Available:</span>
          <button className='ml-2 font-semibold bg-neutral-900 px-1.5 py-0.5 rounded-md border-neutral-700 transition-colors hover:bg-neutral-700 focus:bg-neutral-500 cursor-pointer disabled:text-neutral-500 disabled:hover:bg-neutral-900 disabled:cursor-default' 
          onClick={async () => {
            await setKeplrViewingKey(selectedToken.address);
            try {
              setLoadingTokenBalance(true);
              await sleep(1000); // sometimes query nodes lag
              await updateTokenBalance();
            } finally {
              setLoadingTokenBalance(false);
            }
          }}>
            <FontAwesomeIcon icon={faKey} className='mr-2' />Set Viewing Key
          </button>
        </>
      );
    }
    else if (Number(tokenWrappedBalance) > -1) {
      return (
        <>
          {/* Available: 0.123456 sSCRT () */}
          <span className='font-bold'>Available:</span>
          <span className='font-medium'>{` ${new BigNumber(tokenWrappedBalance!)
                .dividedBy(`1e${selectedToken.decimals}`)
                .toFormat()} s` + selectedToken.name + ` (${usdString.format(
            new BigNumber(tokenWrappedBalance!)
              .dividedBy(`1e${selectedToken.decimals}`)
              .multipliedBy(Number(price))
              .toNumber()
            )})`}</span>
        </>
      )
    }
  }

  function WrappingModeSwitch(props: { wrappingMode: WrappingMode; disabled: boolean; }) {
    const disabled = props.disabled;

    return (
      <div className='text-center my-4'>
          <Tooltip disableHoverListener={!secretjs && !secretAddress} title={`Switch to ${wrappingMode === 'Wrap' ? 'Unwrapping' : 'Wrapping'}`} placement='right' arrow>
            <button onClick={() => toggleWrappingMode()} disabled={disabled} className={'bg-neutral-800 px-3 py-2 text-cyan-500 transition-colors rounded-xl disabled:text-neutral-500' + (!disabled ? ' hover:text-cyan-300' : '')}>
              <FontAwesomeIcon icon={faRightLeft} className='fa-rotate-90' />
            </button>
          </Tooltip>
      </div>
    )
  }

  function SubmitButton(props: { disabled: boolean; amount: string | undefined; nativeCurrency: string; wrappedAmount: string | undefined; wrappedCurrency: string; wrappingMode: WrappingMode }) {
    const disabled = props.disabled;
    const amount = props.amount;
    const nativeCurrency = props.nativeCurrency;
    const wrappedCurrency = props.wrappedCurrency;
    const wrappingMode = props.wrappingMode;
    
    function uiFocusInput() {
      document.getElementById('fromInputWrapper')?.classList.add('animate__animated');
      document.getElementById('fromInputWrapper')?.classList.add('animate__headShake');
      setTimeout(() => {
        document.getElementById('fromInputWrapper')?.classList.remove('animate__animated');
        document.getElementById('fromInputWrapper')?.classList.remove('animate__headShake');
      }, 1000);
    }

    async function submit() {
      setIsValidationActive(true);
      validateForm();

      if (!secretjs || !secretAddress) {
        return;
      }

      if (!isValidAmount || amountToWrap === '') {
        uiFocusInput();
        return;
      }

      const baseAmount = amountToWrap;
      const amount = new BigNumber(Number(baseAmount))
        .multipliedBy(`1e${selectedToken.decimals}`)
        .toFixed(0, BigNumber.ROUND_DOWN);

      if (amount === 'NaN') {
        console.error('NaN amount', baseAmount);
        return;
      }
      
      try {
        setLoadingWrapOrUnwrap(true);
        const toastId = toast.loading(
          wrappingMode === 'Wrap' ? `Wrapping ${selectedToken.name}` : `Unwrapping ${selectedToken.name}`, { closeButton: true }
        );
        if (wrappingMode === 'Wrap') {
          const tx = await secretjs.tx.broadcast(
            [
              new MsgExecuteContract({
                sender: secretAddress,
                contract_address: selectedToken.address,
                code_hash: selectedToken.code_hash,
                sent_funds: [
                  { denom: selectedToken.withdrawals[0].from_denom, amount },
                ],
                msg: { deposit: {} },
              } as any),
            ],
            {
              gasLimit: 150_000,
              gasPriceInFeeDenom: 0.25,
              feeDenom: 'uscrt',
              feeGranter: useFeegrant ? faucetAddress : '',
            }
          );

          if (tx.code === 0) {
            setAmountToWrap('');
            toast.update(toastId, {
              render: `Wrapped ${selectedToken.name} successfully`,
              type: 'success',
              isLoading: false,
              closeOnClick: true,
            });
            console.log(`Wrapped successfully`);
          } else {
            toast.update(toastId, {
              render: `Wrapping of ${selectedToken.name} failed: ${tx.rawLog}`,
              type: 'error',
              isLoading: false,
              closeOnClick: true,
            });
            console.error(`Tx failed: ${tx.rawLog}`);
          }
        } else {
          const tx = await secretjs.tx.broadcast(
            [
              new MsgExecuteContract({
                sender: secretAddress,
                contract_address: selectedToken.address,
                code_hash: selectedToken.code_hash,
                sent_funds: [],
                msg: {
                  redeem: {
                    amount,
                    denom:
                      selectedToken.name === 'SCRT'
                        ? undefined
                        : selectedToken.withdrawals[0].from_denom,
                  },
                },
              } as any),
            ],
            {
              gasLimit: 150_000,
              gasPriceInFeeDenom: 0.25,
              feeDenom: 'uscrt',
              feeGranter: useFeegrant ? faucetAddress : '',
            }
          );
          if (tx.code === 0) {
            setAmountToWrap('');
            toast.update(toastId, {
              render: `Unwrapped ${selectedToken.name} successfully`,
              type: 'success',
              isLoading: false,
              closeOnClick: true,
            });
            console.log(`Unwrapped successfully`);
          } else {
            toast.update(toastId, {
              render: `Unwrapping of ${selectedToken.name} failed: ${tx.rawLog}`,
              type: 'error',
              isLoading: false,
              closeOnClick: true,
            });
            console.error(`Tx failed: ${tx.rawLog}`);
          }
        }
      } finally {
        setLoadingWrapOrUnwrap(false);
        try {
          setLoadingCoinBalance(true);
          await sleep(1000); // sometimes query nodes lag
          await updateCoinBalance();
        } finally {
          setLoadingCoinBalance(false);
        }
      }
    }

    return (
      <>
        <div className='flex items-center'>
          <button
            className={'enabled:bg-gradient-to-r enabled:from-cyan-500 enabled:to-purple-500 enabled:hover:from-cyan-600 enabled:hover:to-purple-600 transition-colors text-white font-semibold py-2 w-full rounded-lg disabled:bg-neutral-500'}
            disabled={disabled}
            onClick={() => submit()}>
            {/* {wrappingMode === 'Wrap' ? 'Wrap' : 'Unwrap'} */}
            {/* text for wrapping with value */}
            {(secretAddress && secretjs && wrappingMode === 'Wrap' && amount) && (
            <>
              {`Wrap ${amount} ${nativeCurrency} into ${amount} ${wrappedCurrency}`}
            </>)}

            {/* text for unwrapping with value */}
            {(secretAddress && secretjs && wrappingMode === 'Unwrap' && amount) && (<>
              {`Unwrap ${amount} ${wrappedCurrency} into ${amount} ${nativeCurrency}`}
            </>)}

            {/* general text without value */}
            {(!amount || !secretAddress || !secretAddress) && (wrappingMode === 'Wrap' ? 'Wrap' : 'Unwrap')}
          </button>
        </div>
      </>
    )
  }

  const updateCoinBalance = async () => {
    try {
      const {
        balance: { amount },
      } = await secretjs.query.bank.balance(
        {
          address: secretAddress,
          denom: selectedToken.withdrawals[0]?.from_denom,
        },
      );
      setTokenNativeBalance(amount);
      if (
        selectedToken.withdrawals[0]?.from_denom == 'uscrt' &&
        amount == '0' &&
        useFeegrant == false
      ) {
        try {
          const response = await fetch(faucetURL, {
            method: 'POST',
            body: JSON.stringify({ Address: secretAddress }),
            headers: { 'Content-Type': 'application/json' },
          });
          const result = await response;
          const textBody = await result.text();
          if (result.ok == true) {
            updateFeeGrantButton('Fee Granted', 'green');
            toast.success(
              `Your wallet does not have any SCRT to pay for transaction costs. Successfully sent new fee grant (0.1 SCRT) to address ${secretAddress}`
            );
          } else if (textBody == 'Existing Fee Grant did not expire\n') {
            updateFeeGrantButton('Fee Granted', 'green');
            toast.success(
              `Your wallet does not have any SCRT to pay for transaction costs. Your address ${secretAddress} however does already have an existing fee grant`
            );
          } else {
            updateFeeGrantButton('Fee Grant failed', 'red');
            toast.error(
              `Fee Grant for address ${secretAddress} failed with status code: ${result.status}`
            );
          }
          setUseFeegrant(true);
        } catch (e) {
          updateFeeGrantButton('Fee Grant failed', 'red');
          toast.error(
            `Fee Grant for address ${secretAddress} failed with error: ${e}`
          );
        }
      }
    } catch (e) {
      console.error(`Error while trying to query ${selectedToken.name}:`, e);
    }
  }

  useEffect(() => {
    if (!secretjs || !secretAddress) { return; }

    const interval = setInterval(updateBalance, 10000, selectedToken);

    (async () => {
      setBalance();
    })();

    return () => {
      clearInterval(interval);
    };
  }, [secretAddress, secretjs, selectedToken, useFeegrant]);

  useEffect(() => {
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${selectedToken.coingecko_id}&vs_currencies=USD`)
      .then((resp) => resp.json())
      .then((result: { [coingecko_id: string]: { usd: number } }) => {
        setPrice(result[selectedToken.coingecko_id].usd);
      });
  }, []);

  return (
    <>
      <Helmet>
        <title>{websiteName} | Wrap</title>
      </Helmet>

      <WrapContext.Provider value={{ isUnknownBalanceModalOpen, setIsUnknownBalanceModalOpen, selectedTokenName: selectedToken.name, amountToWrap, hasEnoughBalanceForUnwrapping: false }}>

        <FeeGrantInfoModal open={isFeeGrantInfoModalOpen} onClose={() => {setIsFeeGrantInfoModalOpen(false); document.body.classList.remove('overflow-hidden')}}/>
        <UnknownBalanceModal open={isUnknownBalanceModalOpen} onClose={() => {setIsUnknownBalanceModalOpen(false); document.body.classList.remove('overflow-hidden')}}/>
        <div className='w-full max-w-xl mx-auto px-4 onEnter_fadeInDown'>
          <div className='border rounded-2xl p-8 border-neutral-700 w-full text-neutral-200 bg-neutral-900'>

            {/* Header */}
            <div className='flex items-center mb-4'>
              <h1 className='inline text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500'>
                Secret {wrappingMode === 'Wrap' ? 'Wrap' : 'Unwrap'}
              </h1>

              <Tooltip title={message} placement='right' arrow>
                <div className='ml-2 pt-1 text-neutral-400 hover:text-white transition-colors cursor-pointer'><FontAwesomeIcon icon={faInfoCircle}/></div>
              </Tooltip>
            </div>





            {/* *** From *** */}
            <div className='bg-neutral-800 p-4 rounded-xl'>
              {/* Title Bar */}
              <div className='flex flex-col sm:flex-row'>
                <div className='flex-1 font-semibold mb-2 text-center sm:text-left'>From</div>
                {!isValidAmount && isValidationActive && (
                  <div className='flex-initial'>
                    <div className='text-red-500 text-xs text-center sm:text-right mb-2'>{validationMessage}</div>
                  </div>
                )}
              </div>


              {/* Input Field */}
              <div className='flex' id='fromInputWrapper'>
                <Select isDisabled={!selectedToken.address || !secretAddress} options={tokens.sort((a, b) => a.name.localeCompare(b.name))} value={selectedToken} onChange={setselectedToken} isSearchable={false}
                  formatOptionLabel={token => (
                    <div className='flex items-center'>
                      <img src={`/img/assets/${token.image}`} className='w-5 h-5 mr-2 rounded-full' />
                      <span className='font-semibold text-sm'>
                        {wrappingMode == 'Unwrap' && 's'}
                        {token.name}
                      </span>
                    </div>
                  )} className='react-select-wrap-container' classNamePrefix='react-select-wrap' />
                <input value={amountToWrap} onChange={handleInputChange} type='text' className={'text-right focus:z-10 block flex-1 min-w-0 w-full bg-neutral-900 text-white px-4 rounded-r-lg disabled:placeholder-neutral-700 transition-colors font-medium' + (!isValidAmount && isValidationActive ? '  border border-red-500' : '')} name='fromValue' id='fromValue' placeholder='0' disabled={!secretjs || !secretAddress}/>
              </div>

              {/* Balance | [25%|50%|75%|Max] */}
              <div className='flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 mt-2'>
                <div className='flex-1 text-xs'>
                  {wrappingMode === 'Wrap' && (
                    <NativeTokenBalanceUi/>
                  )}
                  {wrappingMode === 'Unwrap' && <WrappedTokenBalanceUi/>}
                </div>
                <div className='sm:flex-initial text-xs'>
                  <PercentagePicker/>
                </div>
              </div>
            </div>







            {/* Wrapping Mode Switch */}
            <WrappingModeSwitch wrappingMode={wrappingMode} disabled={!secretAddress || !secretjs}/>


            <div className='bg-neutral-800 p-4 rounded-xl mb-5'>
              <div className='flex'>
                <div className='flex-1 font-semibold mb-2 text-center sm:text-left'>To</div>
              </div>

              <div className='flex'>
                <Select isDisabled={!selectedToken.address || !secretAddress} options={tokens.sort((a, b) => a.name.localeCompare(b.name))} value={selectedToken} onChange={setselectedToken} isSearchable={false} formatOptionLabel={token => (
                  <div className='flex items-center'>
                    <img src={`/img/assets/${token.image}`} className='w-6 h-6 mr-2 rounded-full' />
                    <span className='font-semibold text-sm'>
                      {wrappingMode == 'Wrap' && 's'}
                      {token.name}
                    </span>
                  </div>
                )} className='react-select-wrap-container' classNamePrefix='react-select-wrap' />
                <input value={amountToWrap} onChange={handleInputChange} type='text' className={'text-right focus:z-10 block flex-1 min-w-0 w-full bg-neutral-900 text-white px-4 rounded-r-lg disabled:placeholder-neutral-700 transition-colors font-medium'} name='toValue' id='toValue' placeholder='0' disabled={!selectedToken.address || !secretjs || !secretAddress || (wrappingMode === 'Unwrap' && tokenWrappedBalance == viewingKeyErrorString)}/>
              </div>
              <div className='flex-1 text-xs mt-3 text-center sm:text-left'>
                {wrappingMode === 'Wrap' && (
                  <WrappedTokenBalanceUi/>
                )}
                {wrappingMode === 'Unwrap' && (
                  <NativeTokenBalanceUi/>
                )}
              </div>
            </div>

            {/* Fee Grant */}
            <div className='bg-neutral-800 p-4 rounded-lg select-none flex items-center my-4'>
              <div className='flex-1 flex items-center'>
                <span className='font-semibold text-sm'>Fee Grant</span>
                <Tooltip title={`Lorem Ipsum`} placement='right' arrow>
                  <FontAwesomeIcon icon={faInfoCircle} className='ml-2' />
                </Tooltip>
              </div>
              <div className='flex-initial'>
                {/* Untouched */}
                {feeGrantStatus === 'Untouched' && (
                  <FeeGrant/>
                )}
                {/* Success */}
                {feeGrantStatus === 'Success' && (
                  <div className='font-semibold text-sm'>
                    <FontAwesomeIcon icon={faCheckCircle} className='text-green-500 mr-1.5'/>
                    Fee Granted
                  </div>
                )}
                {/* Fail */}
                {feeGrantStatus === 'Fail' && (
                  <div className='font-semibold text-sm'>
                    <FontAwesomeIcon icon={faXmarkCircle} className='text-red-500 mr-1.5'/>
                    Request failed
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <SubmitButton disabled={!secretjs || !selectedToken.address || !secretAddress} amount={amountToWrap} nativeCurrency={selectedToken.name} wrappedAmount={amountToWrap} wrappedCurrency={'s' + selectedToken.name} wrappingMode={wrappingMode}/>

          </div>
        </div>
      </WrapContext.Provider>
    </>
  )
}
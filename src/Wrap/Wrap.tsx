import React, { useEffect, useState, useContext, createContext } from "react";
import { MsgExecuteContract, SecretNetworkClient } from "secretjs";
import { chains, Token, tokens } from "General/Utils/config";
import { sleep, faucetURL, faucetAddress, viewingKeyErrorString, usdString } from "General/Utils/commons";
import { KeplrContext, FeeGrantContext } from "General/Layouts/defaultLayout";
import BigNumber from "bignumber.js";
import { toast} from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faArrowRightArrowLeft, faRightLeft } from '@fortawesome/free-solid-svg-icons'
import { getKeplrViewingKey, setKeplrViewingKey } from "General/Components/Keplr";
import { Header } from "./Components/Header";
import { Link } from "react-router-dom";
import Select from "react-select";

export const WrapContext = createContext(null);

export function Wrap() {
  enum WrappingMode {
    Wrap,
    Unwrap
  }

  const queryParams = new URLSearchParams(window.location.search);
  const tokenByQueryParam = queryParams.get("token"); // "scrt", "akash", etc.
  const modeByQueryParam = queryParams.get("mode"); // "wrap" or "unwrap"
  const tokenPreselection = 
    tokens.filter(token => token.name === tokenByQueryParam?.toUpperCase())[0]
    ? tokenByQueryParam?.toUpperCase() : "SCRT";
  const modePreselection = 
    modeByQueryParam?.toLowerCase() === "unwrap"
    ? WrappingMode.Unwrap : WrappingMode.Wrap;

  const {secretjs, secretAddress} = useContext(KeplrContext);
  const {useFeegrant, setUseFeegrant} = useContext(FeeGrantContext);

  const [price, setPrice] = useState <number>();
  const [amountToWrap, setAmountToWrap] = useState<string>("");
  const [wrappingMode, setWrappingMode] = useState<WrappingMode>(modePreselection);
  const [selectedToken, setselectedToken] = useState<Token>(tokens.filter(token => token.name === tokenPreselection)[0]);

  // UI
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [isValidAmount, setisValidAmount] = useState<boolean>(true);

  const [loadingWrapOrUnwrap, setLoadingWrapOrUnwrap] = useState<boolean>(false);
  const [loadingTokenBalance, setLoadingTokenBalance] = useState<boolean>(false);
  const [loadingCoinBalance, setLoadingCoinBalance] = useState<boolean>(false);

  const [tokenNativeBalance, setTokenNativeBalance] = useState<string>("");
  const [tokenWrappedBalance, setTokenWrappedBalance] = useState<string>("");

  function handleInputChange(e: any) {
    setAmountToWrap(e.target.value);

    const availableAmount = Number(tokenNativeBalance) * (10**(-selectedToken.decimals));

    const numberRegex = /^-?[0-9]+([.,][0-9]+)?$/;

    function matchExact(r, str) {
      var match = str.match(r);
      return match && str === match[0];
    }

    if (Number(e.target.value) > Number(availableAmount) && !(tokenWrappedBalance == viewingKeyErrorString && wrappingMode === WrappingMode.Unwrap)) {
      setValidationMessage("Not enough balance");
      setisValidAmount(false);
    } else if (!matchExact(numberRegex, e.target.value)) {
      setValidationMessage("Please enter a valid number");
      setisValidAmount(false);
    } else {
      setisValidAmount(true);
    }
  }

  const updateFeeGrantButton = (text: string, color: string) => {
    let btnFeeGrant = document.getElementById("grantButton");
    if (btnFeeGrant != null) {
      btnFeeGrant.style.color = color;
      btnFeeGrant.textContent = text;
    }
  }

  function toggleWrappingMode() {
    if (wrappingMode === WrappingMode.Wrap) {
      setWrappingMode(WrappingMode.Unwrap);
    } else {
      setWrappingMode(WrappingMode.Wrap);
    }
  }

  const message = (wrappingMode === WrappingMode.Wrap) ?
  `Convert transparent ${selectedToken.name} into its privacy-preserving equivalent s${selectedToken.name} using the wrap functionality.`:
  `Convert privacy-preserving s${selectedToken.name} into its transparent equivalent ${selectedToken.name} using the unwrap functionality.`;

  // handles [25% | 50% | 75% | Max] Button-Group
  function setAmountByPercentage(percentage: number) {
    let maxValue = "0";
    if (wrappingMode === WrappingMode.Wrap) {
      maxValue = tokenNativeBalance;
    } else {
      maxValue = tokenWrappedBalance;
    }

    if (maxValue) {
      let availableAmount = Number(maxValue) * (10**(-selectedToken.decimals));
      let potentialInput = new BigNumber(availableAmount * (percentage * 0.01)).toFormat();
      if (Number(potentialInput) == 0) {
        setAmountToWrap("");
      } else {
        setAmountToWrap(potentialInput);
      }

      const numberRegex = /^-?[0-9]+([.,][0-9]+)?$/;

      function matchExact(r, str) {
        var match = str.match(r);
        return match && str === match[0];
      }

      if (Number(amountToWrap) > Number(availableAmount)) {
        setValidationMessage("Not enough balance");
        setisValidAmount(false);
      } else if (!matchExact(numberRegex, amountToWrap)) {
        setValidationMessage("Please enter a valid number");
        setisValidAmount(false);
      } else {
        setisValidAmount(true);
      }
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
      <div className="inline-flex rounded-full text-xs font-bold">
        <button onClick={() => setAmountByPercentage(25)} className="bg-zinc-900 px-2 py-1 rounded-l-lg transition-colors hover:bg-zinc-700 focus:bg-zinc-500 cursor-pointer disabled:text-zinc-500 disabled:hover:bg-zinc-900 disabled:cursor-default" disabled={!secretAddress}>25%</button>
        <button onClick={() => setAmountByPercentage(50)} className="bg-zinc-900 px-2 py-1 border-l border-zinc-700 transition-colors hover:bg-zinc-700 focus:bg-zinc-500 cursor-pointer disabled:text-zinc-500 disabled:hover:bg-zinc-900 disabled:cursor-default" disabled={!secretAddress}>50%</button>
        <button onClick={() => setAmountByPercentage(75)} className="bg-zinc-900 px-2 py-1 border-l border-zinc-700 transition-colors hover:bg-zinc-700 focus:bg-zinc-500 cursor-pointer disabled:text-zinc-500 disabled:hover:bg-zinc-900 disabled:cursor-default" disabled={!secretAddress}>75%</button>
        <button onClick={() => setAmountByPercentage(100)} className="bg-zinc-900 px-2 py-1 rounded-r-lg border-l border-zinc-700 transition-colors hover:bg-zinc-700 focus:bg-zinc-500 cursor-pointer disabled:text-zinc-500 disabled:hover:bg-zinc-900 disabled:cursor-default" disabled={!secretAddress}>MAX</button>
      </div>
    )
  }

  function NativeTokenBalanceUi() {
    if (!loadingCoinBalance && secretjs && secretAddress) {
      return (
        <>
          <span className="font-bold">Available:</span>
          {' ' + new BigNumber(tokenNativeBalance!)
            .dividedBy(`1e${selectedToken.decimals}`)
            .toFormat()} {selectedToken.name} ({usdString.format(
          new BigNumber(tokenNativeBalance!)
            .dividedBy(`1e${selectedToken.decimals}`)
            .multipliedBy(Number(price))
            .toNumber()
          )})
          <Link to={'/ibc'} className="ml-2 hover:text-white transition-colors hover:bg-zinc-900 px-1.5 py-0.5 rounded">
            <FontAwesomeIcon icon={faArrowRightArrowLeft} />
          </Link>
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
          <span className="font-bold">Available:</span>
          <button className="bg-zinc-900 px-2 py-1 rounded-lg transition-colors hover:bg-zinc-700 focus:bg-zinc-500 ml-2 font-semibold" 
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
            <FontAwesomeIcon icon={faKey} className="mr-2" />Set Viewing Key
          </button>
        </>
      );
    }
    else if (Number(tokenWrappedBalance) > -1) {
      return (
        <>
          {/* Available: 0.123456 sSCRT () */}
          <span className="font-bold">Available:</span>
          {` ${new BigNumber(tokenWrappedBalance!)
                .dividedBy(`1e${selectedToken.decimals}`)
                .toFormat()} s` + selectedToken.name + ` (${usdString.format(
            new BigNumber(tokenWrappedBalance!)
              .dividedBy(`1e${selectedToken.decimals}`)
              .multipliedBy(Number(price))
              .toNumber()
            )})`}
        </>
      )
    }
  }

  function WrappingModeSwitch(props: { wrappingMode: WrappingMode; disabled: boolean; }) {
    const disabled = props.disabled;

    return (
      <div className="space-x-4 text-center mt-3">
        <button onClick={() => toggleWrappingMode()} disabled={disabled} className={"bg-zinc-900 px-3 py-2 text-zinc-400 transition-colors rounded-full" + (!disabled ? " hover:text-white" : "")}>
          <FontAwesomeIcon icon={faRightLeft} className="fa-rotate-90" />
        </button>
      </div>
    )
  }

  function SubmitButton(props: { disabled: boolean; amountToWrap: string | undefined; nativeCurrency: string; wrappedAmount: string | undefined; wrappedCurrency: string; wrappingMode: WrappingMode }) {
    const disabled = props.disabled;
    const amountToWrap = props.amountToWrap;
    const nativeCurrency = props.nativeCurrency;
    const wrappedCurrency = props.wrappedCurrency;
    const wrappingMode = props.wrappingMode;

    return (
      <button
        disabled={disabled}
        className={"flex items-center justify-center w-full py-3 px-3 rounded transition-colors font-semibold mt-12 border" + (disabled ? " bg-zinc-500 border-zinc-600 opacity-40" : " bg-blue-500 border-blue-500 hover:bg-blue-600 active:bg-blue-700")}
        onClick={async () => {

          if (!secretjs || !secretAddress) { return; }

          const baseAmount = amountToWrap;
          const amount = new BigNumber(Number(baseAmount))
            .multipliedBy(`1e${selectedToken.decimals}`)
            .toFixed(0, BigNumber.ROUND_DOWN);

          if (amount === "NaN") {
            console.error("NaN amount", baseAmount);
            return;
          }
          
          try {
            setLoadingWrapOrUnwrap(true);
            const toastId = toast.loading(
              wrappingMode === WrappingMode.Wrap ? `Wrapping ${selectedToken.name}` : `Unwrapping ${selectedToken.name}`, { closeButton: true }
            );
            if (wrappingMode === WrappingMode.Wrap) {
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
                  feeDenom: "uscrt",
                  feeGranter: useFeegrant ? faucetAddress : "",
                }
              );

              if (tx.code === 0) {
                setAmountToWrap("");
                toast.update(toastId, {
                  render: `Wrapped ${selectedToken.name} successfully`,
                  type: "success",
                  isLoading: false,
                  closeOnClick: true,
                });
                console.log(`Wrapped successfully`);
              } else {
                toast.update(toastId, {
                  render: `Wrapping of ${selectedToken.name} failed: ${tx.rawLog}`,
                  type: "error",
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
                          selectedToken.name === "SCRT"
                            ? undefined
                            : selectedToken.withdrawals[0].from_denom,
                      },
                    },
                  } as any),
                ],
                {
                  gasLimit: 150_000,
                  gasPriceInFeeDenom: 0.25,
                  feeDenom: "uscrt",
                  feeGranter: useFeegrant ? faucetAddress : "",
                }
              );
              if (tx.code === 0) {
                setAmountToWrap("");
                toast.update(toastId, {
                  render: `Unwrapped ${selectedToken.name} successfully`,
                  type: "success",
                  isLoading: false,
                  closeOnClick: true,
                });
                console.log(`Unwrapped successfully`);
              } else {
                toast.update(toastId, {
                  render: `Unwrapping of ${selectedToken.name} failed: ${tx.rawLog}`,
                  type: "error",
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
      }>
        {/* text for wrapping with value */}
        {(wrappingMode === WrappingMode.Wrap && amountToWrap) && (<>
          Wrap <span className="text-xs font-normal mx-1">{amountToWrap} {nativeCurrency}</span> into <span className="text-xs font-normal mx-1">{amountToWrap} {wrappedCurrency}</span>
        </>)}

        {/* text for unwrapping with value */}
        {(wrappingMode === WrappingMode.Unwrap && amountToWrap) && (<>
          Unwrap <span className="text-xs font-normal mx-1">{amountToWrap} {wrappedCurrency}</span> into <span className="text-xs font-normal mx-1">{amountToWrap} {nativeCurrency}</span>
        </>)}

        {/* general text without value */}
        {(!amountToWrap) && (<>{wrappingMode === WrappingMode.Wrap ? "Wrap" : "Unwrap"}</>)}
      </button>
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
        selectedToken.withdrawals[0]?.from_denom == "uscrt" &&
        amount == "0" &&
        useFeegrant == false
      ) {
        try {
          const response = await fetch(faucetURL, {
            method: "POST",
            body: JSON.stringify({ Address: secretAddress }),
            headers: { "Content-Type": "application/json" },
          });
          const result = await response;
          const textBody = await result.text();
          if (result.ok == true) {
            updateFeeGrantButton("Fee Granted", "green");
            toast.success(
              `Your wallet does not have any SCRT to pay for transaction costs. Successfully sent new fee grant (0.1 SCRT) to address ${secretAddress}`
            );
          } else if (textBody == "Existing Fee Grant did not expire\n") {
            updateFeeGrantButton("Fee Granted", "green");
            toast.success(
              `Your wallet does not have any SCRT to pay for transaction costs. Your address ${secretAddress} however does already have an existing fee grant`
            );
          } else {
            updateFeeGrantButton("Fee Grant failed", "red");
            toast.error(
              `Fee Grant for address ${secretAddress} failed with status code: ${result.status}`
            );
          }
          setUseFeegrant(true);
        } catch (e) {
          updateFeeGrantButton("Fee Grant failed", "red");
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

    const interval = setInterval(setBalance, 10000, selectedToken);

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
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="border rounded-lg p-12 pb-7 border-zinc-700 w-full bg-zinc-800 text-zinc-200">

          <Header title="Secret Wrap" text={message}/>





          {/* *** From *** */}

          {/* Title Bar */}
          <div className="flex mb-2">
            <div className="flex-1 font-bold">From</div>
            <div className="flex-initial">
              {isValidAmount && (<div className="h-4 mb-2"></div>)}
              {!isValidAmount && (<div className="text-red-500 text-xs text-right mb-2">{validationMessage}</div>)}
            </div>
          </div>

          {/* Input Field */}
          <div className="flex">
            <Select isDisabled={!selectedToken.address || !secretAddress} options={tokens.sort((a, b) => a.name.localeCompare(b.name))} value={selectedToken} onChange={setselectedToken} isSearchable={false}
              formatOptionLabel={token => (
                <div className="flex items-center">
                  <img src={token.image} className="w-6 h-6 mr-2 rounded-full" />
                  <span className="font-bold text-sm">
                    {wrappingMode == WrappingMode.Unwrap && 's'}
                    {token.name}
                  </span>
                </div>
              )} className="react-select-wrap-container" classNamePrefix="react-select-wrap" />
            <input value={amountToWrap} onChange={handleInputChange} type="text" className={"block flex-1 min-w-0 w-full bg-zinc-900 text-white p-4 rounded-r-lg disabled:placeholder-zinc-700 transition-colors" + (!isValidAmount ? "  border border-red-500" : "")} name="fromValue" id="fromValue" placeholder="0" disabled={!secretAddress}/>
          </div>

          {/* Balance | [25%|50%|75%|Max] */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 mt-2">
            <div className="flex-1 text-xs">
              {wrappingMode === WrappingMode.Wrap && (
                <NativeTokenBalanceUi/>
              )}
              {wrappingMode === WrappingMode.Unwrap && <WrappedTokenBalanceUi/>}
            </div>
            <div className="sm:flex-initial text-xs">
              <PercentagePicker/>
            </div>
          </div>





          {/* Wrapping Mode Switch */}
          <WrappingModeSwitch wrappingMode={wrappingMode} disabled={!secretAddress}/>






          <div>
            <div className="flex mb-2">
              <div className="flex-1 font-bold">To</div>
            </div>

            <div className="flex">
              <Select isDisabled={!selectedToken.address || !secretAddress} options={tokens.sort((a, b) => a.name.localeCompare(b.name))} value={selectedToken} onChange={setselectedToken} isSearchable={false} formatOptionLabel={token => (
                <div className="flex items-center">
                  <img src={token.image} className="w-6 h-6 mr-2 rounded-full" />
                  <span className="font-bold text-sm">
                    {wrappingMode == WrappingMode.Wrap && 's'}
                    {token.name}
                  </span>
                </div>
              )} className="react-select-wrap-container" classNamePrefix="react-select-wrap" />
              <input value={amountToWrap} onChange={handleInputChange} type="text" className={"block flex-1 min-w-0 w-full bg-zinc-900 text-white p-4 rounded-r-md disabled:placeholder-zinc-700 transition-colors" + (!isValidAmount && wrappingMode === WrappingMode.Unwrap ? " border border-red-500" : "")} name="wrappedValue" id="wrappedValue" placeholder="0" disabled={!selectedToken.address || !secretAddress}/>
            </div>
          </div>
          <div className="flex-1 text-xs mt-3">
            {wrappingMode === WrappingMode.Wrap && (
              <WrappedTokenBalanceUi/>
            )}
            {wrappingMode === WrappingMode.Unwrap && (
              <NativeTokenBalanceUi/>
            )}
          </div>

          {/* <To/> */}
          <SubmitButton disabled={!selectedToken.address || !secretAddress || !amountToWrap || !isValidAmount} amountToWrap={amountToWrap} nativeCurrency={selectedToken.name} wrappedAmount={amountToWrap} wrappedCurrency={"s" + selectedToken.name} wrappingMode={wrappingMode}/>
                    
        </div>
      </div>
    </>
  )
}
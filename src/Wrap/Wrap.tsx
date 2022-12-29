import React, { useEffect, useState, useContext, createContext } from "react";
import { MsgExecuteContract, SecretNetworkClient } from "secretjs";
import { chains, Token, tokens } from "General/Utils/config";
import { sleep, faucetURL, faucetAddress, viewingKeyErrorString, usdString } from "General/Utils/commons";
import { KeplrContext, FeeGrantContext } from "General/Layouts/defaultLayout";
import BigNumber from "bignumber.js";
import { toast} from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faArrowRightArrowLeft, faRightLeft, faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { getKeplrViewingKey, setKeplrViewingKey } from "General/Components/Keplr";
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
  const [amount, setAmount] = useState<string>("");
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

  function validateForm() {
    
    const availableAmount = wrappingMode === WrappingMode.Wrap ? new BigNumber(tokenNativeBalance).dividedBy(`1e${selectedToken.decimals}`) : new BigNumber(tokenWrappedBalance).dividedBy(`1e${selectedToken.decimals}`);

    // const numberRegex = /^-?[0-9]+([.,][0-9]+)?$/;
    const numberRegex = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;

    function matchExact(r, str) {
      var match = str.match(r);
      return match && str === match[0];
    }

    if (new BigNumber(amount) > new BigNumber(availableAmount) && !(tokenWrappedBalance == viewingKeyErrorString && wrappingMode === WrappingMode.Unwrap)) {
      setValidationMessage("Not enough balance");
      setisValidAmount(false);
    } else if (!matchExact(numberRegex, amount)) {
      setValidationMessage("Please enter a valid amount");
      setisValidAmount(false);
    } else {
      setisValidAmount(true);
    }
  }

  useEffect(() => {
    validateForm();
}, [amount, wrappingMode]);

  async function handleInputChange(e: any) {
    await setAmount(e.target.value);
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

  {new BigNumber(tokenWrappedBalance!)
    .dividedBy(`1e${selectedToken.decimals}`)
    .toFormat()}

  // handles [25% | 50% | 75% | Max] Button-Group
  function setAmountByPercentage(percentage: number) {
    let maxValue = "0";
    if (wrappingMode === WrappingMode.Wrap) {
      maxValue = tokenNativeBalance;
    } else {
      maxValue = tokenWrappedBalance;
    }

    if (maxValue) {
      let availableAmount = new BigNumber(maxValue).dividedBy(`1e${selectedToken.decimals}`);
      let potentialInput = availableAmount * (percentage * 0.01);
      console.log("availableAmount", availableAmount);
      console.log("potentialInput", potentialInput);
      if (Number(potentialInput) == 0) {
        setAmount("");
      } else {
        setAmount(potentialInput.toString());
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
      <div className="inline-flex rounded-full text-xs font-semibold">
        <button onClick={() => setAmountByPercentage(25)} className="bg-zinc-900 px-1.5 py-0.5 rounded-l-md transition-colors hover:bg-zinc-700 focus:bg-zinc-500 cursor-pointer disabled:text-zinc-500 disabled:hover:bg-zinc-900 disabled:cursor-default" disabled={!secretAddress}>25%</button>
        <button onClick={() => setAmountByPercentage(50)} className="bg-zinc-900 px-1.5 py-0.5 border-l border-zinc-700 transition-colors hover:bg-zinc-700 focus:bg-zinc-500 cursor-pointer disabled:text-zinc-500 disabled:hover:bg-zinc-900 disabled:cursor-default" disabled={!secretAddress}>50%</button>
        <button onClick={() => setAmountByPercentage(75)} className="bg-zinc-900 px-1.5 py-0.5 border-l border-zinc-700 transition-colors hover:bg-zinc-700 focus:bg-zinc-500 cursor-pointer disabled:text-zinc-500 disabled:hover:bg-zinc-900 disabled:cursor-default" disabled={!secretAddress}>75%</button>
        <button onClick={() => setAmountByPercentage(100)} className="bg-zinc-900 px-1.5 py-0.5 rounded-r-md border-l border-zinc-700 transition-colors hover:bg-zinc-700 focus:bg-zinc-500 cursor-pointer disabled:text-zinc-500 disabled:hover:bg-zinc-900 disabled:cursor-default" disabled={!secretAddress}>MAX</button>
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
          <button className="ml-2 bg-zinc-900 px-1.5 py-0.5 rounded-md border-zinc-700 transition-colors hover:bg-zinc-700 focus:bg-zinc-500 cursor-pointer disabled:text-zinc-500 disabled:hover:bg-zinc-900 disabled:cursor-default" 
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
      <div className="text-center sm:mt-6 sm:mb-2 my-6">
        <button onClick={() => toggleWrappingMode()} disabled={disabled} className={"bg-zinc-900 px-3 py-2 text-blue-600 transition-colors rounded-full" + (!disabled ? " hover:text-blue-400 focus:text-blue-600" : "")}>
          <FontAwesomeIcon icon={faRightLeft} className="fa-rotate-90" />
        </button>
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
      document.getElementById("fromInputWrapper")?.classList.add("animate__animated");
      document.getElementById("fromInputWrapper")?.classList.add("animate__headShake");
      setTimeout(() => {
        document.getElementById("fromInputWrapper")?.classList.remove("animate__animated");
        document.getElementById("fromInputWrapper")?.classList.remove("animate__headShake");
      }, 1000);
    }

    async function submit() {



      if (!secretjs || !secretAddress) { return; }

      if (!isValidAmount || amount === "") {
        uiFocusInput();
        return;
      }

      const baseAmount = amount;
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
            setAmount("");
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
            setAmount("");
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

    return (
      <button
        className={"flex items-center justify-center w-full py-2 rounded-lg transition-colors font-semibold border bg-emerald-700 border-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 shadow-lg shadow-emerald-800/40"}
        onClick={() => submit()}>
        {/* {wrappingMode === WrappingMode.Wrap ? "Wrap" : "Unwrap"} */}
        {/* text for wrapping with value */}
        {(secretAddress && secretjs && wrappingMode === WrappingMode.Wrap && amount) && (<>
          Wrap <span className="text-xs font-bold mx-1">{amount} {nativeCurrency}</span> into <span className="text-xs font-normal mx-1">{amount} {wrappedCurrency}</span>
        </>)}

        {/* text for unwrapping with value */}
        {(secretAddress && secretjs && wrappingMode === WrappingMode.Unwrap && amount) && (<>
          Unwrap <span className="text-xs font-bold mx-1">{amount} {wrappedCurrency}</span> into <span className="text-xs font-normal mx-1">{amount} {nativeCurrency}</span>
        </>)}

        {/* general text without value */}
        {(!amount || !secretAddress || !secretAddress) && (wrappingMode === WrappingMode.Wrap ? "Wrap" : "Unwrap")}
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
      <div className="w-full max-w-xl mx-auto px-4">
        <div className="border rounded-lg p-7 border-zinc-700 w-full bg-zinc-800 text-zinc-200">

          {/* Header */}
          <div className="mb-4">
            <h1 className="inline text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-500">Secret Wrap</h1>
          </div>


          {/* *** From *** */}

          {/* Title Bar */}
          <div className="flex flex-col sm:flex-row">
            <div className="flex-1 font-bold mb-2 text-center sm:text-left">From</div>
            {!isValidAmount && (
              <div className="flex-initial">
                <div className="text-red-500 text-xs text-center sm:text-right -mb-2">{validationMessage}</div>
              </div>
            )}
          </div>


          {/* Input Field */}
          <div className="flex" id="fromInputWrapper">
            <Select isDisabled={!selectedToken.address || !secretAddress} options={tokens.sort((a, b) => a.name.localeCompare(b.name))} value={selectedToken} onChange={setselectedToken} isSearchable={false}
              formatOptionLabel={token => (
                <div className="flex items-center">
                  <img src={token.image} className="w-5 h-5 mr-2 rounded-full" />
                  <span className="font-bold text-sm">
                    {wrappingMode == WrappingMode.Unwrap && 's'}
                    {token.name}
                  </span>
                </div>
              )} className="react-select-wrap-container" classNamePrefix="react-select-wrap" />
            <input value={amount} onChange={handleInputChange} type="text" className={"focus:z-10 block flex-1 min-w-0 w-full bg-zinc-900 text-white px-4 rounded-r-lg disabled:placeholder-zinc-700 transition-colors" + (!isValidAmount ? "  border border-red-500" : "")} name="fromValue" id="fromValue" placeholder="0" disabled={!secretAddress}/>
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
            <div className="flex">
              <div className="flex-1 font-bold mb-2 text-center sm:text-left">To</div>
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
              <input value={amount} onChange={handleInputChange} type="text" className={"focus:z-10 block flex-1 min-w-0 w-full bg-zinc-900 text-white px-4 rounded-r-lg disabled:placeholder-zinc-700 transition-colors"} name="wrappedValue" id="wrappedValue" placeholder="0" disabled={!selectedToken.address || !secretAddress}/>
            </div>
          </div>
          <div className="flex-1 text-xs mt-3 text-center sm:text-left">
            {wrappingMode === WrappingMode.Wrap && (
              <WrappedTokenBalanceUi/>
            )}
            {wrappingMode === WrappingMode.Unwrap && (
              <NativeTokenBalanceUi/>
            )}
          </div>

          <div className="bg-zinc-900 p-4 rounded-lg select-none flex items-center my-4">
            <FontAwesomeIcon icon={faCircleInfo} className="flex-initial mr-4" />
            <div className="flex-1 text-sm">
              {message}
            </div>
          </div>

          {/* <To/> */}
          <SubmitButton disabled={!selectedToken.address || !secretAddress || !amount || !isValidAmount || amount === "0"} amount={amount} nativeCurrency={selectedToken.name} wrappedAmount={amount} wrappedCurrency={"s" + selectedToken.name} wrappingMode={wrappingMode}/>
        </div>
      </div>
    </>
  )
}
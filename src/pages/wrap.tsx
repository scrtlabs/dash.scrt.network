import React, { useEffect, useState, useRef, useContext, createContext } from "react";
import { Breakpoint } from "react-socks";
import { MsgExecuteContract, SecretNetworkClient } from "secretjs";
import { chains, Token, tokens } from "utils/config";
import { sleep, faucetURL, faucetAddress, viewingKeyErrorString} from "utils/commons";
import { KeplrContext } from "layouts/defaultLayout";
import BigNumber from "bignumber.js";
import { Else, If, Then, When } from "react-if";
import { Flip, ToastContainer, toast} from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownLong, faUpLong, faArrowRightArrowLeft, faCaretDown } from '@fortawesome/free-solid-svg-icons'
import { getKeplrViewingKey, setKeplrViewingKey } from "components/general/Keplr";

import {
  Button,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

export const WrapContext = createContext(null);


export function Wrap() {
  const [price, setPrice] = useState <number>();

  // wrapping mode
  enum WrappingMode {
    Wrap,
    Unwrap
  }

  const [wrappingMode, setWrappingMode] = useState<WrappingMode>(WrappingMode.Wrap);

  // token
  const [chosenToken, setChosenToken] = useState<Token>(tokens.filter(token => token.name === "SCRT")[0]);

  // UI
  const [isNativeTokenPickerVisible, setIsNativeTokenPickerVisible] = useState<boolean>(false);
  const [isWrappedTokenPickerVisible, setIsWrappedTokenPickerVisible] = useState<boolean>(false);

  // input values
  const nativeValue = useRef<any>();
  const wrappedValue = useRef<any>();

  function setAmountByPercentage(percentage: number) {
    if (true) {
      let availableAmount = Number(tokenNativeBalance) * (10**(-chosenToken.decimals));
      let potentialInput = (availableAmount * (percentage * 0.01)).toFixed(chosenToken.decimals);
      if (Number(potentialInput) == 0) {
        nativeValue.current.value = ""
      } else {
        nativeValue.current.value = potentialInput;
      }
    }
  }


  const [useFeegrant, setUseFeegrant] = useState<boolean>(false);

  const [loadingWrapOrUnwrap, setLoadingWrapOrUnwrap] = useState<boolean>(false);
  const [loadingTokenBalance, setLoadingTokenBalance] = useState<boolean>(false);
  const [loadingCoinBalance, setLoadingCoinBalance] = useState<boolean>(false);

  const [tokenNativeBalance, setTokenNativeBalance] = useState<string>("");
  const [tokenWrappedBalance, setTokenWrappedBalance] = useState<string>("");

  const {secretjs, secretAddress} = useContext(KeplrContext);

  async function handleNativePickerChoice(token: Token) {
    if (token != chosenToken) {
      setChosenToken(token);
    }
    setIsNativeTokenPickerVisible(false)
    setIsWrappedTokenPickerVisible(false)

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
  
  const usdString = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const updateTokenBalance = async () => {
    if (!chosenToken.address) {
      return;
    }

    if (!secretjs) {
      return;
    }

    const key = await getKeplrViewingKey(chosenToken.address);
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
        contractAddress: chosenToken.address,
        codeHash: chosenToken.code_hash,
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
      console.error(`Error getting balance for s${chosenToken.name}`, e);

      setTokenWrappedBalance(viewingKeyErrorString);
    }
  };

  let balanceCoin;
  let balanceToken;

  if (chosenToken != null) {
    if (loadingCoinBalance) {
      balanceCoin = (
        <>
          Balance: <CircularProgress size="0.8em" />
        </>
      );
    } else if (chosenToken) {
      balanceCoin = (
        <div>
          <div
            style={{ cursor: !chosenToken.is_snip20 ? "pointer" : "auto" }}
            onClick={() => {
              if (chosenToken.is_snip20) {
                return;
              }
              nativeValue.current.value = new BigNumber(
                tokenNativeBalance!
              )
                .dividedBy(`1e${chosenToken.decimals}`)
                .toFixed();
            }}
          >
          </div>
          <div style={{ display: "flex", opacity: chosenToken.is_snip20 ? 0 : 0.7 }}>
            <>{`Available: ${new BigNumber(tokenNativeBalance!)
                  .dividedBy(`1e${chosenToken.decimals}`)
                  .toFormat()}`} {chosenToken.name}({usdString.format(
              new BigNumber(tokenNativeBalance!)
                .dividedBy(`1e${chosenToken.decimals}`)
                .multipliedBy(Number(price))
                .toNumber()
              )})</>
          </div>
        </div>
      );
    } else {
    }
  } else {
    balanceCoin = (
      <div>
        <div>coming soon</div>
        <div>(🤫)</div>
      </div>
    );
  }

  if (chosenToken != null) {
    if (!secretjs) {
      balanceToken = (
        <>
        </>
      );
    } else if (loadingTokenBalance) {
      balanceToken = (
        <div>
          <div>
            Balance: <CircularProgress size="0.8em" />
          </div>
          <div style={{ opacity: 0 }}>placeholder</div>
        </div>
      );
    } else if (tokenWrappedBalance == viewingKeyErrorString) {
      balanceToken = (
        <div>
          <Tooltip title="Set Viewing Key" placement="top">
            <div
              style={{ cursor: "pointer" }}
              onClick={async () => {
                await setKeplrViewingKey(chosenToken.address);
                try {
                  setLoadingTokenBalance(true);
                  await sleep(1000); // sometimes query nodes lag
                  await updateTokenBalance();
                } finally {
                  setLoadingTokenBalance(false);
                }
              }}
            >
              {`Balance: ${viewingKeyErrorString}`}
            </div>
          </Tooltip>
          <div style={{ opacity: 0 }}>placeholder</div>
        </div>
      );
    } else if (Number(tokenWrappedBalance) > -1) {
      balanceToken = (
        <div>
          <button onClick={() => {wrappedValue.current.value = new BigNumber(tokenWrappedBalance).dividedBy(`1e${chosenToken.decimals}`).toFixed();}}>
            <>{`Available: ${new BigNumber(tokenWrappedBalance!)
                  .dividedBy(`1e${chosenToken.decimals}`)
                  .toFormat()}`}{' s' + chosenToken.name}({usdString.format(
              new BigNumber(tokenNativeBalance!)
                .dividedBy(`1e${chosenToken.decimals}`)
                .multipliedBy(Number(price))
                .toNumber()
              )})</>
          </button>
        </div>
      );
    }
  } else {
    balanceToken = (
      <div>
        <div>coming soon</div>
        <div style={{ display: "flex", placeContent: "flex-end" }}>(🤫)</div>
      </div>
    );
  }

  const updateCoinBalance = async () => {

    const url = `${chains["Secret Network"].lcd}/cosmos/bank/v1beta1/balances/${secretAddress}`;
    try {
      const {
        balances,
      }: {
        balances: Array<{ denom: string; amount: string }>;
      } = await (await fetch(url)).json();

      const denoms = Array.from(
        new Set(
          tokens.map((t) => t.withdrawals.map((w) => w.from_denom)).flat()
        )
      );

      for (const denom of denoms.filter((d) => !d.startsWith("secret1"))) {
        const balance_tmp = balances.find((c) => c.denom === denom)?.amount || "0";
        if (denom == chosenToken.withdrawals[0]?.from_denom) { 
          setTokenNativeBalance(balance_tmp);
        }
      }
    } catch (e) {
      console.error(`Error while trying to query ${url}:`, e);
    }
  }
  useEffect(() => {
    if (!secretjs || !secretAddress) {
      return;
    }

    const interval = setInterval(handleNativePickerChoice, 10_000, chosenToken);

    (async () => {
      handleNativePickerChoice(chosenToken);
    })();

    return () => {
      clearInterval(interval);
    };
  }, [secretAddress, secretjs, chosenToken]);

  useEffect(() => {
    fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${chosenToken.coingecko_id}&vs_currencies=USD`
    )
      .then((resp) => resp.json())
      .then((result: { [coingecko_id: string]: { usd: number } }) => {
        setPrice(result[chosenToken.coingecko_id].usd);
      });
  }, []);
  
  return (
    <>
      <div className="w-full max-w-xl mx-auto px-4">
        <div className="border rounded-lg p-12 pb-7 border-zinc-700 w-full bg-zinc-800 text-zinc-200">

          {/* header */}
          <div className="mb-4">
            <h1 className="inline text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-4">Secret Wrap</h1>

          </div>
          <p className="mb-10">
            Wrapping coins as secret tokens immediately supercharges them with private balances and private transfers.
          </p>
        
          
          <div className="space-y-6">
            <div>
              <div className="flex">
                <button onClick={() => setIsNativeTokenPickerVisible(!isNativeTokenPickerVisible)} className="hover:bg-zinc-700 active:bg-zinc-800 transition-colors inline-flex items-center px-3 text-sm font-semibold bg-zinc-800 rounded-l-md border border-r-0 border-zinc-900 text-zinc-400 focus:bg-zinc-700">
                  <img src={chosenToken.image} alt={chosenToken.name} className="w-7 h-7 mr-2"/>
                  {chosenToken.name}
                  <FontAwesomeIcon icon={faCaretDown} className="ml-2" />
                </button>
                { isNativeTokenPickerVisible &&
                  <ul className="overflow-y-scroll scrollbar-hide h-64 text-white z-5 mt-16 rounded bg-black ring-1 ring-zinc-800 w-96 absolute left-1/2">
                    {tokens.map(token => (
                      <li className="cursor-pointer select-none p-2 hover:bg-zinc-800 flex items-center" onClick={() => handleNativePickerChoice(token)} key={token.name}>
                        <img src={token.image} alt="Logo" className="w-7 h-7 mr-2"/>
                        {token.name}
                      </li>
                    ))}
                    {/* <li className="cursor-pointer select-none p-2 hover:bg-zinc-800 flex items-center">
                      <img :src="'img/' + service.image" alt="Logo" className="w-7 h-7 mr-2">
                      <span>xx</span>
                    </li> */}
                  </ul>
                }

                <input ref={nativeValue} type="text" className="block flex-1 min-w-0 w-full bg-zinc-900 text-white p-4 rounded-r-md" name="nativeValue" id="nativeValue" placeholder="Amount" disabled={chosenToken.address === "" || chosenToken.is_snip20}/>

              </div>

              
              <div className="flex items-center mt-3">
                <div className="flex-1 text-sm">
                <div className="text-xs">{balanceCoin}</div>
                  {/* <button className="text-zinc-400">Balance: XX XX</button> */}
                </div>
              </div>
            </div>

            <div className="inline-flex rounded-full text-xs">
              <button onClick={() => setAmountByPercentage(25)} className="py-0.5 px-1.5 font-medium rounded-l-full border focus:z-10 focus:ring-2 bg-zinc-800 border-zinc-600 text-white hover:text-black hover:bg-white active:bg-zinc-300 transition-colors">
                25%
              </button>
              <button onClick={() => setAmountByPercentage(50)} className="py-0.5 px-1.5 font-medium border-t border-b focus:z-10 focus:ring-2 bg-zinc-800 border-zinc-600 text-white hover:text-black hover:bg-white active:bg-zinc-300 transition-colors">
                50%
              </button>
              <button onClick={() => setAmountByPercentage(75)} className="py-0.5 px-1.5 font-medium border-t border-b focus:z-10 focus:ring-2 bg-zinc-800 border-zinc-600 text-white hover:text-black hover:bg-white active:bg-zinc-300 transition-colors">
                75%
              </button>
              <button onClick={() => setAmountByPercentage(100)} className="py-0.5 px-1.5 font-medium rounded-r-full border focus:z-10 focus:ring-2 bg-zinc-800 border-zinc-600 text-white hover:text-black hover:bg-white active:bg-zinc-300 transition-colors">
                Max
              </button>
            </div>


            {/* Wrap / Unwrap Buttons */}
            <div className="space-x-4 text-center">
              <button onClick={() => setWrappingMode(WrappingMode.Wrap)} className={"py-1 px-3 font-semibold rounded-md border transition-colors" + (wrappingMode === WrappingMode.Wrap ? "border border-blue-500 bg-blue-500/40" : "hover:bg-zinc-700 active:bg-zinc-700")}><FontAwesomeIcon icon={faDownLong} className="mr-2" />Wrap</button>
              <button onClick={() => setWrappingMode(WrappingMode.Unwrap)} className={"py-1 px-3 font-semibold rounded-md border transition-colors" + (wrappingMode !== WrappingMode.Wrap ? "border border-blue-500 bg-blue-500/40" : "hover:bg-zinc-700 active:bg-zinc-700")}><FontAwesomeIcon icon={faUpLong} className="mr-2" />Unwrap</button>
            </div>

            <div className="flex">
                <button onClick={() => setIsWrappedTokenPickerVisible(!isWrappedTokenPickerVisible)} className="inline-flex items-center px-3 text-sm font-semibold bg-zinc-800 rounded-l-md border border-r-0 border-zinc-900 text-zinc-400 focus:border-zinc-900 focus:ring-zinc-900 focus:ring-4 focus:outline-none">
                  <img src={chosenToken.image} alt={chosenToken.name} className="w-7 h-7 mr-2" />
                  {!chosenToken.is_snip20 ? "s" : ""}{chosenToken.name}
                  <FontAwesomeIcon icon={faCaretDown} className="ml-2" />
                </button>
                
                <input ref={wrappedValue} type="text" className="block flex-1 min-w-0 w-full bg-zinc-900 text-white p-4 rounded-r-md" name="wrappedValue" id="wrappedValue" placeholder="Amount" disabled={chosenToken.address === "" || chosenToken.is_snip20}/>
            </div>
            { isWrappedTokenPickerVisible &&
              <ul className="overflow-y-scroll scrollbar-hide h-64 text-white z-2 absolute mt-16 rounded bg-black ring-1 ring-zinc-800 left-0 right-0 mx-12">
                {tokens.map(token => (
                  <li className="cursor-pointer select-none p-2 hover:bg-zinc-800 flex items-center" onClick={() => handleNativePickerChoice(token)} key={token.name}>
                    <img src={token.image} alt="Logo" className="w-7 h-7 mr-2"/>
                    {!token.is_snip20 ? "s" : ""}{token.name}
                  </li>
                ))}
                {/* <li className="cursor-pointer select-none p-2 hover:bg-zinc-800 flex items-center">
                  <img :src="'img/' + service.image" alt="Logo" className="w-7 h-7 mr-2">
                  <span>xx</span>
                </li> */}
              </ul>
            }

              <div className="text-sm space-x-3">
                <div
        style={{
          display: "flex",
          placeItems: "center",
          gap: "0.8rem",
          borderRadius: 20,
        }}>
        <div
          style={{
            display: "flex",
            width: 200,
            height: 20,
            placeContent: "flex-start",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              placeItems: "flex-end",
            }}
          >
            <div className="text-xs">
              <div>{balanceToken}</div>
              <When condition={chosenToken.address && secretAddress}>
                <Tooltip title="Refresh Balance" placement="top">
                  <Button
                    style={{
                      display: loadingTokenBalance ? "none" : undefined,
                    }}
                    onClick={async () => {
                      try {
                        setLoadingTokenBalance(true);
                        await updateTokenBalance();
                      } finally {
                        setLoadingTokenBalance(false);
                      }
                    }}
                  >
                    <RefreshIcon sx={{ height: "0.7em" }} />
                  </Button>
                </Tooltip>
              </When>
            </div>
          </div>
        </div>
        <span style={{ flex: 1 }}></span>
      </div>
              </div>
              
              <div>
                <button
                  disabled={chosenToken.address === "" || chosenToken.is_snip20}
                  className="w-full py-3 px-3 bg-emerald-500/50 rounded border border-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 transition-colors font-semibold"
                  onClick={async () => {
                    if (!secretjs || !secretAddress) {
                      return;
                    }
                    const baseAmount = wrappingMode === WrappingMode.Unwrap ? nativeValue?.current?.value : wrappedValue?.current?.value
                    const amount = new BigNumber(baseAmount)
                    .multipliedBy(`1e${chosenToken.decimals}`)
                    .toFixed(0, BigNumber.ROUND_DOWN);
                      if (amount === "NaN") {
                        console.error("NaN amount", baseAmount);
                      return;
                    }
                  try {
                    setLoadingWrapOrUnwrap(true);
                    const toastId = toast.loading(
                      wrappingMode === WrappingMode.Unwrap ? `Wrapping ${chosenToken.name}` : `Unwrapping ${chosenToken.name}`,
                      {
                        closeButton: true,
                      }
                    );
                    if (wrappingMode === WrappingMode.Unwrap) {
                      const tx = await secretjs.tx.broadcast(
                        [
                          new MsgExecuteContract({
                            sender: secretAddress,
                            contractAddress: chosenToken.address,
                            codeHash: chosenToken.code_hash,
                            sentFunds: [
                              { denom: chosenToken.withdrawals[0].from_denom, amount },
                            ],
                            msg: { deposit: {} },
                          }),
                        ],
                        {
                          gasLimit: 150_000,
                          gasPriceInFeeDenom: 0.25,
                          feeDenom: "uscrt",
                        }
                      );
          
                      if (tx.code === 0) {
                        nativeValue.current.value = "";
                        toast.update(toastId, {
                          render: `Wrapped ${chosenToken.name} successfully`,
                          type: "success",
                          isLoading: false,
                          closeOnClick: true,
                        });
                        console.log(`Wrapped successfully`);
                      } else {
                        toast.update(toastId, {
                          render: `Wrapping of ${chosenToken.name} failed: ${tx.rawLog}`,
                          type: "error",
                          isLoading: false,
                          closeOnClick: true,
                        });
                        console.error(`Tx failed: ${tx.rawLog}`);
                      }
                    }
                    else {
                      const tx = await secretjs.tx.broadcast(
                        [
                          new MsgExecuteContract({
                            sender: secretAddress,
                            contractAddress: chosenToken.address,
                            codeHash: chosenToken.code_hash,
                            sentFunds: [],
                            msg: {
                              redeem: {
                                amount,
                                denom:
                                  chosenToken.name === "SCRT"
                                    ? undefined
                                    : chosenToken.withdrawals[0].from_denom,
                              },
                            },
                          }),
                        ],
                        {
                          gasLimit: 150_000,
                          gasPriceInFeeDenom: 0.25,
                          feeDenom: "uscrt",
                          feeGranter: useFeegrant ? faucetAddress : "",
                        }
                      );
                      if (tx.code === 0) {
                        wrappedValue.current.value = "";
                        toast.update(toastId, {
                          render: `Unwrapped ${chosenToken.name} successfully`,
                          type: "success",
                          isLoading: false,
                          closeOnClick: true,
                        });
                        console.log(`Unwrapped successfully`);
                      } else {
                        toast.update(toastId, {
                          render: `Unwrapping of ${chosenToken.name} failed: ${tx.rawLog}`,
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
                }}>
                  {loadingWrapOrUnwrap ? (<svg className="inline-block animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>) : ''} <FontAwesomeIcon icon={faArrowRightArrowLeft} className="mr-2"/>{wrappingMode === WrappingMode.Unwrap ? "Execute Wrapping" : "Execute Unwrapping"}
                </button>
              </div>
          </div>
        </div>
      </div>
      <Breakpoint medium up>
        <ToastContainer
          position="bottom-left"
          autoClose={5000}
          hideProgressBar
          newestOnTop={true}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable={false}
          pauseOnHover={true}
          theme="dark"
        />
      </Breakpoint>
      <Breakpoint small down>
        <ToastContainer 
          position={"bottom-left"}
          autoClose={false}
          hideProgressBar={true}
          closeOnClick={true}
          draggable={false}
          theme={"dark"}
          transition={Flip}
        />
      </Breakpoint>
    </>
  );
}
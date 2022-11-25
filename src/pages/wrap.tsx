import React, { useEffect, useState, useRef, useContext} from "react";
import { Breakpoint } from "react-socks";
import { MsgExecuteContract, SecretNetworkClient } from "secretjs";
import { chains, Token, tokens } from "config/config";
import { sleep, faucetURL , faucetAddress} from "config/commons";
import {KeplrContext} from "layouts/defaultLayout";
import {
  Button,
  CircularProgress,
  Input,
} from "@mui/material";
import BigNumber from "bignumber.js";
import { Flip, ToastContainer, toast} from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faDownLong, faUpLong, faArrowRightArrowLeft, faCaretDown, faBoltLightning, faLock, faRotateRight} from '@fortawesome/free-solid-svg-icons'
import {SingleTokenWrapped, SingleTokenNative} from "../components/SingleToken";

export function Wrap() {
  const [balances, setBalances] = useState<Map<string, string>>(new Map());
  const [prices, setPrices] = useState<Map<string, number>>(new Map());
  const [loadingCoinBalances, setLoadingCoinBalances] =
    useState<boolean>(false);
  const [useFeegrant, setUseFeegrant] = useState<boolean>(false);
  const [chosenToken, setChosenToken] = useState<Token>(tokens.filter(token => token.name === "SCRT")[0]);
  const [isWrapping, setIsWrapping] = useState<boolean>(true);
  const [isNativeTokenPickerVisible, setIsNativeTokenPickerVisible] = useState<boolean>(false);
  const [isWrappedTokenPickerVisible, setIsWrappedTokenPickerVisible] = useState<boolean>(false);
  const nativeValue = useRef<any>();
  const wrappedValue = useRef<any>();
  const [isDepositWithdrawDialogOpen, setIsDepositWithdrawDialogOpen] =
  useState<boolean>(true);
  const [loadingWrapOrUnwrap, setLoadingWrapOrUnwrap] =
  useState<boolean>(false);

  const {secretjs, secretAddress} = useContext(KeplrContext);

  function handleNativePickerChoice(token: Token) {
    if (token != chosenToken) {
      setChosenToken(token);
    }
    setIsNativeTokenPickerVisible(false)
    setIsWrappedTokenPickerVisible(false)
  }
  
  const updateFeeGrantButton = (text : string, color : string) => {
    let btnFeeGrant = document.getElementById('grantButton');
    if (btnFeeGrant != null) {
      btnFeeGrant.style.color = color;
      btnFeeGrant.textContent = text;
    }
  }
  const updateCoinBalances = async () => {
    const newBalances = new Map<string, string>(balances);

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
        const balance = balances.find((c) => c.denom === denom)?.amount || "0";
        newBalances.set(denom, balance);
      }
    } catch (e) {
      console.error(`Error while trying to query ${url}:`, e);
    }

    if (newBalances.get("uscrt") == "0" && useFeegrant == false) {
      try {
        const response = await fetch(faucetURL, {
          method: 'POST',
          body: JSON.stringify({"Address": secretAddress}),
          headers: {'Content-Type': 'application/json'}
        });
        const result = await response;
        const textBody = await result.text();
        if (result.ok == true) {
          updateFeeGrantButton("Fee Granted for unwrapping","green");
          toast.success(`Your wallet does not have any SCRT to pay for transaction costs. Successfully sent new fee grant (0.1 SCRT) for unwrapping tokens to address ${secretAddress}`);
        } else if (textBody == "Existing Fee Grant did not expire\n") {
          updateFeeGrantButton("Fee Granted for unwrapping","green");
          toast.success(`Your wallet does not have any SCRT to pay for transaction costs. Your address ${secretAddress} however does already have an existing fee grant which will be used for unwrapping`);
        } else {
          updateFeeGrantButton("Fee Grant failed","red");
          toast.error(`Fee Grant for address ${secretAddress} failed with status code: ${result.status}`);
        }
        setUseFeegrant(true);
      }
      catch(e) {
        updateFeeGrantButton("Fee Grant failed","red");
        toast.error(`Fee Grant for address ${secretAddress} failed with error: ${e}`);
      }
      }
    setBalances(newBalances);
  };

  useEffect(() => {
    if (!secretjs || !secretAddress) {
      return;
    }

    const interval = setInterval(updateCoinBalances, 10_000);

    (async () => {
      setLoadingCoinBalances(true);
      await updateCoinBalances();
      setLoadingCoinBalances(false);
    })();

    return () => {
      clearInterval(interval);
    };
  }, [secretAddress, secretjs, useFeegrant]);

  useEffect(() => {
    fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokens
        .map((t) => t.coingecko_id)
        .join(",")}&vs_currencies=USD`
    )
      .then((resp) => resp.json())
      .then((result: { [coingecko_id: string]: { usd: number } }) => {
        const prices = new Map<string, number>();
        for (const token of tokens) {
          if (result[token.coingecko_id]) {
            prices.set(token.name, result[token.coingecko_id].usd);
          }
        }
        setPrices(prices);
      });
  }, []);
  
  return (
    <>
      <div className="w-full max-w-xl mx-auto px-4">
        <div className="border rounded-lg p-12 pb-7 border-zinc-700 w-full bg-zinc-800 text-zinc-200">

          {/* header */}
          <div className="mb-4">
            <h1 className="inline text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-4">Enable Privacy</h1>

          </div>
          <p className="mb-10">
            Wrapping coins as secret tokens immediately supercharges them with private balances and private transfers.
          </p>
        
          
          <div className="space-y-6">
            <div>
              <div className="flex">
                <button onClick={() => setIsNativeTokenPickerVisible(!isNativeTokenPickerVisible)} className="inline-flex items-center px-3 text-sm font-semibold bg-zinc-800 rounded-l-md border border-r-0 border-zinc-800 text-zinc-400 focus:border-zinc-900 focus:ring-zinc-900 focus:ring-4 focus:outline-none">
                  <img src={chosenToken.image} alt={chosenToken.name} className="w-7 h-7 mr-2"/>
                  {chosenToken.name}
                  <FontAwesomeIcon icon={faCaretDown} className="ml-2" />
                </button>

                
                { isNativeTokenPickerVisible &&
                  <ul className="overflow-y-scroll scrollbar-hide h-64 text-white z-2 absolute mt-16 rounded bg-black ring-1 ring-zinc-800 left-0 right-0 mx-12">
                    {tokens.map(token => (
                      <li className="cursor-pointer select-none p-2 hover:bg-zinc-800 flex items-center" onClick={() => handleNativePickerChoice(token)} key={token.name}>
                        <img src={token.image} alt="Logo" className="w-7 h-7 mr-2"/>
                        {token.name}
                      </li>
                    ))}
                    {/* <li className="cursor-pointer select-none p-2 hover:bg-zinc-800 flex items-center">
                      <img :src="'img/' + service.image" alt="Logo" class="w-7 h-7 mr-2">
                      <span>xx</span>
                    </li> */}
                  </ul>
                }

                <Input
                name="nativeValue" id="nativeValue" className="block flex-1 min-w-0 w-full bg-zinc-900 text-white p-4 rounded-r-md"
                disabled={chosenToken.address === "" || chosenToken.is_snip20}
                placeholder="Amount"
                inputProps={{
                style: {
                  color: "white",
                  textAlign: "center",
                  textOverflow: "ellipsis",
              },
              }}
              inputRef={nativeValue}
              autoComplete="off"
              />
              </div>

              
                <div className="flex items-center mt-3">
                  <div className="flex-1 text-sm">
                    <SingleTokenNative
                    loadingCoinBalances={loadingCoinBalances}
                    secretAddress={secretAddress}
                    secretjs={secretjs}
                    balances={balances}
                    price={prices.get(chosenToken.name) || 0}
                    token={chosenToken}
                    />
                    {/* <button className="text-zinc-400">Balance: XX XX</button> */}
                  </div>
                </div>
            </div>
            <div className="space-x-4 text-center">
              <button onClick={() => setIsWrapping(true)} className={"py-1 px-3 rounded border transition-colors font-semibold" + (isWrapping ? "border border-blue-500 bg-blue-500/40" : "hover:bg-zinc-700 active:bg-zinc-800")}><FontAwesomeIcon icon={faDownLong} className="mr-2" />Wrap</button>
              <button onClick={() => setIsWrapping(false)} className={"py-1 px-3 rounded border transition-colors font-semibold" + (!isWrapping ? "border border-blue-500 bg-blue-500/40" : "hover:bg-zinc-700 active:bg-zinc-800")}><FontAwesomeIcon icon={faUpLong} className="mr-2" />Unwrap</button>
            </div>
            
            <Button
        disabled={!secretAddress}
        variant="text"
        id="grantButton"
        onClick={async () => {
            fetch(faucetURL, {
            method: 'POST',
            body: JSON.stringify({ "Address": secretAddress }),
            headers: { 'Content-Type': 'application/json' }
          }).then(async (result) => {
            const textBody = await result.text();
            console.log(textBody);
            if (result.ok == true) {
              updateFeeGrantButton("Fee Granted for unwrapping","green");
              toast.success(`Successfully sent new fee grant (0.1 SCRT) for unwrapping tokens to address ${secretAddress}`);
            } else if (textBody == "Existing Fee Grant did not expire\n") {
              updateFeeGrantButton("Fee Granted for unwrapping","green");
              toast.success(`Your address ${secretAddress} already has an existing fee grant which will be used for unwrapping tokens`);
            } else {
              updateFeeGrantButton("Fee Grant failed","red");
              toast.error(`Fee Grant for address ${secretAddress} failed with status code: ${result.status}`);
            }
            setUseFeegrant(true);
          }).catch((error) => { 
              updateFeeGrantButton("Fee Grant failed","red");
              toast.error(`Fee Grant for address ${secretAddress} failed with error: ${error}`);
            });
          }
        }
      >
      Grant Fee for unwrapping (0.1 SCRT)
      </Button>
          
            <div className="flex">
                <button onClick={() => setIsWrappedTokenPickerVisible(!isWrappedTokenPickerVisible)} className="inline-flex items-center px-3 text-sm font-semibold bg-zinc-800 rounded-l-md border border-r-0 border-zinc-800 text-zinc-400 focus:border-zinc-900 focus:ring-zinc-900 focus:ring-4 focus:outline-none">
                  <img src={chosenToken.image} alt={chosenToken.name} className="w-7 h-7 mr-2" />
                  {!chosenToken.is_snip20 ? "s" : ""}{chosenToken.name}
                  <FontAwesomeIcon icon={faCaretDown} className="ml-2" />
                </button>

                <Input
                name="wrappedValue" id="wrappedValue" className="block flex-1 min-w-0 w-full bg-zinc-900 text-white p-4 rounded-r-md"
                disabled={chosenToken.address === "" || chosenToken.is_snip20}
                placeholder="Amount"
                inputProps={{
                style: {
                  color: "white",
                  textAlign: "center",
                  textOverflow: "ellipsis",
              },
              }}
              inputRef={wrappedValue}
              autoComplete="off"
              />
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
                  <img :src="'img/' + service.image" alt="Logo" class="w-7 h-7 mr-2">
                  <span>xx</span>
                </li> */}
              </ul>
            }

              <div className="text-sm space-x-3">
                <SingleTokenWrapped
                loadingCoinBalances={loadingCoinBalances}
                secretAddress={secretAddress}
                secretjs={secretjs}
                balances={balances}
                price={prices.get(chosenToken.name) || 0}
                token={chosenToken}
                />
                {/* <button className="text-zinc-400">Balance: XX XX</button> */}
              </div>
              
              <div>
                <button
                  disabled={chosenToken.address === "" || chosenToken.is_snip20}
                  className="w-full py-3 px-3 bg-emerald-500/50 rounded border border-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 transition-colors font-semibold"
                  onClick={async () => {
                    if (!secretjs || !secretAddress) {
                      return;
                    }
                    const baseAmount = isWrapping ? nativeValue?.current?.value : wrappedValue?.current?.value
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
                    isWrapping ? `Wrapping ${chosenToken.name}` : `Unwrapping ${chosenToken.name}`,
                    {
                      closeButton: true,
                    }
                  );
                  if (isWrapping) {
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
              setLoadingCoinBalances(true);
              await sleep(1000); // sometimes query nodes lag
              await updateCoinBalances();
            } finally {
              setLoadingCoinBalances(false);
            }
          }
        }}
      >
      {loadingWrapOrUnwrap ? (<CircularProgress size="0.8em" />) : <FontAwesomeIcon icon={faArrowRightArrowLeft} className="mr-2"/>} {isWrapping ? "Execute Wrapping" : "Execute Unwrapping"}
      </button>
            </div>
          </div>
        </div>
      </div>
      <Breakpoint medium up>
        <ToastContainer
          style={{ width: "450px" }}
          position={"top-left"}
          autoClose={false}
          hideProgressBar={true}
          closeOnClick={true}
          draggable={false} 
          theme={"dark"}
          transition={Flip}
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
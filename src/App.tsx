import React, { useState, useEffect, MutableRefObject, useRef } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { BigNumber } from "bignumber.js";
import { isMobile } from "react-device-detect";

import { SigningCosmWasmClient } from "secretjs";
import { StdFee } from "secretjs/types/types";
import { Window as KeplrWindow } from "@keplr-wallet/types";
import {
  getKeplrViewingKey,
  KeplrPanel,
  setKeplrViewingKeys as setKeplrViewingKey,
} from "./KeplrStuff";
declare global {
  interface Window extends KeplrWindow {}
}

import tokens from "./tokens.json";

import CircularProgress from "@mui/material/CircularProgress";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

const footerHeight = "1.8rem";

ReactDOM.render(
  <React.StrictMode>
    {/* <div style={{ minHeight: `calc(100vh - ${footerHeight})` }}> */}
    <App />
    {/* </div>
    <footer
      style={{
        height: footerHeight,
        width: "100%",
        backgroundColor: "#e7e7e7",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        left: 0,
        bottom: 0,
        gap: "0.3em",
      }}
    >
      <Avatar
        src="/scrt.svg"
        sx={{
          width: "1em",
          height: "1em",
        }}
      />
      <span>Powered by Secret Network</span>
    </footer> */}
  </React.StrictMode>,
  document.getElementById("root")
);

const viewingKeyErroString = "🧐";
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function App() {
  const [secretjs, setSecretjs] = useState<SigningCosmWasmClient | null>(null);
  const [myAddress, setMyAddress] = useState<string | null>(null);
  const [balances, setBalances] = useState<Map<string, string>>(new Map());
  const [loadingBalances, setLoadingBalances] = useState<boolean>(false);
  const inputRefs = new Map<string, any>();

  for (const { name } of tokens) {
    inputRefs.set(name, useRef());
  }

  const updateBalances = async () => {
    if (!secretjs || !myAddress) {
      return;
    }

    const account = await secretjs.getAccount(myAddress);
    if (!account) {
      return;
    }

    const balances = new Map<string, string>();

    for (const b of account.balance) {
      balances.set(b.denom, b.amount);
    }

    for (const { address, code_hash } of tokens) {
      if (!address) {
        continue;
      }

      const key = await getKeplrViewingKey(address);
      if (!key) {
        balances.set(address, viewingKeyErroString);
        continue;
      }

      try {
        const result = await secretjs.queryContractSmart(
          address,
          {
            balance: { address: myAddress, key },
          },
          undefined,
          code_hash
        );
        if (result.viewing_key_error) {
          balances.set(address, viewingKeyErroString);
          continue;
        }
        balances.set(address, result.balance.amount);
      } catch (e) {
        balances.set(address, viewingKeyErroString);
        continue;
      }
    }

    setBalances(balances);
  };

  useEffect(() => {
    if (!secretjs || !myAddress) {
      return;
    }

    const interval = setInterval(updateBalances, 10000);

    (async () => {
      setLoadingBalances(true);
      await updateBalances();
      setLoadingBalances(false);
    })();

    return () => {
      clearInterval(interval);
    };
  }, [myAddress, secretjs]);

  return (
    <div style={{ padding: "0.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          minHeight: "3rem",
        }}
      >
        <KeplrPanel
          secretjs={secretjs}
          setSecretjs={setSecretjs}
          myAddress={myAddress}
          setMyAddress={setMyAddress}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h2" component="div" align="center">
          Get Privacy
        </Typography>
        <Typography component="div" align="center">
          Wrapping Coins as Secret Tokens immediately supercharges them with
          private balances and private transfers.
        </Typography>
        <br />
        {tokens.map((t) => {
          let isDisabled = true;
          if (t.address) {
            isDisabled = false;
          }

          let balance;
          let secretBalance;
          if (!t.address) {
            if (isMobile) {
              balance = <>soon</>;
              secretBalance = <>soon</>;
            } else {
              balance = <>coming soon</>;
              secretBalance = <>coming soon</>;
            }
          } else {
            if (loadingBalances) {
              balance = (
                <span>
                  Balance: <CircularProgress size="0.8em" />
                </span>
              );
              secretBalance = (
                <span>
                  Balance: <CircularProgress size="0.8em" />
                </span>
              );
            } else if (balances.get(t.denom)) {
              balance = (
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    const ref = inputRefs.get(t.name);

                    ref.current.value = new BigNumber(
                      balances.get(t.denom) as string
                    )
                      .dividedBy(`1e${t.decimals}`)
                      .toFixed();
                    console.log(ref.current.value);
                  }}
                >
                  Balance:{" "}
                  {new BigNumber(balances.get(t.denom) as string)
                    .dividedBy(`1e${t.decimals}`)
                    .toFormat()}
                </span>
              );

              if (balances.get(t.address) == viewingKeyErroString) {
                secretBalance = (
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setKeplrViewingKey(t.address);
                    }}
                  >
                    Balance:{` ${viewingKeyErroString}`}
                  </span>
                );
              } else {
                secretBalance = (
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      const ref = inputRefs.get(t.name);

                      ref.current.value = new BigNumber(
                        balances.get(t.address) as string
                      )
                        .dividedBy(`1e${t.decimals}`)
                        .toFixed();
                      console.log(ref.current.value);
                    }}
                  >
                    Balance:{" "}
                    {new BigNumber(balances.get(t.address) as string)
                      .dividedBy(`1e${t.decimals}`)
                      .toFormat()}
                  </span>
                );
              }
            } else {
              if (isMobile) {
                balance = <></>;
                secretBalance = <></>;
              } else {
                balance = <>Balance: connect wallet</>;
                secretBalance = <>Balance: connect wallet</>;
              }
            }
          }

          return (
            <div
              key={t.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "1rem",
                borderRadius: 20,
                width: isMobile ? "100%" : undefined,
              }}
            >
              <Avatar
                src={t.image}
                sx={{
                  width: 28,
                  height: 28,
                  boxShadow: "rgba(0, 0, 0, 0.15) 0px 6px 10px",
                }}
              />
              <div
                style={{
                  display: "flex",
                  width: isMobile ? undefined : 125,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <span>{t.name}</span>
                  <span style={{ fontSize: "0.75rem" }}>{balance}</span>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <Button
                  size="small"
                  variant="text"
                  startIcon={<KeyboardArrowLeftIcon />}
                  disabled={isDisabled}
                  style={{ minWidth: 0 }}
                  onClick={() => {
                    if (!secretjs || !myAddress) {
                      return;
                    }

                    const ref = inputRefs.get(t.name);

                    const amount = new BigNumber(ref.current.value)
                      .multipliedBy(`1e${t.decimals}`)
                      .toFixed(0);

                    if (amount === "NaN") {
                      console.error("NaN amount", ref.current.value);
                      return;
                    }

                    secretjs.execute(
                      t.address,
                      { redeem: { amount } },
                      "",
                      [],
                      getFeeForExecute(250_000),
                      t.code_hash
                    );
                  }}
                >
                  {isMobile ? "" : "Unwrap"}
                </Button>
                <TextField
                  // TODO add input validation
                  placeholder="Amount"
                  inputProps={{
                    style: {
                      textAlign: "center",
                      textOverflow: "ellipsis",
                    },
                  }}
                  variant="standard"
                  disabled={isDisabled}
                  inputRef={inputRefs.get(t.name)}
                />
                <Button
                  size="small"
                  variant="text"
                  endIcon={<KeyboardArrowRightIcon />}
                  style={{ minWidth: 0 }}
                  disabled={isDisabled}
                  onClick={() => {
                    if (!secretjs || !myAddress) {
                      return;
                    }

                    const ref = inputRefs.get(t.name);

                    const amount = new BigNumber(ref.current.value)
                      .multipliedBy(`1e${t.decimals}`)
                      .toFixed(0);

                    if (amount === "NaN") {
                      console.error("NaN amount", ref.current.value);
                      return;
                    }

                    secretjs.execute(
                      t.address,
                      { deposit: {} },
                      "",
                      [{ denom: t.denom, amount }],
                      getFeeForExecute(250_000),
                      t.code_hash
                    );
                  }}
                >
                  {isMobile ? "" : "Wrap"}
                </Button>
              </div>
              <div
                style={{
                  display: "flex",
                  width: isMobile ? undefined : 125,
                  justifyContent: "flex-end",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                  }}
                >
                  <span>s{t.name}</span>
                  <span style={{ fontSize: "0.75rem" }}>{secretBalance}</span>
                </div>
              </div>
              <Avatar
                src={t.image}
                sx={{
                  width: 28,
                  height: 28,
                  boxShadow: "rgba(0, 0, 0, 0.15) 0px 6px 10px",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const gasPriceUscrt = 0.25;
export function getFeeForExecute(gas: number): StdFee {
  return {
    amount: [
      { amount: String(Math.floor(gas * gasPriceUscrt) + 1), denom: "uscrt" },
    ],
    gas: String(gas),
  };
}

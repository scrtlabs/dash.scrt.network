import React, { useState, useEffect, useRef } from "react";
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

import tokens from "./config.json";

import CircularProgress from "@mui/material/CircularProgress";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";

const footerHeight = "1.8rem";

ReactDOM.render(
  <React.StrictMode>
    <div style={{ minHeight: `calc(100vh - ${footerHeight})` }}>
      <App />
    </div>
    <a
      href="https://SCRT.network"
      target="_blank"
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
        textDecoration: "none",
      }}
    >
      <Avatar
        src="/scrt.svg"
        sx={{
          width: "1em",
          height: "1em",
        }}
      />
      <span
        style={{
          color: "black",
        }}
      >
        Powered by Secret Network
      </span>
    </a>
  </React.StrictMode>,
  document.getElementById("root")
);

const viewingKeyErroString = "🧐";
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function App() {
  const [secretjs, setSecretjs] = useState<SigningCosmWasmClient | null>(null);
  const [myAddress, setMyAddress] = useState<Map<string, string>>(new Map());
  const [balances, setBalances] = useState<Map<string, string>>(new Map());
  const [loadingBalances, setLoadingBalances] = useState<boolean>(false);
  const inputRefs = new Map<string, any>();

  for (const { name } of tokens) {
    inputRefs.set(name, useRef());
  }

  const updateBalances = async () => {
    if (!secretjs) {
      return;
    }

    const balances = new Map<string, string>();

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
            balance: { address: myAddress.get("secret"), key },
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

    for (const { source_denom, prefix, lcd } of tokens) {
      if (!myAddress.has(prefix)) {
        continue;
      }

      const url = `${lcd}/bank/balances/${myAddress.get(prefix)}`;
      try {
        const response = await fetch(url);
        const result: {
          height: string;
          result: Array<{ denom: string; amount: string }>;
        } = await response.json();

        const balance =
          result.result.find((c) => c.denom === source_denom)?.amount || "0";

        balances.set(source_denom, balance);

        // balances.set(source_denom, result.balance.amount);
      } catch (e) {
        console.error(`Error while trying to query ${url}:`, e);
        continue;
      }
    }
    console.log(balances);
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
          // let isDisabled = true;
          // if (t.address) {
          //   isDisabled = false;
          // }

          let balanceOnSource;
          let balanceOnSN;
          let BalanceToken;

          if (loadingBalances) {
            balanceOnSN = (
              <span>
                Balance: <CircularProgress size="0.8em" />
              </span>
            );
            BalanceToken = (
              <span>
                Balance: <CircularProgress size="0.8em" />
              </span>
            );
          } else if (balances.get(t.denom)) {
            balanceOnSN = (
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
              BalanceToken = (
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
              BalanceToken = (
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
            balanceOnSN = <>connect wallet</>;
            BalanceToken = <>connect wallet</>;
          }

          return (
            <div
              key={t.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
                padding: "1rem",
                borderRadius: 20,
                width: isMobile ? "100%" : undefined,
              }}
            >
              <Avatar
                src={t.image}
                sx={{
                  width: 40,
                  height: 40,
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
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: "0.5em",
                    }}
                  >
                    <span>{t.name}</span>
                    <Tooltip title="IBC Deposit" placement="top">
                      <Button style={{ minWidth: 0 }}>
                        <img src="/deposit.png" style={{ height: "0.8em" }} />
                      </Button>
                    </Tooltip>
                  </div>
                  <span style={{ fontSize: "0.75rem" }}>{balanceOnSN}</span>
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
                  style={{ minWidth: 0 }}
                  onClick={() => {
                    if (!secretjs || !myAddress) {
                      return;
                    }

                    const ref = inputRefs.get(t.name);

                    const amount = new BigNumber(ref.current.value)
                      .multipliedBy(`1e${t.decimals}`)
                      .toFixed(0, BigNumber.ROUND_DOWN);

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
                  inputRef={inputRefs.get(t.name)}
                />
                <Button
                  size="small"
                  variant="text"
                  endIcon={<KeyboardArrowRightIcon />}
                  style={{ minWidth: 0 }}
                  onClick={() => {
                    if (!secretjs || !myAddress) {
                      return;
                    }

                    const ref = inputRefs.get(t.name);

                    const amount = new BigNumber(ref.current.value)
                      .multipliedBy(`1e${t.decimals}`)
                      .toFixed(0, BigNumber.ROUND_DOWN);

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
                  <span style={{ fontSize: "0.75rem" }}>{BalanceToken}</span>
                </div>
              </div>
              <Avatar
                src={t.image}
                sx={{
                  width: 40,
                  height: 40,
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

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./index.css";

import { SigningCosmWasmClient } from "secretjs";
import { StdFee } from "secretjs/types/types";
import { Window as KeplrWindow } from "@keplr-wallet/types";
import { getKeplrViewingKey, KeplrPanel } from "./KeplrStuff";
declare global {
  interface Window extends KeplrWindow {}
}

import tokens from "./config.json";
import TokenRow from "./TokenRow";
import { Typography, Avatar } from "@mui/material";

class ErrorBoundary extends React.Component<{}, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    console.error(error);
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

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

export default function App() {
  const [secretjs, setSecretjs] = useState<SigningCosmWasmClient | null>(null);
  const [secretAddress, setSecretAddress] = useState<string>("");
  const [balances, setBalances] = useState<Map<string, string>>(new Map());
  const [loadingCoinBalances, setLoadingCoinBalances] =
    useState<boolean>(false);

  const updateCoinBalances = async () => {
    const newBalances = new Map<string, string>(balances);

    const url = `${
      tokens.find((t) => t.chain_name === "Secret Network")?.lcd
    }/bank/balances/${secretAddress}`;
    try {
      const response = await fetch(url);
      const result: {
        height: string;
        result: Array<{ denom: string; amount: string }>;
      } = await response.json();

      for (const { denom } of tokens) {
        const balance =
          result.result.find((c) => c.denom === denom)?.amount || "0";

        newBalances.set(denom, balance);
      }
    } catch (e) {
      console.error(`Error while trying to query ${url}:`, e);
    }

    setBalances(newBalances);
  };

  useEffect(() => {
    if (!secretjs || !secretAddress) {
      return;
    }

    const interval = setInterval(updateCoinBalances, 6_000);

    (async () => {
      setLoadingCoinBalances(true);
      await updateCoinBalances();
      setLoadingCoinBalances(false);
    })();

    return () => {
      clearInterval(interval);
    };
  }, [secretAddress, secretjs]);

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
          secretAddress={secretAddress}
          setSecretAddress={setSecretAddress}
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
        {tokens.map((t) => (
          <ErrorBoundary key={t.denom}>
            <TokenRow
              token={t}
              loadingCoinBalances={loadingCoinBalances}
              secretAddress={secretAddress}
              secretjs={secretjs}
              balances={balances}
            />
          </ErrorBoundary>
        ))}
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

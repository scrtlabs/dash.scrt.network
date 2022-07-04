import { StdFee } from "@cosmjs/stargate";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { TokensList } from "./config";
import { Token, TokenOptions } from "./types";
import { ChainInfo } from "@keplr-wallet/types";
import { toast, ToastOptions } from "react-toastify";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const gasPriceUscrt = 0.25;

export const notification = (msg: string, type: "success" | "error") => {
  const config: ToastOptions = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
  };
  if (type === "error") {
    toast.error(msg, config);
  } else {
    toast.success(msg, config);
  }
};

export function gasToFee(gas: number): StdFee {
  return {
    amount: [
      { amount: String(Math.floor(gas * gasPriceUscrt) + 1), denom: "uscrt" },
    ],
    gas: String(gas),
  };
}

export function getCurrentToken(tokenOptions: TokenOptions): Token {
  return TokensList.find(
    (TokensList) => TokensList.name === tokenOptions.name
  )!;
}

export const SuggestedChains: { [chain_name: string]: ChainInfo } = {
  LUNC: {
    rpc: "https://rpc-columbus.keplr.app",
    rest: "https://lcd-columbus.keplr.app",
    chainId: "columbus-5",
    chainName: "Terra",
    stakeCurrency: {
      coinDenom: "LUNA",
      coinMinimalDenom: "uluna",
      coinDecimals: 6,
      coinGeckoId: "terra-luna",
    },
    bip44: {
      coinType: 330,
    },
    bech32Config: Bech32Address.defaultBech32Config("terra"),
    currencies: [
      {
        coinDenom: "LUNA",
        coinMinimalDenom: "uluna",
        coinDecimals: 6,
        coinGeckoId: "terra-luna",
      },
      {
        coinDenom: "UST",
        coinMinimalDenom: "uusd",
        coinDecimals: 6,
        coinGeckoId: "terrausd",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "LUNA",
        coinMinimalDenom: "uluna",
        coinDecimals: 6,
        coinGeckoId: "terra-luna",
      },
      {
        coinDenom: "UST",
        coinMinimalDenom: "uusd",
        coinDecimals: 6,
        coinGeckoId: "terrausd",
      },
    ],
    gasPriceStep: {
      low: 0.015,
      average: 0.015,
      high: 0.015,
    },
    features: ["stargate", "ibc-transfer", "no-legacy-stdTx"],
  },
  HUAHUA: {
    rpc: "https://rpc.chihuahua.wtf/",
    rest: "https://api.chihuahua.wtf/",
    chainId: "chihuahua-1",
    chainName: "Chihuahua",
    stakeCurrency: {
      coinDenom: "HUAHUA",
      coinMinimalDenom: "uhuahua",
      coinDecimals: 6,
      coinGeckoId: "chihuahua-chain",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("chihuahua"),
    currencies: [
      {
        coinDenom: "HUAHUA",
        coinMinimalDenom: "uhuahua",
        coinDecimals: 6,
        coinGeckoId: "chihuahua-chain",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "HUAHUA",
        coinMinimalDenom: "uhuahua",
        coinDecimals: 6,
        coinGeckoId: "chihuahua-chain",
      },
    ],
    gasPriceStep: {
      low: 0.025,
      average: 0.03,
      high: 0.035,
    },
    features: ["stargate", "ibc-transfer", "no-legacy-stdTx"],
  },
  LUNA: {
    rpc: "https://terra-rpc.polkachu.com",
    rest: "https://terra-api.polkachu.com",
    chainId: "phoenix-1",
    chainName: "Terra 2",
    stakeCurrency: {
      coinDenom: "LUNA",
      coinMinimalDenom: "uluna",
      coinDecimals: 6,
      coinGeckoId: "terra-luna-2",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("terra"),
    currencies: [
      {
        coinDenom: "LUNA",
        coinMinimalDenom: "uluna",
        coinDecimals: 6,
        coinGeckoId: "terra-luna-2",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "LUNA",
        coinMinimalDenom: "uluna",
        coinDecimals: 6,
        coinGeckoId: "terra-luna-2",
      },
    ],
    gasPriceStep: {
      low: 0.015,
      average: 0.015,
      high: 0.015,
    },
    features: ["stargate", "ibc-transfer", "no-legacy-stdTx"],
  },
};

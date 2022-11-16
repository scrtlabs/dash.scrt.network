import { StdFee } from "@cosmjs/stargate";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { Keplr } from "@keplr-wallet/types";

export const viewingKeyErrorString = "🧐";

export const faucetURL = "https://faucet.secretsaturn.net/claim";
export const faucetAddress = "secret1tq6y8waegggp4fv2fcxk3zmpsmlfadyc7lsd69";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const gasPriceUscrt = 0.25;
export function gasToFee(gas: number): StdFee {
  return {
    amount: [
      { amount: String(Math.floor(gas * gasPriceUscrt) + 1), denom: "uscrt" },
    ],
    gas: String(gas),
  };
}

export async function suggestTerraToKeplr(keplr: Keplr) {
  await keplr.experimentalSuggestChain({
    rpc: "https://terra-rpc.polkachu.com",
    rest: "https://terra-api.polkachu.com",
    chainId: "phoenix-1",
    chainName: "Terra",
    stakeCurrency: {
      coinDenom: "LUNA",
      coinMinimalDenom: "uluna",
      coinDecimals: 6,
      coinGeckoId: "terra-luna-2",
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
        coinGeckoId: "terra-luna-2",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "LUNA",
        coinMinimalDenom: "uluna",
        coinDecimals: 6,
        coinGeckoId: "terra-luna-2",
        gasPriceStep: {
          low: 0.15,
          average: 0.15,
          high: 0.15,
        },
      },
    ],
    features: ["stargate", "ibc-transfer", "no-legacy-stdTx", "ibc-go"],
  });
}

export async function suggestInjectiveToKeplr(keplr: Keplr) {
  await keplr.experimentalSuggestChain({
    rpc: "https://tm.injective.network",
    rest: "https://public.lcd.injective.network",
    chainId: "injective-1",
    chainName: "Injective",
    stakeCurrency: {
      coinDenom: "INJ",
      coinMinimalDenom: "inj",
      coinDecimals: 18,
      coinGeckoId: "injective-protocol",
    },
    bip44: {
      coinType: 60,
    },
    bech32Config: Bech32Address.defaultBech32Config("inj"),
    currencies: [
      {
        coinDenom: "INJ",
        coinMinimalDenom: "inj",
        coinDecimals: 18,
        coinGeckoId: "injective-protocol",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "INJ",
        coinMinimalDenom: "inj",
        coinDecimals: 18,
        coinGeckoId: "injective-protocol",
        gasPriceStep: {
          low: 0.0005,
          average: 0.0007,
          high: 0.0009,
        },
      },
    ],
    features: ["stargate", "ibc-transfer", "no-legacy-stdTx", "ibc-go"],
  });
}

export async function suggestCrescentToKeplr(keplr: Keplr) {
  await keplr.experimentalSuggestChain({
    rpc: "https://mainnet.crescent.network:26657",
    rest: "https://mainnet.crescent.network:1317",
    chainId: "crescent-1",
    chainName: "Crescent",
    stakeCurrency: {
      coinDenom: "CRE",
      coinMinimalDenom: "ucre",
      coinDecimals: 6,
      coinGeckoId: "crescent-network",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("cre"),
    currencies: [
      {
        coinDenom: "CRE",
        coinMinimalDenom: "ucre",
        coinDecimals: 6,
        coinGeckoId: "crescent-network",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "CRE",
        coinMinimalDenom: "ucre",
        coinDecimals: 6,
        coinGeckoId: "crescent-network",
        gasPriceStep: {
          low: 0.01,
          average: 0.01,
          high: 0.02,
        },
      },
    ],
    features: ["stargate", "ibc-transfer", "no-legacy-stdTx", "ibc-go"],
  });
}

export async function suggestKujiraToKeplr(keplr: Keplr) {
  await keplr.experimentalSuggestChain({
    rpc: "https://rpc.kaiyo.kujira.setten.io",
    rest: "https://lcd.kaiyo.kujira.setten.io",
    chainId: "kaiyo-1",
    chainName: "Kujira",
    stakeCurrency: {
      coinDenom: "KUJI",
      coinMinimalDenom: "ukuji",
      coinDecimals: 6,
      coinGeckoId: "kujira",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("kujira"),
    currencies: [
      {
        coinDenom: "KUJI",
        coinMinimalDenom: "ukuji",
        coinDecimals: 6,
        coinGeckoId: "kujira",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "KUJI",
        coinMinimalDenom: "ukuji",
        coinDecimals: 6,
        coinGeckoId: "kujira",
        gasPriceStep: {
          low: 0.01,
          average: 0.025,
          high: 0.03,
        },
      },
    ],
    features: ["stargate", "ibc-transfer", "no-legacy-stdTx", "ibc-go"],
  });
}

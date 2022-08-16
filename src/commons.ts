import { StdFee } from "@cosmjs/stargate";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { Keplr } from "@keplr-wallet/types";

export const viewingKeyErrorString = "🧐";

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

export async function suggestTerraClassicToKeplr(keplr: Keplr) {
  await keplr.experimentalSuggestChain({
    rpc: "https://rpc-columbus.keplr.app",
    rest: "https://lcd-columbus.keplr.app",
    chainId: "columbus-5",
    chainName: "Terra Classic",
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
    features: ["ibc-transfer"],
  });
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
      },
    ],
    gasPriceStep: {
      low: 0.15,
      average: 0.15,
      high: 0.15,
    },
    features: ["ibc-transfer"],
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
      },
    ],
    gasPriceStep: {
      low: 0.0005,
      average: 0.0007,
      high: 0.0009,
    },
    features: ["ibc-transfer"],
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
      },
    ],
    gasPriceStep: {
      low: 0.01,
      average: 0.01,
      high: 0.02,
    },
    features: ["ibc-transfer"],
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
      },
    ],
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.03,
    },
    features: ["ibc-transfer"],
  });
}

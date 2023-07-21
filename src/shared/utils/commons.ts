import { StdFee } from "@cosmjs/stargate";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { sha256 } from "@noble/hashes/sha256";
import { Wallet, toHex, toUtf8 } from "secretjs";
import { tokens } from "./config";

export const viewingKeyErrorString = "🧐";

export const faucetURL = "https://faucet.secretsaturn.net/claim";
export const faucetAddress = "secret1tq6y8waegggp4fv2fcxk3zmpsmlfadyc7lsd69";

export const dAppsURL =
  "https://secretadmin.scrt.network/api/ecosystem-dapps?populate=deep&pagination[pageSize]=1000";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const gasPriceUscrt = 0.25;
export function gasToFee(gas: number, denom: string): StdFee {
  return {
    amount: [
      {
        amount: String(Math.floor(gas * gasPriceUscrt) + 1),
        denom: denom ? denom : "uscrt",
      },
    ],
    gas: String(gas),
  };
}

export async function suggestTerratoWallet(wallet: any) {
  await wallet.experimentalSuggestChain({
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

export async function suggestInjectivetoWallet(wallet: any) {
  await wallet.experimentalSuggestChain({
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

export async function suggestCrescenttoWallet(wallet: any) {
  await wallet.experimentalSuggestChain({
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

export async function suggestKujiratoWallet(wallet: any) {
  await wallet.experimentalSuggestChain({
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

export async function suggestChihuahuatoWallet(wallet: any) {
  await wallet.experimentalSuggestChain({
    rpc: "https://rpc-chihuahua-ia.cosmosia.notional.ventures",
    rest: "https://api-chihuahua-ia.cosmosia.notional.ventures",
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
        gasPriceStep: {
          low: 0.025,
          average: 0.03,
          high: 0.035,
        },
      },
    ],
    features: ["stargate", "ibc-transfer", "no-legacy-stdTx", "ibc-go"],
  });
}

export const usdString = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const COUNT_ABBRS = [
  "",
  "K",
  "M",
  "B",
  "t",
  "q",
  "s",
  "S",
  "o",
  "n",
  "d",
  "U",
  "D",
  "T",
  "Qt",
  "Qd",
  "Sd",
  "St",
];

export function formatNumber(count: number, decimals = 2) {
  const i = count < 1 ? 0 : Math.floor(Math.log(count) / Math.log(1000));
  return (
    parseFloat((count / 1000 ** i).toFixed(decimals)).toLocaleString() +
    COUNT_ABBRS[i]
  );
}

export const shuffleArray = (array: any[]) => {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

export const sortDAppsArray = (array: any[]) => {
  const sortedArray = [...array].sort((a, b) =>
    a.attributes.name.localeCompare(b.attributes.name)
  );
  return sortedArray;
};

/**
 * SEO
 */

// Dashboard
export const pageTitle = `Secret Dashboard`;
export const dashboardPageDescription = `Secret Dashboard is an entry point into Secret Network! Offering tools like IBC Transfer and Wrapping, Secret Dashboard leverages privacy possibilities within SCRT!`;
export const dashboardJsonLdSchema = [
  {
    "@context": "http://schema.org",
    "@type": "WebPage",
    url: "https://dash.scrt.network",
    name: pageTitle,
    description: dashboardPageDescription,
  },
];

// IBC
export const ibcPageTitle = `${pageTitle} | IBC Transfer`;
export const ibcPageDescription = `Deposit your assets, such as SCRT, via IBC transfer to and from Secret Network!`;
export const ibcJsonLdSchema = [
  {
    "@context": "http://schema.org",
    "@type": "WebPage",
    url: "https://dash.scrt.network/ibc",
    name: ibcPageTitle,
    description: ibcPageDescription,
  },
];

// Wrap
export const wrapPageTitle = `${pageTitle} | Wrap`;
export const wrapPageDescription = `Convert publicly visible SCRT into its privacy-preserving equivalent sSCRT with Secret Wrap! These secure tokens are not publicly visible and require a viewing key!`;
export const wrapJsonLdSchema = [
  {
    "@context": "http://schema.org",
    "@type": "WebPage",
    url: "https://dash.scrt.network/wrap",
    name: wrapPageTitle,
    description: wrapPageDescription,
  },
];

// Bridge
export const bridgePageTitle = `${pageTitle} | Bridge`;
export const bridgePageDescription = `Learn how to bridge your assets from blockchains such as Ethereum, Binance Smart Chain (BSC) and Axelar to Secret Network!`;
export const bridgeJsonLdSchema = [
  {
    "@context": "http://schema.org",
    "@type": "WebPage",
    url: "https://dash.scrt.network/bridge",
    name: bridgePageTitle,
    description: bridgePageDescription,
  },
];

// Auto Restake
export const autoRestakePageTitle = `${pageTitle} | Auto Restake`;
export const autoRestakePageDescription = `Automating the process of "claim and restake" for your SCRT! Your normal SCRT balance is not affected. Only pending staking reward will be affected!`;
export const autoRestakeJsonLdSchema = [
  {
    "@context": "http://schema.org",
    "@type": "WebPage",
    url: "https://dash.scrt.network/restake",
    name: autoRestakePageTitle,
    description: autoRestakePageDescription,
  },
];

// Apps
export const appsPageTitle = `${pageTitle} | Apps`;
export const appsPageDescription = `A curation of applications running on Secret Network Mainnet!`;
export const appsJsonLdSchema = [
  {
    "@context": "http://schema.org",
    "@type": "WebPage",
    url: "https://dash.scrt.network/apps",
    name: appsPageTitle,
    description: appsPageDescription,
  },
];

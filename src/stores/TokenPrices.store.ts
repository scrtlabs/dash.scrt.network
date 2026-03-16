import BigNumber from "bignumber.js";
import type { Nullable } from "types/Nullable";
import { allTokens, toCurrencyString } from "utils/commons";
import { type Token, tokens } from "utils/config";
import { create } from "zustand";

export interface CoinPrice {
  coingecko_id: string;
  priceUsd: number;
}

interface TokenPricesState {
  priceMapping: Map<Token, number | undefined> | null;
  init: () => void;
  isInitialized: boolean;
  getPrice: (token: Token) => Nullable<string>;
  getValuePrice: (token: Token, amount?: BigNumber) => Nullable<number>;
}

export const useTokenPricesStore = create<TokenPricesState>()((set, get) => ({
  priceMapping: null,
  isInitialized: false,

  init: () => {
    set({
      priceMapping: new Map<Token, number | undefined>(),
      isInitialized: true,
    });

    fetch(`https://priceapibuffer.secretsaturn.net/getPrices`)
      .then((resp) => resp.json())
      .then((result: { [coingecko_id: string]: { usd: number } }) => {
        const formattedPrices: CoinPrice[] = Object.entries(result).map(
          ([coingecko_id, { usd }]) => ({
            coingecko_id,
            priceUsd: usd,
          }),
        );

        const priceMapping = new Map<Token, number | undefined>();
        allTokens.forEach((token: Token) => {
          priceMapping.set(
            token,
            formattedPrices.find(
              (price) => price.coingecko_id === token.coingecko_id,
            )?.priceUsd,
          );
        });

        set({ priceMapping });
      })
      .catch((error) => {
        console.error(error);
        const priceMapping = new Map<Token, number | undefined>();
        tokens.forEach((token: Token) => {
          priceMapping.set(token, undefined);
        });
        set({ priceMapping });
      });
  },

  getPrice: (token: Token) => {
    if (!get().isInitialized) {
      get().init();
    }
    // Fix: null guard before calling .get()
    const { priceMapping } = get();
    if (priceMapping === null) return null;

    const tokenPrice = priceMapping.get(token);
    if (tokenPrice !== undefined) {
      return toCurrencyString(tokenPrice);
    }
    return null;
  },

  getValuePrice: (
    token: Token,
    amount: BigNumber = new BigNumber(1),
  ): Nullable<number> => {
    if (!get().isInitialized) {
      get().init();
    }
    const { priceMapping } = get();
    if (priceMapping === null) return null;

    const tokenPrice = priceMapping.get(token);
    if (tokenPrice !== undefined) {
      const result = new BigNumber(tokenPrice)
        .multipliedBy(amount)
        .dividedBy(`1e${token.decimals}`);
      return Number(result);
    }
    return null;
  },
}));

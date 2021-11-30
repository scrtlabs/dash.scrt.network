import { StdFee } from "@cosmjs/stargate";

export const viewingKeyErroString = "🧐";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const gasPriceUscrt = 0.25;
export function getFeeFromGas(gas: number): StdFee {
  return {
    amount: [
      { amount: String(Math.floor(gas * gasPriceUscrt) + 1), denom: "uscrt" },
    ],
    gas: String(gas),
  };
}

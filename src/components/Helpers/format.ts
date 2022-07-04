import BigNumber from "bignumber.js";

export async function copyTextToClipboard(text: string) {
  if ("clipboard" in navigator) {
    return await navigator.clipboard.writeText(text);
  } else {
    return document.execCommand("copy", true, text);
  }
}

export const handleCopyClick = (
  ref: any,
  setIsCopied: (data: boolean) => void
) => {
  if (ref.current) {
    if (!ref.current.innerText) return;
    copyTextToClipboard(ref.current.innerText)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

export const formatBalance = (
  balance: BigNumber.Value,
  decimals: number,
  price: number
) => {
  return new BigNumber(balance)
    .dividedBy(`1e${decimals}`)
    .multipliedBy(price)
    .toNumber();
};

export const fixedBalance = (balance: BigNumber.Value, decimals: number) => {
  return new BigNumber(balance).dividedBy(`1e${decimals}`).toFixed();
};

export const cutString = (
  str: string,
  firstCharactersCount: number = 10,
  lastCharactersCount: number = 4
) => {
  const firstCharacters = str.substring(0, firstCharactersCount);
  const lastCharacters = str.substring(str.length - lastCharactersCount);
  return `${firstCharacters}...${lastCharacters}`;
};

export const usdString = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatNumber(v: number) {
  if (!v) {
    return 0;
  } else if (Number.isInteger(v)) {
    return v;
  } else {
    return Number(v.toFixed(2));
  }
}

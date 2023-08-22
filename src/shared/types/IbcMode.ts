export type IbcMode = "deposit" | "withdrawal";

export const isIbcMode = (x: string) => {
  return x === "deposit" || x === "withdrawal";
};

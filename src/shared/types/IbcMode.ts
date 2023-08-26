export type IbcMode = "deposit" | "withdrawal";

export function isIbcMode(x: String): boolean {
  return x === "deposit" || x === "withdrawal";
}

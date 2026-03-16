export type WalletAPIType = "keplr" | "leap";

export function isWalletAPIType(x: String): boolean {
  return x === "keplr" || x === "leap";
}

export type FeeGrantStatus = "Success" | "Fail" | "Untouched";

export function isFeeGrantStatus(x: String): boolean {
  return x === "Success" || x === "Fail" || x === "Untouched";
}

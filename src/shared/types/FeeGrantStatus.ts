export type FeeGrantStatus = "success" | "fail" | "untouched";

export function isFeeGrantStatus(x: String): boolean {
  return x === "success" || x === "fail" || x === "untouched";
}

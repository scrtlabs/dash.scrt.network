export type WrappingMode = "wrap" | "unwrap";

export function isWrappingMode(x: String): boolean {
  return x === "wrap" || x === "unwrap";
}

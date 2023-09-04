export type WrappingMode = "wrap" | "unwrap";

export const isWrappingMode = (x: string) => {
  return x === "wrap" || x === "unwrap";
};

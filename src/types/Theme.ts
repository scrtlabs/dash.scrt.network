export type Theme = "light" | "dark";

export function isTheme(x: unknown): boolean {
  return x === "light" || x === "dark";
}

export type Theme = 'light' | 'dark'

export function isTheme(x: String): boolean {
  return x === 'light' || x === 'dark'
}

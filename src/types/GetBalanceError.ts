export type GetBalanceError = 'viewingKeyError' | 'GenericFetchError'

export function isGetBalanceError(x: String): boolean {
  return x === 'viewingKeyError' || x === 'GenericFetchError'
}

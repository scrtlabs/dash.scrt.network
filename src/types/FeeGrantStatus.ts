export type FeeGrantStatus = 'success' | 'fail' | 'untouched'

export function isFeeGrantStatus(x: any): boolean {
  return x === 'success' || x === 'fail' || x === 'untouched'
}

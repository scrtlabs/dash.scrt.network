import { Nullable } from './Nullable'

export type Currency = 'USD' | 'EUR' | 'JPY' | 'GBP' | 'AUD' | 'CAD' | 'CHF'

export function isCurrency(x: any): boolean {
  return x === 'USD' || x === 'EUR' || x === 'JPY' || x === 'GBP' || x === 'AUD' || x === 'CAD' || x === 'CHF'
}

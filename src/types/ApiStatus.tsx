export type ApiStatus = 'online' | 'offline' | 'loading' | 'unknown'

export function isApiStatus(x: any): boolean {
  return x === 'online' || x === 'offline' || x === 'loading' || x === 'unknown'
}

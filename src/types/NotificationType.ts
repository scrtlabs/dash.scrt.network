export type NotificationType = 'success' | 'error' | 'loading'

export function isNotificationType(x: String): boolean {
  return x === 'success' || x === 'error' || x === 'loading'
}

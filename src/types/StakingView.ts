export type StakingView = 'delegate' | 'redelegate' | 'undelegate'

export const isStakingView = (x: string) => {
  return x === 'delegate' || x === 'redelegate' || x === 'undelegate'
}

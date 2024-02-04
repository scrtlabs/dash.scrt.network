export type MessageType =
  | 'MultiSend'
  | 'Send'
  | 'ExecuteContract'
  | 'InstantiateContract'
  | 'FundCommunityPool'
  | 'SetAutoRestake'
  | 'SetWithdrawAddress'
  | 'WithdrawDelegatorReward'
  | 'WithdrawValidatorCommission'
  | 'Deposit'
  | 'Vote'
  | 'VoteWeighted'
  | 'Transfer'
  | 'Unjail'
  | 'BeginRedelegate'
  | 'CreateValidator'
  | 'Delegate'
  | 'EditValidator'
  | 'Undelegate'
  | 'CreateVestingAccount'

export function isMessageType(x: String): boolean {
  return (
    x === 'MultiSend' ||
    x === 'Send' ||
    x === 'ExecuteContract' ||
    x === 'InstantiateContract' ||
    x === 'FundCommunityPool' ||
    x === 'SetAutoRestake' ||
    x === 'SetWithdrawAddress' ||
    x === 'WithdrawDelegatorReward' ||
    x === 'WithdrawValidatorCommission' ||
    x === 'Deposit' ||
    x === 'Vote' ||
    x === 'VoteWeighted' ||
    x === 'Transfer' ||
    x === 'Unjail' ||
    x === 'BeginRedelegate' ||
    x === 'CreateValidator' ||
    x === 'Delegate' ||
    x === 'EditValidator' ||
    x === 'Undelegate' ||
    x === 'CreateVestingAccount'
  )
}

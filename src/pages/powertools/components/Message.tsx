import React, { useState } from 'react'
import Select from 'react-select'
import { MessageType } from 'types/MessageType'
import { Nullable } from 'types/Nullable'

function Message() {
  const [messageType, setMessageType] = useState<Nullable<MessageType>>(null)
  const options = [
    'MultiSend',
    'Send',
    'ExecuteContract',
    'InstantiateContract',
    'FundCommunityPool',
    'SetAutoRestake',
    'SetWithdrawAddress',
    'WithdrawDelegatorReward',
    'WithdrawValidatorCommission',
    'Deposit',
    'Vote',
    'VoteWeighted',
    'Transfer',
    'Unjail',
    'BeginRedelegate',
    'CreateValidator',
    'Delegate',
    'EditValidator',
    'Undelegate',
    'CreateVestingAccount'
  ]

  const selectOptions: { value: MessageType; label: string }[] = options.map((option) => ({
    value: option as MessageType,
    label: option as string
  }))

  return (
    <div>
      <Select
        placeholder="Select Type"
        isDisabled={false}
        options={selectOptions}
        value={selectOptions.find((opt) => opt.value === messageType)}
        isSearchable={false}
        onChange={(selectedOption) => {
          setMessageType(selectedOption.value)
        }}
        classNamePrefix="react-select"
      />

      <textarea
        rows={6}
        placeholder="Content"
        className="w-full my-4 p-3 placeholder-neutral-600 dark:placeholder-neutral-500 resize-none dark:bg-neutral-800 text-black border dark:border-neutral-700 dark:text-white"
      />
    </div>
  )
}

export default Message

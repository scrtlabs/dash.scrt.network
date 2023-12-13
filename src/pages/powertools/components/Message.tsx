import React, { useState } from 'react'
import Select from 'react-select'
import { Nullable } from 'types/Nullable'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGripVertical, faTrash } from '@fortawesome/free-solid-svg-icons'
import Tooltip from '@mui/material/Tooltip'
import { messages } from './imported/Messages'
import { SecretNetworkClient } from 'secretjs'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'

interface Props {
  key: number
  number: number
  onDelete: any
  secretjs?: Nullable<SecretNetworkClient>
  denom: string
}

function Message(props: Props) {
  const [messageType, setMessageType] = useState<Nullable<string>>(null)
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

  const [error, setError] = useState<string>('')

  const selectOptions: { value: any; label: string }[] = Object.keys(messages)
    .sort((a, b) => {
      const module = messages[a].module.localeCompare(messages[b].module)
      if (module !== 0) {
        return module
      } else {
        return a.localeCompare(b)
      }
    })
    .map((option) => ({
      value: option,
      label: option as string
    }))

  const [textareaContent, setTextareaContent] = useState<string>('')

  const onTypeSelect = (messageType: any) => {
    const newContent: string = JSON.stringify(messages[messageType].example(props.secretjs, null, '', props.denom)) // TODO: Fix
    setTextareaContent(JSON.stringify(JSON.parse(newContent), null, 2))
  }

  const handleBlur = () => {
    if (messageType) {
      try {
        setTextareaContent(JSON.stringify(JSON.parse(textareaContent), null, 2))
      } catch (error) {
        setError(error.toString())
      }
    }
  }

  // Content Textarea height (min. 6 lines)
  const contentRowsCount = () => {
    const textareaLines: number = textareaContent.split('\n').length
    if (textareaLines >= 6) {
      return textareaLines
    } else {
      return 6
    }
  }

  return (
    <div>
      <div className="inline-flex items-center justify-center w-full">
        <hr className="w-full h-px my-8 bg-gray-200 border-0 dark:bg-neutral-700" />
        <span className="inline-flex items-center gap-2 select-none absolute px-3 text-black -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-neutral-900 text-sm font-bold">
          {/* Draggable to change order */}
          {/* <Tooltip title={`Drag'n'Drop to change Order`} arrow enterDelay={500}>
            <button
              type="button"
              className="text-neutral-500 dark:text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
            >
              <FontAwesomeIcon icon={faGripVertical} />
            </button>
          </Tooltip> */}
          <span>Message #{props.number}</span>
          {/* TODO: Delete Function */}
          {/* <Tooltip title="Delete Message">
            <button
              type="button"
              onClick={props.onDelete}
              className="text-neutral-500 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-500 transition-colors"
            >
              <FontAwesomeIcon icon={faTrash} className="" />
            </button>
          </Tooltip> */}
        </span>
      </div>
      <div>
        <Select
          placeholder="Select Type"
          isDisabled={false}
          options={selectOptions}
          value={selectOptions.find((opt) => opt.value === messageType)}
          isSearchable={false}
          onChange={(selectedOption) => {
            setMessageType(selectedOption.value)
            onTypeSelect(selectedOption.value)
          }}
          classNamePrefix="react-select"
        />

        <div className="my-4">
          <textarea
            value={textareaContent}
            onChange={(e) => setTextareaContent(e.target.value)}
            onBlur={handleBlur}
            rows={contentRowsCount()}
            placeholder="Content"
            className="w-full p-3 placeholder-neutral-600 dark:placeholder-neutral-500 resize-none dark:bg-neutral-800 text-black border dark:border-neutral-700 dark:text-white"
          />
          {error ? <div className="text-red-500 text-sm">{error}</div> : null}
        </div>
      </div>

      {/* Relevant Info */}
      {/* <div className="bg-neutral-800 p-4 rounded-lg border dark:text-sky-500 dark:border-sky-800 text-sm">
        <div className="flex gap-2 items-center font-bold mb-2">
          <FontAwesomeIcon icon={faInfoCircle} />
          Relevant Info
        </div>
        <div className="flex flex-col gap-2">
          <div>
            <span className="font-bold">Balance: </span>
            0.914483 SCRT
          </div>
        </div>
      </div> */}
    </div>
  )
}

export default Message

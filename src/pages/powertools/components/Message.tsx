import { useContext, useEffect, useState } from 'react'
import Select, { components } from 'react-select'
import { Nullable } from 'types/Nullable'
import { MessageDefinitions } from './Messages'
import { SecretNetworkClient } from 'secretjs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle, faSearch, faTrash } from '@fortawesome/free-solid-svg-icons'
import Tooltip from '@mui/material/Tooltip'
import { CircularProgress } from '@mui/material'
import { ThemeContext } from 'context/ThemeContext'

interface Props {
  number: number
  onDelete: any
  secretjs?: Nullable<SecretNetworkClient>
  prefix: string
  denom: string
  type: string
  content: string
  updateType: any
  updateContent: any
}

function Message(props: Props) {
  const [messageType, setMessageType] = useState<Nullable<string>>(null)
  const [isLoadingInfo, setIsLoadingInfo] = useState<boolean>(false)
  const [relevantInfo, setRelevantInfo] = useState<any>(null)
  const { theme } = useContext(ThemeContext)

  const [error, setError] = useState<string>('')

  useEffect(() => {
    ;(async () => {
      if (MessageDefinitions[props.type]?.relevantInfo && props.secretjs) {
        setIsLoadingInfo(true)
        setRelevantInfo(
          await MessageDefinitions[props.type].relevantInfo!(props.secretjs, props.prefix, props.denom, props.content)
        )
        setIsLoadingInfo(false)
      } else {
        setRelevantInfo(null)
      }
    })()
  }, [props.type, props.secretjs])

  const selectOptions: { value: any; label: string }[] = Object.keys(MessageDefinitions)
    .sort((a, b) => {
      const module = MessageDefinitions[a].module.localeCompare(MessageDefinitions[b].module)
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

  const onTypeSelect = (messageType: any) => {
    props.updateType(messageType)
    const newContent: string = JSON.stringify(
      MessageDefinitions[messageType].example(props.secretjs, null, props.prefix, props.denom)
    )
    props.updateContent(JSON.stringify(JSON.parse(newContent), null, 2))
  }

  const handleBlur = () => {
    if (messageType) {
      try {
        props.updateContent(JSON.stringify(JSON.parse(props.content), null, 2))
      } catch (error) {
        setError(error.toString())
      }
    }
  }

  // Content Textarea height (min. 6 lines)
  const contentRowsCount = () => {
    const textareaLines: number = props.content.split('\n').length
    if (textareaLines >= 6) {
      return textareaLines
    } else {
      return 6
    }
  }

  const customMsgFilterOption = (option: any, inputValue: string) => {
    const msgName = option.data.label.toLowerCase()
    return msgName.includes(inputValue.toLowerCase())
  }

  const customMsgStyles = {
    input: (styles: any) => ({
      ...styles,
      color: theme === 'light' ? 'black !important' : 'white !important',
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 600,
      fontSize: '14px'
    })
  }

  const CustomControl = ({ children, ...props }: any) => {
    const menuIsOpen = props.selectProps.menuIsOpen
    return (
      <components.Control {...props}>
        <div className="flex items-center justify-end w-full">
          {menuIsOpen && <FontAwesomeIcon icon={faSearch} className="w-5 h-5 ml-2" />}
          {children}
        </div>
      </components.Control>
    )
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
          <Tooltip title="Delete Message">
            <button
              type="button"
              onClick={props.onDelete}
              className="text-neutral-500 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-500 transition-colors"
            >
              <FontAwesomeIcon icon={faTrash} className="" />
            </button>
          </Tooltip>
        </span>
      </div>
      <div>
        <Select
          placeholder="Select Type"
          isDisabled={false}
          options={selectOptions}
          value={selectOptions.find((opt) => opt.value === props.type)}
          isSearchable={true}
          components={{ Control: CustomControl }}
          filterOption={customMsgFilterOption}
          styles={customMsgStyles}
          onChange={(selectedOption) => {
            onTypeSelect(selectedOption.value)
          }}
          classNamePrefix="react-select"
        />

        <div className="my-4">
          <textarea
            value={props.content}
            onChange={(e) => props.updateContent(e.target.value)}
            onBlur={handleBlur}
            rows={contentRowsCount()}
            placeholder="Content"
            className="w-full p-3 placeholder-neutral-600 dark:placeholder-neutral-500 resize-none dark:bg-neutral-800 text-black border dark:border-neutral-700 dark:text-white"
          />
          {error ? <div className="text-red-500 text-sm">{error}</div> : null}
        </div>
      </div>

      {/* Relevant Info */}
      {isLoadingInfo ? (
        <div className="bg-neutral-800 p-4 rounded-lg border dark:text-sky-500 dark:border-sky-800 text-sm">
          <div className="flex gap-2 items-center font-bold mb-2">
            <FontAwesomeIcon icon={faInfoCircle} />
            Relevant Info
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center p-4 gap-4">
              <CircularProgress size="1rem" />
            </div>
          </div>
        </div>
      ) : null}
      {relevantInfo && relevantInfo !== null ? (
        <div className="bg-neutral-800 p-4 rounded-lg border dark:text-sky-500 dark:border-sky-800 text-sm overflow-auto break-all">
          <div className="flex gap-2 items-center font-bold mb-2">
            <FontAwesomeIcon icon={faInfoCircle} />
            Relevant Info
          </div>
          <div className="flex flex-col gap-2">
            <div>{relevantInfo}</div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Message

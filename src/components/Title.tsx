import Tooltip from '@mui/material/Tooltip'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'

interface IProps {
  title: string
  tooltip?: string
  className?: string
}

export default function Title(props: IProps) {
  return (
    <div className={`text-center mb-4 max-w-6xl mx-auto ${props.className || ''}`}>
      <h1 className="font-bold text-4xl inline text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500">
        {props.title}
      </h1>
      {props.tooltip && (
        <Tooltip title={props.tooltip} placement="right" arrow>
          <span className="ml-2 relative bottom-1.5 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
            <FontAwesomeIcon icon={faInfoCircle} />
          </span>
        </Tooltip>
      )}
    </div>
  )
}

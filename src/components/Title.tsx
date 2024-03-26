import Tooltip from '@mui/material/Tooltip'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'

interface IProps {
  title: string
  tooltip?: string
  className?: string
}

export default function Title(props: IProps) {
  function TitleContent() {
    return (
      <div className={[`group text-center mb-4 max-w-6xl mx-auto`, props.className ? props.className : ''].join(' ')}>
        <h1 className="font-bold text-4xl inline text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500">
          {props.title}
        </h1>
        {props.tooltip ? (
          <span className="ml-2 relative bottom-1.5 text-neutral-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors cursor-pointer">
            <FontAwesomeIcon icon={faInfoCircle} />
          </span>
        ) : null}
      </div>
    )
  }

  if (props.tooltip) {
    return (
      <Tooltip title={props.tooltip} placement="bottom" arrow>
        <span>
          <TitleContent />
        </span>
      </Tooltip>
    )
  } else {
    return <TitleContent />
  }
}

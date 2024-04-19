import { faComment } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tooltip from '@mui/material/Tooltip'

type Props = {
  count?: number
}

function ReviewCount(props: Props) {
  if (!props.count) {
    return
  }

  return (
    <Tooltip title={`${props.count} Reviews`} placement="bottom" arrow>
      <div className="ml-auto inline-block text-xs font-medium me-2 px-2 py-1 rounded bg-neutral-100 text-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-300">
        <FontAwesomeIcon icon={faComment} className="mr-1.5" />
        {props.count}
      </div>
    </Tooltip>
  )
}

export default ReviewCount

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-solid-svg-icons'

function ExpeditedBadge() {
  return (
    <span
      className={
        'text-xs font-medium px-3 py-1 rounded border inline-flex gap-2 items-center bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-900'
      }
    >
      <FontAwesomeIcon icon={faClock} />
      Expedited
    </span>
  )
}

export default ExpeditedBadge

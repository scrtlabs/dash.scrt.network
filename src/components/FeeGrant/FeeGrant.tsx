import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tooltip from '@mui/material/Tooltip'
import ActionableStatus from './components/ActionableStatus'

export default function FeeGrant() {
  return (
    <div className="bg-gray-200 dark:bg-neutral-700 text-black dark:text-white p-4 rounded-xl select-none flex items-center">
      <div className="flex-1">
        <Tooltip
          title={`Request Fee Grant so that you don't have to pay gas fees (up to 0.1 SCRT)`}
          placement="right"
          arrow
        >
          <span className="group inline-flex gap-2 items-center">
            <span className="font-semibold text-sm">Fee Grant</span>
            <span className="text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors cursor-pointer">
              <FontAwesomeIcon icon={faInfoCircle} className="text-sm" />
            </span>
          </span>
        </Tooltip>
      </div>
      <div className="flex-initial">
        <ActionableStatus />
      </div>
    </div>
  )
}

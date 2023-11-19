import { faArrowUpRightFromSquare, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function SCRTUnwrapWarning() {
  return (
    <>
      <div className="px-4 mb-4 max-w-6xl mx-auto">
        <div className="inline-block w-full md:w-auto bg-yellow-800/10 dark:bg-yellow-800/40 border border-yellow-700 dark:border-yellow-600 p-4 rounded-lg">
          <div className="font-semibold text-yellow-700 dark:text-yellow-600 flex flex-row items-center">
            <FontAwesomeIcon icon={faTriangleExclamation} className="mr-3" />
            <ul className="list-disc ml-4 flex flex-col gap-0.5">
              <div>You do not have any SCRT to pay for gas</div>
              <li>Please unwrap some sSCRT into SCRT using a fee grant.</li>
              <li>
                Do <b>NOT</b> try to create a viewing key first, instead unwrap 0.1 sSCRT directly.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default SCRTUnwrapWarning

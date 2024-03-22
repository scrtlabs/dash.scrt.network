import { faArrowUpRightFromSquare, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function NoScrtWarning() {
  return (
    <>
      <div className="px-4 mb-4 max-w-6xl mx-auto text-sm">
        <div className="w-full dark:bg-neutral-800 p-4 rounded-lg">
          <div className="flex gap-4 text-yellow-800 dark:text-yellow-500">
            <FontAwesomeIcon icon={faInfoCircle} className="mt-[3px]" />
            <div>
              <div className="font-semibold flex flex-row items-center">
                <span>{`You do not have any SCRT for Staking`}</span>
              </div>
              <ul className="list-disc mt-3 ml-4 flex flex-col gap-1">
                <li>
                  <a href="/get-scrt" className="hover:underline">
                    Get SCRT
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs ml-2" size={'xs'} />
                  </a>
                </li>
                <li>
                  <a
                    href="https://medium.com/secret-network-ecosystem-and-technology/how-to-get-store-and-stake-scrt-64ae2740b98e"
                    className="hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn more about Staking
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs ml-2" size={'xs'} />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default NoScrtWarning

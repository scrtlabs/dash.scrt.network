import {
  faArrowUpRightFromSquare,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function NoScrtWarning() {
  return (
    <>
      <div className="px-4 mb-4 max-w-6xl mx-auto">
        <div className="inline-block w-full md:w-auto bg-yellow-800/40 border border-yellow-600 text-neutral-300 p-4 rounded-lg">
          <div className="font-semibold text-yellow-600 mb-3 flex flex-row items-center">
            <FontAwesomeIcon icon={faTriangleExclamation} className="mr-3" />
            <span>{`You do not have any SCRT for Staking`}</span>
          </div>
          <ul className="list-disc ml-4 flex flex-col gap-0.5">
            <li>
              <a href="" className="hover:border-b">
                Get SCRT
                <FontAwesomeIcon
                  icon={faArrowUpRightFromSquare}
                  className="text-xs ml-2"
                  size={"xs"}
                />
              </a>
            </li>
            <li>
              <a href="" className="hover:border-b">
                Learn more about Staking
                <FontAwesomeIcon
                  icon={faArrowUpRightFromSquare}
                  className="text-xs ml-2"
                  size={"xs"}
                />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default NoScrtWarning;

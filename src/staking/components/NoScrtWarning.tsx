import {
  faArrowUpRightFromSquare,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

function NoScrtWarning() {
  return (
    <>
      <div className="px-4 mb-4 max-w-6xl mx-auto">
        <div className="inline-block w-full md:w-auto bg-yellow-800/10 dark:bg-yellow-800/40 border border-yellow-700 dark:border-yellow-600 p-4 rounded-lg">
          <div className="font-semibold text-yellow-700 dark:text-yellow-600 flex flex-row items-center">
            <FontAwesomeIcon icon={faTriangleExclamation} className="mr-3" />
            <span>{`You do not have any SCRT for Staking`}</span>
          </div>
          <ul className="list-disc ml-4 flex flex-col gap-0.5 text-yellow-700 dark:text-yellow-600">
            <li>
              <a href="/get-scrt" className="hover:border-b">
                Get SCRT
                <FontAwesomeIcon
                  icon={faArrowUpRightFromSquare}
                  className="text-xs ml-2"
                  size={"xs"}
                />
              </a>
            </li>
            <li>
              <a
                href="https://medium.com/@secretnetwork/how-to-get-store-and-stake-scrt-64ae2740b98e"
                className="hover:border-b"
                target="_blank"
                rel="noopener noreferrer"
              >
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

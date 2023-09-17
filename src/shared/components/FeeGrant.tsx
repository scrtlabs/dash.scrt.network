import {
  faInfoCircle,
  faCheckCircle,
  faXmarkCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import { SecretjsContext } from "shared/context/SecretjsContext";
import Tooltip from "@mui/material/Tooltip";

function FeeGrant() {
  const { feeGrantStatus, requestFeeGrant, secretjs } =
    useContext(SecretjsContext);

  return (
    <>
      <div className="bg-neutral-200 dark:bg-neutral-800 p-4 rounded-lg select-none flex items-center my-4">
        <div className="flex-1 flex items-center">
          <span className="font-semibold text-sm">Fee Grant</span>
          <div className="flex items-center ml-2">
            <Tooltip
              title={`Request Fee Grant so that you don't have to pay gas fees (up to 0.1 SCRT)`}
              placement="right"
              arrow
            >
              <span className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
                <FontAwesomeIcon icon={faInfoCircle} />
              </span>
            </Tooltip>
          </div>
        </div>
        <div className="flex-initial">
          {/* Untouched */}
          {feeGrantStatus === "Untouched" && (
            <>
              <button
                id="feeGrantButton"
                onClick={requestFeeGrant}
                className="font-semibold text-xs bg-neutral-100 dark:bg-neutral-900 px-1.5 py-1 rounded-md transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-100 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40"
                disabled={!secretjs || !secretjs?.address}
              >
                Request Fee Grant
              </button>
            </>
          )}
          {/* Success */}
          {feeGrantStatus === "Success" && (
            <div className="font-semibold text-sm flex items-center h-[1.6rem]">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-green-500 mr-1.5"
              />
              Fee Granted
            </div>
          )}
          {/* Fail */}
          {feeGrantStatus === "Fail" && (
            <div className="font-semibold text-sm h-[1.6rem]">
              <FontAwesomeIcon
                icon={faXmarkCircle}
                className="text-red-500 mr-1.5"
              />
              Request failed
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default FeeGrant;

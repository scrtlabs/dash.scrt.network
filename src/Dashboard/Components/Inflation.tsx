import { faArrowTrendUp, faCircle, faCube } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

interface IInflationProps {
  amount: number
}

const Inflation = (props: IInflationProps) => {
  return (
    <>
      {/* Title */}
      {props.amount && (
        <div className="col-span-12 sm:col-span-6  xl:col-span-3 bg-neutral-800 p-4 rounded-lg">
          <div className="flex flex-col items-center">
            <span className="fa-stack fa-2x mb-2">
              <FontAwesomeIcon icon={faCircle} className="fa-stack-2x text-pink-900" />
              <FontAwesomeIcon icon={faArrowTrendUp} className="fa-stack-1x fa-inverse text-pink-400" />
            </span>
            <div className="font-semibold text-lg">{(props.amount * 100).toFixed(2)}%</div>
            <div className="text-md text-neutral-400">Current Inflation</div>
          </div>
        </div>
      )}
    </>
  );
}

export default Inflation;
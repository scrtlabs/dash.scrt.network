import {
  faArrowTrendUp,
  faAward,
  faCircle,
  faCube,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

interface ICommunityPoolProps {
  amount: number;
}

const CommunityPool = (props: ICommunityPoolProps) => {
  return (
    <>
      {/* Title */}
      {props.amount && (
        <div className="col-span-12 sm:col-span-6  xl:col-span-3 bg-neutral-800 p-4 rounded-lg h-full">
          <div className="flex flex-col items-center">
            <span className="fa-stack fa-2x mb-2">
              <FontAwesomeIcon
                icon={faCircle}
                className="fa-stack-2x text-purple-900"
              />
              <FontAwesomeIcon
                icon={faAward}
                className="fa-stack-1x fa-inverse text-purple-400"
              />
            </span>
            <div className="font-semibold text-lg">
              {props.amount ? props.amount.toLocaleString() : ""} SCRT
            </div>
            <div className="text-md text-neutral-400">Community Pool</div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommunityPool;

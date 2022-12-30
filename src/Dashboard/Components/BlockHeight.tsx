import { faCircle, faCube } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

interface IBlockHeightProps {
  blockHeight: number
}

const BlockHeight = (props: IBlockHeightProps) => {
  return (
    <>
      {/* Title */}
      {props.blockHeight && (
        <div className="col-span-12 sm:col-span-6  xl:col-span-3 bg-neutral-800 p-4 rounded-lg">
          <div className="flex flex-col items-center">
            <span className="fa-stack fa-2x mb-2">
              <FontAwesomeIcon icon={faCircle} className="fa-stack-2x text-cyan-900" />
              <FontAwesomeIcon icon={faCube} className="fa-stack-1x fa-inverse text-cyan-400" />
            </span>
            <div className="font-semibold text-lg">{props.blockHeight}</div>
            <div className="text-md text-neutral-400">Block Height</div>
          </div>
        </div>
      )}
    </>
  );
}

export default BlockHeight;
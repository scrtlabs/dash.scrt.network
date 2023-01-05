import { faArrowUpRightFromSquare, faCircle, faCube } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

interface ICurrentPriceProps {
  price: number
}

const CurrentPrice = (props: ICurrentPriceProps) => {
  return (
    <>
      {/* Title */}
      {props.price && (
        <div className="bg-neutral-800 p-4 rounded-lg">
          <div className="flex flex-col items-center">
            <span className="fa-stack fa-2x mb-2">
              <FontAwesomeIcon icon={faCircle} className="fa-stack-2x text-emerald-900" />
              <FontAwesomeIcon icon={faCube} className="fa-stack-1x fa-inverse text-emerald-400" />
            </span>
            <div className="font-semibold text-lg">{props.price.toLocaleString("en-US", {style:"currency", currency:"USD"})}</div>
            <div className="text-md text-neutral-400">Current Price</div>
            <a href="https://scrt.network/about/get-scrt#buy-scrt" target="_blank" className="block border border-cyan-500 text-cyan-500 hover:text-white hover:bg-cyan-500 w-full text-center transition-colors py-2 rounded-lg mt-4 font-semibold text-sm">Get SCRT<FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs ml-2" /></a>
          </div>
        </div>
      )}
    </>
  );
}

export default CurrentPrice;
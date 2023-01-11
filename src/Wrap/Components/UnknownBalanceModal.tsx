import { faCircleCheck, faDesktop, faMobileScreen, faShuffle, faTriangleExclamation, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { WrapContext } from "Wrap/Wrap";

const UnknownBalanceModal = (props) => {
  if (!props.open) return null;

  const {selectedTokenName, amount: amountToWrap} = useContext(WrapContext);
  
  return (
    <>
      {/* Outter */}
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 z-50" onClick={props.onClose}>

        {/* Inner */}
        <div className="absolute top-[15%] w-full onEnter_fadeInDown">
          <div className="mx-auto max-w-xl px-4">
            <div className="bg-neutral-900 p-8 rounded-2xl" onClick={(e) => {e.stopPropagation()}}>

              
              {/* Header */}
              <div className="mb-0 text-right">
                <button onClick={props.onClose} className="text-neutral-500 hover:bg-neutral-800 transition-colors px-1.5 py-1 rounded-lg text-xl"><FontAwesomeIcon icon={faXmark} className="fa-fw"/></button>
              </div>


              {/* Header */}
              <div className="mb-4 text-center">
                <h2 className="text-2xl font-medium mb-4"><FontAwesomeIcon icon={faTriangleExclamation} className="mr-2 text-amber-500" />No Viewing Key found!</h2>
                <p className="text-neutral-400 max-w-sm mx-auto mb-6">
                  You're trying to unwrap {amountToWrap} s{selectedTokenName} without having a Viewing Key set. Only execute the contract if you know that you definitely have {amountToWrap} s{selectedTokenName} on this account, otherwise this action will fail!
                  {/* Now that you have (publicly visible) {selectedTokenName || "SCRT"} in Secret Network, make sure to wrap your assets into the privacy-preserving equivalent s{selectedTokenName || "SCRT"}. */}
                </p>
                <button className="sm:max-w-[225px] w-full md:px-4 inline-block bg-cyan-600 text-cyan-00 hover:text-cyan-100 hover:bg-cyan-500 text-center transition-colors py-2.5 rounded-xl font-semibold text-sm">Continue Unwrapping</button>
              </div>

              {/* Body */}
              <div className="text-center">
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UnknownBalanceModal;
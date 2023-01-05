import { faDesktop, faMobileScreen, faWallet, faX, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const GetWalletModal = (props) => {
  if (!props.open) return null;
  
  return (
    <>
      {/* Outter */}
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 z-50" onClick={props.onClose}>

        {/* Inner */}
        <div className="absolute top-[15%] w-full">
          <div className="mx-auto max-w-xl px-4">
            <div className="bg-neutral-900 p-8 rounded-2xl" onClick={(e) => {e.stopPropagation()}}>

              
              {/* Header */}
              <div className="mb-0 text-right">
                <button onClick={props.onClose} className="text-neutral-500 hover:bg-neutral-800 transition-colors px-1.5 py-1 rounded-lg text-xl"><FontAwesomeIcon icon={faXmark} className="fa-fw"/></button>
              </div>


              {/* Header */}
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-medium mb-2"><FontAwesomeIcon icon={faWallet} className="mr-2"/>Get Wallet</h2>
                <p className="text-neutral-400 max-w-sm mx-auto">Please install a wallet to access all applications</p>
              </div>

              {/* Body */}
              <div className="flex flex-col bg-neutral-800 rounded-xl overflow-hidden">
                <a href="https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap?hl=en" target="_blank" className="group p-5 flex items-center gap-2.5 hover:bg-neutral-700 transition-colors">
                  <img src="/img/assets/keplr.svg" className="flex-initial w-7 h-7"/>
                  <span className="flex-1 font-medium">Keplr Wallet</span>
                  <span className="bg-blue-500 group-hover:bg-blue-400 transition-colors px-3 py-1.5 rounded text-xs font-semibold">
                    <FontAwesomeIcon icon={faDesktop} className="mr-2"/>
                    Desktop
                  </span>
                </a>
                <a href="https://fina.cash/wallet" target="_blank" className="group p-5 flex items-center gap-2.5 hover:bg-neutral-700 transition-colors">
                  <img src="/img/assets/fina.webp" className="flex-initial w-7 h-7"/>
                  <span className="flex-1 font-medium">Fina Wallet</span>
                  <span className="bg-blue-500 group-hover:bg-blue-400 transition-colors px-3 py-1.5 rounded text-xs font-semibold">
                    <FontAwesomeIcon icon={faMobileScreen} className="mr-2"/>
                    Mobile
                  </span>
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default GetWalletModal;
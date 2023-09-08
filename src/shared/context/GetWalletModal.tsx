import {
  faDesktop,
  faMobileScreen,
  faWallet,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { trackMixPanelEvent } from "shared/utils/commons";

interface IGetWalletModalProps {
  open: boolean;
  onClose: any;
}

class GetWalletModal extends React.Component<IGetWalletModalProps> {
  render() {
    if (!this.props.open) return null;

    return (
      <>
        {/* Outer */}
        <div
          className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 dark:bg-black/80 z-50"
          onClick={this.props.onClose}
        >
          {/* Inner */}
          <div className="relative py-[6rem] w-full onEnter_fadeInDown h-full overflow-auto scrollbar-hide">
            <div className="mx-auto max-w-xl px-4">
              <div
                className="bg-white dark:bg-neutral-900 p-8 rounded-2xl"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {/* Header */}
                <div className="mb-0 text-right">
                  <button
                    onClick={this.props.onClose}
                    className="text-neutral-500 dark:text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors px-1.5 py-1 rounded-lg text-xl"
                  >
                    <FontAwesomeIcon icon={faXmark} className="fa-fw" />
                  </button>
                </div>
                {/* Header */}
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-medium mb-2">
                    <FontAwesomeIcon icon={faWallet} className="mr-2" />
                    Get Wallet
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
                    Install a wallet to interact with the applications!
                  </p>
                </div>
                {/* Body */}
                <div className="flex flex-col bg-neutral-200 dark:bg-neutral-800 rounded-xl overflow-hidden">
                  <a
                    href="https://starshell.net"
                    target="_blank"
                    className="group p-5 flex items-center gap-2.5 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                    onClick={() => {
                      trackMixPanelEvent(
                        "Clicked Starshell Wallet on Get Wallet Modal"
                      );
                    }}
                  >
                    <img
                      src="/img/assets/starshell.svg"
                      className="flex-initial w-7 h-7"
                    />
                    <span className="flex-1 font-medium flex items-center">
                      Starshell{" "}
                      <span className="text-xs ml-2 font-semibold py-0.5 px-1.5 rounded bg-gradient-to-r from-cyan-600 to-purple-600">
                        recommended
                      </span>
                    </span>
                    <span className="text-white dark:text-white bg-blue-500 dark:bg-blue-500 group-hover:bg-blue-600 dark:group-hover:bg-blue-400 transition-colors px-3 py-1.5 rounded text-xs font-semibold">
                      <FontAwesomeIcon icon={faDesktop} className="mr-1" />
                      Desktop /{" "}
                      <FontAwesomeIcon icon={faMobileScreen} className="mr-1" />
                      Mobile
                    </span>
                  </a>
                  <a
                    href="https://www.leapwallet.io"
                    target="_blank"
                    className="group p-5 flex items-center gap-2.5 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                    onClick={() => {
                      trackMixPanelEvent(
                        "Clicked Leap Wallet on Get Wallet Modal"
                      );
                    }}
                  >
                    <img
                      src="/img/assets/leap.svg"
                      className="flex-initial w-7 h-7"
                    />
                    <span className="flex-1 font-medium">Leap</span>
                    <span className="text-white dark:text-white bg-blue-500 dark:bg-blue-500 group-hover:bg-blue-600 dark:group-hover:bg-blue-400 transition-colors px-3 py-1.5 rounded text-xs font-semibold">
                      <FontAwesomeIcon icon={faDesktop} className="mr-1" />
                      Desktop /{" "}
                      <FontAwesomeIcon icon={faMobileScreen} className="mr-1" />
                      Mobile
                    </span>
                  </a>
                  <a
                    href="https://fina.cash/wallet"
                    target="_blank"
                    className="group p-5 flex items-center gap-2.5 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                    onClick={() => {
                      trackMixPanelEvent(
                        "Clicked Fina Wallet on Get Wallet Modal"
                      );
                    }}
                  >
                    <img
                      src="/img/assets/fina.webp"
                      className="flex-initial w-7 h-7"
                    />
                    <span className="flex-1 font-medium">Fina</span>
                    <span className="text-white dark:text-white bg-blue-500 dark:bg-blue-500 group-hover:bg-blue-600 dark:group-hover:bg-blue-400 transition-colors px-3 py-1.5 rounded text-xs font-semibold">
                      <FontAwesomeIcon icon={faMobileScreen} className="mr-1" />
                      Mobile
                    </span>
                  </a>
                  <a
                    href="https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap?hl=en"
                    target="_blank"
                    className="group p-5 flex items-center gap-2.5 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                    onClick={() => {
                      trackMixPanelEvent(
                        "Clicked Keplr Wallet on Get Wallet Modal"
                      );
                    }}
                  >
                    <img
                      src="/img/assets/keplr.svg"
                      className="flex-initial w-7 h-7"
                    />
                    <span className="flex-1 font-medium">Keplr</span>
                    <span className="text-white dark:text-white bg-blue-500 dark:bg-blue-500 group-hover:bg-blue-600 dark:group-hover:bg-blue-400 transition-colors px-3 py-1.5 rounded text-xs font-semibold">
                      <FontAwesomeIcon icon={faDesktop} className="mr-1" />
                      Desktop
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
}

export default GetWalletModal;

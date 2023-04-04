import React, {
  Component,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faCopy,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import GetWalletModal from "shared/context/GetWalletModal";
import { SecretjsContext } from "../context/SecretjsContext";
import { useHoverOutside } from "shared/utils/useHoverOutside";

export function KeplrPanel() {
  const {
    secretjs,
    secretAddress,
    connectWallet,
    disconnectWallet,
    isModalOpen,
    setIsModalOpen,
  } = useContext(SecretjsContext);

  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(true);

  useEffect(() => {
    if (localStorage.getItem("keplrAutoConnect") === "true") {
      connectWallet();
    }
  }, []);

  const keplrRef = useRef();

  useHoverOutside(keplrRef, () => setIsMenuVisible(false));

  const KeplrMenu = () => {
    return (
      <div className="absolute pt-2 right-4 z-40 top-[3.7rem]">
        <div className="bg-white dark:bg-neutral-800 text-xs p-4 w-auto rounded-lg">
          <CopyToClipboard
            text={secretAddress}
            onCopy={() => {
              toast.success("Address copied to clipboard!");
            }}
          >
            <button className="px-2 py-1 mb-2 rounded-lg flex gap-2 items-center group bg-neutral-100 dark:bg-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-500 transition-colors">
              <span>
                {secretAddress.slice(0, 14) + "..." + secretAddress.slice(-14)}
              </span>
              <FontAwesomeIcon
                icon={faCopy}
                className="block transition-colors"
              />
            </button>
          </CopyToClipboard>
          <div className="text-right border-t border-neutral-200 dark:border-neutral-600 mt-4 pt-3">
            <button
              onClick={disconnectWallet}
              className="inline-block font-semibold text-white dark:text-red-200 bg-red-500 dark:bg-red-500/60 hover:bg-red-400 dark:hover:bg-red-500/80 hover:text-white transition-colors px-2 py-1 rounded"
            >
              <FontAwesomeIcon
                icon={faArrowRightFromBracket}
                className="mr-1"
                size="sm"
              />
              {"Disconnect Wallet"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const AnimatedDot = () => {
    return (
      <span className="flex relative h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-1/2"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
    );
  };

  const Content = () => {
    return (
      <>
        <div className="flex items-center font-semibold text-sm">
          <div className="flex items-center">
            {/* Animated Dot */}
            {secretAddress.length > 0 ? (
              <span className="mr-3">
                <AnimatedDot />
              </span>
            ) : null}
            {/* Wallet Icon */}
            <FontAwesomeIcon icon={faWallet} className="mr-2" />
            {/* Connect Wallet || Connected */}
            <span className="flex-1">
              {secretAddress.length > 0 ? "Connected" : "Connect Wallet"}
            </span>
          </div>
        </div>
      </>
    );
  };

  if (secretjs) {
    return (
      <>
        <div ref={keplrRef}>
          {isMenuVisible ? <KeplrMenu /> : null}
          <div
            className="w-full sm:w-auto rounded-lg px-4 py-3 bg-white dark:bg-neutral-700 hover:dark:bg-neutral-600 select-none cursor-pointer transition-colors"
            onMouseOver={() => setIsMenuVisible(true)}
            ref={keplrRef}
          >
            <Content />
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <GetWalletModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            document.body.classList.remove("overflow-hidden");
          }}
        />
        <button
          id="keplr-button"
          onClick={() => connectWallet()}
          className="w-full sm:w-auto rounded-lg px-4 py-3 bg-white dark:bg-neutral-700 hover:dark:bg-neutral-600 select-none cursor-pointer transition-colors"
        >
          <Content />
        </button>
      </>
    );
  }
}

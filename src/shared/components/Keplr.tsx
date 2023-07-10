import {
  FunctionComponent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { sleep, viewingKeyErrorString, usdString } from "shared/utils/commons";
import Tooltip from "@mui/material/Tooltip";
import CopyToClipboard from "react-copy-to-clipboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faCopy,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import GetWalletModal from "shared/context/GetWalletModal";
import { useHoverOutside } from "shared/utils/useHoverOutside";
import { APIContext } from "shared/context/APIContext";
import { Token } from "shared/utils/config";
import BigNumber from "bignumber.js";
import { faKey, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import {
  SecretjsContext,
  setWalletViewingKey,
} from "shared/context/SecretjsContext";
import BalanceItem from "./BalanceItem";

export function KeplrPanel() {
  const {
    secretjs,
    secretAddress,
    connectWallet,
    disconnectWallet,
    isModalOpen,
    setIsModalOpen,
    SCRTBalance,
    sSCRTBalance,
    updateTokenBalance,
    SCRTToken,
    setSCRTToken,
  } = useContext(SecretjsContext);

  const { currentPrice } = useContext(APIContext);

  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false); // set to true for debugging menu

  function WrappedTokenBalanceUi() {
    if (!secretjs || !secretAddress || !sSCRTBalance) {
      return <></>;
    } else if (sSCRTBalance == viewingKeyErrorString) {
      return (
        <>
          <button
            className="ml-2 font-semibold bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-md border-neutral-300 dark:border-neutral-700 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 focus:bg-neutral-500 dark:focus:bg-neutral-500 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-100 dark:disabled:hover:bg-neutral-900 disabled:cursor-default"
            onClick={async () => {
              await setWalletViewingKey(SCRTToken.address);
              try {
                await sleep(1000); // sometimes query nodes lag
                await updateTokenBalance();
              } finally {
                console.log("sdgfbydsjhg");
              }
            }}
          >
            <FontAwesomeIcon icon={faKey} className="mr-2" />
            Set Viewing Key
          </button>
          <Tooltip title={"tsgdfdgshdgf"} placement="right" arrow>
            <span className="ml-2 mt-1 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
              <FontAwesomeIcon icon={faInfoCircle} />
            </span>
          </Tooltip>
        </>
      );
    } else if (Number(sSCRTBalance) > -1) {
      return (
        <>
          <div className="text-xs">
            <div className="font-bold">
              {` ${new BigNumber(sSCRTBalance!)
                .dividedBy(`1e${SCRTToken.decimals}`)
                .toFormat()} sSCRT`}
            </div>
            {currentPrice && sSCRTBalance && (
              <div className="text-gray-500">
                ≈{" "}
                {` ${usdString.format(
                  new BigNumber(sSCRTBalance!)
                    .dividedBy(`1e${SCRTToken.decimals}`)
                    .multipliedBy(Number(currentPrice))
                    .toNumber()
                )}`}
              </div>
            )}
          </div>
        </>
      );
    }
  }

  const keplrRef = useRef();
  useHoverOutside(keplrRef, () => setIsMenuVisible(false));

  const CopyableAddress = () => {
    return (
      <CopyToClipboard
        text={secretAddress}
        onCopy={() => {
          toast.success("Address copied to clipboard!");
        }}
      >
        <button className="px-2 py-1 mb-2 rounded-lg flex gap-2 items-center group bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-black transition-colors">
          {secretAddress.slice(0, 14) + "..." + secretAddress.slice(-14)}
          <FontAwesomeIcon
            icon={faCopy}
            className="block text-neutral-500 dark:text-neutral-500 transition-colors"
          />
        </button>
      </CopyToClipboard>
    );
  };

  const Balances = () => {
    return (
      <div>
        <div className="font-bold mb-2">Balances</div>
        <div className="flex flex-col gap-2 mb-2">
          <BalanceItem token={SCRTToken} isSecretToken={false} /> {/* SCRT */}
          <BalanceItem token={SCRTToken} isSecretToken={true} /> {/* sSCRT */}
        </div>
        {/* TODO: implement viewing key manager */}
        {/* <button className="inline-block border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors text-black dark:text-white font-semibold py-1.5 w-full rounded-lg">Manage Viewing Keys</button> */}
      </div>
    );
  };

  const Disconnect = () => {
    return (
      <button
        onClick={disconnectWallet}
        className="w-full font-semibold px-3 py-1.5 rounded-md text-white dark:text-red-400 bg-red-500 dark:bg-red-500/30 hover:bg-red-400 dark:hover:bg-red-500/50 hover:text-white transition-colors cursor-pointer"
      >
        Disconnect Wallet
      </button>
    );
  };

  const KeplrMenu = () => {
    return (
      <div className="absolute pt-10 right-4 z-40 top-[3.7rem]">
        <div className="bg-white dark:bg-neutral-800 border text-xs border-neutral-200 dark:border-neutral-700 p-4 w-auto rounded-lg flex-row space-y-4">
          {/* Copyable Wallet Address */}
          <CopyableAddress />

          {/* Balances */}
          <Balances />

          {/* Disconnect Button */}
          <Disconnect />
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

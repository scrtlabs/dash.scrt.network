import React, {
  Component,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faWallet } from "@fortawesome/free-solid-svg-icons";
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
  const [SCRTBalance, setSCRTBalance] = useState<number>();
  const [sSCRTBalance, setSSCRTBalance] = useState<any>();
  const [SCRTPrice, setSCRTPrice] = useState<number>();

  useEffect(() => {
    const fetchBalance = async () => {
      const {
        balance: { amount },
      } = await secretjs.query.bank.balance({
        address: secretAddress,
        denom: "uscrt",
      });
      setSCRTBalance(amount);
    };
    fetchBalance();
  }, [secretjs, secretAddress]);

  useEffect(() => {
    fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=secret&vs_currencies=USD`
    )
      .then((resp) => resp.json())
      .then((result: { [coingecko_id: string]: { usd: number } }) => {
        setSCRTPrice(result["secret"].usd);
      });
  }, [SCRTBalance]);

  useEffect(() => {
    if (localStorage.getItem("keplrAutoConnect") === "false") {
      connectWallet();
    }
  }, []);

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
        <div className="flex flex-col gap-2">
          {/* item */}
          <div className="flex items-center gap-3">
            <div>
              <img
                src="/img/assets/scrt.svg"
                alt="Secret Network Logo"
                className="h-7"
              />
            </div>
            <div className="text-xs">
              <div className="font-bold">
                {(SCRTBalance / 1e6).toFixed(2)} SCRT
              </div>
              {SCRTPrice && SCRTBalance && (
                <div className="text-gray-500">
                  ≈ ${((SCRTBalance / 1e6) * SCRTPrice).toFixed(2)}
                </div>
              )}
            </div>
          </div>
          {/* item */}
          {/*  <div className="flex items-center gap-3">
            <div>
              <img
                src="/img/assets/scrt.svg"
                alt="Secret Network Logo"
                className="h-7"
              />
            </div>
            <div className="text-xs">
              <div className="font-bold">0 sSCRT</div>
              {(!SCRTPrice && !sSCRTBalance) && (<div className="text-gray-500">≈ ${(sSCRTBalance/1e6*SCRTPrice).toFixed(2)}</div>)}
            </div>
          </div> */}
        </div>
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
      <div className="absolute pt-2 right-4 z-40 top-[3.7rem]">
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
            className="w-full sm:w-auto rounded-lg px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700  select-none cursor-pointer"
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
          className="w-full sm:w-auto rounded-lg px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 active:bg-neutral-500 dark:active:bg-neutral-600 transition-colors select-none"
        >
          <Content />
        </button>
      </>
    );
  }
}

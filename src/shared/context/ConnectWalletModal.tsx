import {
  faDesktop,
  faMobileScreen,
  faWallet,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IConnectWalletModalProps {
  open: boolean;
  onClose: any;
}

export function ConnectWalletModal(props: IConnectWalletModalProps) {
  // const { setPreferedWalletApi } =
  //   useContext(SecretjsContext);

  if (!props.open) return null;

  const leapAvailable = (window as any).leap
    ? undefined
    : "opacity-50 cursor-not-allowed";
  const keplrAvailable = window.keplr
    ? undefined
    : "opacity-50 cursor-not-allowed";

  return (
    <>
      {/* Outer */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 dark:bg-black/80 z-50"
        onClick={props.onClose}
      >
        {/* Inner */}
        <div className="relative py-[6rem] w-full onEnter_fadeInDown h-full overflow-scroll scrollbar-hide">
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
                  onClick={props.onClose}
                  className="text-neutral-500 dark:text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors px-1.5 py-1 rounded-lg text-xl"
                >
                  <FontAwesomeIcon icon={faXmark} className="fa-fw" />
                </button>
              </div>
              {/* Header */}
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-medium mb-2">
                  <FontAwesomeIcon icon={faWallet} className="mr-2" />
                  Connect to a wallet
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
                  Please connect to one of your wallets to access your
                  applications
                </p>
              </div>
              {/* Body */}
              <div className="flex flex-col bg-neutral-200 dark:bg-neutral-800 rounded-xl overflow-hidden">
                <a
                  onClick={() => {
                    if (keplrAvailable) return;
                    props.onClose();
                    // setPreferedWalletApi("Keplr");
                  }}
                  target="_blank"
                  className={`group p-5 flex items-center gap-2.5 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors ${keplrAvailable}`}
                >
                  <img
                    src="/img/assets/starshell.svg"
                    className="flex-initial w-7 h-7"
                  />
                  <span className="flex-1 font-medium">Starshell Wallet</span>
                  <span className="text-white dark:text-white bg-blue-500 dark:bg-blue-500 group-hover:bg-blue-600 dark:group-hover:bg-blue-400 transition-colors px-3 py-1.5 rounded text-xs font-semibold">
                    <FontAwesomeIcon icon={faDesktop} className="mr-1" />
                    Desktop /{" "}
                    <FontAwesomeIcon icon={faMobileScreen} className="mr-1" />
                    Mobile
                  </span>
                </a>
                <a
                  onClick={() => {
                    if (leapAvailable) return;
                    props.onClose();
                    // setPreferedWalletApi("Leap");
                  }}
                  target="_blank"
                  className={`group p-5 flex items-center gap-2.5 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors ${leapAvailable}`}
                >
                  <img
                    src="/img/assets/leap.svg"
                    className="flex-initial w-7 h-7"
                  />
                  <span className="flex-1 font-medium">Leap Wallet</span>
                  <span className="text-white dark:text-white bg-blue-500 dark:bg-blue-500 group-hover:bg-blue-600 dark:group-hover:bg-blue-400 transition-colors px-3 py-1.5 rounded text-xs font-semibold">
                    <FontAwesomeIcon icon={faDesktop} className="mr-1" />
                    Desktop /{" "}
                    <FontAwesomeIcon icon={faMobileScreen} className="mr-1" />
                    Mobile
                  </span>
                </a>
                <a
                  onClick={() => {
                    if (keplrAvailable) return;
                    props.onClose();
                    // setPreferedWalletApi("Keplr");
                  }}
                  target="_blank"
                  className={`group p-5 flex items-center gap-2.5 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors ${keplrAvailable}`}
                >
                  <img
                    src="/img/assets/fina.webp"
                    className="flex-initial w-7 h-7"
                  />
                  <span className="flex-1 font-medium">Fina Wallet</span>
                  <span className="text-white dark:text-white bg-blue-500 dark:bg-blue-500 group-hover:bg-blue-600 dark:group-hover:bg-blue-400 transition-colors px-3 py-1.5 rounded text-xs font-semibold">
                    <FontAwesomeIcon icon={faMobileScreen} className="mr-2" />
                    Mobile
                  </span>
                </a>
                <a
                  onClick={() => {
                    if (keplrAvailable) return;
                    props.onClose();
                    // setPreferedWalletApi("Keplr");
                  }}
                  target="_blank"
                  className={`group p-5 flex items-center gap-2.5 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors ${keplrAvailable}`}
                >
                  <img
                    src="/img/assets/keplr.svg"
                    className="flex-initial w-7 h-7"
                  />
                  <span className="flex-1 font-medium">Keplr Wallet</span>
                  <span className="text-white dark:text-white bg-blue-500 dark:bg-blue-500 group-hover:bg-blue-600 dark:group-hover:bg-blue-400 transition-colors px-3 py-1.5 rounded text-xs font-semibold">
                    <FontAwesomeIcon icon={faDesktop} className="mr-2" />
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

export default ConnectWalletModal;

import {
  faDesktop,
  faMobileScreen,
  faWallet,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

interface IHoudiniModalProps {
  open: boolean;
  onClose: any;
  theme: any;
  secretAddress: string;
}

const HoudiniModal: React.FC<IHoudiniModalProps> = ({
  open,
  onClose,
  theme,
  secretAddress,
}) => {
  const [loading, setLoading] = useState(true);

  if (!open) return null;

  return (
    <>
      {/* Outer */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 dark:bg-black/80 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Inner */}
        <div className="relative onEnter_fadeInDown h-full overflow-scroll scrollbar-hide flex items-center justify-center">
          <div className="mx-auto max-w-xl px-4">
            <div
              className="bg-white dark:bg-neutral-900 rounded-2xl p-6 relative min-w-[35vw] h-[80vh]"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="text-neutral-500 dark:text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors px-1.5 py-2 rounded-lg text-xl absolute top-3 right-7 z-10"
              >
                <FontAwesomeIcon icon={faXmark} className="fa-fw" />
              </button>

              {loading && (
                <div className="animate-pulse bg-neutral-300/40 dark:bg-neutral-700/40 absolute top-0 left-0 right-0 bottom-0 rounded-2xl"></div>
              )}

              <iframe
                src={`https://houdiniswap.com/?widgetMode=true&theme=${
                  theme === "light" ? "light" : "dark"
                }&tokenIn=ETH&tokenOut=SCRT&amount=1&anonymous=true&partnerId=64f58fc75abdd6a4df170fda${
                  secretAddress ? `&receiveAddress=${secretAddress}` : ``
                }&tokenLockOut=true`}
                width="100%"
                height="100%"
                style={{ maxHeight: "800px" }}
                onLoad={() => setLoading(false)}
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HoudiniModal;

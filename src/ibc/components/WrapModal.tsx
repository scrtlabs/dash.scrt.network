import {
  faCircleCheck,
  faShuffle,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IbcContext } from "ibc/Ibc";
import { useContext } from "react";
import { Link } from "react-router-dom";

interface IWrapModalProps {
  open: boolean;
  onClose: any;
}

const WrapModal = (props: IWrapModalProps) => {
  if (!props.open) return null;

  const { selectedTokenName } = useContext(IbcContext);

  return (
    <>
      {/* Outter */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 z-50"
        onClick={props.onClose}
      >
        {/* Inner */}
        <div className="absolute top-[15%] w-full onEnter_fadeInDown">
          <div className="mx-auto max-w-xl px-4">
            <div
              className="bg-neutral-100 dark:bg-neutral-900 p-8 rounded-2xl"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {/* Header */}
              <div className="mb-0 text-right">
                <button
                  onClick={props.onClose}
                  className="text-neutral-500 dark:text-neutral-500 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors px-1.5 py-1 rounded-lg text-xl"
                >
                  <FontAwesomeIcon icon={faXmark} className="fa-fw" />
                </button>
              </div>

              {/* Header */}
              <div className="mb-4 text-center">
                <h2 className="text-2xl font-medium mb-4">
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    className="mr-2 text-emerald-500 dark:text-emerald-500"
                  />
                  Transaction Successful
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto mb-6">
                  Now that you have (publicly visible){" "}
                  {selectedTokenName || "SCRT"} in Secret Network, make sure to
                  wrap your assets into the privacy-preserving equivalent s
                  {selectedTokenName || "SCRT"}.
                </p>
                <Link
                  to={"/wrap?token=" + selectedTokenName}
                  className="sm:max-w-[200px] w-full md:px-4 inline-block bg-cyan-500 dark:bg-cyan-600 text-cyan-100 hover:text-white hover:bg-cyan-400 dark:hover:bg-cyan-600 text-center transition-colors py-2.5 rounded-xl font-semibold text-sm"
                >
                  <FontAwesomeIcon icon={faShuffle} className="mr-2" />
                  Secret Wrap
                </Link>
              </div>

              {/* Body */}
              <div className="text-center"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WrapModal;

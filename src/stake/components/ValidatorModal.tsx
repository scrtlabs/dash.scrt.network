import {
  faGlobe,
  faInfoCircle,
  faLink,
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react";

const ValidatorModal = (props: any) => {
  // disable body scroll on open
  useEffect(() => {
    if (props.open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [props.open]);

  if (!props.open) return null;

  return (
    <>
      {/* Outter */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 z-50"
        onClick={props.onClose}
      >
        {/* Inner */}
        <div className="absolute top-[15%] w-full onEnter_fadeInDown">
          <div className="mx-auto max-w-4xl px-4">
            <div
              className="bg-neutral-900 p-8 rounded-2xl"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {/* Header */}
              <div className="mb-0 text-right">
                <button
                  onClick={props.onClose}
                  className="text-neutral-500 hover:bg-neutral-800 transition-colors px-1.5 py-1 rounded-lg text-xl"
                >
                  <FontAwesomeIcon icon={faXmark} className="fa-fw" />
                </button>
              </div>

              {/* Header */}
              {/* <div className="mb-4 text-center">
                <h2 className="text-2xl font-medium mb-4">Lorem Ipsum</h2>
                <p className="text-neutral-400 mx-auto mb-6">
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit
                </p>
                <button
                  onClick={props.onClose}
                  className="sm:max-w-[225px] w-full md:px-4 bg-cyan-600 text-cyan-00 hover:text-cyan-100 hover:bg-cyan-500 text-center transition-colors py-2.5 rounded-xl font-semibold text-sm"
                >
                  Close
                </button>
              </div> */}

              {/* Body */}
              <div>
                <div className="flex gap-4 items-center">
                  <div className="image">
                    <img
                      src="https://wallet.keplr.app/_next/image?url=https%3A%2F%2Fs3.amazonaws.com%2Fkeybase_processed_uploads%2Ffb91854ccdfd8183d7ed07c214519f05_360_360.jpg&w=128&q=75"
                      alt="Validator logo"
                      className="w-16 h-16 rounded-full"
                    />
                  </div>
                  <div>
                    <div className="mb-1">
                      <span className="font-semibold">{`🌑 Secret Jupiter | 2% forever`}</span>
                      <a
                        href="https://google.com/"
                        target="_blank"
                        className="text-white hover:text-neutral-200 font-semibold"
                      >
                        <FontAwesomeIcon
                          icon={faGlobe}
                          size="sm"
                          className="ml-3 mr-1"
                        />
                        {`Website`}
                      </a>
                    </div>
                    <div className="text-neutral-400 font-medium text-sm">
                      Commission 2% | APR 23.79%
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="font-semibold text-white mb-1">
                    Description
                  </div>
                  <div className="text-neutral-400 text-sm">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Adipisci repellendus voluptatibus recusandae quo rem
                    doloremque, voluptas, maiores iste vero nesciunt perferendis
                    in iure repellat quidem!
                  </div>
                </div>
                {/* Highlighted Box */}
                <div className="bg-white/5 rounded-xl px-4 py-8 mt-4">
                  <div className="font-bold mb-2">Your Delegation</div>
                  <div className="font-semibold">
                    {`10,826 `}
                    <span className="text-neutral-400">{`SCRT`}</span>
                  </div>
                  <div className="font-semibold text-neutral-400 mt-0.5 text-sm">
                    $7,293
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 mt-4">
                <div className="flex-1">
                  <button className="bg-neutral-800 hover:bg-neutral-700 font-semibold px-3 py-2 rounded-md">
                    <FontAwesomeIcon icon={faLink} className="fa-fw" />
                  </button>
                </div>
                <button className="bg-neutral-800 hover:bg-neutral-700 font-semibold px-4 py-2 rounded-md">
                  Unstake
                </button>
                <button className="bg-neutral-800 hover:bg-neutral-700 font-semibold px-4 py-2 rounded-md">
                  Switch Validator
                </button>
                <button className="bg-blue-600 hover:bg-blue-500 font-semibold px-4 py-2 rounded-md">
                  Stake
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ValidatorModal;

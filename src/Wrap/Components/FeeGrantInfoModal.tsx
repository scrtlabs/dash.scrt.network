import { faInfoCircle, faTriangleExclamation, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react";

const FeeGrantInfoModal = (props) => {

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
                <h2 className="text-2xl font-medium mb-4"><FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-neutral-500" />Fee Grant Feature</h2>
                <p className="text-neutral-400 max-w-sm mx-auto mb-6">
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Corrupti, ducimus? Modi inventore, deleniti culpa quasi quis reiciendis sint, consectetur voluptate eaque ea aliquam rerum natus vel nostrum, quod praesentium quidem!
                </p>
                <button onClick={props.onClose} className="sm:max-w-[225px] w-full md:px-4 bg-cyan-600 text-cyan-00 hover:text-cyan-100 hover:bg-cyan-500 text-center transition-colors py-2.5 rounded-xl font-semibold text-sm">Close</button>
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

export default FeeGrantInfoModal;
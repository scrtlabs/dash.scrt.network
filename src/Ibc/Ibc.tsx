import React, { useEffect, useState, useRef } from "react";
import Deposit from "./components/Deposit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import Tooltip from "@mui/material/Tooltip";
import WrapModal from "./components/WrapModal";

export function Ibc() {

  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <>
      <WrapModal open={isModalOpen} onClose={() => {setIsModalOpen(false); document.body.classList.remove("overflow-hidden")}}/>
      <div className="w-full max-w-xl mx-auto px-4 onEnter_fadeInDown">
        <div className="border rounded-2xl p-8 border-neutral-700 w-full text-neutral-200 bg-neutral-900">

          {/* Header */}
          <div className="flex items-center mb-4">
            <h1 className="inline text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500">IBC Transfer</h1>
            <Tooltip title={`Deposit/withdraw your SCRT via IBC transfer from any chain to/from Secret Network`} placement="bottom">
              <div className="ml-2 pt-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"><FontAwesomeIcon icon={faInfoCircle}/></div>
            </Tooltip>
          </div>

          {/* Deposit */}
          <Deposit/>
          <button onClick={() => setIsModalOpen(true)}>Wrap</button>
        </div>
      </div>
    </>
  );
}
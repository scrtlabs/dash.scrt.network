import React, { useEffect, useState, useRef } from "react";
import { chains, Token, tokens } from "General/Utils/config";
import { toast} from "react-toastify";
import Deposit from "./components/Deposit";
import Withdraw from "./components/Withdraw";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import Tooltip from "@mui/material/Tooltip";

export function Ibc() {
  const [balances, setBalances] = useState<Map<string, string>>(new Map());
  const [selectedToken, setselectedToken] = useState<Token>(tokens.filter(token => token.name === "SCRT")[0]);

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <div className="border rounded-lg p-7 border-neutral-700 w-full bg-neutral-800 text-neutral-200">

        {/* Header */}
        <div className="flex items-center mb-4">
          <h1 className="inline text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-500">IBC Transfer</h1>
          <Tooltip title={`Deposit/withdraw your SCRT via IBC transfer from any chain to/from Secret Network`} placement="bottom">
              <div className="ml-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"><FontAwesomeIcon icon={faInfoCircle}/></div>
            </Tooltip>
        </div>

        {/* Deposit */}
        <Deposit
          token={selectedToken}
          tokens={tokens}
          onSuccess={(txhash) => {
            console.log("success", txhash);
          }}
          onFailure={(error) => console.error(error)}
        />

      </div>
    </div>
  );
}
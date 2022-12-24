import React, { useEffect, useState, useRef } from "react";
import { chains, Token, tokens } from "General/Utils/config";
import { toast} from "react-toastify";
import Deposit from "./components/Deposit";
import Withdraw from "./components/Withdraw";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";

export function Ibc() {
  const [balances, setBalances] = useState<Map<string, string>>(new Map());
  const [selectedToken, setselectedToken] = useState<Token>(tokens.filter(token => token.name === "SCRT")[0]);

  function Header() {
    return (
      <div className="mb-4">
        <div className="mb-4">
          <h1 className="inline text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-500">
            IBC Transfer
          </h1>
        </div>
      </div>
    )}

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="border rounded-lg p-12 pb-7 border-zinc-700 w-full bg-zinc-800 text-zinc-200">
        <Header />

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
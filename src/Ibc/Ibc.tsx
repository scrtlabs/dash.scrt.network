import React, { useEffect, useState, useRef } from "react";
import { chains, Token, tokens } from "General/Utils/config";
import { toast} from "react-toastify";
import Deposit from "./components/Deposit";
import Withdraw from "./components/Withdraw";

export function Ibc() {
  enum IbcMode {
    Deposit,
    Withdrawal
  }

  const [balances, setBalances] = useState<Map<string, string>>(new Map());
  const [selectedToken, setselectedToken] = useState<Token>(tokens.filter(token => token.name === "SCRT")[0]);

  const [ibcMode, setIbcMode] = useState<IbcMode>(IbcMode.Deposit);

  function Header() {
    return <>
      <div className="mb-4">
        <h1 className="inline text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-500">
          IBC Transfer
        </h1>
      </div>
      <span className="block mb-4">
        Transfer your tokens via IBC (Inter-Blockchain Communication)
      </span>
    </>
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <div className="border rounded-lg border-zinc-700 w-full bg-zinc-800 text-zinc-200">
      <Header> </Header>
        {/* <Header/> */}
        
        {/* [Deposit|Withdrawal] */}
        <div className="flex">
          <button onClick={() => setIbcMode(IbcMode.Deposit)} className={"flex-1 py-4" + (ibcMode === IbcMode.Deposit ? "  bg-zinc-800 rounded-tl-lg cursor-default" : "  bg-zinc-700/50 rounded-tl-lg hover:bg-zinc-600 transition-colors")}>
          <h1 className={ibcMode === IbcMode.Deposit ? "inline text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-500" : "text-lg"}>Deposit</h1>
          </button>
          <button onClick={() => setIbcMode(IbcMode.Withdrawal)} className={"flex-1 py-4" + (ibcMode === IbcMode.Withdrawal ? "  bg-zinc-800 rounded-tl-lg cursor-default" : "  bg-zinc-700/50 rounded-tr-lg hover:bg-zinc-600 transition-colors")}>
            <h1 className={ibcMode === IbcMode.Withdrawal ? "inline text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-500" : "text-lg font-medium"}>Withdrawal</h1>
          </button>
        </div>

        <div className="px-12 pb-7">
          {/* Deposit */}
          {ibcMode === IbcMode.Deposit &&
            <Deposit
              token={selectedToken}
              onSuccess={(txhash) => {
                console.log("success", txhash);
              }}
              onFailure={(error) => console.error(error)}
            />
          }

          {/* Withdrawal */}
          {ibcMode === IbcMode.Withdrawal &&
            <Withdraw
              token={selectedToken}
              balances={balances}
              onSuccess={(txhash) => {
                console.log("success", txhash);
              }}
              onFailure={(error) => console.error(error)}
            />
          }
        </div>
      </div>
    </div>
  );
}
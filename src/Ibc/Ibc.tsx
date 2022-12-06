import React, { useEffect, useState, useRef } from "react";
import { SecretNetworkClient } from "secretjs";
import { chains, Token, tokens } from "General/Utils/config";
import { faucetURL } from "General/Utils/commons";
import DepositWithdrawDialog from "Ibc/components/DepositWithdrawDialog";
import { toast} from "react-toastify";
import Deposit from "./components/Deposit";
import Withdraw from "./components/Withdraw";

export function Ibc() {
  enum IbcMode {
    Deposit,
    Withdrawal
  }

  const [secretjs, setSecretjs] = useState<SecretNetworkClient | null>(null);
  const [secretAddress, setSecretAddress] = useState<string>("");
  const [balances, setBalances] = useState<Map<string, string>>(new Map());
  const [prices, setPrices] = useState<Map<string, number>>(new Map());
  const [loadingCoinBalances, setLoadingCoinBalances] = useState<boolean>(false);
  const [useFeegrant, setUseFeegrant] = useState<boolean>(false);
  const [selectedToken, setselectedToken] = useState<Token>(tokens.filter(token => token.name === "SCRT")[0]);
  const [isWrapping, setIsWrapping] = useState<boolean>(true);
  const [isNativeTokenPickerVisible, setIsNativeTokenPickerVisible] = useState<boolean>(false);
  const [isWrappedTokenPickerVisible, setIsWrappedTokenPickerVisible] = useState<boolean>(false);
  const nativeValue = useRef<any>();
  const wrappedValue = useRef<any>();
  const [isDepositWithdrawDialogOpen, setIsDepositWithdrawDialogOpen] = useState<boolean>(true);
  const [loadingWrapOrUnwrap, setLoadingWrapOrUnwrap] = useState<boolean>(false);

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

  function handleNativePickerChoice(token: Token) {
    if (token != selectedToken) {
      setselectedToken(token);
    }
    setIsNativeTokenPickerVisible(false)
    setIsWrappedTokenPickerVisible(false)
  }
  
  const updateFeeGrantButton = (text : string, color : string) => {
    let btnFeeGrant = document.getElementById('grantButton');
    if (btnFeeGrant != null) {
      btnFeeGrant.style.color = color;
      btnFeeGrant.textContent = text;
    }
  }
  const updateCoinBalances = async () => {
    const newBalances = new Map<string, string>(balances);

    const url = `${chains["Secret Network"].lcd}/cosmos/bank/v1beta1/balances/${secretAddress}`;
    try {
      const {
        balances,
      }: {
        balances: Array<{ denom: string; amount: string }>;
      } = await (await fetch(url)).json();

      const denoms = Array.from(
        new Set(
          tokens.map((t) => t.withdrawals.map((w) => w.from_denom)).flat()
        )
      );

      for (const denom of denoms.filter((d) => !d.startsWith("secret1"))) {
        const balance = balances.find((c) => c.denom === denom)?.amount || "0";
        newBalances.set(denom, balance);
      }
    } catch (e) {
      console.error(`Error while trying to query ${url}:`, e);
    }

    if (newBalances.get("uscrt") == "0" && useFeegrant == false) {
      try {
        const response = await fetch(faucetURL, {
          method: 'POST',
          body: JSON.stringify({"Address": secretAddress}),
          headers: {'Content-Type': 'application/json'}
        });
        const result = await response;
        const textBody = await result.text();
        if (result.ok == true) {
          updateFeeGrantButton("Fee Granted for unwrapping","green");
          toast.success(`Your wallet does not have any SCRT to pay for transaction costs. Successfully sent new fee grant (0.1 SCRT) for unwrapping tokens to address ${secretAddress}`);
        } else if (textBody == "Existing Fee Grant did not expire\n") {
          updateFeeGrantButton("Fee Granted for unwrapping","green");
          toast.success(`Your wallet does not have any SCRT to pay for transaction costs. Your address ${secretAddress} however does already have an existing fee grant which will be used for unwrapping`);
        } else {
          updateFeeGrantButton("Fee Grant failed","red");
          toast.error(`Fee Grant for address ${secretAddress} failed with status code: ${result.status}`);
        }
        setUseFeegrant(true);
      }
      catch(e) {
        updateFeeGrantButton("Fee Grant failed","red");
        toast.error(`Fee Grant for address ${secretAddress} failed with error: ${e}`);
      }
      }
    setBalances(newBalances);
  };

  useEffect(() => {
    if (!secretjs || !secretAddress) {
      return;
    }

    const interval = setInterval(updateCoinBalances, 10_000);

    (async () => {
      setLoadingCoinBalances(true);
      await updateCoinBalances();
      setLoadingCoinBalances(false);
    })();

    return () => {
      clearInterval(interval);
    };
  }, [secretAddress, secretjs, useFeegrant]);

  useEffect(() => {
    fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokens
        .map((t) => t.coingecko_id)
        .join(",")}&vs_currencies=USD`
    )
      .then((resp) => resp.json())
      .then((result: { [coingecko_id: string]: { usd: number } }) => {
        const prices = new Map<string, number>();
        for (const token of tokens) {
          if (result[token.coingecko_id]) {
            prices.set(token.name, result[token.coingecko_id].usd);
          }
        }
        setPrices(prices);
      });
  }, []);
  
  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <div className="border rounded-lg border-zinc-700 w-full bg-zinc-800 text-zinc-200">

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
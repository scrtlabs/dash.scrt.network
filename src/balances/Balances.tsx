import { useEffect, useState, useContext, createContext } from "react";
import { MsgExecuteContract, BroadcastMode } from "secretjs";
import { Token, tokens } from "shared/utils/config";
import {
  sleep,
  faucetURL,
  faucetAddress,
  viewingKeyErrorString,
  usdString,
  randomPadding,
  balancesPageTitle,
  balancesPageDescription,
  balancesJsonLdSchema,
  allTokens,
} from "shared/utils/commons";
import BigNumber from "bignumber.js";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faKey,
  faArrowRightArrowLeft,
  faRightLeft,
  faInfoCircle,
  faCheckCircle,
  faXmarkCircle,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import "./Balances.scss";
import { Link } from "react-router-dom";
import Select from "react-select";
import Tooltip from "@mui/material/Tooltip";
import { Helmet } from "react-helmet-async";
import {
  getWalletViewingKey,
  SecretjsContext,
} from "shared/context/SecretjsContext";
import mixpanel from "mixpanel-browser";
import { useSearchParams } from "react-router-dom";
import { BalanceItem } from "./components/BalanceItem";
import Title from "shared/components/Title";

function Balances() {
  //Search Query
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [assetsBySearch, setAssetsBySearch] = useState<Token[]>();

  let tokens = JSON.parse(JSON.stringify(allTokens));
  const tokenToModify = tokens.find((token: any) => token.name === "SCRT");
  if (tokenToModify) {
    tokenToModify.address = "native";
  }

  const SCRT = allTokens[0];

  tokens = [SCRT, ...tokens];

  useEffect(() => {
    if (!searchQuery) {
      setAssetsBySearch(null);
      return;
    }
    setAssetsBySearch(
      tokens.filter(
        (token: any) =>
          token.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
          ("s" + token.name)
            ?.toLowerCase()
            .includes(searchQuery?.toLowerCase()) ||
          token.description?.toLowerCase().includes(searchQuery?.toLowerCase())
      )
    );
  }, [searchQuery]);

  return (
    <>
      <Helmet>
        <title>{balancesPageTitle}</title>

        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="title" content={balancesPageTitle} />
        <meta name="application-name" content={balancesPageTitle} />
        <meta name="description" content={balancesPageDescription} />
        <meta name="robots" content="index,follow" />

        <meta property="og:title" content={balancesPageTitle} />
        <meta property="og:description" content={balancesPageDescription} />
        {/* <meta property="og:image" content="Image URL Here"/> */}

        <meta name="twitter:title" content={balancesPageTitle} />
        <meta name="twitter:description" content={balancesPageDescription} />
        {/* <meta name="twitter:image" content="Image URL Here"/> */}

        <script type="application/ld+json">
          {JSON.stringify(balancesJsonLdSchema)}
        </script>
      </Helmet>

      <Title title={"Balances"} />
      {/* All Balances */}
      <div className="max-w-6xl mx-auto mt-8">
        <div className="flex flex-col gap-4 sm:flex-row items-center px-4 mb-4">
          {/* Search */}
          <div className="flex-1 w-full xs:w-auto">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="" />
              </div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
                id="search"
                className="block w-full sm:w-72 p-2.5 pl-10 text-sm rounded-lg text-neutral-800 dark:text-white bg-white dark:bg-neutral-800 placeholder-neutral-600 dark:placeholder-neutral-400 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-500"
                placeholder="Search Asset"
              />
            </div>
          </div>
        </div>

        <div className="balance-item flex flex-col px-4">
          {tokens || assetsBySearch ? (
            (assetsBySearch ? assetsBySearch : tokens).map(
              (token: any, i: any) => <BalanceItem position={i} asset={token} />
            )
          ) : (
            <div className="animate-pulse flex">
              <BalanceItem position={0} asset={undefined} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Balances;

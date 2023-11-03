import { useState, createContext, useContext, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import Tooltip from "@mui/material/Tooltip";
import { Helmet } from "react-helmet-async";
import WrapModal from "./components/WrapModal";
import Deposit from "./components/Deposit";
import { SecretjsContext } from "shared/context/SecretjsContext";
import ViewingKeyModal from "./components/ViewingKeyModal";
import { Token, chains } from "shared/utils/config";
import { allTokens } from "shared/utils/commons";
import { IbcMode } from "shared/types/IbcMode";
import { useSearchParams } from "react-router-dom";
import {
  ibcJsonLdSchema,
  ibcPageDescription,
  ibcPageTitle,
} from "shared/utils/commons";
import Title from "shared/components/Title";

export const IbcContext = createContext(null);

export function Ibc() {
  const [isWrapModalOpen, setIsWrapModalOpen] = useState(false);

  let tokens = JSON.parse(JSON.stringify(allTokens));
  const tokenToModify = tokens.find((token: any) => token.name === "SCRT");
  if (tokenToModify) {
    tokenToModify.address = "native";
  }

  const SCRT = allTokens[0];

  tokens = [SCRT, ...tokens];

  const [selectedToken, setSelectedToken] = useState<Token>(
    tokens.filter((token: any) => token.name === "SCRT")[0]
  );

  const [supportedTokens, setSupportedTokens] = useState<Token[]>([]);

  const [ibcMode, setIbcMode] = useState<IbcMode>("deposit");

  const { secretjs, connectWallet } = useContext(SecretjsContext);

  // URL params
  const [searchParams, setSearchParams] = useSearchParams();
  const modeUrlParam = searchParams.get("mode");
  const chainUrlParam = searchParams.get("chain");
  const tokenUrlParam = searchParams.get("token");

  const selectableChains = Object.keys(chains)
    .filter((chain_name) => chain_name !== "Secret Network")
    .map((chain_name) => {
      const chain = chains[chain_name];
      return {
        chain_name: chain.chain_name,
        chain_image: chain.chain_image,
      };
    });

  const [selectedSource, setSelectedSource] = useState<any>(
    selectedToken.deposits.find(
      (deposit: any) => deposit.chain_name.toLowerCase() === "osmosis"
    )
  );

  const isValidChainUrlParam = () => {
    return selectedToken.deposits.find(
      (deposit: any) =>
        deposit.chain_name.toLowerCase() === chainUrlParam.toLowerCase()
    )
      ? true
      : false;
  };

  const isValidTokenUrlParam = () => {
    return true;
  };

  useEffect(() => {
    if (
      modeUrlParam?.toLowerCase() === "deposit" ||
      modeUrlParam?.toLowerCase() === "withdrawal"
    ) {
      setIbcMode(modeUrlParam.toLowerCase() as IbcMode);
    }
  }, []);

  useEffect(() => {
    if (chainUrlParam && isValidChainUrlParam()) {
      setSelectedSource(
        selectedToken.deposits.find(
          (deposit: any) =>
            deposit.chain_name.toLowerCase() === chainUrlParam.toLowerCase()
        )
      );
    }
    if (tokenUrlParam && isValidTokenUrlParam()) {
      setSelectedToken(
        tokens.find(
          (token: any) =>
            token.name.toLowerCase() === tokenUrlParam.toLowerCase()
        )
      );
    }
  }, []);

  useEffect(() => {
    var params = {};
    if (ibcMode) {
      params = { ...params, mode: ibcMode.toLowerCase() };
    }
    if (selectedSource) {
      params = { ...params, chain: selectedSource.chain_name.toLowerCase() };
    }
    setSearchParams(params);
  }, [ibcMode, selectedSource]);

  function toggleIbcMode() {
    if (ibcMode === "deposit") {
      setIbcMode("withdrawal");
    } else {
      setIbcMode("deposit");
    }
  }

  const handleClick = () => {
    if (!secretjs?.address || !secretjs) {
      connectWallet();
    }
  };

  const ibcContextProviderValue = {
    isWrapModalOpen,
    setIsWrapModalOpen,
    ibcMode,
    setIbcMode,
    toggleIbcMode,
    selectedToken,
    setSelectedToken,
    selectableChains,
    selectedSource,
    setSelectedSource,
    supportedTokens,
    setSupportedTokens,
  };

  return (
    <>
      <Helmet>
        <title>{ibcPageTitle}</title>

        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="title" content={ibcPageTitle} />
        <meta name="application-name" content={ibcPageTitle} />
        <meta name="description" content={ibcPageDescription} />
        <meta name="robots" content="index,follow" />

        <meta property="og:title" content={ibcPageTitle} />
        <meta property="og:description" content={ibcPageDescription} />
        <meta
          property="og:image"
          content={`/img/secret_dashboard_preview.png`}
        />

        <meta name="twitter:title" content={ibcPageTitle} />
        <meta name="twitter:description" content={ibcPageDescription} />
        <meta
          property="twitter:image"
          content={`/img/secret_dashboard_preview.png`}
        />

        <script type="application/ld+json">
          {JSON.stringify(ibcJsonLdSchema)}
        </script>
      </Helmet>
      <IbcContext.Provider value={ibcContextProviderValue}>
        <WrapModal
          open={isWrapModalOpen}
          selectedToken={selectedToken}
          ibcMode={ibcMode}
          onClose={() => {
            setIsWrapModalOpen(false);
            document.body.classList.remove("overflow-hidden");
          }}
        />

        <div className="w-full max-w-xl mx-auto px-4 onEnter_fadeInDown">
          {/* Title */}
          <Title title={"IBC Transfer"}>
            <Tooltip
              title={
                ibcMode === "deposit"
                  ? `Deposit your ${selectedToken?.name} via IBC transfer from any chain to Secret Network`
                  : `Withdraw your ${selectedToken?.name} via IBC transfer from Secret Network to any chain`
              }
              placement="right"
              arrow
            >
              <span className="ml-2 relative -top-1.5 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
                <FontAwesomeIcon icon={faInfoCircle} />
              </span>
            </Tooltip>
          </Title>
          <div
            className="rounded-2xl p-8 border border-neutral-200 dark:border-neutral-700 w-full text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900"
            onClick={handleClick}
          >
            {/* Deposit */}
            <Deposit />
          </div>
        </div>
      </IbcContext.Provider>
    </>
  );
}

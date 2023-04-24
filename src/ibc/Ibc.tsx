import { useState, createContext, useContext, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import Tooltip from "@mui/material/Tooltip";
import { Helmet } from "react-helmet-async";
import { websiteName } from "App";
import WrapModal from "./components/WrapModal";
import Deposit from "./components/Deposit";
import { SecretjsContext } from "shared/context/SecretjsContext";
import ViewingKeyModal from "./components/ViewingKeyModal";
import { Token, tokens } from "shared/utils/config";
import { IbcMode } from "shared/types/IbcMode";
import { useSearchParams } from "react-router-dom";

export const IbcContext = createContext(null);

export function Ibc() {
  const [isWrapModalOpen, setIsWrapModalOpen] = useState(false);

  const [selectedTokenName, setSelectedTokenName] = useState("");

  const [selectedToken, setSelectedToken] = useState<Token>(
    tokens.filter((token) => token.name === "SCRT")[0]
  );

  const [supportedTokens, setSupportedTokens] = useState<Token[]>([]);

  const [ibcMode, setIbcMode] = useState<IbcMode>("deposit");

  const { secretjs, secretAddress, connectWallet } =
    useContext(SecretjsContext);

  // URL params
  const [searchParams, setSearchParams] = useSearchParams();
  const modeUrlParam = searchParams.get("mode");
  const chainUrlParam = searchParams.get("chain");
  const tokenUrlParam = searchParams.get("token");

  const selectableChains = tokens.find(
    (token) => token.name === "SCRT"
  ).deposits;

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
          (token) => token.name.toLowerCase() === tokenUrlParam.toLowerCase()
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
    if (!secretAddress || !secretjs) {
      connectWallet();
    }
  };

  const ibcContextProviderValue = {
    isWrapModalOpen,
    setIsWrapModalOpen,
    selectedTokenName,
    setSelectedTokenName,
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
        <title>{websiteName} | IBC</title>
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
          <div
            className="rounded-2xl p-8 border border-neutral-200 dark:border-neutral-700 w-full text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900"
            onClick={handleClick}
          >
            {/* Header */}
            <div className="flex items-center mb-4">
              <h1 className="inline text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500">
                IBC Transfer
              </h1>
              <Tooltip
                title={
                  ibcMode === "deposit"
                    ? `Deposit your ${selectedTokenName} via IBC transfer from any chain to Secret Network`
                    : `Withdraw your ${selectedTokenName} via IBC transfer from Secret Network to any chain`
                }
                placement="right"
                arrow
              >
                <span className="ml-2 mt-1 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
                  <FontAwesomeIcon icon={faInfoCircle} />
                </span>
              </Tooltip>
            </div>

            {/* Deposit */}
            <Deposit />
          </div>
        </div>
      </IbcContext.Provider>
    </>
  );
}

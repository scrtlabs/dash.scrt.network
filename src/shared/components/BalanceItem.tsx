import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BigNumber from "bignumber.js";
import React, { FunctionComponent, useContext } from "react";
import { APIContext } from "shared/context/APIContext";
import { sleep, viewingKeyErrorString, usdString } from "shared/utils/commons";
import Tooltip from "@mui/material/Tooltip";
import {
  getKeplrViewingKey,
  SecretjsContext,
  setKeplrViewingKey,
} from "shared/context/SecretjsContext";
import { Token } from "shared/utils/config";
import { faKey, faInfoCircle } from "@fortawesome/free-solid-svg-icons";

type IBalanceProps = {
  token: Token;
  isSecretToken?: boolean;
};

const BalanceItem: FunctionComponent<IBalanceProps> = ({
  isSecretToken = false,
  token,
}) => {
  const {
    secretjs,
    secretAddress,
    connectWallet,
    disconnectWallet,
    isModalOpen,
    setIsModalOpen,
    SCRTBalance,
    sSCRTBalance,
    updateTokenBalance,
    SCRTToken,
    setSCRTToken,
    viewingKey,
    setViewingKey,
  } = useContext(SecretjsContext);

  const { currentPrice } = useContext(APIContext);

  const SetViewingKeyButton = (props: { token: Token }) => {
    return (
      <>
        <button
          onClick={() => setViewingKey(props.token)}
          className="ml-2 font-semibold bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-md border-neutral-300 dark:border-neutral-700 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 focus:bg-neutral-500 dark:focus:bg-neutral-500 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-100 dark:disabled:hover:bg-neutral-900 disabled:cursor-default"
        >
          <FontAwesomeIcon icon={faKey} className="mr-2" />
          Set Viewing Key
        </button>
        <Tooltip
          title={
            "Balances on Secret Network are private by default. Create a viewing key to view your encrypted balances."
          }
          placement="right"
          arrow
        >
          <span className="ml-2 mt-1 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
            <FontAwesomeIcon icon={faInfoCircle} />
          </span>
        </Tooltip>
      </>
    );
  };

  //  e.g. "$1.23"
  const scrtBalanceUsdString = usdString.format(
    new BigNumber(SCRTBalance!)
      .dividedBy(`1e${SCRTToken.decimals}`)
      .multipliedBy(Number(currentPrice))
      .toNumber()
  );
  //  e.g. "$1.23"
  const sScrtBalanceUsdString = usdString.format(
    new BigNumber(sSCRTBalance!)
      .dividedBy(`1e${SCRTToken.decimals}`)
      .multipliedBy(Number(currentPrice))
      .toNumber()
  );

  return (
    <div className="flex items-center gap-3">
      <div>
        <img
          src={"/img/assets" + token.image}
          alt={token.name + " logo"}
          className="h-7"
        />
      </div>
      {isSecretToken && sSCRTBalance == viewingKeyErrorString ? (
        <div className="font-bold">
          {" "}
          sSCRT
          <SetViewingKeyButton token={token} />
        </div>
      ) : (
        <div className="text-xs">
          {/* Balance as native token */}
          <div className="font-bold">
            {!isSecretToken
              ? new BigNumber(SCRTBalance!)
                  .dividedBy(`1e${SCRTToken.decimals}`)
                  .toFormat()
              : new BigNumber(sSCRTBalance!)
                  .dividedBy(`1e${SCRTToken.decimals}`)
                  .toFormat()}
            {/* Token name */}
            {" " + (isSecretToken ? "s" : "") + token.name}
          </div>
          {/* Balance in USD */}
          {currentPrice && SCRTBalance && (
            <div className="text-gray-500">
              {"≈ " +
                (isSecretToken ? sScrtBalanceUsdString : scrtBalanceUsdString)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BalanceItem;

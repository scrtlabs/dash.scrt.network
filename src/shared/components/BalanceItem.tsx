import { faKey } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BigNumber from "bignumber.js";
import React, { FunctionComponent, useContext } from "react";
import { APIContext } from "shared/context/APIContext";
import {
  getKeplrViewingKey,
  SecretjsContext,
  setKeplrViewingKey,
} from "shared/context/SecretjsContext";
import { sleep, usdString } from "shared/utils/commons";
import { Token } from "shared/utils/config";

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
      <button
        onClick={() => setViewingKey(props.token)}
        className="ml-2 font-semibold bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-md border-neutral-300 dark:border-neutral-700 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 focus:bg-neutral-500 dark:focus:bg-neutral-500 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-100 dark:disabled:hover:bg-neutral-900 disabled:cursor-default"
      >
        <FontAwesomeIcon icon={faKey} className="mr-2" />
        Set Viewing Key
      </button>
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
      {isSecretToken && !sSCRTBalance ? (
        <div>
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

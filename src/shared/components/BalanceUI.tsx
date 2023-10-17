import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BigNumber from "bignumber.js";
import React, { FunctionComponent, useContext } from "react";
import { sleep, viewingKeyErrorString, usdString } from "shared/utils/commons";
import Tooltip from "@mui/material/Tooltip";
import {
  getWalletViewingKey,
  SecretjsContext,
  setWalletViewingKey,
} from "shared/context/SecretjsContext";
import { Token } from "shared/utils/config";
import {
  faKey,
  faInfoCircle,
  faArrowRightArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

export function NativeTokenBalanceUi(
  nativeBalance: any,
  selectedToken: Token,
  selectedTokenPrice: any,
  disableAvailable: boolean = false
) {
  const { secretjs } = useContext(SecretjsContext);

  if (secretjs && secretjs?.address && nativeBalance !== undefined) {
    return (
      <>
        {!disableAvailable && <span className="font-semibold">Available:</span>}
        <span className="">
          {` ${new BigNumber(nativeBalance!)
            .dividedBy(`1e${selectedToken.decimals}`)
            .toFormat()} ${selectedToken.name} ${
            selectedToken.coingecko_id && selectedTokenPrice
              ? ` (${usdString(
                  new BigNumber(nativeBalance!)
                    .dividedBy(`1e${selectedToken.decimals}`)
                    .multipliedBy(Number(selectedTokenPrice))
                    .toNumber()
                )})`
              : ""
          }`}
        </span>
      </>
    );
  } else if (secretjs && secretjs?.address && nativeBalance === undefined) {
    return (
      <div className="flex items-center">
        {!disableAvailable && <span className="font-semibold">Available:</span>}
        <span className="animate-pulse bg-neutral-300/40 dark:bg-neutral-700/40 rounded w-20 h-5 ml-2"></span>
      </div>
    );
  } else {
    return <></>;
  }
}

export function WrappedTokenBalanceUi(
  tokenBalance: any,
  selectedToken: Token,
  selectedTokenPrice: any,
  disableAvailable: boolean = false
) {
  const { setViewingKey, secretjs } = useContext(SecretjsContext);

  if (tokenBalance === viewingKeyErrorString) {
    return (
      <>
        {!disableAvailable && <span className="font-semibold">Available:</span>}
        <button
          className="text-sm ml-2 font-semibold bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-md border-neutral-300 dark:border-neutral-700 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-100 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40"
          onClick={() => setViewingKey(selectedToken)}
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
  } else if (Number(tokenBalance) > -1) {
    return (
      <>
        {/* Available: 0.123456 sSCRT () */}
        {!disableAvailable && <span className="font-semibold">Available:</span>}
        <span className="">
          {` ${new BigNumber(tokenBalance!)
            .dividedBy(`1e${selectedToken.decimals}`)
            .toFormat()} ${selectedToken.is_snip20 ? "" : "s"}${
            selectedToken.name
          } ${
            selectedToken.coingecko_id && selectedTokenPrice
              ? ` (${usdString(
                  new BigNumber(tokenBalance!)
                    .dividedBy(`1e${selectedToken.decimals}`)
                    .multipliedBy(Number(selectedTokenPrice))
                    .toNumber()
                )})`
              : ""
          }`}
        </span>
      </>
    );
  } else if (secretjs && secretjs?.address && tokenBalance === undefined) {
    return (
      <div className="flex items-center">
        {!disableAvailable && <span className="font-semibold">Available:</span>}
        <span className="animate-pulse bg-neutral-300/40 dark:bg-neutral-700/40 rounded w-20 h-5 ml-2"></span>
      </div>
    );
  } else {
    return <></>;
  }
}

import React, { useEffect, useState, useContext, useRef } from "react";
import {
  faArrowRightArrowLeft,
  faChevronRight,
  faGlobe,
  faInfoCircle,
  faKey,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  formatNumber,
  sleep,
  usdString,
  viewingKeyErrorString,
} from "shared/utils/commons";
import { APIContext } from "shared/context/APIContext";
import { IValidator } from "staking/Staking";
import { Nullable } from "shared/types/Nullable";
import Tooltip from "@mui/material/Tooltip";
import { Token } from "shared/utils/config";
import {
  SecretjsContext,
  getWalletViewingKey,
} from "shared/context/SecretjsContext";
import BigNumber from "bignumber.js";
import { Link } from "react-router-dom";

interface IBalanceItemProps {
  asset: Token;
}

export const BalanceItem = (props: IBalanceItemProps) => {
  const {
    feeGrantStatus,
    setFeeGrantStatus,
    requestFeeGrant,
    setViewingKey,
    secretjs,
    secretAddress,
    connectWallet,
  } = useContext(SecretjsContext);

  const { prices } = useContext(APIContext);

  const [assetPrice, setAssetPrice] = useState<number>(0);

  const [nativeBalance, setNativeBalance] = useState<any>();
  const [tokenBalance, setTokenBalance] = useState<any>();

  const [loadingCoinBalance, setLoadingCoinBalance] = useState<boolean>(true);
  const [loadingTokenBalance, setLoadingTokenBalance] = useState<boolean>(true);

  useEffect(() => {
    setAssetPrice(
      prices.find(
        (price: { coingecko_id: string }) =>
          price.coingecko_id === props.asset?.coingecko_id
      )?.priceUsd
    );
  }, [props.asset, prices]);

  async function setBalance() {
    try {
      setLoadingCoinBalance(true);
      setLoadingTokenBalance(true);
      await updateCoinBalance();
      await updateTokenBalance();
    } finally {
      setLoadingCoinBalance(false);
      setLoadingTokenBalance(false);
    }
  }

  async function updateBalance() {
    try {
      await updateCoinBalance();
      await updateTokenBalance();
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    if (!secretjs || !secretAddress) return;

    (async () => {
      setBalance();
    })();

    const interval = setInterval(updateBalance, 10000);
    return () => {
      clearInterval(interval);
    };
  }, [secretAddress, secretjs]);

  const updateCoinBalance = async () => {
    try {
      const {
        balance: { amount },
      } = await secretjs.query.bank.balance({
        address: secretAddress,
        denom: props.asset.withdrawals[0]?.from_denom,
      });
      setNativeBalance(amount);
    } catch (e) {
      console.error(`Error while trying to query ${props.asset.name}:`, e);
    }
  };

  const updateTokenBalance = async () => {
    if (!props.asset.address || !secretjs) {
      return;
    }

    const key = await getWalletViewingKey(props.asset.address);
    if (!key) {
      setTokenBalance(viewingKeyErrorString);
      return;
    }

    try {
      const result: {
        viewing_key_error: any;
        balance: {
          amount: string;
        };
      } = await secretjs.query.compute.queryContract({
        contract_address: props.asset.address,
        code_hash: props.asset.code_hash,
        query: {
          balance: { address: secretAddress, key },
        },
      });

      if (result.viewing_key_error) {
        setTokenBalance(viewingKeyErrorString);
        return;
      }

      setTokenBalance(result.balance.amount);
    } catch (e) {
      console.error(`Error getting balance for s${props.asset.name}`, e);

      setTokenBalance(viewingKeyErrorString);
    }
  };

  function NativeTokenBalanceUi() {
    if (secretjs && secretAddress && nativeBalance) {
      return (
        <>
          <span className="font-semibold">Available:</span>
          <span className="font-medium">
            {" " +
              new BigNumber(nativeBalance!)
                .dividedBy(`1e${props.asset.decimals}`)
                .toFormat()}{" "}
            {props.asset.name} (
            {usdString.format(
              new BigNumber(nativeBalance!)
                .dividedBy(`1e${props.asset.decimals}`)
                .multipliedBy(Number(assetPrice))
                .toNumber()
            )}
            )
          </span>

          <Tooltip title={`IBC Transfer`} placement="bottom" arrow>
            <Link
              to="/ibc"
              className="ml-2 hover:text-w dark:hover:text-white transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900 px-1.5 py-0.5 rounded focus:outline-0 focus:ring-2 ring-sky-500/40"
            >
              <FontAwesomeIcon icon={faArrowRightArrowLeft} />
            </Link>
          </Tooltip>
        </>
      );
    } else {
      return <></>;
    }
  }

  function WrappedTokenBalanceUi() {
    if (!secretjs || !secretAddress || !tokenBalance) {
      return <></>;
    } else if (tokenBalance == viewingKeyErrorString) {
      return (
        <>
          <span className="font-semibold">Available:</span>
          <button
            className="ml-2 font-semibold bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-md border-neutral-300 dark:border-neutral-700 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-100 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40"
            onClick={() => setViewingKey(props.asset)}
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
          <span className="font-semibold">Available:</span>
          <span className="font-medium">
            {` ${new BigNumber(tokenBalance!)
              .dividedBy(`1e${props.asset.decimals}`)
              .toFormat()} ${
              props.asset.address === "native" || props.asset.is_snip20
                ? ""
                : "s"
            }${props.asset.name} ${
              assetPrice
                ? ` (${usdString.format(
                    new BigNumber(tokenBalance!)
                      .dividedBy(`1e${props.asset.decimals}`)
                      .multipliedBy(Number(assetPrice))
                      .toNumber()
                  )})`
                : ""
            }`}
          </span>
        </>
      );
    }
  }

  return (
    <>
      <div
        onClick={() => {}}
        className="group flex flex-col sm:flex-row items-center text-left even:bg-white odd:bg-neutral-200 dark:even:bg-neutral-800 dark:odd:bg-neutral-700 py-8 sm:py-4 gap-4 pl-4 pr-8  w-full min-w-full "
      >
        {/* Image */}
        <div className="relative">
          {props.asset?.image ? (
            <>
              <img
                src={`/img/assets/${props.asset?.image}`}
                alt={`${props.asset?.name} logo`}
                className="w-10 h-10 mr-2 rounded-full"
              />
            </>
          ) : null}
        </div>
        {/* Title */}
        <div className="flex-1">
          <span className="font-bold text-lg sm:text-base">
            {props.asset.address === "native" || props.asset.is_snip20
              ? null
              : "s"}
            {props.asset.name}
          </span>
        </div>

        {props.asset.address === "native" ? (
          <NativeTokenBalanceUi />
        ) : (
          <WrappedTokenBalanceUi />
        )}

        <div className="flex flex-col items-center"></div>
      </div>
    </>
  );
};

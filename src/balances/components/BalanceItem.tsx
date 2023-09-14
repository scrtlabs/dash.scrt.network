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
  randomDelay,
  sleep,
  usdString,
  viewingKeyErrorString,
} from "shared/utils/commons";
import { APIContext } from "shared/context/APIContext";
import { Token } from "shared/utils/config";
import {
  SecretjsContext,
  getWalletViewingKey,
} from "shared/context/SecretjsContext";
import {
  NativeTokenBalanceUi,
  WrappedTokenBalanceUi,
} from "shared/components/BalanceUI";

interface IBalanceItemProps {
  asset: Token;
  position: number;
}

export const BalanceItem = (props: IBalanceItemProps) => {
  const { secretjs } = useContext(SecretjsContext);

  const { prices } = useContext(APIContext);

  const [assetPrice, setAssetPrice] = useState<number>(0);

  const [nativeBalance, setNativeBalance] = useState<any>(undefined);
  const [tokenBalance, setTokenBalance] = useState<any>(undefined);

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
      if (props.asset.address === "native") {
        setNativeBalance(undefined);
        await updateCoinBalance();
      } else {
        setTokenBalance(undefined);
        await updateTokenBalance();
      }
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    if (!secretjs || !secretjs?.address) return;

    (async () => {
      setBalance();
    })();

    const interval = setInterval(setBalance, 100000);
    return () => {
      clearInterval(interval);
    };
  }, [secretjs?.address, secretjs]);

  const updateCoinBalance = async () => {
    try {
      const {
        balance: { amount },
      } = await secretjs.query.bank.balance({
        address: secretjs?.address,
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
      await sleep(randomDelay(0, 1000));
      const result: {
        viewing_key_error: any;
        balance: {
          amount: string;
        };
      } = await secretjs.query.compute.queryContract({
        contract_address: props.asset.address,
        code_hash: props.asset.code_hash,
        query: {
          balance: { address: secretjs?.address, key },
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

  return (
    <>
      <div
        onClick={() => {}}
        className="group flex flex-col sm:flex-row items-center text-left even:bg-white odd:bg-neutral-200 dark:even:bg-neutral-800 dark:odd:bg-neutral-700 py-8 sm:py-4 gap-4 pl-4 pr-8  w-full min-w-full "
      >
        {/* Image */}
        <div className="relative flex items-center">
          {props.asset?.image ? (
            <>
              <img
                src={`/img/assets/${props.asset?.image}`}
                alt={`${props.asset?.name} logo`}
                className="w-10 h-10 mr-1 rounded-full"
              />
            </>
          ) : null}
        </div>
        {/* Title */}
        <div className="flex-1">
          <span className="font-semibold text-lg sm:text-base">
            {props.asset.address === "native" || props.asset.is_snip20
              ? null
              : "s"}
            {props.asset.name}
            {props.asset.description ? (
              <div className="text-xs text-gray-500">
                {(props.asset.address !== "native" ||
                props.asset.is_ics20 ||
                props.asset.is_snip20
                  ? "Private "
                  : "Public ") + props.asset.description}
              </div>
            ) : null}
          </span>
        </div>

        {props.asset.coingecko_id !== "" && (
          <div className="flex flex-col items-center">
            <div className="description text-xs text-gray-500 mb-2">Price</div>
            {assetPrice !== undefined && (
              <div className="font-semibold">
                {usdString.format(Number(assetPrice))}
              </div>
            )}
            {assetPrice === undefined && (
              <div className="animate-pulse bg-neutral-300/40 dark:bg-neutral-700/40 rounded col-span-2 w-16 h-7 mx-auto"></div>
            )}
          </div>
        )}
        {secretjs && secretjs?.address ? (
          <div className="flex flex-col items-center">
            <div className="description text-xs text-gray-500 mb-2">
              Balance
            </div>
            <div className="font-semibold">
              {props.asset.address === "native"
                ? NativeTokenBalanceUi(
                    nativeBalance,
                    props.asset,
                    assetPrice,
                    true
                  )
                : WrappedTokenBalanceUi(
                    tokenBalance,
                    props.asset,
                    assetPrice,
                    true
                  )}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

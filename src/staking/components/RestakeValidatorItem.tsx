import React, { useEffect, useState, useContext, useRef } from "react";
import { APIContext } from "shared/context/APIContext";
import BigNumber from "bignumber.js";
import { IValidator, ValidatorRestakeStatus } from "../Staking";
import { SecretjsContext } from "shared/context/SecretjsContext";

interface IRestakeValidatorItemProps {
  name: string;
  stakedAmount: number;
  identity?: string;
  restakeEntries: any;
  validator: any;
  openModal: any;
  restakeChoice: any;
  setRestakeChoice: any;
}

const RestakeValidatorItem = (props: IRestakeValidatorItemProps) => {
  const stakedAmountString = BigNumber(props.stakedAmount!)
    .dividedBy(`1e6`)
    .toString();

  const { currentPrice, setCurrentPrice } = useContext(APIContext);

  const { SCRTToken } = useContext(SecretjsContext);

  const [imgUrl, setImgUrl] = useState<any>();

  const identityRef = useRef(props.identity);

  const restakeThreshold = 10_000_000;

  useEffect(() => {
    identityRef.current = props.identity;
    const fetchKeybaseImgUrl = async () => {
      const url = `https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${props.identity}&fields=pictures`;
      await fetch(url)
        .then((response) => response.json())
        .catch((e) => {})
        .then((response) => {
          if (identityRef.current === props.identity) {
            if (response?.them[0]) {
              setImgUrl(response?.them[0].pictures?.primary?.url);
            } else {
              setImgUrl(undefined);
            }
          }
        })
        .catch((e) => {});
    };
    if (props.identity) {
      setImgUrl(undefined);
      fetchKeybaseImgUrl();
    }
  }, [props.identity, identityRef]);

  const isRestakeEnabled = (validator: IValidator) => {
    return props.restakeEntries.find(
      (validatorAddress: string) =>
        validatorAddress === validator.operator_address
    );
  };

  const isAboveRestakeThreshold = (stakedAmount: number) => {
    return stakedAmount > restakeThreshold;
  };

  const [isChecked, setIsChecked] = useState<boolean>(false);

  return (
    <>
      {/* Item */}
      <button
        onClick={() => setIsChecked(!isChecked)}
        className={`w-full flex items-center text-left py-8 sm:py-4 gap-4 px-4 ${
          isChecked
            ? "bg-emerald-500/30 dark:bg-emerald-500/30"
            : "bg-red-500/30 dark:bg-red-500/30"
        }`}
      >
        {/* Auto Restake */}
        {/* <div className="auto-restake">
          <Tooltip
            title={`Auto restake is ${
              isAboveRestakeThreshold(props.stakedAmount)
                ? isRestakeEnabled(props.validator)
                  ? "enabled"
                  : "disabled"
                : `unavailable (below threshold of ${BigNumber(restakeThreshold)
                    .dividedBy(`1e${SCRTToken.decimals}`)
                    .toFormat()} SCRT)`
            }!`}
            placement="bottom"
            arrow
          >
            <span
              className={`font-bold text-xs p-1 rounded-full ${
                isAboveRestakeThreshold(props.stakedAmount)
                  ? isRestakeEnabled(props.validator)
                    ? "text-green-200 bg-green-800"
                    : "text-red-200 bg-red-800"
                  : "text-gray-200 bg-gray-800"
              }`}
            >
              <FontAwesomeIcon icon={faRepeat} className="fa-fw" />
            </span>
          </Tooltip>
        </div> */}
        {/* Image */}
        <div>
          <input
            type="checkbox"
            onChange={() => setIsChecked(!isChecked)}
            checked={isChecked}
          />
        </div>
        <div className="image">
          {imgUrl ? (
            <>
              <img
                src={imgUrl}
                alt={`validator logo`}
                className="rounded-full w-10"
              />
            </>
          ) : (
            <>
              <div className="relative bg-blue-500 rounded-full w-10 h-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold">
                  {/* .charAt(0) or .slice(0,1) won't work here with emojis! */}
                  {[...props.name][0].toUpperCase()}
                </div>
              </div>
            </>
          )}
        </div>
        {/* Title */}
        <div className="flex-1">
          <span className="font-semibold">{props.name}</span>
        </div>
        {props.validator.status === "BOND_STATUS_UNBONDED" && (
          <div className="border border-red-500 bg-transparent text-red-500 text-sm rounded px-4 py-2 cursor-not-allowed flex items-center justify-start">
            Inactive
          </div>
        )}
        <div className="flex flex-col items-right">
          <div className="description text-xs text-gray-500 mb-2 text-right">
            Your stake
          </div>
          <div>
            <div>
              <span className="font-semibold">{stakedAmountString}</span>
              <span className="text-xs font-semibold text-neutral-400">
                {" "}
                SCRT
              </span>
            </div>
          </div>
        </div>
      </button>
    </>
  );
};

export default RestakeValidatorItem;

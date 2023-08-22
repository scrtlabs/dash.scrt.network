import React, { useEffect, useState, useContext, useRef } from "react";
import {
  faArrowRotateRight,
  faCheck,
  faChevronDown,
  faChevronRight,
  faCircle,
  faGlobe,
  faRepeat,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tooltip from "@mui/material/Tooltip";
import { APIContext } from "shared/context/APIContext";
import { usdString } from "shared/utils/commons";
import BigNumber from "bignumber.js";
import { formatNumber } from "shared/utils/commons";
import { IValidator, ValidatorRestakeStatus } from "../Staking";
import {
  getWalletViewingKey,
  isViewingKeyAvailable,
  SecretjsContext,
  setWalletViewingKey,
} from "shared/context/SecretjsContext";

interface IMyValidatorsItemProps {
  name: string;
  commissionPercentage: number;
  stakedAmount: number;
  identity?: string;
  setSelectedValidator: any;
  restakeEntries: any;
  validator: any;
  openModal: any;
  restakeChoice: any;
  setRestakeChoice: any;
}

const MyValidatorsItem = (props: IMyValidatorsItemProps) => {
  const stakedAmountString = BigNumber(props.stakedAmount!)
    .dividedBy(`1e6`)
    .toString();

  const { currentPrice, setCurrentPrice } = useContext(APIContext);

  const [imgUrl, setImgUrl] = useState<any>();

  const identityRef = useRef(props.identity);

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

  return (
    <>
      {/* Item */}
      <button
        onClick={() => {
          props.openModal(true);
          props.setSelectedValidator(props.validator);
        }}
        className="dark:even:bg-neutral-700 dark:odd:bg-neutral-800 flex items-center text-left dark:hover:bg-neutral-600 py-8 sm:py-4 gap-4 pl-4 pr-8"
      >
        {/* Auto Restake */}
        <div className="auto-restake">
          <Tooltip
            title={`Auto restake is ${
              isRestakeEnabled(props.validator) ? "enabled" : "disabled"
            }!`}
            placement="bottom"
            arrow
          >
            <span
              className={`font-bold text-xs p-1 rounded-full ${
                isRestakeEnabled(props.validator)
                  ? "text-green-200 bg-green-800"
                  : "text-red-200 bg-red-800"
              }`}
            >
              <FontAwesomeIcon icon={faRepeat} className="fa-fw" />
            </span>
          </Tooltip>
        </div>
        {/* Image */}
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
          {props.validator?.description?.website && (
            <a
              onClick={(e) => e.stopPropagation()}
              href={props.validator?.description?.website}
              target="_blank"
              className="group font-medium text-sm"
            >
              <FontAwesomeIcon
                icon={faGlobe}
                size="sm"
                className="ml-3 mr-1 text-neutral-500 group-hover:text-white"
              />
              <span className="hidden group-hover:inline-block">Website</span>
            </a>
          )}
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
            {/*           <div className="text-sm font-semibold text-neutral-400">
            {usdString.format(
              new BigNumber(props.stakedAmount!)
                .dividedBy(`1e6`)
                .multipliedBy(Number(currentPrice))
                .toNumber()
            )}
          </div> */}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="description text-xs text-gray-500 mb-2">
            Commission
          </div>
          <div className="commission font-semibold">
            {formatNumber(props.commissionPercentage * 100, 2)}%
          </div>
        </div>
        {/*         <div className="flex items-center font-semibold border-b border-white/0 hover:border-white transition-colors">
          <FontAwesomeIcon icon={faChevronRight} size="sm" className="ml-1" />
        </div> */}
      </button>
    </>
  );
};

export default MyValidatorsItem;

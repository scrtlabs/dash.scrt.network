import {
  faGlobe,
  faInfoCircle,
  faLink,
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useState } from "react";
import { APIContext } from "shared/context/APIContext";
import { usdString } from "shared/utils/commons";
import BigNumber from "bignumber.js";

interface IValidatorModalProps {
  open: boolean;
  onClose: any;
  delegatorDelegations: any;
  selectedValidator: any;
}

const ValidatorModal = (props: IValidatorModalProps) => {
  const [imgUrl, setImgUrl] = useState<any>();

  const {
    dappsData,
    setDappsData,
    dappsDataSorted,
    setDappsDataSorted,
    tags,
    setTags,
    coingeckoApiData_Day,
    setCoinGeckoApiData_Day,
    coingeckoApiData_Month,
    setCoinGeckoApiData_Month,
    coingeckoApiData_Year,
    setCoinGeckoApiData_Year,
    defiLamaApiData_Year,
    setDefiLamaApiData_Year,
    spartanApiData,
    setSpartanApiData,
    currentPrice,
    setCurrentPrice,
    volume,
    setVolume,
    blockHeight,
    inflation,
    bondedRatio,
    communityTax,
    communityPool,
    pool,
    totalSupply,
    bondedToken,
    notBondedToken,
    secretFoundationTax,
    marketCap,
    setMarketCap,
  } = useContext(APIContext);

  const I = inflation; // inflation
  const F = secretFoundationTax; // foundation tax
  const C = props.selectedValidator?.commission?.commission_rates?.rate; // validator commision rate; median is 5%
  const T = parseFloat(communityTax); // community tax
  const R = bondedRatio / 100; // bonded ratio
  const realYield = (I / R) * (1 - F - T) * (1 - C) * 100;
  const APRString: string = realYield.toFixed(2);

  // disable body scroll on open
  useEffect(() => {
    if (props.open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    console.log(props.selectedValidator);
    const fetchKeybaseImgUrl = async () => {
      const url = `https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${props.selectedValidator?.description?.identity}&fields=pictures`;
      await fetch(url)
        .then((response) => response.json())
        .catch((e) => {})
        .then((response) => {
          if (response?.them[0]) {
            setImgUrl(response?.them[0].pictures?.primary?.url);
          } else {
            setImgUrl(undefined);
          }
        })
        .catch((e) => {});
    };
    if (props.selectedValidator?.description?.identity) {
      setImgUrl(undefined);
      fetchKeybaseImgUrl();
    }
  }, [props.open]);

  if (!props.open) return null;

  return (
    <>
      {/* Outer */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 z-50"
        onClick={props.onClose}
      >
        {/* Inner */}
        <div className="absolute top-[15%] w-full onEnter_fadeInDown">
          <div className="mx-auto max-w-4xl px-4">
            <div
              className="bg-neutral-900 p-8 rounded-2xl"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {/* Header */}
              <div className="mb-0 text-right">
                <button
                  onClick={props.onClose}
                  className="text-neutral-500 hover:bg-neutral-800 transition-colors px-1.5 py-1 rounded-lg text-xl"
                >
                  <FontAwesomeIcon icon={faXmark} className="fa-fw" />
                </button>
              </div>

              {/* Header */}
              {/* <div className="mb-4 text-center">
                <h2 className="text-2xl font-medium mb-4">Lorem Ipsum</h2>
                <p className="text-neutral-400 mx-auto mb-6">
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit
                </p>
                <button
                  onClick={props.onClose}
                  className="sm:max-w-[225px] w-full md:px-4 bg-cyan-600 text-cyan-00 hover:text-cyan-100 hover:bg-cyan-500 text-center transition-colors py-2.5 rounded-xl font-semibold text-sm"
                >
                  Close
                </button>
              </div> */}

              {/* Body */}
              <div>
                <div className="flex gap-4 items-center">
                  <div className="image">
                    <img
                      src={imgUrl}
                      alt="Validator logo"
                      className="w-16 h-16 rounded-full"
                    />
                  </div>
                  <div>
                    <div className="mb-1">
                      <span className="font-semibold">
                        {props.selectedValidator?.description?.moniker}
                      </span>
                      {props.selectedValidator?.description?.website && (
                        <a
                          href={props.selectedValidator?.description?.website}
                          target="_blank"
                          className="group font-medium text-sm"
                        >
                          <FontAwesomeIcon
                            icon={faGlobe}
                            size="sm"
                            className="ml-3 mr-1 text-neutral-500 group-hover:text-white"
                          />
                          <span className="hidden group-hover:inline-block">
                            Website
                          </span>
                        </a>
                      )}
                    </div>
                    <div className="text-neutral-400 font-medium text-sm">
                      <div className="commission font-semibold">
                        Commission{" "}
                        {(
                          props.selectedValidator?.commission?.commission_rates
                            ?.rate * 100
                        ).toFixed(2)}
                        % | APR {APRString}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="font-semibold text-white mb-1">
                    Description
                  </div>
                  <div className="text-neutral-400 text-sm">
                    {props.selectedValidator?.description?.details}
                  </div>
                </div>
                {/* Highlighted Box */}
                {props.delegatorDelegations.find(
                  (delegatorDelegation: any) =>
                    props.selectedValidator?.operator_address ==
                    delegatorDelegation.delegation.validator_address
                ) && (
                  <div className="bg-white/5 rounded-xl px-4 py-8 mt-4">
                    <div className="font-bold mb-2">Your Delegation</div>
                    <div className="font-semibold">
                      {props.delegatorDelegations.find(
                        (delegatorDelegation: any) =>
                          props.selectedValidator?.operator_address ==
                          delegatorDelegation.delegation.validator_address
                      )?.balance?.amount / 1e6}
                      <span className="text-neutral-400">{` SCRT`}</span>
                    </div>
                    <div className="font-semibold text-neutral-400 mt-0.5 text-sm">
                      {usdString.format(
                        new BigNumber(
                          props.delegatorDelegations.find(
                            (delegatorDelegation: any) =>
                              props.selectedValidator?.operator_address ==
                              delegatorDelegation.delegation.validator_address
                          )?.balance?.amount
                        )
                          .dividedBy(`1e6`)
                          .multipliedBy(Number(currentPrice))
                          .toNumber()
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 mt-4">
                <div className="flex-1">
                  <button className="bg-neutral-800 hover:bg-neutral-700 font-semibold px-3 py-2 rounded-md">
                    <FontAwesomeIcon icon={faLink} className="fa-fw" />
                  </button>
                </div>
                <button className="bg-neutral-800 hover:bg-neutral-700 font-semibold px-4 py-2 rounded-md">
                  Unstake
                </button>
                <button className="bg-neutral-800 hover:bg-neutral-700 font-semibold px-4 py-2 rounded-md">
                  Switch Validator
                </button>
                <button className="bg-blue-600 hover:bg-blue-500 font-semibold px-4 py-2 rounded-md">
                  Stake
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ValidatorModal;

import React, { useEffect, useState, useContext, useRef } from "react";
import { faChevronRight, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatNumber } from "shared/utils/commons";
import { APIContext } from "shared/context/APIContext";

interface IValidatorProps {
  name: string;
  commissionPercentage: number;
  votingPower: number;
  identity?: string;
  position: number;
  website?: string;
  setSelectedValidator: any;
  validator: any;
  openModal: any;
}

export const Validator = (props: IValidatorProps) => {
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

  const [imgUrl, setImgUrl] = useState<any>();
  const [realYield, setRealYield] = useState<any>();
  const votingPowerString = formatNumber(props.votingPower / 1e6);

  const maxVPThreshold = 0.1;

  useEffect(() => {
    if (
      inflation &&
      secretFoundationTax >= 0 &&
      props.commissionPercentage &&
      communityTax &&
      bondedToken &&
      totalSupply
    ) {
      const I = inflation; // inflation
      const F = secretFoundationTax; // foundation tax
      const C = props.commissionPercentage; // validator commision rate; median is 5%
      const T = parseFloat(communityTax); // community tax
      const R = bondedToken / totalSupply; // bonded ratio
      setRealYield((I / R) * (1 - F - T) * (1 - C) * 100);
    }
  }, [
    inflation,
    secretFoundationTax,
    props.commissionPercentage,
    communityTax,
    bondedToken,
    totalSupply,
  ]);

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

  return (
    <>
      <button
        onClick={() => {
          props.openModal(true);
          props.setSelectedValidator(props.validator);
        }}
        className={`group flex flex-col sm:flex-row items-center text-left even:bg-white dark:even:bg-neutral-800 py-8 sm:py-4 gap-4 pl-4 pr-8 ${
          props.validator?.delegator_shares &&
          bondedToken &&
          props.validator?.delegator_shares / 1e6 / bondedToken > maxVPThreshold
            ? "dark:odd:bg-red-400 "
            : "dark:odd:bg-neutral-700 "
        }
         ${
           props.validator?.delegator_shares &&
           bondedToken &&
           props.validator?.delegator_shares / 1e6 / bondedToken >
             maxVPThreshold
             ? "dark:hover:bg-red-500"
             : "dark:hover:bg-neutral-600"
         }`}
      >
        {/* Image */}
        <div>
          {imgUrl ? (
            <>
              <img
                src={imgUrl}
                alt={`validator logo`}
                className="rounded-full w-20 sm:w-10"
              />
            </>
          ) : (
            <>
              <div className="relative bg-blue-500 rounded-full sm:w-10 w-20 sm:h-10 h-20">
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
          <span className="font-bold text-lg sm:text-base">{props.name}</span>
          {props.website && (
            <a
              href={props.website}
              target="_blank"
              className="group font-medium text-sm hidden sm:inline-block"
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
        <div className="flex flex-col items-center">
          <div className="description text-xs text-gray-500 mb-2">
            Voting Power
          </div>
          <div className="voting-power font-semibold">
            <span className="">{votingPowerString}</span>{" "}
            <span className="text-neutral-400 text-sm">SCRT</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="description text-xs text-gray-500 mb-2">
            Commission
          </div>
          <div className="commission font-semibold">
            <span className="sm:hidden">Commission: </span>
            {formatNumber(props.commissionPercentage * 100, 2)}%
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="description text-xs text-gray-500 mb-2">
            Real Yield
          </div>
          {realYield && (
            <div className="apr font-semibold">
              <span className="sm:hidden">Yield: </span>
              {realYield || realYield != 0
                ? `${formatNumber(realYield, 2)} %`
                : ""}
            </div>
          )}
          {realYield === undefined && (
            <div className="animate-pulse">
              <div className="bg-neutral-300/40 dark:bg-neutral-700/40 rounded col-span-2 w-16 h-7 mx-auto"></div>
            </div>
          )}
        </div>
        <FontAwesomeIcon
          icon={faChevronRight}
          size="sm"
          className="hidden sm:inline-block"
        />
      </button>
    </>
  );
};

import React, { useEffect, useState, useContext, useRef } from "react";
import { faChevronRight, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatNumber } from "shared/utils/commons";
import { APIContext } from "shared/context/APIContext";

interface IAllValidatorsItemProps {
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

const AllValidatorsItem = (props: IAllValidatorsItemProps) => {
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
      bondedRatio
    ) {
      const I = inflation; // inflation
      const F = secretFoundationTax; // foundation tax
      const C = props.commissionPercentage; // validator commision rate; median is 5%
      const T = parseFloat(communityTax); // community tax
      const R = bondedRatio / 100; // bonded ratio
      setRealYield((I / R) * (1 - F - T) * (1 - C) * 100);
    }
  }, [
    inflation,
    secretFoundationTax,
    props.commissionPercentage,
    communityTax,
    bondedRatio,
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
      {/* Item */}
      <button
        onClick={() => {
          props.openModal(true);
          props.setSelectedValidator(props.validator);
        }}
        className={`dark:even:bg-neutral-800 ${
          props.validator?.delegator_shares &&
          bondedToken &&
          props.validator?.delegator_shares / 1e6 / bondedToken > maxVPThreshold
            ? "dark:odd:bg-red-400"
            : "dark:odd:bg-neutral-700"
        }  flex items-center text-left ${
          props.validator?.delegator_shares &&
          bondedToken &&
          props.validator?.delegator_shares / 1e6 / bondedToken > maxVPThreshold
            ? "dark:hover:bg-red-500"
            : "dark:hover:bg-neutral-600"
        }  py-2.5 gap-4 pl-4 pr-8`}
      >
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
          {props.website && (
            <a
              href={props.website}
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
        <div className="voting-power font-semibold">
          <span className="">{votingPowerString}</span>{" "}
          <span className="text-neutral-400 text-sm">SCRT</span>
        </div>
        <div className="commission font-semibold">
          {formatNumber(props.commissionPercentage * 100, 2)}%
        </div>
        {realYield && (
          <div className="apr font-semibold">
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
        <div className="flex items-center font-semibold border-b border-white/0 hover:border-white transition-colors">
          <FontAwesomeIcon icon={faChevronRight} size="sm" className="ml-1" />
        </div>
      </button>
    </>
  );
};

export default AllValidatorsItem;

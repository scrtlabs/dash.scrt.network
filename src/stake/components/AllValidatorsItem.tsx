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
  const votingPowerString = formatNumber(props.votingPower / 1e6);

  const I = inflation; // inflation
  const F = secretFoundationTax; // foundation tax
  const C = props.commissionPercentage; // validator commision rate; median is 5%
  const T = parseFloat(communityTax); // community tax
  const R = bondedRatio / 100; // bonded ratio
  const realYield = (I / R) * (1 - F - T) * (1 - C) * 100;
  const APRString: string = realYield.toFixed(2);

  const identityRef = useRef(props.identity);

  useEffect(() => {
    identityRef.current = props.identity;
    const fetchKeybaseImgUrl = async () => {
      console.log(identityRef.current);
      const url = `https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${props.identity}&fields=pictures`;
      await fetch(url)
        .then((response) => response.json())
        .then((response) => {
          if (identityRef.current === props.identity) {
            if (response?.them[0]) {
              setImgUrl(response?.them[0].pictures?.primary?.url);
            } else {
              setImgUrl(undefined);
            }
          }
        });
    };
    if (props.identity) {
      setImgUrl(undefined);
      fetchKeybaseImgUrl();
    }
  }, [props]);

  return (
    <>
      {/* Item */}
      <button
        onClick={() => console.log("sdgghsfgh")}
        className="dark:even:bg-neutral-800 dark:odd:bg-neutral-700 flex items-center text-left dark:hover:bg-neutral-600 py-2.5 gap-4 pl-4 pr-8"
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
        <div className="voting-power font-semibold">
          <span className="">{votingPowerString}</span>{" "}
          <span className="text-neutral-400 text-sm">SCRT</span>
        </div>
        <div className="commission font-semibold">
          {(props.commissionPercentage * 100).toFixed(2)}%
        </div>
        <div className="apr font-semibold">{APRString}%</div>
        <div className="flex items-center font-semibold border-b border-white/0 hover:border-white transition-colors">
          <FontAwesomeIcon icon={faChevronRight} size="sm" className="ml-1" />
        </div>
      </button>
    </>
  );
};

export default AllValidatorsItem;

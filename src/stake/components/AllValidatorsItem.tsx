import React from "react";
import { faChevronRight, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatNumber } from "shared/utils/commons";

interface IAllValidatorsItemProps {
  name: string;
  commisionPercentage: number;
  votingPower: number;
  imgUrl?: string;
  position: number;
}

const AllValidatorsItem = (props: IAllValidatorsItemProps) => {
  // TODO: format votingPowerString
  const votingPowerString = formatNumber(props.votingPower);

  // TODO: get APR by API
  const fullApr: number = 24.27;
  const apr: number = fullApr - fullApr * (0.01 * props.commisionPercentage);
  const aprString: string = apr.toFixed(2);

  return (
    <>
      {/* Item */}
      <button
        onClick={() => alert("In implementation")}
        className="dark:even:bg-neutral-800 dark:odd:bg-neutral-700 flex items-center text-left dark:hover:bg-neutral-600 py-2.5 gap-4 pl-4 pr-8"
      >
        {/* Position */}
        <div className="rank w-6 text-right">{props.position}</div>
        {/* Image */}
        <div className="image">
          {props.imgUrl ? (
            <>
              <img
                src={props.imgUrl}
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
          <a
            href="https://google.com"
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
        </div>
        <div className="voting-power font-semibold">
          <span className="">{votingPowerString}</span>{" "}
          <span className="text-neutral-400 text-sm">SCRT</span>
        </div>
        <div className="commission font-semibold">
          {props.commisionPercentage}%
        </div>
        <div className="apr font-semibold">{aprString}%</div>
        <div className="flex items-center font-semibold border-b border-white/0 hover:border-white transition-colors">
          <FontAwesomeIcon icon={faChevronRight} size="sm" className="ml-1" />
        </div>
      </button>
    </>
  );
};

export default AllValidatorsItem;

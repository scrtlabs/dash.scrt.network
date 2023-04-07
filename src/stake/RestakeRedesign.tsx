import { faChevronRight, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { websiteName } from "App";
import React from "react";
import { Helmet } from "react-helmet-async";

// for html-head

function Restake() {
  interface IItemProps {
    title: string;
    commisionPercentage: number;
    votingPower: number;
    imgUrl?: string;
    position: number;
  }

  const Item = (props: IItemProps) => {
    // TODO: format votingPowerString
    const votingPowerString = props.votingPower.toString();
    return (
      <>
        {/* Item */}
        <div className="flex items-center gap-4">
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
                    {[...props.title][0].toUpperCase()}
                  </div>
                </div>
              </>
            )}
          </div>
          {/* Title */}
          <div className="flex-1">
            <span className="font-medium">{props.title}</span>
            <a
              href="https://google.com"
              target="_blank"
              className="group font-medium text-sm"
            >
              <FontAwesomeIcon
                icon={faGlobe}
                size="sm"
                className="ml-3 mr-1 text-neutral-500 group-hover:text-white transition-colors"
              />
              <span className="hidden group-hover:inline-block">Website</span>
            </a>
          </div>
          <div className="voting-power">{votingPowerString} SCRT</div>
          <div className="commission">{props.commisionPercentage}%</div>
          <div className="flex items-center">
            {"Manage"}
            <FontAwesomeIcon icon={faChevronRight} size="sm" className="ml-1" />
          </div>
        </div>
      </>
    );
  };
  return (
    <>
      <Helmet>
        <title>{websiteName} | Staking</title>
      </Helmet>

      <div className="flex flex-col px-4 gap-3">
        <Item
          position={1}
          title="0% Fee >2024 💸 | melea"
          commisionPercentage={2}
          votingPower={15967671}
          imgUrl="https://wallet.keplr.app/_next/image?url=https%3A%2F%2Fs3.amazonaws.com%2Fkeybase_processed_uploads%2Fff855e93d7b9c9de64ce0e404d47c105_360_360.jpg&w=128&q=75"
        />
        <Item
          position={2}
          title="Citadel.one"
          commisionPercentage={2}
          votingPower={15967671}
          imgUrl="https://wallet.keplr.app/_next/image?url=https%3A%2F%2Fs3.amazonaws.com%2Fkeybase_processed_uploads%2F2826e38259411adafb416505fb948c05_360_360.jpg&w=128&q=75"
        />
        <Item
          position={3}
          title="Blizzard.finance❄️"
          commisionPercentage={2}
          votingPower={15967671}
          imgUrl="https://wallet.keplr.app/_next/image?url=https%3A%2F%2Fs3.amazonaws.com%2Fkeybase_processed_uploads%2F5a41bb0b26799624923e9f29c34d3805_360_360.jpg&w=128&q=75"
        />
        <Item
          position={4}
          title="WhisperNode🤐"
          commisionPercentage={2}
          votingPower={15967671}
          imgUrl="https://wallet.keplr.app/_next/image?url=https%3A%2F%2Fs3.amazonaws.com%2Fkeybase_processed_uploads%2Ffd488355ab385fc78fa6c0cee76c3205_360_360.jpg&w=128&q=75"
        />
        <Item
          position={5}
          title="Mario | #noCaps"
          commisionPercentage={2}
          votingPower={15967671}
          imgUrl="https://wallet.keplr.app/_next/image?url=https%3A%2F%2Fs3.amazonaws.com%2Fkeybase_processed_uploads%2F04970c2854e4f25102fb781811167a05_360_360.jpg&w=128&q=75"
        />
        <Item
          position={6}
          title="Kraken"
          commisionPercentage={2}
          votingPower={15967671}
          imgUrl="https://wallet.keplr.app/_next/image?url=https%3A%2F%2Fs3.amazonaws.com%2Fkeybase_processed_uploads%2Fc980e65e14adb3528c44e23e0ee4e405_360_360.jpg&w=128&q=75"
        />
        <Item
          position={7}
          title="🪐 𝕊ecret 𝕊aturn | 1% forever"
          commisionPercentage={2}
          votingPower={15967671}
          imgUrl="https://wallet.keplr.app/_next/image?url=https%3A%2F%2Fs3.amazonaws.com%2Fkeybase_processed_uploads%2Fee1614693d1fa8c08ef59ebf812f0c05_360_360.jpg&w=128&q=75"
        />
        <Item
          position={8}
          title="Staked"
          commisionPercentage={2}
          votingPower={15967671}
          imgUrl="https://wallet.keplr.app/_next/image?url=https%3A%2F%2Fs3.amazonaws.com%2Fkeybase_processed_uploads%2F313047df6e3b466844bd8df96e1b9505_360_360.jpg&w=128&q=75"
        />
        <Item
          position={9}
          title="securesecrets.org"
          commisionPercentage={2}
          votingPower={15967671}
          imgUrl="https://wallet.keplr.app/_next/image?url=https%3A%2F%2Fs3.amazonaws.com%2Fkeybase_processed_uploads%2F245cc914fddb8f5957e635cff782ab05_360_360.jpg&w=128&q=75"
        />
        <Item
          position={10}
          title={`Mr. Roboto 🤖's Secret`}
          commisionPercentage={2}
          votingPower={15967671}
        />
      </div>
    </>
  );
}

export default Restake;

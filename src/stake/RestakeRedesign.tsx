import {
  faArrowUpRightFromSquare,
  faChevronRight,
  faGlobe,
  faInfoCircle,
  faMagnifyingGlass,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import MyValidatorsItem from "./components/MyValidatorsItem";
import AllValidatorsItem from "./components/AllValidatorsItem";
import Tooltip from "@mui/material/Tooltip";
import "./RestakeRedesign.scss";
import { SecretjsContext } from "shared/context/SecretjsContext";
import NoScrtWarning from "./components/NoScrtWarning";
import {
  autoRestakeJsonLdSchema,
  autoRestakePageDescription,
  autoRestakePageTitle,
} from "shared/utils/commons";

// for html-head

function RestakeRedesign() {
  const { secretjs, secretAddress } = useContext(SecretjsContext);

  // useEffect(() => {
  //   alert("hi");
  // }, []);

  return (
    <>
      <Helmet>
        <title>{autoRestakePageTitle}</title>

        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="title" content={autoRestakePageTitle} />
        <meta name="application-name" content={autoRestakePageTitle} />
        <meta name="description" content={autoRestakePageDescription} />
        <meta name="robots" content="index,follow" />

        <meta property="og:title" content={autoRestakePageTitle} />
        <meta property="og:description" content={autoRestakePageDescription} />
        {/* <meta property="og:image" content="Image URL Here"/> */}

        <meta name="twitter:title" content={autoRestakePageTitle} />
        <meta name="twitter:description" content={autoRestakePageDescription} />
        {/* <meta name="twitter:image" content="Image URL Here"/> */}

        <script type="application/ld+json">
          {JSON.stringify(autoRestakeJsonLdSchema)}
        </script>
      </Helmet>

      {/* Title */}
      <div className="text-center mb-4 max-w-6xl mx-auto">
        <h1 className="font-bold text-4xl inline text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500">
          Staking
        </h1>
      </div>

      {/* TODO: Check if user has SCRT */}
      {secretjs && secretAddress ? <NoScrtWarning /> : null}

      {/* My Validators */}
      <div className="my-validators mb-20 max-w-6xl mx-auto">
        <div className="font-bold text-lg mb-4 px-4">My Validators</div>

        <div className="px-4 pb-2">
          <button
            disabled
            onClick={() => alert("In implementation")}
            className="text-medium disabled:bg-neutral-600 enabled:bg-green-600 enabled:hover:bg-green-700 disabled:text-neutral-400 enabled:text-white transition-colors font-semibold px-2 py-2 text-sm rounded-md"
          >
            Enable Auto Restake
          </button>
          <Tooltip
            title={
              'Automating the process of "claim and restake" for your SCRT. Your normal SCRT balance is not affected. Only pending staking reward will be affected.'
            }
            placement="right"
            arrow
          >
            <FontAwesomeIcon
              icon={faInfoCircle}
              className="ml-2 text-neutral-400"
            />
          </Tooltip>
        </div>
        <div className="my-validators flex flex-col px-4">
          <MyValidatorsItem
            name="🪐 𝕊ecret 𝕊aturn | 1% forever"
            commisionPercentage={2}
            stakedAmount={10816.72}
            imgUrl="https://wallet.keplr.app/_next/image?url=https%3A%2F%2Fs3.amazonaws.com%2Fkeybase_processed_uploads%2Fee1614693d1fa8c08ef59ebf812f0c05_360_360.jpg&w=128&q=75"
          />
          <MyValidatorsItem
            name="0% Fee >2024 💸 | melea"
            commisionPercentage={2}
            stakedAmount={15967671}
            imgUrl="https://wallet.keplr.app/_next/image?url=https%3A%2F%2Fs3.amazonaws.com%2Fkeybase_processed_uploads%2Fff855e93d7b9c9de64ce0e404d47c105_360_360.jpg&w=128&q=75"
          />
        </div>
      </div>

      {/* All Validators */}
      <div className="max-w-6xl mx-auto">
        <div className="font-bold text-lg mb-4 px-4">All Validators</div>
        <div className="grid grid-cols-12 px-4">
          {/* Search */}
          <div className="col-span-12 md:col-span-6">
            <div className="relative w-full sm:w-96 mb-4">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="" />
              </div>
              <input
                // value={searchText}
                // onChange={(e) => setSearchText(e.target.value)}
                type="text"
                id="search"
                className="block w-full p-2.5 pl-10 text-sm rounded-lg text-neutral-800 dark:text-white bg-white dark:bg-neutral-800 placeholder-neutral-600 dark:placeholder-neutral-400 border border-neutra-300 dark:border-neutral-700"
                placeholder="Search"
              />
            </div>
          </div>
        </div>
        <div className="all-validators flex flex-col px-4">
          <AllValidatorsItem
            position={1}
            name="0% Fee >2024 💸 | melea"
            commisionPercentage={0}
            votingPower={15967671}
            imgUrl="https://wallet.keplr.app/_next/image?url=https%3A%2F%2Fs3.amazonaws.com%2Fkeybase_processed_uploads%2Fff855e93d7b9c9de64ce0e404d47c105_360_360.jpg&w=128&q=75"
          />
          <AllValidatorsItem
            position={2}
            name="Citadel.one"
            commisionPercentage={5}
            votingPower={15967671}
            imgUrl="https://wallet.keplr.app/_next/image?url=https%3A%2F%2Fs3.amazonaws.com%2Fkeybase_processed_uploads%2F2826e38259411adafb416505fb948c05_360_360.jpg&w=128&q=75"
          />
          <AllValidatorsItem
            position={3}
            name="Blizzard.finance❄️"
            commisionPercentage={5}
            votingPower={15967671}
            imgUrl="https://wallet.keplr.app/_next/image?url=https%3A%2F%2Fs3.amazonaws.com%2Fkeybase_processed_uploads%2F5a41bb0b26799624923e9f29c34d3805_360_360.jpg&w=128&q=75"
          />
          <AllValidatorsItem
            position={4}
            name="WhisperNode🤐"
            commisionPercentage={5}
            votingPower={15967671}
            imgUrl="https://wallet.keplr.app/_next/image?url=https%3A%2F%2Fs3.amazonaws.com%2Fkeybase_processed_uploads%2Ffd488355ab385fc78fa6c0cee76c3205_360_360.jpg&w=128&q=75"
          />
          <AllValidatorsItem
            position={5}
            name="Mario | #noCaps"
            commisionPercentage={4}
            votingPower={15967671}
            imgUrl="https://wallet.keplr.app/_next/image?url=https%3A%2F%2Fs3.amazonaws.com%2Fkeybase_processed_uploads%2F04970c2854e4f25102fb781811167a05_360_360.jpg&w=128&q=75"
          />
          <AllValidatorsItem
            position={6}
            name="Kraken"
            commisionPercentage={100}
            votingPower={15967671}
            imgUrl="https://wallet.keplr.app/_next/image?url=https%3A%2F%2Fs3.amazonaws.com%2Fkeybase_processed_uploads%2Fc980e65e14adb3528c44e23e0ee4e405_360_360.jpg&w=128&q=75"
          />
          <AllValidatorsItem
            position={7}
            name="🪐 𝕊ecret 𝕊aturn | 1% forever"
            commisionPercentage={1}
            votingPower={15967671}
            imgUrl="https://wallet.keplr.app/_next/image?url=https%3A%2F%2Fs3.amazonaws.com%2Fkeybase_processed_uploads%2Fee1614693d1fa8c08ef59ebf812f0c05_360_360.jpg&w=128&q=75"
          />
          <AllValidatorsItem
            position={8}
            name="Staked"
            commisionPercentage={10}
            votingPower={15967671}
            imgUrl="https://wallet.keplr.app/_next/image?url=https%3A%2F%2Fs3.amazonaws.com%2Fkeybase_processed_uploads%2F313047df6e3b466844bd8df96e1b9505_360_360.jpg&w=128&q=75"
          />
          <AllValidatorsItem
            position={9}
            name="securesecrets.org"
            commisionPercentage={5}
            votingPower={15967671}
            imgUrl="https://wallet.keplr.app/_next/image?url=https%3A%2F%2Fs3.amazonaws.com%2Fkeybase_processed_uploads%2F245cc914fddb8f5957e635cff782ab05_360_360.jpg&w=128&q=75"
          />
          <AllValidatorsItem
            position={10}
            name={`Mr. Roboto 🤖's Secret`}
            commisionPercentage={8}
            votingPower={15967671}
          />
        </div>
      </div>
    </>
  );
}

export default RestakeRedesign;

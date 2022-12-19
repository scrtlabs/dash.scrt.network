import React, { useEffect, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { Breakpoint } from "react-socks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTrendUp, faAward, faCircle, faCopy, faCube, faDollar, faPercentage } from "@fortawesome/free-solid-svg-icons";
import { useDashboardContext } from "Dashboard/Dashboard";

export default function InfoBoxes() {
  const { apiData, setApiData, secretjs, secretAddress } = useDashboardContext();


  const [communityPool, setCommunityPool] = useState([]);

  // let foundationTax: { tax: any; } | null = null;
  // async function setFoundationTax() {
  //   foundationTax = await secretjs?.query?.distribution?.foundationTax();
  // }
  // setFoundationTax();



  useEffect(() => {
      secretjs?.query?.distribution?.communityPool().then(data => setCommunityPool(data));

  }, [communityPool]);

  console.log("***")
  console.log(communityPool)
  console.log("***")

  return (
    <div className="px-4 mx-auto">
      <div className="grid grid-cols-12 gap-4">
        {/* Item */}
        <div className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-2 bg-zinc-800 p-4 rounded-lg">
          <div className="flex flex-col items-center">
            <span className="fa-stack fa-2x mb-2">
              <FontAwesomeIcon icon={faCircle} className="fa-stack-2x text-emerald-900" />
              <FontAwesomeIcon icon={faCube} className="fa-stack-1x fa-inverse text-emerald-400" />
            </span>
            <div className="font-bold text-lg">$0.61</div>
            <div className="text-md text-zinc-400">Current Price [USD]</div>
          </div>
        </div>
        {/* Item */}
        <div className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-2 bg-zinc-800 p-4 rounded-lg">
          <div className="flex flex-col items-center">
            <span className="fa-stack fa-2x mb-2">
              <FontAwesomeIcon icon={faCircle} className="fa-stack-2x text-cyan-900" />
              <FontAwesomeIcon icon={faCube} className="fa-stack-1x fa-inverse text-cyan-400" />
            </span>
            <div className="font-bold text-lg">6587852</div>
            <div className="text-md text-zinc-400">Block Height</div>
          </div>
        </div>
        {/* Item */}
        <div className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-2 bg-zinc-800 p-4 rounded-lg">
          <div className="flex flex-col items-center">
            <span className="fa-stack fa-2x mb-2">
              <FontAwesomeIcon icon={faCircle} className="fa-stack-2x text-amber-900" />
              <FontAwesomeIcon icon={faDollar} className="fa-stack-1x fa-inverse text-amber-400" />
            </span>
            <div className="font-bold text-lg">239.84M</div>
            <div className="text-md text-zinc-400">Total Supply</div>
          </div>
        </div>
        {/* Item */}
        <div className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-2 bg-zinc-800 p-4 rounded-lg">
          <div className="flex flex-col items-center">
            <span className="fa-stack fa-2x mb-2">
              <FontAwesomeIcon icon={faCircle} className="fa-stack-2x text-red-900" />
              <FontAwesomeIcon icon={faPercentage} className="fa-stack-1x fa-inverse text-red-400" />
            </span>
            <div className="font-bold text-lg">58.06%</div>
            <div className="text-md text-zinc-400">Bonded: 139.24M</div>
          </div>
        </div>
        {/* Item */}
        <div className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-2 bg-zinc-800 p-4 rounded-lg">
          <div className="flex flex-col items-center">
            <span className="fa-stack fa-2x mb-2">
              <FontAwesomeIcon icon={faCircle} className="fa-stack-2x text-pink-900" />
              <FontAwesomeIcon icon={faArrowTrendUp} className="fa-stack-1x fa-inverse text-pink-400" />
            </span>
            <div className="font-bold text-lg">15%</div>
            <div className="text-md text-zinc-400">Inflation</div>
          </div>
        </div>
        {/* Item */}
        <div className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-2 bg-zinc-800 p-4 rounded-lg">
          <div className="flex flex-col items-center">
            <span className="fa-stack fa-2x mb-2">
              <FontAwesomeIcon icon={faCircle} className="fa-stack-2x text-purple-900" />
              <FontAwesomeIcon icon={faAward} className="fa-stack-1x fa-inverse text-purple-400" />
            </span>
            <div className="font-bold text-lg">873,871 SCRT</div>
            <div className="text-md text-zinc-400">Community Pool</div>
          </div>
        </div>
      </div>
    </div>
  );
}

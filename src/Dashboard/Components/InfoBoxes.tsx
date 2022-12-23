import React, { useEffect, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { Breakpoint } from "react-socks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTrendUp, faAward, faCircle, faCopy, faCube, faDollar, faPercentage } from "@fortawesome/free-solid-svg-icons";
import { useDashboardContext } from "Dashboard/Dashboard";
import { chains } from "General/Utils/config";
import { SecretNetworkClient } from "secretjs";
const SECRET_RPC = chains["Secret Network"].rpc;
const SECRET_LCD = chains["Secret Network"].lcd;
const SECRET_CHAIN_ID = chains["Secret Network"].chain_id;

export default function InfoBoxes() {
  const { apiData, setApiData} = useDashboardContext();


  const [communityPool, setCommunityPool] = useState(Number); // in uscrt
  const [blockHeight, setBlockHeight] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(Number);
  const [inflation, setInflation] = useState(Number);
  const [pool, setPool] = useState(null);

  const COUNT_ABBRS = ['', 'K', 'M', 'B', 't', 'q', 's', 'S', 'o', 'n', 'd', 'U', 'D', 'T', 'Qt', 'Qd', 'Sd', 'St'];

  function formatNumber(count: number, withAbbr = false, decimals = 2) {
    const i = count === 0 ? count : Math.floor(Math.log(count) / Math.log(1000));
    if (withAbbr && COUNT_ABBRS[i]) {
      return parseFloat((count / (1000 ** i)).toFixed(decimals)).toString() + COUNT_ABBRS[i];
    }
  }

  useEffect(() => {
    const queryData = async () => {
      const secretjsquery = new SecretNetworkClient({
        url: SECRET_LCD,
        chainId: "secret-4",
      });
      secretjsquery?.query?.distribution?.communityPool("")?.then(res => setCommunityPool(Math.floor((res.pool[1].amount) / 10e5)));
      secretjsquery?.query?.tendermint?.getLatestBlock("")?.then(res => setBlockHeight(res.block.header.height));
      secretjsquery?.query?.mint?.inflation("")?.then(res => setInflation((res.inflation*100).toFixed(2)));
      secretjsquery?.query?.staking?.pool("")?.then(res => setPool(res.pool));
      setCurrentPrice(apiData?.prices[apiData?.prices?.length-1][1]);
    }
    
    queryData();
  }, []);

  useEffect(() => {
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=secret&vs_currencies=USD`)
      .then((resp) => resp.json())
      .then((result: { [coingecko_id: string]: { usd: number } }) => {
        setCurrentPrice(result["secret"].usd)
      });
  }, []);

  const bondedToken = parseInt(pool?.bonded_tokens) / 10e5;
  const notBondedToken = parseInt(pool?.not_bonded_tokens) / 10e4;
  const totalPool = bondedToken + notBondedToken;
  const poolPercentageBonded = (bondedToken / totalPool * 100).toFixed(2);

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
            <div className="font-bold text-lg">{currentPrice ? currentPrice.toLocaleString("en-US", {style:"currency", currency:"USD"}) : ""}</div>
            <div className="text-md text-zinc-400">Current Price</div>
          </div>
        </div>
        {/* Item */}
        <div className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-2 bg-zinc-800 p-4 rounded-lg">
          <div className="flex flex-col items-center">
            <span className="fa-stack fa-2x mb-2">
              <FontAwesomeIcon icon={faCircle} className="fa-stack-2x text-cyan-900" />
              <FontAwesomeIcon icon={faCube} className="fa-stack-1x fa-inverse text-cyan-400" />
            </span>
            <div className="font-bold text-lg">{blockHeight}</div>
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
            <div className="font-bold text-lg">{formatNumber(totalPool, true, 2)}</div>
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
            <div className="font-bold text-lg">{poolPercentageBonded}%</div>
            <div className="text-md text-zinc-400">Bonded: {formatNumber(bondedToken, true, 2)}</div>
            <div className="text-md text-zinc-400">Not bonded: {formatNumber(notBondedToken, true, 2)}</div>
          </div>
        </div>
        {/* Item */}
        <div className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-2 bg-zinc-800 p-4 rounded-lg">
          <div className="flex flex-col items-center">
            <span className="fa-stack fa-2x mb-2">
              <FontAwesomeIcon icon={faCircle} className="fa-stack-2x text-pink-900" />
              <FontAwesomeIcon icon={faArrowTrendUp} className="fa-stack-1x fa-inverse text-pink-400" />
            </span>
            <div className="font-bold text-lg">{inflation}%</div>
            <div className="text-md text-zinc-400">Current Inflation</div>
          </div>
        </div>
        {/* Item */}
        <div className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-2 bg-zinc-800 p-4 rounded-lg">
          <div className="flex flex-col items-center">
            <span className="fa-stack fa-2x mb-2">
              <FontAwesomeIcon icon={faCircle} className="fa-stack-2x text-purple-900" />
              <FontAwesomeIcon icon={faAward} className="fa-stack-1x fa-inverse text-purple-400" />
            </span>
            <div className="font-bold text-lg">{communityPool ? communityPool.toLocaleString() : ""} SCRT</div>
            <div className="text-md text-zinc-400">Community Pool</div>
          </div>
        </div>
      </div>
    </div>
  );
}
function async(arg0: () => void) {
  throw new Error("Function not implemented.");
}

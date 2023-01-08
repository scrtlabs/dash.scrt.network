import React, { useEffect, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { Breakpoint } from "react-socks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTrendUp, faAward, faCircle, faCopy, faCube, faDollar, faPercentage } from "@fortawesome/free-solid-svg-icons";
import { useDashboardContext } from "Dashboard/Dashboard";
import { chains } from "General/Utils/config";
import { SecretNetworkClient } from "secretjs";
import { SECRET_LCD, SECRET_CHAIN_ID} from "General/Utils/config";


export default function InfoBoxes() {
  const { apiData, setApiData} = useDashboardContext() as any;


  const [communityPool, setCommunityPool] = useState(Number); // in uscrt
  const [blockHeight, setBlockHeight] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(Number);
  const [inflation, setInflation] = useState(Number);
  const [pool, setPool] = useState(null);
  const [totalSupply, setTotalSupply] = useState(null);

  useEffect(() => {
    const queryData = async () => {
      const secretjsquery = new SecretNetworkClient({
        url: SECRET_LCD,
        chainId: SECRET_CHAIN_ID,
      });
      secretjsquery?.query?.distribution?.communityPool("")?.then(res => setCommunityPool(Math.floor((res.pool[1] as any).amount / 10e5)));
      secretjsquery?.query?.tendermint?.getLatestBlock("")?.then(res => setBlockHeight(res.block.header.height));
      secretjsquery?.query?.mint?.inflation("")?.then(res => setInflation(((res.inflation as any)*100).toFixed(2) as any));
      secretjsquery?.query?.staking?.pool("")?.then(res => setPool(res.pool));
      secretjsquery?.query?.bank?.supplyOf({denom:"uscrt"})?.then(res => setTotalSupply((res.amount.amount as any)/1e6));
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
  const notBondedToken = totalSupply-bondedToken
  const totalPool = totalSupply;
  const poolPercentageBonded = (bondedToken / totalPool * 100).toFixed(2);

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Item */}
      <div className="col-span-12 sm:col-span-6  xl:col-span-3 bg-neutral-800 p-4 rounded-lg">
        <div className="flex flex-col items-center">
          <span className="fa-stack fa-2x mb-2">
            <FontAwesomeIcon icon={faCircle} className="fa-stack-2x text-emerald-900" />
            <FontAwesomeIcon icon={faCube} className="fa-stack-1x fa-inverse text-emerald-400" />
          </span>
          <div className="font-semibold text-lg">{currentPrice ? currentPrice.toLocaleString("en-US", {style:"currency", currency:"USD"}) : ""}</div>
          <div className="text-md text-neutral-400">Current Price</div>
        </div>
      </div>
      {/* Item */}
      <div className="col-span-12 sm:col-span-6  xl:col-span-3 bg-neutral-800 p-4 rounded-lg">
        <div className="flex flex-col items-center">
          <span className="fa-stack fa-2x mb-2">
            <FontAwesomeIcon icon={faCircle} className="fa-stack-2x text-cyan-900" />
            <FontAwesomeIcon icon={faCube} className="fa-stack-1x fa-inverse text-cyan-400" />
          </span>
          <div className="font-semibold text-lg">{blockHeight}</div>
          <div className="text-md text-neutral-400">Block Height</div>
        </div>
      </div>
      <div className="col-span-12 sm:col-span-6  xl:col-span-3 bg-neutral-800 p-4 rounded-lg">
        <div className="flex flex-col items-center">
          <span className="fa-stack fa-2x mb-2">
            <FontAwesomeIcon icon={faCircle} className="fa-stack-2x text-pink-900" />
            <FontAwesomeIcon icon={faArrowTrendUp} className="fa-stack-1x fa-inverse text-pink-400" />
          </span>
          <div className="font-semibold text-lg">{inflation}%</div>
          <div className="text-md text-neutral-400">Current Inflation</div>
        </div>
      </div>
      {/* Item */}
      <div className="col-span-12 sm:col-span-6  xl:col-span-3 bg-neutral-800 p-4 rounded-lg">
        <div className="flex flex-col items-center">
          <span className="fa-stack fa-2x mb-2">
            <FontAwesomeIcon icon={faCircle} className="fa-stack-2x text-purple-900" />
            <FontAwesomeIcon icon={faAward} className="fa-stack-1x fa-inverse text-purple-400" />
          </span>
          <div className="font-semibold text-lg">{communityPool ? communityPool.toLocaleString() : ""} SCRT</div>
          <div className="text-md text-neutral-400">Community Pool</div>
        </div>
      </div>
    </div>
  );
}
function async(arg0: () => void) {
  throw new Error("Function not implemented.");
}


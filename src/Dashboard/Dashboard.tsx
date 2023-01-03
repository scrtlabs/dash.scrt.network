import { KeplrContext } from "General/Layouts/defaultLayout";
import { chains } from "General/Utils/config";
import React, { useEffect, useState, createContext, useContext } from "react";
import { SecretNetworkClient } from "secretjs";
import BlockHeight from "./Components/BlockHeight";
import BlockInfo from "./Components/BlockInfo";
import CommunityPool from "./Components/CommunityPool";
import CurrentPrice from "./Components/CurrentPrice";
import Inflation from "./Components/Inflation";
import InfoBoxes from "./Components/InfoBoxes";
import PriceChart from "./Components/PriceChart";
import StakingChart from "./Components/StakingChart";
import VolumeChart from "./Components/VolumeChart";
const SECRET_RPC = chains["Secret Network"].rpc;
const SECRET_LCD = chains["Secret Network"].lcd;
const SECRET_CHAIN_ID = chains["Secret Network"].chain_id;



const COUNT_ABBRS = ['', 'K', 'M', 'B', 't', 'q', 's', 'S', 'o', 'n', 'd', 'U', 'D', 'T', 'Qt', 'Qd', 'Sd', 'St'];

function formatNumber(count: number, withAbbr = false, decimals = 2) {
  const i = count === 0 ? count : Math.floor(Math.log(count) / Math.log(1000));
  if (withAbbr && COUNT_ABBRS[i]) {
    return parseFloat((count / (1000 ** i)).toFixed(decimals)).toString() + COUNT_ABBRS[i];
  }
}



export const DashboardContext = createContext<{ apiData: undefined; setApiData: React.Dispatch<React.SetStateAction<undefined>>; }| null>(null);

export function Dashboard() {
  const [coingeckoApiData, setCoinGeckoApiData] = useState();
  const [mintscanBlockTime, setMintscanBlockTime] = useState(Number);
  const [spartanApiData, setSpartanApiData] = useState();


  const [blockHeight, setBlockHeight] = useState(0);
  const [inflation, setInflation] = useState(0);
  const [circulatingSupply, setCirculatingSupply] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(Number);
  const [communityPool, setCommunityPool] = useState(Number); // in uscrt
  const [blockTime, setBlockTime] = useState(Number); // in uscrt

  useEffect(() => {
    // Coingecko API
    let coingeckoApiUrl = `https://api.coingecko.com/api/v3/coins/secret/market_chart?vs_currency=usd&days=30`;
    fetch(coingeckoApiUrl).then(response => response.json()).then((response) => {
        setCoinGeckoApiData(response);
    });

    // Mintscan API
    let mintscanBlockTimeApiUrl = `https://api.mintscan.io/v1/secret/block/blocktime`;
    fetch(mintscanBlockTimeApiUrl).then(response => response.json()).then((response) => {
      setMintscanBlockTime(response.block_time);
    });

    //  API
    let spartanApiUrl = `https://core.spartanapi.dev/secret/chains/secret-4/chain_info`;
    fetch(spartanApiUrl).then(response => response.json()).then((response) => {
      setSpartanApiData(response);
    });
  }, []);
  

  useEffect(() => {
    const queryData = async () => {
      const secretjsquery = new SecretNetworkClient({
        url: SECRET_LCD,
        chainId: "secret-4",
      });
      setCurrentPrice(coingeckoApiData?.prices[coingeckoApiData?.prices?.length-1][1]);
      secretjsquery?.query?.tendermint?.getLatestBlock("")?.then(res => setBlockHeight(res.block.header.height));
      setInflation(spartanApiData?.inflation);
      setCirculatingSupply(spartanApiData?.circulating_supply);
      setBlockTime(spartanApiData?.avg_block_time);
      // secretjsquery?.query?.mint?.inflation("")?.then(res => setInflation(res.inflation));
      secretjsquery?.query?.distribution?.communityPool("")?.then(res => setCommunityPool(Math.floor((res.pool[1].amount) / 10e5)));
    }
    
    queryData();
  }, [coingeckoApiData, spartanApiData]);



  return (
    <>
      <DashboardContext.Provider value={{ apiData: coingeckoApiData, setApiData: setCoinGeckoApiData }}>
        <div className="mt-4 px-4 mx-auto space-y-4 w-full">
          <div className="grid grid-cols-12 gap-4">

            {/* Block Info */}
            <div className="col-span-12 md:col-span-6 lg:col-span-6 2xl:col-span-4">
              <BlockInfo blockHeight={blockHeight || 0} blockTime={blockTime} circulatingSupply={circulatingSupply} inflation={inflation}/>
            </div>

            <div className="col-span-12 sm:col-span-6 lg:col-span-6 xl:col-span-4 2xl:col-span-3 bg-neutral-800 px-6 py-8 rounded-lg">
              <StakingChart />
            </div>

            {/* Current Price */}
            <div className="col-span-12 sm:col-span-6 xl:col-span-3">
              <CurrentPrice price={currentPrice}/>
            </div>

            {/* Block Height */}
            <div className="col-span-12 sm:col-span-6 xl:col-span-3">
              <BlockHeight blockHeight={blockHeight}/>
            </div>

            {/* Inflation */}
            <div className="col-span-12 sm:col-span-6 xl:col-span-3">
              <Inflation amount={inflation}/>
            </div>

            {/* Community Pool */}
            <div className="col-span-12 sm:col-span-6 xl:col-span-3">
              <CommunityPool amount={communityPool}/>
            </div>
          </div>
          
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 sm:col-span-6 lg:col-span-6 xl:col-span-4 2xl:col-span-3 bg-neutral-800 px-6 py-8 rounded-lg">
              <StakingChart />
            </div>
            {/* Item */}
            <div className="col-span-12 xl:col-span-6 bg-neutral-800 p-4 rounded-lg">
              <PriceChart />
            </div>
            {/* Item */}
            <div className="col-span-12 xl:col-span-6 bg-neutral-800 p-4 rounded-lg">
              <VolumeChart />
            </div>
            
          </div>
        </div>
      </DashboardContext.Provider>
    </>
  )
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("Context must be used within a Provider");
  }
  return context;
}
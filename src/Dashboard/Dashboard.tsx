import { chains } from "General/Utils/config";
import React, { useEffect, useState, createContext, useContext } from "react";
import { SecretNetworkClient } from "secretjs";
import BlockHeight from "./Components/BlockHeight";
import CommunityPool from "./Components/CommunityPool";
import CurrentPrice from "./Components/CurrentPrice";
import PriceChart from "./Components/PriceChart";
import QuadTile from "./Components/QuadTile";
import StakingChart from "./Components/StakingChart";
import VolumeChart from "./Components/VolumeChart";
const SECRET_LCD = chains["Secret Network"].lcd;

const COUNT_ABBRS = ['', 'K', 'M', 'B', 't', 'q', 's', 'S', 'o', 'n', 'd', 'U', 'D', 'T', 'Qt', 'Qd', 'Sd', 'St'];

function formatNumber(count: number, withAbbr = false, decimals = 2) {
  const i = count === 0 ? count : Math.floor(Math.log(count) / Math.log(1000));
  if (withAbbr && COUNT_ABBRS[i]) {
    return parseFloat((count / (1000 ** i)).toFixed(decimals)).toString() + COUNT_ABBRS[i];
  }
}

export const DashboardContext = createContext<{ coingeckoApiData_Day: any; coingeckoApiData_Month: any; coingeckoApiData_Year: any } | null>(null);

export function Dashboard() {
  const [coingeckoApiData_Day, setCoinGeckoApiData_Day] = useState();
  const [coingeckoApiData_Month, setCoinGeckoApiData_Month] = useState();
  const [coingeckoApiData_Year, setCoinGeckoApiData_Year] = useState();
  const [mintscanBlockTime, setMintscanBlockTime] = useState(Number);
  const [spartanApiData, setSpartanApiData] = useState();

  // block height
  const [blockHeight, setBlockHeight] = useState(null); // by Coingecko API
  const [blockHeightFormattedString, setblockHeightFormattedString] = useState("");

  useEffect(() => {
    if (blockHeight) {
      setblockHeightFormattedString(parseInt(blockHeight).toLocaleString());
    }
  }, [blockHeight]);

  // block time
  const [blockTime, setBlockTime] = useState(null); // in seconds
  const [blockTimeFormattedString, setbBlockTimeFormattedString] = useState("");

  useEffect(() => {
    if (blockTime) {
      setbBlockTimeFormattedString(blockTime + "s");
    }
  }, [blockTime]);

  // daily transactions
  const [dailyTransactions, setDailyTransactions] = useState("");
  const [dailyTransactionsFormattedString, setDailyTransactionsFormattedString] = useState("");

  useEffect(() => {
    if (dailyTransactions) {
      setDailyTransactionsFormattedString((parseInt(dailyTransactions).toLocaleString()));
    }
  }, [dailyTransactions]);

  // community tax
  const [communityTax, setCommunityTax] = useState("");
  const [communityTaxFormattedString, setCommunityTaxFormattedString] = useState("");

  useEffect(() => {
    if (communityTax) {
      setCommunityTaxFormattedString((parseFloat(communityTax)*100).toString() + "%");
    }
  }, [communityTax]);

  // secretFoundationTax
  const [secretFoundationTax, setSecretFoundationTax] = useState("");
  const [secretFoundationTaxFormattedString, setSecretFoundationTaxFormattedString] = useState("");

  useEffect(() => {
    if (secretFoundationTax) {
      setSecretFoundationTaxFormattedString((parseFloat(secretFoundationTax)*100).toString() + "%");
    }
  }, [secretFoundationTax]);

  // feesPaid
  const [feesPaid, setFeesPaid] = useState("");
  const [feesPaidFormattedString, setFeesPaidFormattedString] = useState("");

  useEffect(() => {
    if (feesPaid) {
      setFeesPaidFormattedString(parseInt(feesPaid).toLocaleString());
    }
  }, [feesPaid]);

  // inflation
  const [inflation, setInflation] = useState(0);
  const [inflationFormattedString, setInflationFormattedString] = useState("");

  useEffect(() => {
    if (inflation) {
      setInflationFormattedString((inflation*100).toString() + "%");
    }
  }, [inflation]);

  // APR
  const [growthRate, setGrowthRate] = useState(0);
  const [growthRateFormattedString, setGrowthRateFormattedString] = useState("");

  useEffect(() => {
    if (growthRate) {
      const percentage = growthRate*100;
      setGrowthRateFormattedString((percentage.toFixed(2)) + "%");
    }
  }, [growthRate]);

  //Bonded Ratio
  const [bondedRatio, setBondedRatio] = useState(0); 

  // totalSupply, bonded, notBonded
  const [totalSupply, setTotalSupply] = useState(Number);
  const [bondedToken, setBondedToken] = useState(Number);
  const [notBondedToken, setNotBondedToken] = useState(Number);

  useEffect(() => {
    const queryData = async () => {
      const secretjsquery = new SecretNetworkClient({
        url: SECRET_LCD,
        chainId: "secret-4",
      });
      secretjsquery?.query?.bank?.supplyOf({denom:"uscrt"})?.then(res => setTotalSupply(res.amount.amount/1e6));
      secretjsquery?.query?.staking?.pool("")?.then(res => setBondedToken(parseInt(res.pool.bonded_tokens) / 10e5));
      secretjsquery?.query?.staking?.pool("")?.then(res => setNotBondedToken(parseInt(res.pool.not_bonded_tokens) / 10e4));
    }
    
    queryData();
  }, []);

  useEffect(() => {
    console.log("totalSupply: " + totalSupply);
    console.log("staked: " + bondedToken);
    console.log("Unstaked: " + notBondedToken);
  }, [totalSupply, bondedToken, notBondedToken]);

  const [circulatingSupply, setCirculatingSupply] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(Number);
  const [communityPool, setCommunityPool] = useState(Number); // in uscrt

  useEffect(() => {
    // Coingecko API
    let coingeckoApiUrl_Day = `https://api.coingecko.com/api/v3/coins/secret/market_chart?vs_currency=usd&days=1`;
    fetch(coingeckoApiUrl_Day).then(response => response.json()).then((response) => { setCoinGeckoApiData_Day(response) });

    let coingeckoApiUrl_Month = `https://api.coingecko.com/api/v3/coins/secret/market_chart?vs_currency=usd&days=30`;
    fetch(coingeckoApiUrl_Month).then(response => response.json()).then((response) => { setCoinGeckoApiData_Month(response) });

    let coingeckoApiUrl_Year = `https://api.coingecko.com/api/v3/coins/secret/market_chart?vs_currency=usd&days=365`;
    fetch(coingeckoApiUrl_Year).then(response => response.json()).then((response) => { setCoinGeckoApiData_Year(response) });

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
      setCurrentPrice(coingeckoApiData_Month?.prices[coingeckoApiData_Month?.prices?.length-1][1]);
      secretjsquery?.query?.tendermint?.getLatestBlock("")?.then(res => setBlockHeight(res.block.header.height)); // setting block height
      // secretjsquery?.query?.mint?.inflation("")?.then(res => setInflation(res.inflation));
      secretjsquery?.query?.distribution?.communityPool("")?.then(res => setCommunityPool(Math.floor((res.pool[1].amount) / 10e5)));
    }
    
    queryData();
  }, [coingeckoApiData_Month]);

  useEffect(() => {
    const queryData = async () => {
      setInflation(spartanApiData?.inflation);
      setCirculatingSupply(spartanApiData?.circulating_supply);
      setBlockTime(spartanApiData?.avg_block_time);
      setDailyTransactions(spartanApiData?.tx_volume);
      setCommunityTax(spartanApiData?.staking_params?.community_tax);
      setSecretFoundationTax(spartanApiData?.staking_params?.secret_foundation_tax);
      setFeesPaid(spartanApiData?.fees_paid);
      setBondedRatio(spartanApiData?.bond_rate)
    }
    
    queryData();
  }, [spartanApiData]);

  useEffect(() => {
    if (inflation && secretFoundationTax && communityTax) { // staking ratio missing
      const I = inflation; // inflation
      const F = parseFloat(secretFoundationTax); // foundation tax
      const C = 0.05; // validator commision rate; median is 5%
      const T = parseFloat(communityTax); // community tax
      const R = bondedRatio / 100; // bonded ratio
      setGrowthRate((I / R) * (1 - F - T) * (1 - C));
    }
  }, [inflation, secretFoundationTax, communityTax, bondedRatio]);

  return (
    <>
      <DashboardContext.Provider value={{ coingeckoApiData_Day, coingeckoApiData_Month, coingeckoApiData_Year }}>
        <div className="px-4 mx-auto space-y-4 w-full">
          <div className="grid grid-cols-12 gap-4">

          {/* Current Price */}
          <div className="col-span-12 sm:col-span-6 xl:col-span-3">
            <CurrentPrice price={currentPrice}/>
          </div>

          {/* Community Pool */}
          <div className="col-span-12 sm:col-span-6 xl:col-span-3">
            <CommunityPool amount={communityPool}/>
          </div>

          {/* Block Height */}
          <div className="col-span-12 sm:col-span-6 xl:col-span-3">
            <BlockHeight blockHeight={blockHeight}/>
          </div>

          {/* Block Height */}
          <div className="col-span-12 sm:col-span-6 xl:col-span-3">
            <BlockHeight blockHeight={blockHeight}/>
          </div>

          {/* Inflation */}
          {/* <div className="col-span-12 sm:col-span-6 xl:col-span-3">
            <Inflation amount={inflation}/>
          </div> */}

            {/* Block Info */}
            <div className="col-span-12 md:col-span-6 lg:col-span-6 2xl:col-span-4">
              {/* <BlockInfo blockHeight={blockHeight || 0} blockTime={blockTime} circulatingSupply={circulatingSupply} inflation={inflation}/> */}
              <QuadTile item1_key="Block Height" item1_value={blockHeightFormattedString} item2_key="Block Time" item2_value={blockTimeFormattedString} item3_key="Daily Transactions" item3_value={dailyTransactionsFormattedString} item4_key="Fees Paid" item4_value={feesPaidFormattedString}/>
            </div>

            <div className="col-span-12 sm:col-span-6 lg:col-span-6 xl:col-span-4 2xl:col-span-4 bg-neutral-800 px-6 py-8 rounded-lg">
              <StakingChart />
            </div>

            {/* Block Info */}
            <div className="col-span-12 md:col-span-6 lg:col-span-6 2xl:col-span-4">
              <QuadTile item1_key="APR" item1_value={growthRateFormattedString} item2_key="Inflation" item2_value={inflationFormattedString} item3_key="Community Tax" item3_value={communityTaxFormattedString} item4_key="Secret Foundation Tax" item4_value={secretFoundationTaxFormattedString}/>
            </div>

          </div>
          
          <div className="grid grid-cols-12 gap-4">
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
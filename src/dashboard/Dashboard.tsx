import { chains } from "shared/utils/config";
import { useEffect, useState, createContext, useContext } from "react";
import { SecretNetworkClient } from "secretjs";
import CurrentPrice from "./components/CurrentPrice";
import MiniTile from "./components/MiniTile";
import PriceVolumeTVL from "./components/PriceVolTVLChart/PriceVolumeTVL";
import QuadTile from "./components/QuadTile";
import SocialMedia from "./components/SocialMedia";
import StakingChart from "./components/StakingChart";
import { formatNumber } from "shared/utils/commons";
import { APIContext } from "shared/context/APIContext";

export const DashboardContext = createContext<{
  coingeckoApiData_Day: any;
  coingeckoApiData_Month: any;
  coingeckoApiData_Year: any;
  defiLamaApiData_Year: any;
} | null>(null);

export function Dashboard() {
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

  // block height
  const [blockHeightFormattedString, setblockHeightFormattedString] =
    useState("");

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
  const [
    dailyTransactionsFormattedString,
    setDailyTransactionsFormattedString,
  ] = useState("");

  useEffect(() => {
    if (dailyTransactions) {
      setDailyTransactionsFormattedString(
        parseInt(dailyTransactions).toLocaleString()
      );
    }
  }, [dailyTransactions]);

  // taxes
  const [taxFormattedString, setTaxFormattedString] = useState("");

  useEffect(() => {
    if (communityTax) {
      setTaxFormattedString(
        (parseFloat(communityTax) * 100).toString() +
          "%" +
          " / " +
          (parseFloat(secretFoundationTax) * 100).toString() +
          "%"
      );
    }
  }, [communityTax, secretFoundationTax]);

  // feesPaid
  const [feesPaid, setFeesPaid] = useState("");
  const [feesPaidFormattedString, setFeesPaidFormattedString] = useState("");

  useEffect(() => {
    if (feesPaid) {
      setFeesPaidFormattedString(
        (parseFloat(feesPaid) / 1e6).toFixed(2).toString() + " SCRT"
      );
    }
  }, [feesPaid]);

  // inflation
  const [inflationFormattedString, setInflationFormattedString] = useState("");

  useEffect(() => {
    if (inflation) {
      setInflationFormattedString((inflation * 100).toString() + "%");
    }
  }, [inflation]);

  // APR
  const [growthRateFormattedString, setGrowthRateFormattedString] =
    useState("");

  //Bonded Ratio
  const [bondedRatioFormattedString, setBondedRatioFormattedString] =
    useState("");

  useEffect(() => {
    console.log(inflation, secretFoundationTax, communityTax, bondedRatio);
    if (inflation && secretFoundationTax && communityTax && bondedRatio) {
      // staking ratio missing
      const I = inflation; // inflation
      const F = secretFoundationTax; // foundation tax
      const C = 0.0; // validator commision rate; median is 5%
      const T = parseFloat(communityTax); // community tax
      const R = bondedRatio / 100; // bonded ratio
      const realYield = (I / R) * (1 - F - T) * (1 - C) * 100;
      const APR = (I / R) * 100;
      setGrowthRateFormattedString(
        APR.toFixed(2) + "%" + " / " + realYield.toFixed(2) + "%"
      );
      setBondedRatioFormattedString(bondedRatio.toFixed(2) + "%");
    }
  }, [inflation, secretFoundationTax, communityTax, bondedRatio]);

  // volume & market cap
  const [volumeFormattedString, setVolumeFormattedString] = useState("");
  const [marketCapFormattedString, setMarketCapFormattedString] = useState("");

  useEffect(() => {
    if (volume) {
      setVolumeFormattedString(
        "$" + formatNumber(parseInt(volume.toFixed(0).toString()), 2)
      );
    }
    if (marketCap) {
      setMarketCapFormattedString(
        "$" + formatNumber(parseInt(marketCap.toFixed(0).toString()), 2)
      );
    }
  }, [volume, marketCap]);

  useEffect(() => {
    if (spartanApiData) {
      const queryData = async () => {
        setBlockTime((spartanApiData as any).avg_block_time);
        setDailyTransactions((spartanApiData as any).tx_volume);
        setFeesPaid((spartanApiData as any).fees_paid);
      };
      queryData();
    }
  }, [spartanApiData]);

  return (
    <>
      <DashboardContext.Provider
        value={{
          coingeckoApiData_Day,
          coingeckoApiData_Month,
          coingeckoApiData_Year,
          defiLamaApiData_Year,
        }}
      >
        <div className="px-4 mx-auto space-y-4 w-full">
          <div className="grid grid-cols-12 gap-4">
            {/* WideQuadTile */}
            {/* <div className="col-span-12">
              <WideQuadTile item1_key="Block Height" item1_value={blockHeightFormattedString} item2_key="Block Time" item2_value={blockTimeFormattedString} item3_key="Daily Transactions" item3_value={dailyTransactionsFormattedString} item4_key="Fees Paid" item4_value={feesPaidFormattedString}/>
            </div> */}

            {/* Price */}
            <div className="col-span-12 sm:col-span-6 lg:col-span-12 xl:col-span-6 2xl:col-span-4">
              <CurrentPrice price={currentPrice} />
            </div>

            {/* Volume */}
            <div className="col-span-12 sm:col-span-6 lg:col-span-12 xl:col-span-6 2xl:col-span-2">
              <MiniTile name="Volume" value={volumeFormattedString} />
            </div>

            {/* Market Cap */}
            <div className="col-span-12 sm:col-span-6 lg:col-span-12 xl:col-span-6 2xl:col-span-2">
              <MiniTile name="Market Cap" value={marketCapFormattedString} />
            </div>

            {/* Social Media */}
            <div className="col-span-12 sm:col-span-6 lg:col-span-12 xl:col-span-6 2xl:col-span-4">
              <SocialMedia />
            </div>

            {/* Block Info */}
            <div className="col-span-12 md:col-span-6 lg:col-span-12 xl:col-span-6 2xl:col-span-4">
              {/* <BlockInfo blockHeight={blockHeight || 0} blockTime={blockTime} circulatingSupply={circulatingSupply} inflation={inflation}/> */}
              <QuadTile
                item1_key="Block Height"
                item1_value={blockHeightFormattedString}
                item2_key="Block Time (100 blocks)"
                item2_value={blockTimeFormattedString}
                item3_key="# Transactions (24h)"
                item3_value={dailyTransactionsFormattedString}
                item4_key="Fees Paid (24h)"
                item4_value={feesPaidFormattedString}
              />
            </div>

            <div className="col-span-12 md:col-span-6 lg:col-span-12 xl:col-span-6 2xl:col-span-4">
              <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-6 py-8 rounded-xl">
                <StakingChart />
              </div>
            </div>

            {/* Block Info */}
            <div className="col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 2xl:col-span-4">
              <QuadTile
                item1_key="APR/Staking Yield"
                item1_value={growthRateFormattedString}
                item2_key="Inflation"
                item2_value={inflationFormattedString}
                item3_key="Community Tax/Secret Foundation Tax"
                item3_value={taxFormattedString}
                item4_key="Bonded Ratio"
                item4_value={bondedRatioFormattedString}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            {/* Item */}
            <div className="col-span-12 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 rounded-xl">
              <PriceVolumeTVL />
            </div>
            {/* Item */}
            {/* <div className="col-span-12 xl:col-span-6 bg-neutral-800 p-4 rounded-xl">
              <PriceChart />
            </div> */}
            {/* Item */}
            {/* <div className="col-span-12 xl:col-span-6 bg-neutral-800 p-4 rounded-xl">
              <VolumeChart />
            </div> */}
          </div>
        </div>
      </DashboardContext.Provider>
    </>
  );
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("Context must be used within a Provider");
  }
  return context;
}

import { chains } from "shared/utils/config";
import { useEffect, useState, createContext, useContext } from "react";
import { SecretNetworkClient } from "secretjs";
import CurrentPrice from "./components/CurrentPrice";
import MiniTile from "./components/MiniTile";
import PriceVolumeTVL from "./components/PriceVolTVLChart/PriceVolumeTVL";
import QuadTile from "./components/QuadTile";
import SocialMedia from "./components/SocialMedia";
import { SECRET_LCD, SECRET_CHAIN_ID } from "shared/utils/config";
import StakingChart from "./components/StakingChart";
import { formatNumber } from "shared/utils/commons";
import { APIContext } from "shared/context/APIContext";

export function Dashboard() {
  const {
    coingeckoApiData_Day,
    setCoinGeckoApiData_Day,
    coingeckoApiData_Month,
    setCoinGeckoApiData_Month,
    coingeckoApiData_Year,
    setCoinGeckoApiData_Year,
    defiLamaApiData_Year,
    setDefiLamaApiData_Year,
    defiLamaApiData_TVL,
    setDefiLamaApiData_TVL,
    currentPrice,
    setCurrentPrice,
    externalApiData,
    setExternalApiData,
    secretAnalyticslApiData,
    setSecretAnalyticslApiData,
    bondedToken,
    setBondedToken,
    notBondedToken,
    setNotBondedToken,
    totalSupply,
    setTotalSupply,
    communityPool,
    setCommunityPool,
    inflation,
    setInflation,
    secretFoundationTax,
    setSecretFoundationTax,
    communityTax,
    setCommunityTax,
    volume,
    setVolume,
    marketCap,
    setMarketCap,
  } = useContext(APIContext);

  // block height
  const [blockHeight, setBlockHeight] = useState(null);
  const [blockHeightFormattedString, setblockHeightFormattedString] =
    useState("");

  useEffect(() => {
    if (blockHeight) {
      setblockHeightFormattedString(parseInt(blockHeight).toString());
    }
  }, [blockHeight]);

  // block time
  const [blockTime, setBlockTime] = useState(null); // in seconds
  const [blockTimeFormattedString, setBlockTimeFormattedString] = useState("");

  useEffect(() => {
    if (blockTime) {
      setBlockTimeFormattedString(
        parseFloat(blockTime).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) + "s"
      );
    }
  }, [blockTime]);

  // daily transactions
  const [transactions, setTransactions] = useState("");
  const [dailyTransactionsFormattedString, setTransactionsFormattedString] =
    useState("");

  useEffect(() => {
    if (transactions) {
      setTransactionsFormattedString(parseInt(transactions).toLocaleString());
    }
  }, [transactions]);

  // taxes
  const [taxFormattedString, setTaxFormattedString] = useState("");

  useEffect(() => {
    if (communityTax && secretFoundationTax) {
      setTaxFormattedString(
        (parseFloat(communityTax) * 100).toLocaleString() +
          "%" +
          " / " +
          (parseFloat(secretFoundationTax) * 100).toLocaleString() +
          "%"
      );
    }
  }, [communityTax, secretFoundationTax]);

  // feesPaid
  const [gasUsed, setGasUsed] = useState("");
  const [gasUsedFormattedString, setGasUsedFormattedString] = useState("");

  useEffect(() => {
    if (gasUsed) {
      setGasUsedFormattedString(formatNumber(parseInt(gasUsed), 2));
    }
  }, [gasUsed]);

  // inflation
  const [inflationFormattedString, setInflationFormattedString] = useState("");

  useEffect(() => {
    if (inflation) {
      setInflationFormattedString((inflation * 100).toLocaleString() + "%");
    }
  }, [inflation]);

  // APR
  const [growthRateFormattedString, setGrowthRateFormattedString] =
    useState("");

  //Bonded Ratio
  const [bondedRatio, setBondedRatio] = useState(0);
  const [bondedRatioFormattedString, setBondedRatioFormattedString] =
    useState("");

  useEffect(() => {
    const queryData = async () => {
      const secretjsquery = new SecretNetworkClient({
        url: SECRET_LCD,
        chainId: SECRET_CHAIN_ID,
      });

      secretjsquery?.query?.tendermint.getLatestBlock("")?.then((res1) => {
        setBlockHeight(res1.block.header.height);
        secretjsquery?.query?.tendermint
          .getBlockByHeight({
            height: (Number(res1.block.header.height) - 1).toString(),
          })
          ?.then((res2) => {
            const timestamp1 = new Date(res1.block.header.time as any);
            const timestamp2 = new Date(res2.block.header.time as any);
            const diffInSeconds =
              Math.abs((timestamp1 as any) - (timestamp2 as any)) / 1000;
            setBlockTime(diffInSeconds.toFixed(2));
          });
      });
    };
    queryData();
  }, []);

  // volume & market cap
  const [volumeFormattedString, setVolumeFormattedString] = useState("");
  const [marketCapFormattedString, setMarketCapFormattedString] = useState("");
  const [TVLFormattedString, setTVLFormattedString] = useState("");

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
    if (defiLamaApiData_TVL) {
      setTVLFormattedString(
        "$" +
          formatNumber(parseInt(defiLamaApiData_TVL.toFixed(0).toString()), 2)
      );
    }
  }, [volume, marketCap, defiLamaApiData_TVL]);

  const [circulatingSupply, setCirculatingSupply] = useState(0);

  // useEffect(() => {
  //   if (externalApiData) {
  //     const queryData = async () => {
  //       setBlockTime((externalApiData as any).block_time);
  //     };

  //     queryData();
  //   }
  // }, [externalApiData]);

  useEffect(() => {
    if (secretAnalyticslApiData) {
      const queryData = async () => {
        setTransactions((secretAnalyticslApiData as any).tx_count);
        setGasUsed((secretAnalyticslApiData as any).gas_used);
      };

      queryData();
    }
  }, [secretAnalyticslApiData]);

  useEffect(() => {
    if (
      inflation &&
      secretFoundationTax &&
      communityTax &&
      bondedToken &&
      notBondedToken &&
      totalSupply
    ) {
      // staking ratio missing
      const I = inflation; // inflation
      const F = parseFloat(secretFoundationTax); // foundation tax
      const C = 0.0; // validator commision rate; median is 5%
      const T = parseFloat(communityTax); // community tax
      const R = bondedToken / totalSupply; // bonded ratio
      setBondedRatio(R * 100);
      const APR = (I / R) * 100;
      const realYield = (I / R) * (1 - F - T) * (1 - C) * 100;
      setGrowthRateFormattedString(
        formatNumber(APR, 2) + "%" + " / " + formatNumber(realYield, 2) + "%"
      );
      setBondedRatioFormattedString(formatNumber(bondedRatio, 2) + "%");
    }
  }, [
    inflation,
    secretFoundationTax,
    communityTax,
    bondedToken,
    notBondedToken,
    bondedRatio,
    totalSupply,
  ]);

  return (
    <>
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
            <MiniTile
              name="Market Cap/TVL"
              value={`${marketCapFormattedString} / ${TVLFormattedString}`}
            />
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
              item2_key="Block Time (last block)"
              item2_value={blockTimeFormattedString}
              item3_key="# Transactions (24h)"
              item3_value={dailyTransactionsFormattedString}
              item4_key="Gas Used (24h)"
              item4_value={gasUsedFormattedString}
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
    </>
  );
}

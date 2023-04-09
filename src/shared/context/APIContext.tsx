import { createContext, useEffect, useRef, useState } from "react";
import { SecretNetworkClient } from "secretjs";
import { dAppsURL, shuffleArray, sortDAppsArray } from "shared/utils/commons";
import { SECRET_LCD, SECRET_CHAIN_ID } from "shared/utils/config";

const APIContext = createContext(null);

const APIContextProvider = ({ children }: any) => {
  const [dappsData, setDappsData] = useState<any[]>([]);
  const [dappsDataSorted, setDappsDataSorted] = useState<any[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const fetchDappsURL = () => {
    fetch(dAppsURL)
      .then((response) => {
        if (!response.ok) throw new Error();
        else return response.json();
      })
      .then((jsonData) => {
        setDappsData(jsonData.data);
      })
      .catch((error) => {
        console.error(error);

        setTimeout(() => fetchDappsURL(), 3000);
      });
  };

  useEffect(() => {
    fetchDappsURL();
  }, []);

  useEffect(() => {
    if (dappsData && dappsDataSorted.length === 0 && dappsData?.length !== 0) {
      setDappsDataSorted(sortDAppsArray(dappsData));
      // Tag-Filter
      let allTags: string[] = [];

      dappsData.forEach((dapp) => {
        dapp.attributes.type
          .map((item: any) => item.name)
          .forEach((tag: any) => {
            if (!allTags.find((tagItem) => tagItem === tag)) {
              allTags.push(tag);
            }
          });
      });
      setTags(allTags.sort());
    }
  }, [dappsData]);

  const [coingeckoApiData_Day, setCoinGeckoApiData_Day] = useState();
  const [coingeckoApiData_Month, setCoinGeckoApiData_Month] = useState();
  const [coingeckoApiData_Year, setCoinGeckoApiData_Year] = useState();
  const [defiLamaApiData_Year, setDefiLamaApiData_Year] = useState();
  const [spartanApiData, setSpartanApiData] = useState();
  const [currentPrice, setCurrentPrice] = useState(Number);
  const [volume, setVolume] = useState(Number);
  const [marketCap, setMarketCap] = useState(Number);

  //chain data
  const [inflation, setInflation] = useState(0);
  const [bondedRatio, setBondedRatio] = useState(0);
  const [blockHeight, setBlockHeight] = useState(0);
  const [communityTax, setCommunityTax] = useState(Number);
  const [communityPool, setCommunityPool] = useState(Number);
  const [secretFoundationTax, setSecretFoundationTax] = useState(Number);
  const [pool, setPool] = useState(null);
  const [totalSupply, setTotalSupply] = useState(Number);
  const [bondedToken, setBondedToken] = useState(Number);
  const [notBondedToken, setNotBondedToken] = useState(Number);

  useEffect(() => {
    const queryData = async () => {
      const secretjsquery = new SecretNetworkClient({
        url: SECRET_LCD,
        chainId: SECRET_CHAIN_ID,
      });
      await secretjsquery?.query?.tendermint
        ?.getLatestBlock("")
        ?.then((res) => setBlockHeight(res.block.header.height as any)); // setting block height
      await secretjsquery?.query?.mint
        ?.inflation("")
        ?.then((res) => setInflation(res.inflation as any));
      await secretjsquery?.query?.distribution
        ?.communityPool("")
        ?.then((res) =>
          setCommunityPool(Math.floor((res.pool[1] as any).amount / 10e5))
        );
      await secretjsquery?.query?.distribution?.params("")?.then((res) => {
        setSecretFoundationTax(parseFloat(res.params.secret_foundation_tax));
        setCommunityTax(parseFloat(res.params.community_tax));
      });
      await secretjsquery?.query?.distribution
        ?.communityPool("")
        ?.then((res) =>
          setCommunityPool(Math.floor((res.pool[1] as any).amount / 10e5))
        );
      await secretjsquery?.query?.bank
        ?.supplyOf({ denom: "uscrt" })
        ?.then((res) => setTotalSupply((res.amount.amount as any) / 1e6));
      await secretjsquery?.query?.staking
        ?.pool("")
        ?.then((res) => setPool(res.pool));
    };

    queryData();
  }, []);

  useEffect(() => {
    if (totalSupply && communityPool && pool) {
      const bondedToken = parseInt(pool?.bonded_tokens) / 10e5;
      setBondedToken(bondedToken);
      const notBondedToken = totalSupply - bondedToken;
      setNotBondedToken(notBondedToken);
      setBondedRatio((bondedToken / (bondedToken + notBondedToken)) * 100);
    }
  }, [totalSupply, communityPool, pool]);

  useEffect(() => {
    // Coingecko API
    let coingeckoApiUrl_Day = `https://api.coingecko.com/api/v3/coins/secret/market_chart?vs_currency=usd&days=1`;
    fetch(coingeckoApiUrl_Day)
      .then((response) => response.json())
      .then((response) => {
        setCoinGeckoApiData_Day(response);
      });

    let coingeckoApiUrl_Month = `https://api.coingecko.com/api/v3/coins/secret/market_chart?vs_currency=usd&days=30`;
    fetch(coingeckoApiUrl_Month)
      .then((response) => response.json())
      .then((response) => {
        setCoinGeckoApiData_Month(response);
      });

    let coingeckoApiUrl_Year = `https://api.coingecko.com/api/v3/coins/secret/market_chart?vs_currency=usd&days=365`;
    fetch(coingeckoApiUrl_Year)
      .then((response) => response.json())
      .then((response) => {
        setCoinGeckoApiData_Year(response);
      });

    let defiLamaApiUrl_Year = `https://api.llama.fi/charts/secret`;
    fetch(defiLamaApiUrl_Year)
      .then((response) => response.json())
      .then((response) => {
        setDefiLamaApiData_Year(
          response.map((x: any[]) => [
            parseInt((x as any).date) * 1000,
            (x as any).totalLiquidityUSD,
          ])
        );
      });

    //  API
    let spartanApiUrl = `https://core.spartanapi.dev/secret/chains/secret-4/chain_info`;
    fetch(spartanApiUrl)
      .then((response) => response.json())
      .then((response) => {
        setSpartanApiData(response);
      });

    // Coingecko Market Price, Market Cap & Volume
    let coingeckoMarketCapVolumeUrl = `https://api.coingecko.com/api/v3/simple/price?ids=secret&vs_currencies=USD&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`;
    fetch(coingeckoMarketCapVolumeUrl)
      .then((response) => response.json())
      .then((response) => {
        setCurrentPrice(response.secret.usd);
        setMarketCap(response.secret.usd_market_cap);
        setVolume(response.secret.usd_24h_vol);
      });
  }, []);

  const providerValue = {
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
  };
  return (
    <APIContext.Provider value={providerValue}>{children}</APIContext.Provider>
  );
};

export { APIContext, APIContextProvider };

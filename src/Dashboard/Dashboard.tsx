import { KeplrContext } from "General/Layouts/defaultLayout";
import React, { useEffect, useState, createContext, useContext } from "react";
import InfoBoxes from "./Components/InfoBoxes";
import PriceChart from "./Components/PriceChart";
import StakingChart from "./Components/StakingChart";
import VolumeChart from "./Components/VolumeChart";

export const DashboardContext = createContext<{ apiData: undefined; setApiData: React.Dispatch<React.SetStateAction<undefined>>; }| null>(null);

export function Dashboard() {
  const [apiData, setApiData] = useState();
  const {secretjs, secretAddress} = useContext(KeplrContext);

  useEffect(() => {
    let url = 'https://api.coingecko.com/api/v3/coins/secret/market_chart?vs_currency=usd&days=30';
    fetch(url).then(response => response.json()).then((response) => {
        setApiData(response);
    });
  }, []);

  return (
    <>
      <DashboardContext.Provider value={{ apiData, setApiData }}>
        <InfoBoxes/>
        <div className="mt-4 px-4 mx-auto">
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
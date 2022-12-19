import React, { useEffect, useState, createContext } from "react";
import InfoBoxes from "./Components/InfoBoxes";
import PriceChart from "./Components/PriceChart";

export const DashboardContext = createContext(null);

export function Dashboard() {
  const [apiData, setApiData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let url = 'https://api.coingecko.com/api/v3/coins/secret/market_chart?vs_currency=usd&days=30';
    fetch(url).then(response => response.json()).then((items) => {
        setApiData(items);
    });
    setIsLoading(false);
  }, []);

  // console.log(isLoading);


  return (
    <>
      <DashboardContext.Provider value={{apiData, setApiData, isLoading}}>
        <InfoBoxes/>
        <div className="mt-4 px-4 mx-auto">
          <div className="grid grid-cols-12 gap-4">
            {/* Item */}
            <div className="col-span-6 bg-zinc-800 p-4 rounded-lg">
              {!isLoading ? <PriceChart /> : <div></div>}
            </div>
          </div>
        </div>
      </DashboardContext.Provider>
    </>
  )
}
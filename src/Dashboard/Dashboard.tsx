import React from "react";
import InfoBoxes from "./Components/InfoBoxes";
import PriceChart from "./Components/PriceChart";

export function Dashboard() {

  return (
    <>
      <InfoBoxes/>
      <div className="mt-4 px-4 mx-auto">
        <div className="grid grid-cols-12 gap-4">
          {/* Item */}
          <div className="col-span-6 bg-zinc-800 p-4 rounded-lg">
            <PriceChart/>
          </div>
        </div>
      </div>
    </>
  )
}
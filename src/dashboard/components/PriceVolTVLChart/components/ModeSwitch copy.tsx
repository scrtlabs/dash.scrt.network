import React, { useContext } from "react";
import { PriceVolumeHistoryContext } from "../PriceVolumeHistory";

function ModeSwitch() {
  const { chartType, setChartType } = useContext(PriceVolumeHistoryContext);

  return (
    <>
      <div
        className='flex-initial inline-flex rounded-md shadow-sm'
        role='group'
      >
        <button
          onClick={() => setChartType("Price")}
          type='button'
          className={
            "py-1.5 px-3 text-xs font-semibold rounded-l-lg bg-neutral-100 dark:bg-neutral-900" +
            (chartType === "Price"
              ? " cursor-default bg-cyan-500 dark:bg-cyan-500/20 text-white dark:text-cyan-200 font-bold"
              : " text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-700 focus:bg-neutral-500 dark:focus:bg-neutral-500")
          }
        >
          Price
        </button>
        <button
          onClick={() => setChartType("Volume")}
          type='button'
          className={
            "py-1.5 px-3 text-xs font-semibold rounded-r-lg bg-neutral-100 dark:bg-neutral-900" +
            (chartType === "Volume"
              ? " cursor-default bg-cyan-500 dark:bg-cyan-500/20 text-white dark:text-cyan-200 font-bold"
              : " text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-700 focus:bg-neutral-500 dark:focus:bg-neutral-500")
          }
        >
          Volume
        </button>
      </div>
    </>
  );
}

export default ModeSwitch;

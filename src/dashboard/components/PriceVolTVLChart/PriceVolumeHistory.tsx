import React, { createContext, useContext, useEffect, useState } from "react";
import { DashboardContext, useDashboardContext } from "../../Dashboard";
import { formatNumber } from "shared/utils/commons";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import TypeSwitch from "./components/TypeSwitch";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type ChartType = "Price" | "Volume" | "TVL";
type ChartRange = "Day" | "Month" | "Year";

export const PriceVolumeHistoryContext = createContext(null);

export default function PriceVolumeHistory(props: any) {
  const {
    coingeckoApiData_Day,
    coingeckoApiData_Month,
    coingeckoApiData_Year,
  } = useDashboardContext();

  const [marketData, setMarketData] = useState([]);

  const [chartType, setChartType] = useState<ChartType>("Price");
  const [chartRange, setChartRange] = useState<ChartRange>("Month");

  let apiDataMapping = new Map<ChartRange, Object>([
    ["Day", coingeckoApiData_Day],
    ["Month", coingeckoApiData_Month],
    ["Year", coingeckoApiData_Year],
  ]);

  const data = {
    labels:
      chartType === "Price"
        ? (apiDataMapping.get(chartRange) as any)?.prices.map(
            (x: any[]) =>
              ({
                x:
                  chartRange === "Day"
                    ? new Date(x[0]).toLocaleTimeString()
                    : new Date(x[0]).toLocaleDateString(),
              }.x)
          )
        : (apiDataMapping.get(chartRange) as any).total_volumes.map(
            (x: any[]) =>
              ({
                x:
                  chartRange === "Day"
                    ? new Date(x[0]).toLocaleTimeString()
                    : new Date(x[0]).toLocaleDateString(),
              }.x)
          ),
    datasets: [
      {
        label: chartType,
        data:
          chartType === "Price"
            ? (apiDataMapping.get(chartRange) as any)?.prices.map(
                (x: any[]) => ({ x: x[0], y: x[1] })
              )
            : (apiDataMapping.get(chartRange) as any).total_volumes.map(
                (x: any[]) => ({ x: x[0], y: x[1] })
              ),
        fill: false,
        borderColor: "#06b6d4",
        tension: 0.1,
        pointHitRadius: "5",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (value, index, ticks) {
            return "$" + value;
          },
        },
      },
    },
    pointStyle: false,
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        inverseColors: false,
        gradientToColors: ["#ff0000"],
        shadeIntensity: 1,
        type: "horizontal",
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100, 100, 100],
      },
    },
  };

  const providerValue = {
    chartType,
    setChartType,
  };

  return (
    <>
      <PriceVolumeHistoryContext.Provider value={providerValue}>
        <div className='flex items-center mb-4'>
          <div className='flex-1'>
            <TypeSwitch />
          </div>

          {/* [Day|Month|Year] */}
          <div
            className='flex-initial inline-flex rounded-md shadow-sm'
            role='group'
          >
            <button
              onClick={() => setChartRange("Day")}
              type='button'
              className={
                "py-1.5 px-3 text-xs font-semibold rounded-l-lg bg-neutral-100 dark:bg-neutral-900 " +
                (chartRange === "Day"
                  ? " cursor-default bg-cyan-500 dark:bg-cyan-500/20 text-white dark:text-cyan-200 font-bold"
                  : " text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-700 focus:bg-neutral-500 dark:focus:bg-neutral-500")
              }
            >
              Day
            </button>
            <button
              onClick={() => setChartRange("Month")}
              type='button'
              className={
                "py-1.5 px-3 text-xs font-semibold bg-neutral-100 dark:bg-neutral-900" +
                (chartRange === "Month"
                  ? " cursor-default bg-cyan-500 dark:bg-cyan-500/20 text-white dark:text-cyan-200 font-bold"
                  : " text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-700 focus:bg-neutral-500 dark:focus:bg-neutral-500")
              }
            >
              Month
            </button>
            <button
              onClick={() => setChartRange("Year")}
              type='button'
              className={
                "py-1.5 px-3 text-xs font-semibold rounded-r-lg bg-neutral-100 dark:bg-neutral-900" +
                (chartRange === "Year"
                  ? " cursor-default bg-cyan-500 dark:bg-cyan-500/20 text-white dark:text-cyan-200 font-bold"
                  : " text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-700 focus:bg-neutral-500 dark:focus:bg-neutral-500")
              }
            >
              Year
            </button>
          </div>
        </div>
        <div className='w-full h-[300px] xl:h-[400px]'>
          <Line data={data as any} options={options} />
        </div>
      </PriceVolumeHistoryContext.Provider>
    </>
  );
}

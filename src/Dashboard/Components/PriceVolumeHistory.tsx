import React, { createContext, useContext, useEffect, useState } from "react";
import { DashboardContext, useDashboardContext } from "../Dashboard";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Chart, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
)

enum ChartType {
  Price,
  Volume
}

enum ChartRange {
  Day,
  Month,
  Year
}

export default function PriceVolumeHistory(props: any) {
  const { coingeckoApiData_Day, coingeckoApiData_Month, coingeckoApiData_Year } = useDashboardContext();


  const [marketData, setMarketData] = useState([]);

  const [chartType, setChartType] = useState<ChartType>(ChartType.Price);
  const [chartRange, setChartRange] = useState<ChartRange>(ChartRange.Month);

  let apiDataMapping = new Map<ChartRange, Object>([
    [ChartRange.Day, coingeckoApiData_Day],
    [ChartRange.Month, coingeckoApiData_Month],
    [ChartRange.Year, coingeckoApiData_Year]
  ]);

  const data = {
    labels: chartType == ChartType.Price ? apiDataMapping.get(chartRange)?.prices.map((x: any[]) => ({ x: new Date(x[0]).toLocaleDateString() }).x) : apiDataMapping.get(chartRange)?.total_volumes.map((x: any[]) => ({ x: new Date(x[0]).toLocaleDateString() }).x),
    datasets: [{
      label: 'Price',
      data: chartType == ChartType.Price ? apiDataMapping.get(chartRange)?.prices.map((x: any[]) => ({ x: x[0], y: x[1] })) : apiDataMapping.get(chartRange)?.total_volumes.map((x: any[]) => ({ x: x[0], y: x[1] })),
      fill: false,
      borderColor: '#06b6d4',
      tension: 0.1,
      pointHitRadius: '5',
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
    },
    pointStyle: false,
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        inverseColors: false,
        gradientToColors: ["#ff0000"],
        shadeIntensity: 1,
        type: 'horizontal',
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100, 100, 100],
      }
    }
  };

  return (
    <>
    <div className="flex items-center mb-4">
      {/* Title */}
      <div className="flex-1">
        {/* <h1 className="text-2xl font-bold">Price History</h1> */}
        {/* [Price|Volume] */}
        <div className="flex-initial inline-flex rounded-md shadow-sm" role="group">
          <button onClick={() => setChartType(ChartType.Price)} type="button" className={"py-1.5 px-3 text-xs font-semibold text-neutral-200 rounded-l-lg bg-neutral-700" + (chartType == ChartType.Price ? " bg-cyan-500/50 text-cyan-100 font-bold" : " hover:bg-neutral-600 focus:z-10 focus:ring-2 focus:ring-neutral-700 focus:text-white")}>
            Price
          </button>
          <button onClick={() => setChartType(ChartType.Volume)} type="button" className={"py-1.5 px-3 text-xs font-semibold text-neutral-200 rounded-r-lg bg-neutral-700" + (chartType == ChartType.Volume ? " bg-cyan-500/50 text-cyan-100 font-bold" : " hover:bg-neutral-600 focus:z-10 focus:ring-2 focus:ring-neutral-700 focus:text-white")}>
          Volume
          </button>
        </div>
      </div>

      {/* [Day|Month|Year] */}
      <div className="flex-initial inline-flex rounded-md shadow-sm" role="group">
        <button onClick={() => setChartRange(ChartRange.Day)} type="button" className={"py-1.5 px-3 text-xs font-semibold text-neutral-200 rounded-l-lg bg-neutral-700" + (chartRange == ChartRange.Day ? " bg-cyan-500/50 text-cyan-100 font-bold" : " hover:bg-neutral-600 focus:z-10 focus:ring-2 focus:ring-neutral-700 focus:text-white")}>
          Day
        </button>
        <button onClick={() => setChartRange(ChartRange.Month)} type="button" className={"py-1.5 px-3 text-xs font-semibold text-neutral-200 bg-neutral-700" + (chartRange == ChartRange.Month ? " bg-cyan-500/50 text-cyan-100 font-bold" : " hover:bg-neutral-600 focus:z-10 focus:ring-2 focus:ring-neutral-700 focus:text-white")}>
          Month
        </button>
        <button onClick={() => setChartRange(ChartRange.Year)} type="button" className={"py-1.5 px-3 text-xs font-semibold text-neutral-200 rounded-r-lg bg-neutral-700" + (chartRange == ChartRange.Year ? " bg-cyan-500/50 text-cyan-100 font-bold" : " hover:bg-neutral-600 focus:z-10 focus:ring-2 focus:ring-neutral-700 focus:text-white")}>
          Year
        </button>
      </div>
    </div>
    <div className="w-full h-[300px] xl:h-[400px]" >
      <Line data={data} options={options}/>
    </div>
    </>
  );
}
function componentDidMount() {
  throw new Error("Function not implemented.");
}


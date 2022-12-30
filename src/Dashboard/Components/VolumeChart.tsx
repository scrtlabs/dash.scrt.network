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
import { Line } from 'react-chartjs-2'

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

export default function VolumeChart(props: any) {
  const { apiData, setApiData } = useDashboardContext();
  const [marketData, setMarketData] = useState([]);

  console.log(apiData);

  const [chartRange, setChartRange] = useState<ChartRange>(ChartRange.Day);

  const data = {
    labels: apiData?.total_volumes.map((x: any[]) => ({ x: x[0] }).x),
    datasets: [{
      label: 'Prices',
      data: apiData?.total_volumes.map((x: any[]) => ({ x: x[0], y: x[1] })),
      fill: false,
      borderColor: '#3b82f6',
      tension: 0.1,
      pointHitRadius: '5',
    }]
  };

  const options = {
    responsive: true,
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
        <h1 className="text-2xl font-bold">Volume History</h1>
      </div>

      <div className="flex-initial inline-flex rounded-md shadow-sm" role="group">
        <button onClick={() => setChartRange(ChartRange.Day)} type="button" className={"py-1.5 px-3 text-xs font-semibold text-neutral-200 rounded-l-lg border border-neutral-400" + (chartRange == ChartRange.Day ? " bg-blue-500 font-bold" : "bg-neutral-700 hover:bg-neutral-500 hover:text-white focus:z-10 focus:ring-2 focus:ring-neutral-700 focus:text-white")}>
          Day
        </button>
        <button onClick={() => setChartRange(ChartRange.Month)} type="button" className={"py-1.5 px-3 text-xs font-semibold text-neutral-200 border-t border-r border-b border-neutral-400" + (chartRange == ChartRange.Month ? " bg-blue-500 font-bold" : "bg-neutral-700 hover:bg-neutral-500 hover:text-white focus:z-10 focus:ring-2 focus:ring-neutral-700 focus:text-white")}>
          Month
        </button>
        <button onClick={() => setChartRange(ChartRange.Year)} type="button" className={"py-1.5 px-3 text-xs font-semibold text-neutral-200 rounded-r-lg border-t border-r border-b border-neutral-400" + (chartRange == ChartRange.Year ? " bg-blue-500 font-bold" : "bg-neutral-700 hover:bg-neutral-500 hover:text-white focus:z-10 focus:ring-2 focus:ring-neutral-700 focus:text-white")}>
          Year
        </button>
      </div>
    </div>
    <Line data={data} options={options}/>
    </>
  );
}
function componentDidMount() {
  throw new Error("Function not implemented.");
}


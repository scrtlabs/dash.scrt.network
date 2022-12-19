import React, { useEffect, useState } from "react";

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


export default function PriceChart() {
  const [apiData, setApiData] = useState([]);
  const [marketData, setMarketData] = useState([]);

  useEffect(() => {
    let url = 'https://api.coingecko.com/api/v3/coins/secret/market_chart?vs_currency=usd&days=30';
    fetch(url).then(response => response.json()).then((items) => {
        setApiData(items.prices);
    });
  }, []);


  // console.log(apiData);
  console.log(apiData.map(x => ({ x: x[0], y: x[1] })));

  const data = {
    labels: apiData.map(x => ({ x: x[0], y: x[1] })),
    datasets: [{
      label: 'Prices',
      data: apiData.map(x => ({ x: x[0], y: x[1] })),
      fill: false,
      borderColor: '#34d399',
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

    xaxis: {
      type: 'datetime',
    },
  };

  return (
    <>
    <div className="flex items-center mb-4">
      <div className="flex-1 inline-flex rounded-md shadow-sm" role="group">
        <button type="button" className="py-1.5 px-3 text-xs font-medium text-zinc-200 bg-zinc-700 rounded-l-lg border border-zinc-400 hover:bg-zinc-500 hover:text-white focus:z-10 focus:ring-2 focus:ring-zinc-700 focus:text-white">
          Price
        </button>
        <button type="button" className="py-1.5 px-3 text-xs font-medium text-zinc-200 bg-zinc-700 rounded-r-md border-t border-b border-r border-zinc-400 hover:bg-zinc-500 hover:text-white focus:z-10 focus:ring-2 focus:ring-zinc-700 focus:text-white">
          Volume
        </button>
      </div>

      <div className="flex-initial inline-flex rounded-md shadow-sm" role="group">
        <button type="button" className="py-1.5 px-3 text-xs font-medium text-zinc-200 bg-zinc-700 rounded-l-lg border border-zinc-400 hover:bg-zinc-500 hover:text-white focus:z-10 focus:ring-2 focus:ring-zinc-700 focus:text-white">
          Day
        </button>
        <button type="button" className="py-1.5 px-3 text-xs font-medium text-zinc-200 bg-zinc-700 border-t border-b border-zinc-400 hover:bg-zinc-500 hover:text-white focus:z-10 focus:ring-2 focus:ring-zinc-700 focus:text-white">
          Month
        </button>
        <button type="button" className="py-1.5 px-3 text-xs font-medium text-zinc-200 bg-zinc-700 rounded-r-md border border-zinc-400 hover:bg-zinc-500 hover:text-white focus:z-10 focus:ring-2 focus:ring-zinc-700 focus:text-white">
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


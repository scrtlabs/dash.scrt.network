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
    <Line data={data} options={options}/>
  );
}
function componentDidMount() {
  throw new Error("Function not implemented.");
}


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
  Legend
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

  const chartData = {
    labels: apiData.map(x => ({ x: x[0], y: x[1] })),
    datasets: [{
      label: 'My First Dataset',
      data: apiData.map(x => ({ x: x[0], y: x[1] })),
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  return (
    <Line data={chartData}/>
  );
}
function componentDidMount() {
  throw new Error("Function not implemented.");
}


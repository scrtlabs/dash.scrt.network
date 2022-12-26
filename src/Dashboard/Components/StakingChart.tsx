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
  ArcElement
} from 'chart.js'
import { Doughnut, Line } from "react-chartjs-2";
import { chains } from "General/Utils/config";
import { SecretNetworkClient } from "secretjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
)

const SECRET_LCD = chains["Secret Network"].lcd;


export default function StakingChart(props: any) {
  const { apiData, setApiData } = useDashboardContext();
  const [marketData, setMarketData] = useState([]);
  const [communityPool, setCommunityPool] = useState(Number); // in uscrt
  const [totalSupply, setTotalSupply] = useState(Number);
  const [pool, setPool] = useState(null);

  useEffect(() => {
    const queryData = async () => {
      const secretjsquery = new SecretNetworkClient({
        url: SECRET_LCD,
        chainId: "secret-4",
      });
      secretjsquery?.query?.distribution?.communityPool("")?.then(res => setCommunityPool(Math.floor((res.pool[1].amount) / 10e5)));
      secretjsquery?.query?.bank?.supplyOf({denom:"uscrt"})?.then(res => setTotalSupply(res.amount.amount/1e6));
      secretjsquery?.query?.staking?.pool("")?.then(res => setPool(res.pool));
    }
    
    queryData();
  }, []);

  const COUNT_ABBRS = ['', 'K', 'M', 'B', 't', 'q', 's', 'S', 'o', 'n', 'd', 'U', 'D', 'T', 'Qt', 'Qd', 'Sd', 'St'];

  function formatNumber(count: number, withAbbr = false, decimals = 2) {
    const i = count === 0 ? count : Math.floor(Math.log(count) / Math.log(1000));
    if (withAbbr && COUNT_ABBRS[i]) {
      return parseFloat((count / (1000 ** i)).toFixed(decimals)).toString() + COUNT_ABBRS[i];
    }
  }


  const bondedToken = parseInt(pool?.bonded_tokens) / 10e5;
  const notBondedToken = parseInt(pool?.not_bonded_tokens) / 10e4;

  const centerText = {
    id: "centerText",
    afterDatasetsDraw(chart, args, options) {
      const { ctx, chartArea: {left, right, top, bottom, width, height} } = chart;

      ctx.save();

      ctx.font = "bold 0.9rem sans-serif";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText(`Total Supply`, width / 2, height / 2.25 + top);
      ctx.restore();

      ctx.font = "400 2rem sans-serif";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText(`${formatNumber(totalSupply, true, 2)}`, width / 2, height / 1.75 + top);
      ctx.restore();
    }
  }

  const data = {
    labels: [
      'Staked',
      'Unstaked'
    ],
    datasets: [{
      data: [bondedToken, notBondedToken],
      backgroundColor: [
        '#3b82f6',
        '#a855f7'
      ],
      hoverBackgroundColor: [
        '#3b82f6',
        '#a855f7'
      ],
    }]
  };

  const options = {
    responsive: true,
    cutout: "80%",
    borderWidth: 0,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        onClick: null,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
        },
      },
      tooltip: {
        enabled: false
      },
    }
  };

  return (
    <>
      {/* Chart */}
      {totalSupply && <Doughnut data={data} options={options} plugins={[centerText]}/>}

      <a href="https://wallet.keplr.app/chains/secret-network" target="_blank" className="block border border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500 w-full text-center transition-colors py-2 rounded-lg mt-4 font-semibold text-sm">Start Staking<FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs ml-2" /></a>
    </>
  );
}
function componentDidMount() {
  throw new Error("Function not implemented.");
}


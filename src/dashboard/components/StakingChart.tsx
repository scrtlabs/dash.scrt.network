import { useContext, useEffect, useState } from "react";
import { formatNumber } from "shared/utils/commons";
import { SECRET_LCD, SECRET_CHAIN_ID } from "shared/utils/config";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { SecretNetworkClient } from "secretjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { ThemeContext } from "shared/components/ThemeContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

export default function StakingChart() {
  const [communityPool, setCommunityPool] = useState(Number); // in uscrt
  const [totalSupply, setTotalSupply] = useState(Number);
  const [pool, setPool] = useState(null);

  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const queryData = async () => {
      const secretjsquery = new SecretNetworkClient({
        url: SECRET_LCD,
        chainId: SECRET_CHAIN_ID,
      });
      secretjsquery?.query?.distribution
        ?.communityPool("")
        ?.then((res) =>
          setCommunityPool(Math.floor((res.pool[1] as any).amount / 10e5))
        );
      secretjsquery?.query?.bank
        ?.supplyOf({ denom: "uscrt" })
        ?.then((res) => setTotalSupply((res.amount.amount as any) / 1e6));
      secretjsquery?.query?.staking?.pool("")?.then((res) => setPool(res.pool));
    };

    queryData();
  }, []);

  const bondedToken = parseInt(pool?.bonded_tokens) / 10e5;
  let notBondedToken = totalSupply - bondedToken - communityPool;
  const operationalToken =
    notBondedToken - parseInt(pool?.not_bonded_tokens) / 10e4;
  notBondedToken = notBondedToken - operationalToken;

  const centerText = {
    id: "centerText",
    afterDatasetsDraw(chart, args, options) {
      const {
        ctx,
        chartArea: { left, right, top, bottom, width, height },
      } = chart;

      ctx.save();

      ctx.font = "bold 0.9rem sans-serif";
      ctx.fillStyle = theme === "dark" ? "#fff" : "#000";
      ctx.textAlign = "center";
      ctx.fillText(`Total Supply`, width / 2, height / 2.25 + top);
      ctx.restore();

      ctx.font = "400 2rem sans-serif";
      ctx.fillStyle = theme === "dark" ? "#fff" : "#000";
      ctx.textAlign = "center";
      ctx.fillText(
        `${formatNumber(totalSupply, true, 2)}`,
        width / 2,
        height / 1.75 + top
      );
      ctx.restore();
    },
  };

  const data = {
    labels: [
      `Staked:${formatNumber(bondedToken, true, 2)}`,
      `Unstaked ${formatNumber(notBondedToken, true, 2)}`,
      `Community Pool: ${formatNumber(communityPool, true, 2)}`,
      `Operational: ${formatNumber(operationalToken, true, 2)}`,
    ],
    datasets: [
      {
        data: [bondedToken, notBondedToken, communityPool, operationalToken],
        backgroundColor: ["#06b6d4", "#8b5cf6", "#ff8800", "#008000"],
        hoverBackgroundColor: ["#06b6d4", "#8b5cf6", "#ff8800", "#008000"],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "90%",
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
        enabled: false,
      },
    },
  };

  return (
    <>
      <div>
        {/* Title */}
        {/* <div className='flex items-center mb-4'>
          <h1 className='text-2xl font-bold'>Staking</h1>
          <Tooltip
            title={`Earn rewards for holding SCRT (currently ~24.66% p.a.)`}
            placement='right'
          >
            <div className='ml-2 pt-1 text-neutral-400 hover:text-white transition-colors cursor-pointer'>
              <FontAwesomeIcon icon={faInfoCircle} />
            </div>
          </Tooltip>
        </div> */}

        {/* Chart */}
        <div className='w-full h-[250px] xl:h-[300px]'>
          {totalSupply && (
            <Doughnut
              data={data}
              options={options as any}
              plugins={[centerText]}
            />
          )}
        </div>

        <a
          href='https://wallet.keplr.app/chains/secret-network'
          target='_blank'
          className='block bg-cyan-500 dark:bg-cyan-500/20 text-white dark:text-cyan-200 dark:hover:text-cyan-100 hover:bg-cyan-400 dark:hover:bg-cyan-500/50 w-full text-center transition-colors py-2.5 rounded-xl mt-4 font-semibold text-sm'
        >
          Stake SCRT
          <FontAwesomeIcon
            icon={faArrowUpRightFromSquare}
            className='text-xs ml-2'
          />
        </a>
      </div>
    </>
  );
}
function componentDidMount() {
  throw new Error("Function not implemented.");
}

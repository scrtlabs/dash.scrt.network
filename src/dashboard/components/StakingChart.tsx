import { useContext, useEffect, useRef, useState } from "react";
import { formatNumber } from "shared/utils/commons";
import { APIContext } from "shared/context/APIContext";

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
import { ThemeContext } from "shared/context/ThemeContext";
import { setDatasets } from "react-chartjs-2/dist/utils";
import { trackMixPanelEvent } from "shared/utils/commons";

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
  const chartRef = useRef<ChartJS<"doughnut", number[], string>>(null);

  const {
    coingeckoApiData_Day,
    setCoinGeckoApiData_Day,
    coingeckoApiData_Month,
    setCoinGeckoApiData_Month,
    coingeckoApiData_Year,
    setCoinGeckoApiData_Year,
    defiLamaApiData_Year,
    setDefiLamaApiData_Year,
    defiLamaApiData_TVL,
    setDefiLamaApiData_TVL,
    currentPrice,
    setCurrentPrice,
    externalApiData,
    setExternalApiData,
    secretAnalyticslApiData,
    setSecretAnalyticslApiData,
    bondedToken,
    setBondedToken,
    notBondedToken,
    setNotBondedToken,
    totalSupply,
    setTotalSupply,
    communityPool,
    setCommunityPool,
    inflation,
    setInflation,
    secretFoundationTax,
    setSecretFoundationTax,
    communityTax,
    setCommunityTax,
    volume,
    setVolume,
    marketCap,
    setMarketCap,
  } = useContext(APIContext);

  const { theme, setTheme } = useContext(ThemeContext);

  const [operationalToken, setOperationalToken] = useState(null);

  const [data, setData] = useState({
    labels: [""],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        hoverBackgroundColor: [],
      },
    ],
  });

  useEffect(() => {
    if (bondedToken && notBondedToken && totalSupply && communityPool) {
      setOperationalToken(
        totalSupply - bondedToken - notBondedToken - communityPool
      );
    }
  }, [bondedToken, notBondedToken, totalSupply, communityPool]);

  useEffect(() => {
    if (
      bondedToken &&
      notBondedToken &&
      totalSupply &&
      communityPool &&
      operationalToken
    ) {
      setData({
        labels: [
          `Staked: ${formatNumber(bondedToken, 2)} (${(
            (bondedToken / totalSupply) *
            100
          ).toFixed(2)}%)`,
          `Undelegated: ${formatNumber(notBondedToken, 2)} (${(
            (notBondedToken / totalSupply) *
            100
          ).toFixed(2)}%)`,
          `Operational: ${formatNumber(operationalToken, 2)} (${(
            (operationalToken / totalSupply) *
            100
          ).toFixed(2)}%)`,
          `Community Pool: ${formatNumber(communityPool, 2)} (${(
            (communityPool / totalSupply) *
            100
          ).toFixed(2)}%)`,
        ],
        datasets: [
          {
            data: [
              bondedToken,
              notBondedToken,
              operationalToken,
              communityPool,
            ],
            backgroundColor: ["#06b6d4", "#8b5cf6", "#008080", "#ff8800"],
            hoverBackgroundColor: ["#06b6d4", "#8b5cf6", "#008080", "#ff8800"],
          },
        ],
      });
    }
  }, [
    bondedToken,
    notBondedToken,
    totalSupply,
    communityPool,
    operationalToken,
  ]);

  const centerText = {
    id: "centerText",
    afterDatasetsDraw(chart: any, args: any, options: any) {
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
        `${formatNumber(totalSupply, 2)}`,
        width / 2,
        height / 1.75 + top
      );
      ctx.restore();
    },
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "92%",
    borderWidth: 0,
    animation: {
      animateRotate: true,
      responsiveAnimationDuration: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        onClick: null as any,
        labels: {
          color: theme === "dark" ? "#fff" : "#000",
          usePointStyle: true,
          pointStyle: "circle",
          padding: 10,
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed !== null) {
              label += `${formatNumber(context.parsed, 2)} SCRT`;
            }
            return label;
          },
        },
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
        <div className="w-full h-[250px] xl:h-[300px]">
          {totalSupply != undefined &&
            bondedToken != undefined &&
            notBondedToken != undefined &&
            operationalToken != undefined &&
            data != undefined &&
            options != undefined &&
            centerText != undefined && (
              <Doughnut
                id="stakingChartDoughnut"
                data={data}
                options={options as any}
                plugins={[centerText]}
                ref={chartRef}
                redraw
              />
            )}
          {!(
            totalSupply != undefined &&
            bondedToken != undefined &&
            notBondedToken != undefined &&
            operationalToken != undefined &&
            data != undefined &&
            options != undefined &&
            centerText != undefined
          ) && (
            <div className="animate-pulse">
              <div className="bg-neutral-300/40 dark:bg-neutral-700/40 rounded col-span-2 w-full h-full min-h-[250px] xl:min-h-[300px] mx-auto"></div>
            </div>
          )}
        </div>

        <a
          href="/staking"
          target="_blank"
          className="block bg-cyan-500 dark:bg-cyan-500/20 text-white dark:text-cyan-200 dark:hover:text-cyan-100 hover:bg-cyan-400 dark:hover:bg-cyan-500/50 w-full text-center transition-colors py-2.5 rounded-xl mt-4 font-semibold text-sm"
          onClick={() => {
            trackMixPanelEvent("Clicked Stake on Staking Chart");
          }}
        >
          Stake SCRT
          <FontAwesomeIcon
            icon={faArrowUpRightFromSquare}
            className="text-xs ml-2"
          />
        </a>
      </div>
    </>
  );
}

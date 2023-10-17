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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { ThemeContext } from "shared/context/ThemeContext";
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
    bondedToken,
    notBondedToken,
    totalSupply,
    communityPool,
    stkdSCRTTokenSupply,
    sSCRTTokenSupply,
    IBCTokenSupply,
  } = useContext(APIContext);

  const { theme } = useContext(ThemeContext);

  const [otherToken, setOtherToken] = useState(null);

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
    if (
      bondedToken &&
      notBondedToken &&
      totalSupply &&
      communityPool &&
      sSCRTTokenSupply &&
      stkdSCRTTokenSupply &&
      IBCTokenSupply
    ) {
      setOtherToken(
        totalSupply -
          bondedToken -
          notBondedToken -
          communityPool -
          IBCTokenSupply
      );
    }
  }, [
    bondedToken,
    notBondedToken,
    totalSupply,
    communityPool,
    sSCRTTokenSupply,
    stkdSCRTTokenSupply,
    IBCTokenSupply,
  ]);

  useEffect(() => {
    if (
      bondedToken &&
      notBondedToken &&
      totalSupply &&
      communityPool &&
      sSCRTTokenSupply &&
      stkdSCRTTokenSupply &&
      IBCTokenSupply &&
      otherToken
    ) {
      setData({
        labels: [
          `Staked: ${formatNumber(bondedToken - stkdSCRTTokenSupply, 2)} (${(
            ((bondedToken - stkdSCRTTokenSupply) / totalSupply) *
            100
          ).toFixed(2)}%)`,
          `Not staked: ${formatNumber(
            notBondedToken - sSCRTTokenSupply,
            2
          )} (${(
            ((notBondedToken - sSCRTTokenSupply) / totalSupply) *
            100
          ).toFixed(2)}%)`,
          `Community Pool: ${formatNumber(communityPool, 2)} (${(
            (communityPool / totalSupply) *
            100
          ).toFixed(2)}%)`,
          `sSCRT: ${formatNumber(sSCRTTokenSupply, 2)} (${(
            (sSCRTTokenSupply / totalSupply) *
            100
          ).toFixed(2)}%)`,
          `stkd-SCRT: ${formatNumber(stkdSCRTTokenSupply, 2)} (${(
            (stkdSCRTTokenSupply / totalSupply) *
            100
          ).toFixed(2)}%)`,
          `IBC out: ${formatNumber(IBCTokenSupply, 2)} (${(
            (IBCTokenSupply / totalSupply) *
            100
          ).toFixed(2)}%)`,
          `Other: ${formatNumber(otherToken, 2)} (${(
            (otherToken / totalSupply) *
            100
          ).toFixed(2)}%)`,
        ],
        datasets: [
          {
            data: [
              bondedToken - stkdSCRTTokenSupply,
              notBondedToken - sSCRTTokenSupply,
              communityPool,
              sSCRTTokenSupply,
              stkdSCRTTokenSupply,
              IBCTokenSupply,
              otherToken,
            ],
            backgroundColor: [
              "#06b6d4",
              "#8b5cf6",
              "#FF4500",
              "#008080",
              "#32CD32",
              "#ff8800",
              "#FF1493",
            ],
            hoverBackgroundColor: [
              "#06b6d4",
              "#8b5cf6",
              "#FF4500",
              "#008080",
              "#32CD32",
              "#ff8800",
              "#FF1493",
            ],
          },
        ],
      });
    }
  }, [
    bondedToken,
    notBondedToken,
    totalSupply,
    communityPool,
    sSCRTTokenSupply,
    stkdSCRTTokenSupply,
    IBCTokenSupply,
    otherToken,
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
        {/* Chart */}
        <div className="w-full h-[250px] xl:h-[300px]">
          {totalSupply != undefined &&
          bondedToken != undefined &&
          notBondedToken != undefined &&
          otherToken != undefined &&
          sSCRTTokenSupply != undefined &&
          stkdSCRTTokenSupply != undefined &&
          otherToken != undefined &&
          data != undefined &&
          options != undefined &&
          centerText != undefined ? (
            <Doughnut
              id="stakingChartDoughnut"
              data={data}
              options={options as any}
              plugins={[centerText]}
              ref={chartRef}
              redraw
            />
          ) : (
            <div className="animate-pulse bg-neutral-300/40 dark:bg-neutral-700/40 rounded col-span-2 w-full h-full min-h-[250px] xl:min-h-[300px] mx-auto"></div>
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

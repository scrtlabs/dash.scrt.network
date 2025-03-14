import { useContext, useEffect, useRef, useState } from 'react'
import { formatNumber } from 'utils/commons'
import { APIContext } from 'context/APIContext'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { trackMixPanelEvent } from 'utils/commons'
import { Link } from 'react-router-dom'
import { useUserPreferencesStore } from 'store/UserPreferences'

ChartJS.register(CategoryScale, LinearScale, PointElement, ArcElement, LineElement, Title, ChartTooltip, Legend)

export default function StakingChart() {
  const chartRef = useRef<ChartJS<'doughnut', number[], string>>(null)

  const {
    bondedToken,
    notBondedToken,
    totalSupply,
    communityPool,
    stkdSCRTTokenSupply,
    sSCRTTokenSupply,
    IBCTokenSupply,
    burnedTokenSupply,
    exchangesTokenSupply
  } = useContext(APIContext)

  const { theme } = useUserPreferencesStore()

  const [otherToken, setOtherToken] = useState<number>()
  const [adjustedTotalSupply, setAdjustedTotalSupply] = useState<number>()

  const [data, setData] = useState({
    labels: [''],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        hoverBackgroundColor: []
      }
    ]
  })

  useEffect(() => {
    if (
      bondedToken &&
      notBondedToken &&
      totalSupply &&
      communityPool &&
      sSCRTTokenSupply &&
      stkdSCRTTokenSupply &&
      IBCTokenSupply !== null &&
      exchangesTokenSupply &&
      burnedTokenSupply
    ) {
      const otherToken =
        totalSupply -
        bondedToken -
        notBondedToken -
        communityPool -
        IBCTokenSupply -
        sSCRTTokenSupply -
        burnedTokenSupply -
        exchangesTokenSupply

      setAdjustedTotalSupply(totalSupply - burnedTokenSupply)
      setOtherToken(otherToken)

      const dataValues = [
        { label: 'Staked', value: bondedToken - stkdSCRTTokenSupply },
        { label: 'Liquid', value: otherToken },
        { label: 'Exchanges', value: exchangesTokenSupply },
        { label: 'sSCRT', value: sSCRTTokenSupply },
        { label: 'stkd-SCRT', value: stkdSCRTTokenSupply },
        { label: 'Staked (not bonded)', value: notBondedToken },
        { label: 'IBC out', value: IBCTokenSupply },
        { label: 'Community Pool', value: communityPool },
        { label: 'Burned', value: burnedTokenSupply }
      ]

      const backgroundColors = [
        '#06b6d4',
        '#8b5cf6',
        '#ADD8E6',
        '#FF4500',
        '#008080',
        '#32CD32',
        '#FF1493',
        '#ff8800',
        '#000000'
      ]

      setData({
        labels: dataValues.map((item) => createLabel(item.label, item.value)),
        datasets: [
          {
            data: dataValues.map((item) => item.value),
            backgroundColor: backgroundColors,
            hoverBackgroundColor: backgroundColors
          }
        ]
      })
    }
  }, [
    bondedToken,
    notBondedToken,
    totalSupply,
    communityPool,
    sSCRTTokenSupply,
    stkdSCRTTokenSupply,
    IBCTokenSupply,
    burnedTokenSupply,
    exchangesTokenSupply
  ])

  const createLabel = (label: string, value: number) => {
    return `${label}: ${formatNumber(value, 2)}`
  }

  const centerText = {
    id: 'centerText',
    afterDatasetsDraw(chart: any, args: any, options: any) {
      const {
        ctx,
        chartArea: { left, right, top, bottom, width, height }
      } = chart

      ctx.save()

      ctx.font = 'bold 0.9rem RundDisplay'
      ctx.fillStyle = theme === 'dark' ? '#fff' : '#000'
      ctx.textAlign = 'center'
      ctx.fillText(`SCRT Total Supply`, width / 2, height / 2.25 + top)
      ctx.restore()

      ctx.font = '400 1.5rem RundDisplay'
      ctx.fillStyle = theme === 'dark' ? '#fff' : '#000'
      ctx.textAlign = 'center'
      ctx.fillText(`${formatNumber(totalSupply, 2)}`, width / 2, height / 1.75 + top)
      ctx.restore()
    }
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '92%',
    borderWidth: 0,
    animation: {
      animateRotate: true,
      responsiveAnimationDuration: false
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        onClick: null as any,
        labels: {
          color: theme === 'dark' ? '#fff' : '#000',
          font: {
            family: 'RundDisplay',
            size: 11
          },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 7
        }
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context: any) {
            let label = ''
            return label
          }
        },
        titleFont: {
          family: 'RundDisplay'
        },
        bodyFont: {
          family: 'RundDisplay'
        }
      }
    }
  }

  return (
    <>
      <div>
        {/* Chart */}
        <div className="w-full h-[250px] xl:h-[300px]">
          {adjustedTotalSupply !== undefined &&
          bondedToken !== undefined &&
          notBondedToken !== undefined &&
          otherToken !== undefined &&
          sSCRTTokenSupply !== undefined &&
          stkdSCRTTokenSupply !== undefined &&
          communityPool !== undefined &&
          IBCTokenSupply !== undefined &&
          burnedTokenSupply !== undefined &&
          exchangesTokenSupply !== undefined &&
          options !== undefined &&
          centerText !== undefined ? (
            <Doughnut
              id="stakingChartDoughnut"
              data={data}
              options={options as any}
              plugins={[centerText]}
              ref={chartRef}
              redraw
            />
          ) : (
            <div className="animate-pulse bg-neutral-300 dark:bg-neutral-800 rounded col-span-2 w-full h-full min-h-[250px] xl:min-h-[300px] mx-auto"></div>
          )}
        </div>
        <Link
          to={'/staking'}
          className="block bg-cyan-500 dark:bg-cyan-500/20 text-white dark:text-cyan-200 dark:hover:text-cyan-100 hover:bg-cyan-400 dark:hover:bg-cyan-500/50 w-full text-center transition-colors py-2.5 rounded-xl mt-2 font-semibold text-sm"
          onClick={() => {
            trackMixPanelEvent('Clicked Stake on Staking Chart')
          }}
        >
          Stake SCRT
        </Link>
      </div>
    </>
  )
}

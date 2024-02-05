import { createContext, useContext, useEffect, useState } from 'react'
import { formatNumber } from 'utils/commons'
import { ThemeContext } from 'context/ThemeContext'
import { APIContext } from 'context/APIContext'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import TypeSwitch from './components/TypeSwitch'
import RangeSwitch from './components/RangeSwitch'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

type ChartType = 'Price' | 'Volume' | 'TVL'
type ChartRange = 'Day' | 'Month' | 'Year'

export const PriceVolumeHistoryContext = createContext(null)

export default function PriceVolumeTVL(props: any) {
  const { coingeckoApiData_Day, coingeckoApiData_Month, coingeckoApiData_Year, defiLamaApiData_Year } =
    useContext(APIContext)

  const { theme } = useContext(ThemeContext)

  const [chartType, setChartType] = useState<ChartType>('Price')
  const [chartRange, setChartRange] = useState<ChartRange>('Month')
  const [chartData, setChartData] = useState<any>([])

  let apiDataMapping = new Map<ChartRange, Object>([
    ['Day', coingeckoApiData_Day],
    ['Month', coingeckoApiData_Month],
    ['Year', coingeckoApiData_Year]
  ])

  useEffect(() => {
    if (!coingeckoApiData_Day || !coingeckoApiData_Month || !coingeckoApiData_Year || !defiLamaApiData_Year) {
      return
    }
    if (chartType === 'Price') {
      setChartData((apiDataMapping.get(chartRange) as any).prices)
    } else if (chartType === 'Volume') {
      setChartData((apiDataMapping.get(chartRange) as any).total_volumes)
    } else if (chartType === 'TVL') {
      setChartData(defiLamaApiData_Year)
      setChartRange('Year')
    }
  }, [chartType, chartRange, coingeckoApiData_Day, coingeckoApiData_Month, coingeckoApiData_Year, defiLamaApiData_Year])

  const data = {
    labels: chartData.map(
      (x: any[]) =>
        ({
          x:
            chartRange === 'Day'
              ? `${new Date(x[0]).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit'
                })} / ${new Date(x[0]).toLocaleDateString(undefined, {
                  month: '2-digit',
                  day: '2-digit'
                })}`
              : `${new Date(x[0]).toLocaleDateString(undefined, {
                  year: '2-digit',
                  month: '2-digit',
                  day: '2-digit'
                })}`
        }).x
    ),
    datasets: [
      {
        label: chartType,
        data: chartData.map((x: any[]) => ({ x: x[0], y: x[1] })),
        fill: 'start',
        borderColor: 'rgba(0, 123, 255, 1)',
        tension: 0.1,
        pointHitRadius: '5'
      }
    ]
  }

  const glowPlugin = {
    id: 'glow',
    beforeDatasetsDraw: (chart: any, args: any, options: any) => {
      const ctx = chart.ctx
      ctx.save()
      ;(ctx.shadowColor = 'rgba(0, 123, 255, 1)'), (ctx.shadowBlur = 2)
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    },
    afterDatasetsDraw: (chart: any) => {
      chart.ctx.restore()
    }
  }

  const options = {
    responsive: true,
    animation: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        xAlign: true,
        color: 'rgba(0, 123, 255, 1)',
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || ''

            if (label) {
              label += ': '
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: 'USD'
              }).format(context.parsed.y)
            }
            return label
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: theme === 'dark' ? '#fff' : '#000'
        },
        grid: {
          color: theme === 'dark' ? '#fff' : '#000',
          alpha: 0.5,
          display: false,
          drawOnChartArea: true,
          drawTicks: true,
          tickLength: 0
        },
        border: {
          color: theme === 'dark' ? '#fff' : '#000'
        }
      },
      y: {
        ticks: {
          color: theme === 'dark' ? '#fff' : '#000',
          callback: function (value: any, index: any, ticks: any) {
            return '$' + formatNumber(value, 2)
          }
        },
        border: {
          color: theme === 'dark' ? '#fff' : '#000'
        },
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
          display: true,
          drawOnChartArea: true,
          drawTicks: true,
          tickLength: 0
        }
      }
    },
    pointStyle: false
  }

  const providerValue = {
    chartType,
    setChartType,
    chartRange,
    setChartRange
  }

  return (
    <PriceVolumeHistoryContext.Provider value={providerValue}>
      <div className="flex flex-col gap-4 xs:gap-2 xs:flex-row items-center mb-4">
        {/* [Price|Volume|TVL] */}
        <div className="flex-1 flex items-center">
          <div className="block xs:hidden mr-2 text-sm font-semibold dark:text-neutral-400">Mode:</div>
          <TypeSwitch />
        </div>
        {/* [Day|Month|Year] */}
        <div className="flex-initial flex items-center">
          <div className="block xs:hidden mr-2 text-sm font-semibold text-neutral-600 dark:text-neutral-400">
            Range:
          </div>
          <RangeSwitch />
        </div>
      </div>
      <div className="w-full h-[300px] xl:h-[400px]">
        <Line data={data as any} options={options as any} plugins={[]} />
      </div>
    </PriceVolumeHistoryContext.Provider>
  )
}

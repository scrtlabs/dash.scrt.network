import { useContext, useEffect, useState } from 'react'
import { formatNumber } from 'utils/commons'
import { APIContext } from 'context/APIContext'
import Tooltip from '@mui/material/Tooltip'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip as ChartTooltip,
  BarController
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { useUserPreferencesStore } from 'store/UserPreferences'

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTooltip, BarController)

type Data = {
  bonded_tokens: number
  date: string
  moniker: string
}

export default function ValidatorsChart() {
  const { analyticsData2 } = useContext(APIContext)
  const { theme } = useUserPreferencesStore()
  const [chartData, setChartData] = useState<any>([])

  useEffect(() => {
    if (analyticsData2) {
      const dateMap: Record<string, Record<string, number>> = {}
      const monikerTotals: Record<string, number> = {}
      const monikerSet = new Set<string>()

      analyticsData2.forEach((entry: Data) => {
        monikerSet.add(entry.moniker)

        if (!dateMap[entry.date]) {
          dateMap[entry.date] = {}
        }
        dateMap[entry.date][entry.moniker] = (dateMap[entry.date][entry.moniker] || 0) + entry.bonded_tokens

        monikerTotals[entry.moniker] = (monikerTotals[entry.moniker] || 0) + entry.bonded_tokens
      })

      const sortedMonikers = Array.from(monikerSet).sort((a, b) => monikerTotals[b] - monikerTotals[a])

      const sortedDates = Object.keys(dateMap).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

      const datasets = sortedMonikers.map((moniker) => {
        return {
          label: moniker,
          data: sortedDates.map((date) => dateMap[date][moniker] || 0),
          backgroundColor: getColorFromMoniker(moniker),
          borderWidth: 0,
          yAxisID: 'y',
          stack: 'validators'
        }
      })

      const labels = sortedDates.map((date) => {
        return new Date(date).toLocaleDateString(undefined, {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit'
        })
      })

      if (datasets.length > 0) {
        setChartData({
          labels,
          datasets
        })
      }
    }
  }, [analyticsData2])

  const options = {
    responsive: true,
    animation: true,
    maintainAspectRatio: false,
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
        beginAtZero: true,
        stacked: true,
        ticks: {
          color: theme === 'dark' ? '#fff' : '#000',
          callback: function (value: any) {
            return formatNumber(value, 2)
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
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        xAlign: 'center',
        color: theme === 'dark' ? '#fff' : '#000',
        callbacks: {
          label: function (context: any) {
            if (context.parsed.y !== null) {
              return `${context.dataset.label}: ${formatNumber(context.parsed.y)} SCRT`
            }
            return ''
          }
        }
      }
    }
  }

  // Function to generate a deterministic color based on the moniker name
  function getColorFromMoniker(moniker: string) {
    let hash = 0
    for (let i = 0; i < moniker.length; i++) {
      hash = moniker.charCodeAt(i) + ((hash << 5) - hash)
    }
    const color = `#${(hash & 0x00ffffff).toString(16).padStart(6, '0').slice(-6)}`
    return color
  }

  return (
    <>
      <div>
        <h2 className="text-center text-xl font-semibold pt-2.5 pb-0">
          Bonded Tokens by Validator
          <div className="inline-block">
            <Tooltip title={`Number of bonded tokens by validator over time`} placement="right" arrow>
              <span className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer ml-2 text-sm">
                <FontAwesomeIcon icon={faInfoCircle} />
              </span>
            </Tooltip>
          </div>
        </h2>
      </div>
      <div className="w-full h-[300px] xl:h-[400px]">
        {chartData.length !== 0 && analyticsData2 ? <Bar data={chartData as any} options={options as any} /> : null}
      </div>
    </>
  )
}

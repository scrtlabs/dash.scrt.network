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
  block_timestamp: number
  is_new: boolean
  num_wallets: number
}

export default function AccountsChart() {
  const { analyticsData1 } = useContext(APIContext)
  const { theme } = useUserPreferencesStore()
  const [chartData, setChartData] = useState<any>([])

  useEffect(() => {
    if (analyticsData1) {
      // Create a map with block_timestamp as keys and the corresponding data as values
      const timestampMap = new Map<number, Data[]>()

      analyticsData1.forEach((entry: Data) => {
        if (timestampMap.has(entry.block_timestamp)) {
          timestampMap.get(entry.block_timestamp)?.push(entry)
        } else {
          timestampMap.set(entry.block_timestamp, [entry])
        }
      })

      const sortedEntries = Array.from(timestampMap.entries()).sort(([a], [b]) => a - b)

      const stackedData = sortedEntries.map(([timestamp, entries]) => {
        const isNewEntry = entries.find((entry) => entry.is_new)
        const notNewEntry = entries.find((entry) => !entry.is_new)
        return {
          timestamp,
          new_wallets: isNewEntry ? isNewEntry.num_wallets : 0,
          old_wallets: notNewEntry ? notNewEntry.num_wallets : 0
        }
      })

      const labels = stackedData.map((date: any) => {
        return new Date(date.timestamp).toLocaleDateString(undefined, {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit'
        })
      })

      if (stackedData && stackedData.length > 0) {
        const chartData = {
          labels: labels,
          datasets: [
            {
              label: 'Existing Wallets',
              data: stackedData.map((item) => item.old_wallets),
              backgroundColor: 'rgba(0, 123, 255, 1)',
              borderWidth: 0,
              yAxisID: 'y',
              stack: 'wallets'
            },
            {
              label: 'New Wallets',
              data: stackedData.map((item) => item.new_wallets),
              backgroundColor: 'rgba(150, 75, 200, 1)',
              borderWidth: 0,
              yAxisID: 'y',
              stack: 'wallets'
            }
          ]
        }
        setChartData(chartData)
      }
    }
  }, [analyticsData1])

  const options = {
    responsive: true,
    animation: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: theme === 'dark' ? '#fff' : '#000',
          font: {
            family: 'RundDisplay'
          }
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
          },
          font: {
            family: 'RundDisplay'
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
        display: true,
        labels: {
          font: {
            family: 'RundDisplay'
          }
        }
      },
      tooltip: {
        xAlign: 'center',
        color: theme === 'dark' ? '#fff' : '#000',
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
        <h2 className="text-center text-xl font-semibold pt-2.5 pb-0">
          Daily interacting Wallets
          <div className="inline-block">
            <Tooltip title={`Number of unique wallets that interacted with the chain daily`} placement="right" arrow>
              <span className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer ml-2 text-sm">
                <FontAwesomeIcon icon={faInfoCircle} />
              </span>
            </Tooltip>
          </div>
        </h2>
      </div>
      <div className="w-full h-[300px] xl:h-[400px]">
        {chartData.length != 0 && analyticsData1 ? <Bar data={chartData as any} options={options as any} /> : null}
      </div>
    </>
  )
}

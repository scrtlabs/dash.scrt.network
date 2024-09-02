import { useContext, useEffect, useState } from 'react'
import { formatNumber } from 'utils/commons'
import { APIContext } from 'context/APIContext'
import Tooltip from '@mui/material/Tooltip'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip as ChartTooltip,
  LineController
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { useUserPreferencesStore } from 'store/UserPreferences'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTooltip, LineController)

type Data = {
  Date: string
  num_contracts_created: number
  num_contracts_used: number
  num_nonempty_blocks: number
  num_transactions: number
  num_wallets: number
}

export default function TransactionsChart() {
  const { analyticsData3 } = useContext(APIContext)
  const { theme } = useUserPreferencesStore()
  const [chartData, setChartData] = useState<any>([])

  useEffect(() => {
    if (analyticsData3) {
      const labels = analyticsData3.map((entry: Data) =>
        new Date(entry.Date).toLocaleDateString(undefined, {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit'
        })
      )

      const lineData = {
        labels: labels,
        datasets: [
          {
            label: 'Daily Transactions',
            data: analyticsData3.map((item: Data) => item.num_transactions),
            borderColor: 'rgba(0, 123, 255, 1)',
            borderWidth: 2,
            backgroundColor: 'rgba(0, 123, 255, 0.5)',
            fill: false,
            tension: 0.1,
            yAxisID: 'y'
          },
          {
            label: 'Filled Blocks Daily',
            data: analyticsData3.map((item: Data) => item.num_nonempty_blocks),
            borderColor: 'rgba(150, 75, 200, 1)',
            borderWidth: 2,
            backgroundColor: 'rgba(150, 75, 200, 0.5)',
            fill: false,
            tension: 0.1,
            yAxisID: 'y'
          }
        ]
      }
      setChartData(lineData)
    }
  }, [analyticsData3])

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
        display: true
      },
      tooltip: {
        xAlign: 'center',
        color: theme === 'dark' ? '#fff' : '#000'
      }
    }
  }

  return (
    <>
      <div>
        <h2 className="text-center text-xl font-semibold pt-2.5 pb-0">
          # Transactions over time
          <div className="inline-block">
            <Tooltip title={`Number of daily transactions and daily filled blocks over time`} placement="right" arrow>
              <span className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer ml-2 text-sm">
                <FontAwesomeIcon icon={faInfoCircle} />
              </span>
            </Tooltip>
          </div>
        </h2>
      </div>
      <div className="w-full h-[300px] xl:h-[400px]">
        {chartData.length != 0 ? <Line data={chartData as any} options={options as any} /> : null}
      </div>
    </>
  )
}

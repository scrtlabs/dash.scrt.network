import { useContext, useEffect, useState } from 'react'
import { formatNumber } from 'utils/commons'
import { APIContext } from 'context/APIContext'
import Tooltip from '@mui/material/Tooltip'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  BarController
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { useUserPreferencesStore } from 'store/UserPreferences'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend, BarController)

export default function UnbondingsChart(props: any) {
  const { L5AnalyticslApiData } = useContext(APIContext)

  const { theme } = useUserPreferencesStore()

  const [chartData, setChartData] = useState<any>([])

  useEffect(() => {
    if (L5AnalyticslApiData) {
      const dataArray = Object.entries(L5AnalyticslApiData['unbonding_by_date']).map(([date, balance]) => [
        date,
        balance
      ])
      setChartData(dataArray)
    }
  }, [L5AnalyticslApiData])

  const datasets = [
    {
      label: 'SCRT',
      data: chartData.map(([_, balances]: any) => balances),
      backgroundColor: 'rgba(0, 123, 255, 1)',
      borderColor: 'rgba(0, 123, 255, 1)',
      borderWidth: 1
    }
  ]

  const totalUnbonding = datasets[0].data.reduce((sum: number, balance: number) => sum + balance, 0)

  const labels = chartData.map(([date]: any) => {
    const dateObj = new Date(date)
    return dateObj.toLocaleDateString(undefined, {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit'
    })
  })

  const data = {
    labels: labels,
    datasets: datasets
  }

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
          callback: function (value: any, index: any, ticks: any) {
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
        xAlign: true,
        color: 'rgba(0, 123, 255, 1)',
        callbacks: {
          label: function (context: any) {
            if (context.parsed.y !== null) {
              return `${formatNumber(context.parsed.y)} SCRT`
            }
            return ''
          }
        }
      }
    }
  }

  return (
    <>
      <div>
        <h2 className="text-center text-xl font-semibold pt-2.5 pb-0">
          SCRT Unbonding
          <div className="inline-block">
            <Tooltip title={`Shows the unbonded (unstaked) SCRT per day`} placement="right" arrow>
              <span className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer ml-2 text-sm">
                <FontAwesomeIcon icon={faInfoCircle} />
              </span>
            </Tooltip>
          </div>
        </h2>
      </div>
      {totalUnbonding ? (
        <h3 className="text-center text-lg pt-0 pb-2.5">Total: {Math.round(totalUnbonding).toLocaleString()} SCRT</h3>
      ) : null}
      <div className="w-full h-[300px] xl:h-[400px]">
        <Bar data={data as any} options={options as any} />
      </div>
    </>
  )
}

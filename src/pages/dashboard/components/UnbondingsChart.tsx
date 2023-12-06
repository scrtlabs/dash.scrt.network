import React, { createContext, useContext, useEffect, useState } from 'react'
import { formatNumber } from 'utils/commons'
import { ThemeContext } from 'context/ThemeContext'
import { APIContext } from 'context/APIContext'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController // Import BarController
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, BarController)

export default function UnbondingsChart(props: any) {
  const { L5AnalyticslApiData } = useContext(APIContext)

  const { theme } = useContext(ThemeContext)

  const [chartData, setChartData] = useState<any>([])

  useEffect(() => {
    if (L5AnalyticslApiData) {
      console.log(L5AnalyticslApiData['unbonding_by_date'])
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
      <h2 className="text-center text-2xl font-semibold pt-2.5 pb-0">SCRT Unbonding</h2>
      {totalUnbonding ? (
        <h3 className="text-center text-lg pt-0 pb-2.5">Total: {Math.round(totalUnbonding).toLocaleString()} SCRT</h3>
      ) : null}
      <div className="w-full h-[300px] xl:h-[400px]">
        <Bar data={data as any} options={options as any} />
      </div>
    </>
  )
}

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
import { Bar, Line } from 'react-chartjs-2'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { useUserPreferencesStore } from 'store/UserPreferences'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend, BarController)

export default function AccountsChart(props: any) {
  const { L5AnalyticsApiData } = useContext(APIContext)

  const { theme } = useUserPreferencesStore()

  const [chartData, setChartData] = useState<any>([])

  // useEffect(() => {
  //   if (L5AnalyticsApiData) {
  //     console.log(L5AnalyticsApiData)
  //     const dataArray = Object.entries(L5AnalyticsApiData['unbonding_by_date']).map(([date, balance]) => [
  //       date,
  //       balance
  //     ])
  //     const chartData = {
  //       labels: dataArray.map((item) => item.timestamp),
  //       datasets: [
  //         {
  //           label: '# unique wallets',
  //           data: dataArray.map((item) => item.wallets),
  //           borderColor: 'rgb(105, 57, 208)',
  //           yAxisID: 'y',
  //           tension: 0.1
  //         },
  //         {
  //           label: '# Unique contracts',
  //           data: dataArray.map((item) => item.code_ids),
  //           borderColor: 'rgb(249, 201, 31)',
  //           yAxisID: 'y1'
  //         }
  //       ]
  //     }
  //     setChartData(chartData)
  //   }
  // }, [L5AnalyticsApiData])

  return (
    <>
      <div>
        <h2 className="text-center text-xl font-semibold pt-2.5 pb-0">
          Unique Wallets
          <div className="inline-block">
            <Tooltip title={`Shows the unbonded (unstaked) SCRT per day`} placement="right" arrow>
              <span className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer ml-2 text-sm">
                <FontAwesomeIcon icon={faInfoCircle} />
              </span>
            </Tooltip>
          </div>
        </h2>
      </div>
      <div className="w-full h-[300px] xl:h-[400px]">
        {/* {chartData ? <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
              display: true
            }
          },
          scales: {
            x : {
              display: true,
              type: 'time',
              ticks: {
                major: {
                  enabled: true, // <-- This is the key line
                },
                maxRotation: 45,
                minRotation: 45,
                maxTicksLimit: 12,
                color: 'black',
              },
              time: {
                parser: 'YYYY-MM-DD HH:mm:ss',
                unit: 'day',
                displayFormats: {
                   'day': 'MMM DD'
                  }
              }
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
      
              // grid line settings
              grid: {
                drawOnChartArea: false, // only want the grid lines for one axis to show up
              },
            },
          } 
        }}
      /> : null} */}
      </div>
      <div className="text-center text-sm">Metrics by Lavender.Five Nodes 🐝</div>
    </>
  )
}

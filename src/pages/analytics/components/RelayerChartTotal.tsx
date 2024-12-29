import { useContext, useMemo } from 'react'
import { formatNumber } from 'utils/commons'
import Tooltip from '@mui/material/Tooltip'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip as ChartTooltip,
  Legend,
  BarController
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { useUserPreferencesStore } from 'store/UserPreferences'
import { APIContext } from 'context/APIContext'

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTooltip, Legend, BarController)

export default function RelayerChartTotal() {
  const { theme } = useUserPreferencesStore()
  const { analyticsData4 } = useContext(APIContext)

  const chartData = useMemo(() => {
    if (!analyticsData4) return null

    const datesSet = new Set<string>()
    const dataMatrix: Record<string, number[]> = {}

    // Collect and sort dates
    for (const entry of analyticsData4) {
      const date = new Date(entry.Date).toISOString().split('T')[0]
      datesSet.add(date)
    }
    const sortedDates = Array.from(datesSet).sort()

    // Create a date-to-index map
    const dateIndexMap = sortedDates.reduce(
      (acc, date, index) => {
        acc[date] = index
        return acc
      },
      {} as Record<string, number>
    )

    // Process entries and populate dataMatrix
    for (const entry of analyticsData4) {
      const date = new Date(entry.Date).toISOString().split('T')[0]
      const dateIndex = dateIndexMap[date]

      const label = `${entry.IBC_Counterpart} - ${entry.Relayer || 'Other'}`

      // Initialize dataMatrix[label] if it doesn't exist
      if (!dataMatrix[label]) {
        dataMatrix[label] = new Array(sortedDates.length).fill(0)
      }

      // Update the corresponding value
      dataMatrix[label][dateIndex] += entry.Transactions
    }

    // Create datasets without nested mapping
    const datasets = Object.keys(dataMatrix).map((label) => ({
      label,
      data: dataMatrix[label],
      backgroundColor: getColorFromCombo(label)
    }))

    // Return the final chart data
    return {
      labels: sortedDates,
      datasets
    }
  }, [analyticsData4])

  const options = useMemo(() => {
    if (!chartData) return {}

    return {
      responsive: true,
      animation: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: theme === 'dark' ? '#fff' : '#000',
            callback: function (value: any, index: number) {
              return new Date((chartData as any).labels[index]).toLocaleDateString(undefined, {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit'
              })
            },
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
          display: false
        },
        tooltip: {
          xAlign: 'center',
          color: theme === 'dark' ? '#fff' : '#000',
          callbacks: {
            label: function (context: any) {
              if (context.parsed.y !== null) {
                return `${context.dataset.label}: ${formatNumber(context.parsed.y)} Transactions`
              }
              return ''
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
  }, [theme, chartData])

  function getColorFromCombo(combo: string) {
    // Generate a unique color based on the combo string
    let hash = 0
    for (let i = 0; i < combo.length; i++) {
      hash = combo.charCodeAt(i) + ((hash << 5) - hash)
    }
    const color = `#${('000000' + (hash & 0xffffff).toString(16)).slice(-6)}`
    return color
  }

  return (
    <>
      <div>
        <h2 className="text-center text-xl font-semibold pt-2.5 pb-0">
          IBC Transactions
          <Tooltip
            title="Chart shows the IBC transactions per date for each combination of chain and relayer."
            placement="right"
            arrow
          >
            <span className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer ml-2 text-sm">
              <FontAwesomeIcon icon={faInfoCircle} />
            </span>
          </Tooltip>
        </h2>
      </div>
      <div className="w-full h-[300px] xl:h-[400px]">
        {chartData ? <Bar data={chartData} options={options as any} /> : null}
      </div>
    </>
  )
}

import { useContext, useMemo } from 'react'
import { bech32PrefixToChainName, formatNumber } from 'utils/commons'
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

type Entry = {
  Date: string
  IBC_Counterpart: string
  Relayer: string
  Transactions: number
}

export default function RelayerChartTotal() {
  const { theme } = useUserPreferencesStore()
  const { analyticsData4 } = useContext(APIContext)

  const chartData = useMemo(() => {
    if (!analyticsData4) return null

    // Initialize data structures
    const dataMatrix: Map<string, Map<string, number>> = new Map()
    const datesSet: Set<string> = new Set()
    const comboSet: Set<string> = new Set()

    // Build dataMatrix and collect unique dates and combinations
    for (const entry of analyticsData4) {
      const date = new Date(entry.Date).toISOString().split('T')[0]
      const chainBech32Prefix = entry.IBC_Counterpart
      const relayer = entry.Relayer || 'Other'

      datesSet.add(date)

      const comboKey = `${chainBech32Prefix}-${relayer}`
      comboSet.add(comboKey)

      if (!dataMatrix.has(comboKey)) {
        dataMatrix.set(comboKey, new Map())
      }
      const dateMap = dataMatrix.get(comboKey)!
      dateMap.set(date, (dateMap.get(date) || 0) + entry.Transactions)
    }

    // Sort dates
    const sortedDates = Array.from(datesSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

    // Prepare an array of { comboKey, label } pairs
    const comboLabelPairs = Array.from(comboSet).map((comboKey) => {
      const [chainPrefix, ...relayerParts] = comboKey.split('-')
      const relayer = relayerParts.join('-')
      const chainLabel = bech32PrefixToChainName.get(chainPrefix) || chainPrefix
      const label = `${chainLabel} - ${relayer}`
      return { comboKey, label }
    })

    // Sort combos by label alphabetically
    comboLabelPairs.sort((a, b) => a.label.localeCompare(b.label))

    // Extract the sorted combos and labels
    const sortedComboKeys = comboLabelPairs.map((pair) => pair.comboKey)
    const comboLabels = comboLabelPairs.map((pair) => pair.label)

    // Create datasets for each combo
    const datasets = sortedComboKeys.map((comboKey, index) => {
      const dateMap = dataMatrix.get(comboKey)!
      const data = sortedDates.map((date) => dateMap.get(date) || 0)
      return {
        label: comboLabels[index],
        data,
        backgroundColor: getColorFromCombo(comboLabels[index])
      }
    })

    // Return chart data with prepared labels and datasets
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
              return new Date(chartData.labels[index]).toLocaleDateString(undefined, {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit'
              })
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
    const color = `#${(hash & 0x00ffffff).toString(16).padStart(6, '0').slice(-6)}`
    return color
  }

  return (
    <>
      <div>
        <h2 className="text-center text-xl font-semibold pt-2.5 pb-0">
          IBC Transactions by Date, Chain, and Relayer
          <Tooltip
            title="The chart shows the stacked transactions per date for each combination of IBC Counterpart and Relayer."
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

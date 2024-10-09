import { useContext, useEffect, useState } from 'react'
import { bech32PrefixToChainName, formatNumber } from 'utils/commons'
import Tooltip from '@mui/material/Tooltip'
import Slider from '@mui/material/Slider'
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
import { chains } from 'utils/config'

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTooltip, Legend, BarController)

type Entry = {
  Date: string
  IBC_Counterpart: string
  Relayer: string
  Transactions: number
}

export default function RelayerChartWithDateSlider() {
  const { theme } = useUserPreferencesStore()
  const { analyticsData4 } = useContext(APIContext)
  const [chartData, setChartData] = useState<any>(null)
  const [dates, setDates] = useState<string[]>([])
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0)

  useEffect(() => {
    // Process data grouped by date
    const dateMap: Record<string, Entry[]> = {}

    analyticsData4.forEach((entry: Entry) => {
      const date = new Date(entry.Date).toISOString().split('T')[0]
      dateMap[date] ||= []
      dateMap[date].push(entry)
    })

    const sortedDates = Object.keys(dateMap).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    setDates(sortedDates)

    // Initialize chart data with the first date's data
    if (sortedDates.length > 0) {
      const initialDate = sortedDates[0]
      updateChartDataForDate(initialDate, dateMap[initialDate])
    }
  }, [analyticsData4])

  const updateChartDataForDate = (date: string, entries: Entry[]) => {
    // Initialize data structures
    const dataMatrix: Map<string, Map<string, number>> = new Map()
    const chainsSet: Set<string> = new Set()
    const relayersSet: Set<string> = new Set()

    // Build dataMatrix and collect unique chains and relayers
    for (const entry of entries) {
      const chainBech32Prefix = entry.IBC_Counterpart
      const relayer = entry.Relayer || 'Other'

      chainsSet.add(chainBech32Prefix)
      relayersSet.add(relayer)

      if (!dataMatrix.has(relayer)) {
        dataMatrix.set(relayer, new Map())
      }
      const chainMap = dataMatrix.get(relayer)!
      chainMap.set(chainBech32Prefix, (chainMap.get(chainBech32Prefix) || 0) + entry.Transactions)
    }

    // Prepare an array of { prefix, label } pairs
    const prefixLabelPairs = Array.from(chainsSet).map((prefix) => ({
      prefix,
      label: bech32PrefixToChainName.get(prefix) || prefix
    }))

    // Sort prefixLabelPairs by label alphabetically
    prefixLabelPairs.sort((a, b) => a.label.localeCompare(b.label))

    // Extract the sorted bech32Prefixes and labels
    const sortedBech32Prefixes = prefixLabelPairs.map((pair) => pair.prefix)
    const labels = prefixLabelPairs.map((pair) => pair.label)

    // Create datasets for each relayer
    const datasets = Array.from(relayersSet).map((relayer) => {
      const chainMap = dataMatrix.get(relayer)!
      const data = sortedBech32Prefixes.map((prefix) => chainMap.get(prefix) || 0)
      return {
        label: relayer,
        data,
        backgroundColor: getColorFromRelayer(relayer)
      }
    })

    // Set chart data with prepared labels and datasets
    setChartData({
      labels,
      datasets
    })
  }

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    const index = newValue as number
    setSelectedDateIndex(index)

    const selectedDate = dates[index]
    const dateEntries = analyticsData4.filter(
      (entry: Entry) => new Date(entry.Date).toISOString().split('T')[0] === selectedDate
    )

    updateChartDataForDate(selectedDate, dateEntries)
  }

  const getSliderMarks = () => {
    if (dates.length === 0) return []

    const numMarks = Math.min(10, dates.length) // Limit to 10 marks max
    const marks = []

    const formatDate = (date: string) =>
      new Date(date).toLocaleDateString(undefined, {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit'
      })

    // Always include the first date
    marks.push({
      value: 0,
      label: formatDate(dates[0])
    })

    if (dates.length > 1) {
      const interval = (dates.length - 1) / (numMarks - 1)

      // Add intermediate marks only if necessary
      for (let i = 1; i < numMarks - 1; i++) {
        const index = Math.round(i * interval)
        marks.push({
          value: index,
          label: formatDate(dates[index])
        })
      }

      // Always include the last date
      marks.push({
        value: dates.length - 1,
        label: formatDate(dates[dates.length - 1])
      })
    }

    return marks
  }

  const options = {
    responsive: true,
    animation: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
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
              return `${context.dataset.label}: ${formatNumber(context.parsed.y)} Transactions`
            }
            return ''
          }
        }
      }
    }
  }

  function getColorFromRelayer(relayer: string) {
    // Generate a unique color based on the relayer name
    let hash = 0
    for (let i = 0; i < relayer.length; i++) {
      hash = relayer.charCodeAt(i) + ((hash << 5) - hash)
    }
    const color = `#${(hash & 0x00ffffff).toString(16).padStart(6, '0').slice(-6)}`
    return color
  }

  return (
    <>
      <div>
        <h2 className="text-center text-xl font-semibold pt-2.5 pb-0">
          IBC Transactions by Chain and Relayer
          <Tooltip
            title="Use the slider to select a date and view transactions by chain and relayer."
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
      <div className="mt-0">
        <div className="w-3/4 mx-auto mb-(-1)">
          <Slider
            value={selectedDateIndex}
            min={0}
            max={dates.length - 1}
            onChange={handleSliderChange}
            marks={getSliderMarks()}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) =>
              new Date(dates[value]).toLocaleDateString(undefined, {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit'
              })
            }
            sx={{
              color: theme === 'dark' ? '#fff' : '#000', // Set the slider color based on the theme
              '& .MuiSlider-thumb': {
                backgroundColor: theme === 'dark' ? '#fff' : '#000' // Thumb color
              },
              '& .MuiSlider-track': {
                backgroundColor: theme === 'dark' ? '#fff' : '#000' // Track color
              },
              '& .MuiSlider-rail': {
                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' // Rail color (unfilled part of the slider)
              },
              '& .MuiSlider-mark': {
                backgroundColor: theme === 'dark' ? '#fff' : '#000' // Marks color
              },
              '& .MuiSlider-markLabel': {
                color: theme === 'dark' ? '#fff' : '#000' // Mark labels color
              }
            }}
          />
        </div>
      </div>
    </>
  )
}

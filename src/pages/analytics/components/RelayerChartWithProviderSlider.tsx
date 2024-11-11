import { useContext, useEffect, useState } from 'react'
import { formatNumber } from 'utils/commons'
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

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTooltip, Legend, BarController)

type Entry = {
  Date: string
  IBC_Counterpart: string
  Relayer: string
  Transactions: number
}

export default function RelayerChartWithProviderSlider() {
  const { theme } = useUserPreferencesStore()
  const { analyticsData4 } = useContext(APIContext)
  const [chartData, setChartData] = useState<any>(null)
  const [relayers, setRelayers] = useState<string[]>([])
  const [selectedRelayerIndex, setSelectedRelayerIndex] = useState<number>(0)
  const [marks, setMarks] = useState<{ value: number; label: string }[]>([])

  useEffect(() => {
    // Process data grouped by relayer
    const relayerMap: Record<string, Entry[]> = {}

    analyticsData4.forEach((entry: Entry) => {
      const relayer = entry.Relayer || 'Other'
      relayerMap[relayer] ||= []
      relayerMap[relayer].push(entry)
    })

    const sortedRelayers = Object.keys(relayerMap).sort()
    setRelayers(sortedRelayers)

    // Calculate total transactions per relayer
    const relayerTotals: Record<string, number> = {}
    Object.entries(relayerMap).forEach(([relayer, entries]) => {
      relayerTotals[relayer] = entries.reduce((sum, entry) => sum + entry.Transactions, 0)
    })

    // Find the relayer with the highest total transactions
    const maxTotal = Math.max(...Object.values(relayerTotals))
    const topRelayers = Object.keys(relayerTotals).filter((relayer) => relayerTotals[relayer] === maxTotal)
    // If multiple relayers have the same max total, choose the first one alphabetically
    const defaultRelayer = topRelayers.sort()[0]

    // Find the index of the default relayer
    const defaultIndex = sortedRelayers.indexOf(defaultRelayer)
    setSelectedRelayerIndex(defaultIndex >= 0 ? defaultIndex : 0)

    // Generate marks for the slider
    const marks: { value: number; label: string }[] = []
    const lettersSeen = new Set<string>()
    sortedRelayers.forEach((relayerName, index) => {
      const letter = relayerName.charAt(0).toUpperCase()
      if (!lettersSeen.has(letter)) {
        marks.push({ value: index, label: letter })
        lettersSeen.add(letter)
      }
    })
    setMarks(marks)

    // Initialize chart data with the default relayer's data
    if (defaultRelayer) {
      updateChartDataForRelayer(defaultRelayer, relayerMap[defaultRelayer])
    }
  }, [analyticsData4])

  const updateChartDataForRelayer = (relayer: string, entries: Entry[]) => {
    // Initialize data structures
    const dataMatrix: Map<string, Map<string, number>> = new Map()
    const datesSet: Set<string> = new Set()
    const chainsSet: Set<string> = new Set()

    // Build dataMatrix and collect unique dates and chains
    for (const entry of entries) {
      const date = new Date(entry.Date).toISOString().split('T')[0]
      const chainBech32Prefix = entry.IBC_Counterpart

      datesSet.add(date)
      chainsSet.add(chainBech32Prefix)

      if (!dataMatrix.has(chainBech32Prefix)) {
        dataMatrix.set(chainBech32Prefix, new Map())
      }
      const dateMap = dataMatrix.get(chainBech32Prefix)!
      dateMap.set(date, (dateMap.get(date) || 0) + entry.Transactions)
    }

    // Sort dates
    const sortedDates = Array.from(datesSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

    // Prepare an array of { prefix, label } pairs for chains
    const prefixLabelPairs = Array.from(chainsSet).map((prefix) => ({
      prefix,
      label: prefix
    }))

    // Sort prefixLabelPairs by label alphabetically
    prefixLabelPairs.sort((a, b) => a.label.localeCompare(b.label))

    // Extract the sorted bech32Prefixes and labels
    const sortedBech32Prefixes = prefixLabelPairs.map((pair) => pair.prefix)
    const chainLabels = prefixLabelPairs.map((pair) => pair.label)

    // Create datasets for each chain
    const datasets = sortedBech32Prefixes.map((chainPrefix, index) => {
      const dateMap = dataMatrix.get(chainPrefix)!
      const data = sortedDates.map((date) => dateMap.get(date) || 0)
      return {
        label: chainLabels[index],
        data,
        backgroundColor: getColorFromChain(chainLabels[index])
      }
    })

    // Set chart data with prepared labels and datasets
    setChartData({
      labels: sortedDates,
      datasets
    })
  }

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    const index = newValue as number
    setSelectedRelayerIndex(index)

    const selectedRelayer = relayers[index]
    const relayerEntries = analyticsData4.filter((entry: Entry) => (entry.Relayer || 'Other') === selectedRelayer)

    updateChartDataForRelayer(selectedRelayer, relayerEntries)
  }

  const options = {
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

  function getColorFromChain(chain: string) {
    // Generate a unique color based on the chain name
    let hash = 0
    for (let i = 0; i < chain.length; i++) {
      hash = chain.charCodeAt(i) + ((hash << 5) - hash)
    }
    const color = `#${('000000' + (hash & 0xffffff).toString(16)).slice(-6)}`
    return color
  }

  return (
    <>
      <div>
        <h2 className="text-center text-xl font-semibold pt-2.5 pb-0">
          IBC Transactions by Date and Chain (Per Relayer)
          <Tooltip
            title="Use the slider to select a relayer and view transactions by date and chain."
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
        <div className="mx-auto flex items-center space-x-4">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Relayer:</span>
          <Slider
            value={selectedRelayerIndex}
            min={0}
            max={relayers.length - 1}
            onChange={handleSliderChange}
            marks={marks}
            step={1}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => relayers[value]}
            sx={{
              color: theme === 'dark' ? '#fff' : '#000', // Set the slider color based on the theme
              '& .MuiSlider-thumb': {
                backgroundColor: theme === 'dark' ? '#fff' : '#000' // Thumb color
              },
              '& .MuiSlider-track': {
                backgroundColor: theme === 'dark' ? '#fff' : '#000' // Track color
              },
              '& .MuiSlider-rail': {
                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' // Rail color
              },
              '& .MuiSlider-mark': {
                backgroundColor: theme === 'dark' ? '#fff' : '#000' // Marks color
              },
              '& .MuiSlider-markLabel': {
                color: theme === 'dark' ? '#fff' : '#000'
              }
            }}
          />
        </div>
      </div>
    </>
  )
}

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
import { chains } from 'utils/config'

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

  useEffect(() => {
    // Process data grouped by relayer
    const relayerMap: Record<string, Entry[]> = {}

    analyticsData4.forEach((entry: Entry) => {
      const relayer = entry.Relayer || 'Other'
      relayerMap[relayer] ||= []
      relayerMap[relayer].push(entry)
    })

    const sortedRelayers = Object.keys(relayerMap).sort((a, b) => a.localeCompare(b))
    setRelayers(sortedRelayers)

    // Initialize chart data with the first relayer's data
    if (sortedRelayers.length > 0) {
      const initialRelayer = sortedRelayers[0]
      updateChartDataForRelayer(initialRelayer, relayerMap[initialRelayer])
    }
  }, [analyticsData4])

  const updateChartDataForRelayer = (relayer: string, entries: Entry[]) => {
    // Cache the mapping from bech32 prefixes to chain names
    const bech32PrefixToChainName: Map<string, string> = new Map()
    for (const chainInfo of Object.values(chains)) {
      bech32PrefixToChainName.set(chainInfo.bech32_prefix, chainInfo.chain_name)
    }

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
      label: bech32PrefixToChainName.get(prefix) || prefix
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

  const getSliderMarks = () => {
    if (relayers.length === 0) return []

    const numMarks = Math.min(10, relayers.length) // Limit to 10 marks max
    const marks = []

    // Always include the first relayer
    marks.push({
      value: 0,
      label: relayers[0]
    })

    if (relayers.length > 1) {
      const interval = (relayers.length - 1) / (numMarks - 1)

      // Add intermediate marks only if necessary
      for (let i = 1; i < numMarks - 1; i++) {
        const index = Math.round(i * interval)
        marks.push({
          value: index,
          label: relayers[index]
        })
      }

      // Always include the last relayer
      marks.push({
        value: relayers.length - 1,
        label: relayers[relayers.length - 1]
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
          color: theme === 'dark' ? '#fff' : '#000',
          callback: function (value: any, index: number) {
            return new Date(chartData.labels[index]).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric'
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
    const color = `#${(hash & 0x00ffffff).toString(16).padStart(6, '0').slice(-6)}`
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
        <div className="w-3/4 mx-auto mb-(-1)">
          <Slider
            value={selectedRelayerIndex}
            min={0}
            max={relayers.length - 1}
            onChange={handleSliderChange}
            marks={getSliderMarks()}
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
                color: theme === 'dark' ? '#fff' : '#000' // Mark labels color
              }
            }}
          />
        </div>
      </div>
    </>
  )
}
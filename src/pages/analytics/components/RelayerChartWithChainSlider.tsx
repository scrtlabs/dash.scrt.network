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

export default function RelayerChartWithChainSlider() {
  const { theme } = useUserPreferencesStore()
  const { analyticsData4 } = useContext(APIContext)
  const [chartData, setChartData] = useState<any>(null)
  const [chainLabels, setChainLabels] = useState<string[]>([])
  const [selectedChainIndex, setSelectedChainIndex] = useState<number>(0)
  const [chainMap, setChainMap] = useState<Record<string, Entry[]>>({})
  const [marks, setMarks] = useState<{ value: number; label: string }[]>([])

  const updateChartDataForChain = (chainName: string, entries: Entry[]) => {
    // Initialize data structures
    const dataMatrix: Map<string, Map<string, number>> = new Map()
    const datesSet: Set<string> = new Set()
    const relayersSet: Set<string> = new Set()

    // Build dataMatrix and collect unique dates and relayers
    for (const entry of entries) {
      const date = new Date(entry.Date).toISOString().split('T')[0]
      const relayer = entry.Relayer || 'Other'

      datesSet.add(date)
      relayersSet.add(relayer)

      if (!dataMatrix.has(relayer)) {
        dataMatrix.set(relayer, new Map())
      }
      const dateMap = dataMatrix.get(relayer)!
      dateMap.set(date, (dateMap.get(date) || 0) + entry.Transactions)
    }

    // Sort dates
    const sortedDates = Array.from(datesSet).sort()

    // Sort relayers
    const sortedRelayers = Array.from(relayersSet).sort()

    // Create datasets for each relayer
    const datasets = sortedRelayers.map((relayer) => {
      const dateMap = dataMatrix.get(relayer)!
      const data = sortedDates.map((date) => dateMap.get(date) || 0)
      return {
        label: relayer,
        data,
        backgroundColor: getColorFromRelayer(relayer)
      }
    })

    // Set chart data with prepared labels and datasets
    setChartData({
      labels: sortedDates,
      datasets
    })
  }

  useEffect(() => {
    // Process data grouped by chain
    const chainMap: Record<string, Entry[]> = {}

    analyticsData4.forEach((entry: Entry) => {
      chainMap[entry.IBC_Counterpart] ||= []
      chainMap[entry.IBC_Counterpart].push(entry)
    })

    const sortedChains = Object.keys(chainMap).sort()
    setChainLabels(sortedChains)
    setChainMap(chainMap)

    // Generate marks for the slider
    const marks: { value: number; label: string }[] = []
    const lettersSeen = new Set<string>()
    sortedChains.forEach((chainName, index) => {
      const letter = chainName.charAt(0).toUpperCase()
      if (!lettersSeen.has(letter)) {
        marks.push({ value: index, label: letter })
        lettersSeen.add(letter)
      }
    })
    setMarks(marks)

    // Find the index of "osmosis"
    const osmosisIndex = sortedChains.findIndex((chainName) => chainName.toLowerCase() === 'osmosis')

    // Determine the default index
    const defaultIndex = osmosisIndex !== -1 ? osmosisIndex : 0
    setSelectedChainIndex(defaultIndex)

    // Initialize chart data with the default chain's data
    if (sortedChains.length > 0) {
      const initialChain = sortedChains[defaultIndex]
      updateChartDataForChain(initialChain, chainMap[initialChain])
    }
  }, [analyticsData4])

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    const index = newValue as number
    setSelectedChainIndex(index)

    const selectedChain = chainLabels[index]
    const chainEntries = chainMap[selectedChain] || []

    updateChartDataForChain(selectedChain, chainEntries)
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

  function getColorFromRelayer(relayer: string) {
    // Generate a unique color based on the relayer name
    let hash = 0
    for (let i = 0; i < relayer.length; i++) {
      hash = relayer.charCodeAt(i) + ((hash << 5) - hash)
    }
    const color = `#${('000000' + (hash & 0xffffff).toString(16)).slice(-6)}`
    return color
  }

  return (
    <>
      <div>
        <h2 className="text-center text-xl font-semibold pt-2.5 pb-0">
          {`IBC Transactions by Date and Relayer for ${chainLabels[selectedChainIndex]}`}
          <Tooltip
            title="Use the slider to select a chain, the chart then shows the IBC transactions per date for each relayer."
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
        {/* Remove the separate selected chain name display */}
        <div className="mx-auto flex items-center space-x-4">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Chain:</span>
          <Slider
            value={selectedChainIndex}
            min={0}
            max={chainLabels.length - 1}
            onChange={handleSliderChange}
            marks={marks}
            step={1}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => chainLabels[value]}
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
                backgroundColor: theme === 'dark' ? '#fff' : '#000', // Marks color
                fontFamily: 'RundDisplay'
              },
              '& .MuiSlider-markLabel': {
                color: theme === 'dark' ? '#fff' : '#000', // Mark labels color
                fontFamily: 'RundDisplay'
              }
            }}
          />
        </div>
      </div>
    </>
  )
}

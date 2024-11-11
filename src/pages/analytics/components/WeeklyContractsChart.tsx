import { useContext, useEffect, useState } from 'react'
import { formatNumber } from 'utils/commons'
import { APIContext } from 'context/APIContext'
import Tooltip from '@mui/material/Tooltip'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip as ChartTooltip,
  BarController,
  Legend,
  Title,
  ChartOptions,
  ChartData,
  ChartDataset
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { useUserPreferencesStore } from 'store/UserPreferences'

ChartJS.register(CategoryScale, LinearScale, BarElement, BarController, ChartTooltip, Legend, Title)

type Data = {
  Date: string
  contract_admin: string | null
  contract_creator: string | null
  contract_name: string
  num_transactions: number
  num_wallets: number
}

export default function WeeklyContractsChart() {
  const { analyticsData5 } = useContext(APIContext)
  const { theme } = useUserPreferencesStore()
  const [chartData, setChartData] = useState<ChartData<'bar', number[], string> | null>(null)

  useEffect(() => {
    if (analyticsData5) {
      // Initialize data structures
      const datesSet = new Set<string>()
      const contractNamesSet = new Set<string>()
      const dataByDateAndContract: Record<string, Record<string, number>> = {}
      const totalTransactionsPerContract: Record<string, number> = {}

      // Process analyticsData5 in a single pass
      analyticsData5.forEach((item: Data) => {
        datesSet.add(item.Date)
        contractNamesSet.add(item.contract_name)

        // Accumulate num_transactions per date and contract
        if (!dataByDateAndContract[item.Date]) {
          dataByDateAndContract[item.Date] = {}
        }
        if (!dataByDateAndContract[item.Date][item.contract_name]) {
          dataByDateAndContract[item.Date][item.contract_name] = 0
        }
        dataByDateAndContract[item.Date][item.contract_name] += item.num_transactions

        // Accumulate total num_transactions per contract
        if (!totalTransactionsPerContract[item.contract_name]) {
          totalTransactionsPerContract[item.contract_name] = 0
        }
        totalTransactionsPerContract[item.contract_name] += item.num_transactions
      })

      // Convert sets to arrays and sort dates
      const dates = Array.from(datesSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      const contractNames = Array.from(contractNamesSet)

      // Sort contracts by total transactions and pick top N
      const topN = 50
      const sortedContractNames = contractNames.sort(
        (a, b) => totalTransactionsPerContract[b] - totalTransactionsPerContract[a]
      )
      const topContractNames = sortedContractNames.slice(0, topN)

      // Create datasets for top contracts
      const datasets: ChartDataset<'bar', number[]>[] = topContractNames.map((contractName, index) => {
        const data = dates.map((date) => dataByDateAndContract[date]?.[contractName] || 0)
        return {
          label: contractName,
          data,
          backgroundColor: getColorFromString(contractName),
          stack: 'Stack 0'
        }
      })

      // Compute 'Others' data
      const othersData = dates.map((date) => {
        const contractsData = dataByDateAndContract[date] || {}
        return Object.entries(contractsData).reduce((total, [name, value]) => {
          return topContractNames.includes(name) ? total : total + value
        }, 0)
      })

      // Add 'Others' dataset if applicable
      if (othersData.some((value) => value > 0)) {
        datasets.push({
          label: 'Others',
          data: othersData,
          backgroundColor: '#cccccc',
          stack: 'Stack 0'
        })
      }

      // Prepare chart data
      const preparedChartData: ChartData<'bar', number[], string> = {
        labels: dates.map((date) =>
          new Date(date).toLocaleDateString(undefined, {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit'
          })
        ),
        datasets
      }

      setChartData(preparedChartData)
    }
  }, [analyticsData5, theme])

  function getColorFromString(str: string) {
    // Generate a unique color based on the combo string
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const color = `#${('000000' + (hash & 0xffffff).toString(16)).slice(-6)}`
    return color
  }

  const options: ChartOptions<'bar'> = {
    responsive: true,
    animation: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: theme === 'dark' ? '#fff' : '#000',
          autoSkip: false,
          maxRotation: 90,
          minRotation: 45
        },
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        stacked: true,
        ticks: {
          color: theme === 'dark' ? '#fff' : '#000',
          callback: (value: number | string) => formatNumber(value, 2)
        },
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
          display: true
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        xAlign: 'center',
        yAlign: 'bottom',
        backgroundColor: theme === 'dark' ? '#333' : '#fff',
        titleColor: theme === 'dark' ? '#fff' : '#000',
        bodyColor: theme === 'dark' ? '#fff' : '#000'
      }
    }
  }

  return (
    <>
      <div>
        <h2 className="text-center text-xl font-semibold pt-2.5 pb-0">
          Weekly Transactions per Contract
          <div className="inline-block">
            <Tooltip title="Number of transactions per contract per week" placement="right" arrow>
              <span className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer ml-2 text-sm">
                <FontAwesomeIcon icon={faInfoCircle} />
              </span>
            </Tooltip>
          </div>
        </h2>
      </div>
      <div className="w-full h-[400px]">
        {chartData && chartData.datasets && chartData.datasets.length > 0 ? (
          <Bar data={chartData} options={options} />
        ) : null}
      </div>
    </>
  )
}

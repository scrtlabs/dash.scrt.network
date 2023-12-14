import { useContext, useEffect, useRef, useState } from 'react'
import { allTokens, formatNumber } from 'utils/commons'
import { APIContext } from 'context/APIContext'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { ThemeContext } from 'context/ThemeContext'
import { Token } from 'utils/config'
import { useTokenPricesStore } from 'store/TokenPrices'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import BigNumber from 'bignumber.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, ArcElement, LineElement, Title, ChartTooltip, Legend)

export default function BalanceChart() {
  const chartRef = useRef<ChartJS<'doughnut', number[], string>>(null)

  const { secretNetworkClient, balanceMapping } = useSecretNetworkClientStore()
  const { getPrice } = useTokenPricesStore()

  const { theme } = useContext(ThemeContext)

  const [otherToken, setOtherToken] = useState(null)

  const [data, setData] = useState({
    labels: [''],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        hoverBackgroundColor: []
      }
    ]
  })

  const createLabel = (label: string, value: number) => {
    return `${label}: ${formatNumber(value, 2)}`
  }

  useEffect(() => {
    if (balanceMapping) {
      console.log(balanceMapping)
      const dataValues = []

      for (let [token, balance] of balanceMapping) {
        if (balance.secretBalance !== null && balance.secretBalance instanceof BigNumber) {
          dataValues.push({
            label: `s${token.name}`,
            value: BigNumber(balance.secretBalance).dividedBy(`1e${token.decimals}`).toNumber()
          })
        }
        if (balance.balance && token.name === 'SCRT') {
          dataValues.push({
            label: `${token.name}`,
            value: BigNumber(balance.balance).dividedBy(`1e${token.decimals}`).toNumber()
          })
        }
      }

      const backgroundColors = ['#06b6d4', '#8b5cf6', '#FF4500', '#008080', '#32CD32', '#ff8800', '#FF1493']

      setData({
        labels: dataValues.map((item) => createLabel(item.label, item.value)),
        datasets: [
          {
            data: dataValues.map((item) => item.value),
            backgroundColor: backgroundColors,
            hoverBackgroundColor: backgroundColors
          }
        ]
      })
    }
  }, [balanceMapping])

  const centerText = {
    id: 'centerText',
    afterDatasetsDraw(chart: any, args: any, options: any) {
      const {
        ctx,
        chartArea: { left, right, top, bottom, width, height }
      } = chart

      ctx.save()

      ctx.font = 'bold 0.9rem sans-serif'
      ctx.fillStyle = theme === 'dark' ? '#fff' : '#000'
      ctx.textAlign = 'center'
      ctx.fillText(`Total Supply`, width / 2, height / 2.25 + top)
      ctx.restore()

      ctx.font = '400 2rem sans-serif'
      ctx.fillStyle = theme === 'dark' ? '#fff' : '#000'
      ctx.textAlign = 'center'
      ctx.fillText(`${formatNumber(3234534, 2)}`, width / 2, height / 1.75 + top)
      ctx.restore()
    }
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '92%',
    borderWidth: 0,
    animation: {
      animateRotate: true,
      responsiveAnimationDuration: false
    },
    plugins: {
      legend: {
        display: true,
        position: 'right',
        onClick: null as any,
        labels: {
          color: theme === 'dark' ? '#fff' : '#000',
          font: {
            size: 11
          },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 7
        }
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context: any) {
            let label = context.label || ''
            if (label) {
              label += ': '
            }
            if (context.parsed !== null) {
              label += `${formatNumber(context.parsed, 2)} ${context.label}`
            }
            return label
          }
        }
      }
    }
  }

  return (
    <>
      <div>
        {/* Chart */}
        <div className="w-full h-[250px] xl:h-[300px]">
          {data != undefined && options != undefined && centerText != undefined ? (
            <Doughnut
              id="stakingChartDoughnut"
              data={data}
              options={options as any}
              //plugins={[centerText]}
              ref={chartRef}
              redraw
            />
          ) : (
            <div className="animate-pulse bg-neutral-300 dark:bg-neutral-800 rounded col-span-2 w-full h-full min-h-[250px] xl:min-h-[300px] mx-auto"></div>
          )}
        </div>
      </div>
    </>
  )
}

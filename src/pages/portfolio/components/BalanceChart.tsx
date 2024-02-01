import { useContext, useEffect, useRef, useState } from 'react'
import { formatNumber } from 'utils/commons'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  Plugin,
  Chart,
  LegendItem
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { ThemeContext } from 'context/ThemeContext'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import BigNumber from 'bignumber.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, ArcElement, LineElement, Title, ChartTooltip, Legend)

export default function BalanceChart() {
  const chartRef = useRef<ChartJS<'doughnut', number[], string>>(null)

  const { balanceMapping } = useSecretNetworkClientStore()

  const { theme } = useContext(ThemeContext)

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

  var images: HTMLImageElement[] = []
  function preloadImages() {
    const imageSrcs = [
      'https://images.pexels.com/photos/18898418/pexels-photo-18898418/free-photo-of-close-up-of-a-branch-with-green-and-yellow-leaves.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load'
    ]
    imageSrcs.forEach((src) => {
      const img = new Image()
      img.onload = () => images.push(img)
      img.src = src
    })
  }
  preloadImages()

  const centerText: Plugin = {
    id: 'centerText',
    afterDatasetsDraw(chart: any, args: any, options: any) {
      const {
        ctx,
        chartArea: { left, right, top, bottom, width, height }
      } = chart

      ctx.save()

      ctx.font = '300 1.5rem sans-serif'
      ctx.fillStyle = theme === 'dark' ? '#fff' : '#000'
      ctx.textAlign = 'center'
      ctx.fillText(`Your`, width / 2, height / 2.25 + top)
      ctx.restore()

      ctx.font = 'bold 1.75rem sans-serif'
      ctx.fillStyle = theme === 'dark' ? '#fff' : '#000'
      ctx.textAlign = 'center'
      ctx.fillText(`Portfolio`, width / 2, height / 1.65 + top)
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
        display: false,
        position: 'right',
        onClick: null as any,
        labels: {
          color: theme === 'dark' ? '#fff' : '#000',
          font: {
            size: 12
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
            let label = `${formatNumber(context.parsed, 2)} ${context.label}`
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
        <div className="w-full h-[150px] xl:h-[250px]">
          {data != undefined && options != undefined && centerText != undefined ? (
            <>
              <Doughnut
                id="stakingChartDoughnut"
                data={data}
                plugins={[centerText]}
                options={options as any}
                ref={chartRef}
                redraw
              />
            </>
          ) : (
            <div className="animate-pulse bg-neutral-300 dark:bg-neutral-800 rounded col-span-2 w-full h-full min-h-[250px] xl:min-h-[300px] mx-auto"></div>
          )}
        </div>
      </div>
    </>
  )
}

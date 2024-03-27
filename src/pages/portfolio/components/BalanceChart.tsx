import { useContext, useEffect, useRef, useState } from 'react'
import { toCurrencyString } from 'utils/commons'

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
  Plugin
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { useUserPreferencesStore } from 'store/UserPreferences'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import BigNumber from 'bignumber.js'
import { useTokenPricesStore } from 'store/TokenPrices'
import { Token } from 'utils/config'
import { APIContext } from 'context/APIContext'
import { TokenBalances } from 'types/TokenBalances'

ChartJS.register(CategoryScale, LinearScale, PointElement, ArcElement, LineElement, Title, ChartTooltip, Legend)

export default function BalanceChart() {
  const chartRef = useRef<ChartJS<'doughnut', number[], string>>(null)

  const { balanceMapping } = useSecretNetworkClientStore()
  const { getValuePrice, priceMapping } = useTokenPricesStore()
  const { convertCurrency } = useContext(APIContext)

  const { theme, currency } = useUserPreferencesStore()

  const defaultData = {
    labels: [''],
    datasets: [
      {
        data: [] as any,
        backgroundColor: [] as any,
        hoverBackgroundColor: [] as any
      }
    ]
  }
  const [data, setData] = useState(defaultData)
  const prevBalanceMappingRef = useRef<Map<Token, TokenBalances> | undefined>()
  const prevPriceMappingRef = useRef<Map<Token, number> | undefined>()

  useEffect(() => {
    if (
      balanceMapping !== null &&
      priceMapping !== null &&
      (prevBalanceMappingRef.current !== balanceMapping || prevPriceMappingRef.current !== priceMapping)
    ) {
      const dataValues = []

      for (let [token, balance] of balanceMapping) {
        if (balance.secretBalance !== null && balance.secretBalance instanceof BigNumber) {
          let tokenPrice = priceMapping.get(token)
          if (tokenPrice === undefined) {
            tokenPrice = 1
          }
          dataValues.push({
            label: `s${token.name}`,
            value: BigNumber(balance.secretBalance)
              .dividedBy(`1e${token.decimals}`)
              .multipliedBy(tokenPrice)
              .toNumber(),
            balance: balance.secretBalance,
            token: token
          })
        }
        if (balance.balance && token.name === 'SCRT') {
          let tokenPrice = priceMapping.get(token)
          if (tokenPrice === undefined) {
            tokenPrice = 1
          }
          dataValues.push({
            label: `${token.name}`,
            value: BigNumber(balance.balance).dividedBy(`1e${token.decimals}`).multipliedBy(tokenPrice).toNumber(),
            balance: balance.balance,
            token: token
          })
        }
        async function getAverageColor(imgSrc: string): Promise<string> {
          return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => {
              const canvas = document.createElement('canvas')
              const ctx = canvas.getContext('2d')!
              canvas.width = 2
              canvas.height = 2
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
              const data = imageData.data
              const pixelCount = data.length / 4
              let r = 0,
                g = 0,
                b = 0

              for (let i = 0; i < data.length; i += 4) {
                r += data[i]
                g += data[i + 1]
                b += data[i + 2]
              }

              resolve(
                `rgb(${Math.floor(r / pixelCount)}, ${Math.floor(g / pixelCount)}, ${Math.floor(b / pixelCount)})`
              )
            }
            img.onerror = reject
            img.src = imgSrc
          })
        }

        async function setDatasetColors(dataValues: any[]) {
          const backgroundColors = await Promise.all(
            dataValues.map(async (item) => {
              const imgSrc = `/img/assets/${item.token.image}`
              const averageColor = await getAverageColor(imgSrc)
              return averageColor
            })
          )
          const data = {
            labels: dataValues.map((item) => createLabel(item.label, item.value, item.token, item.balance)),
            datasets: [
              {
                data: dataValues.map((item) => item.value),
                backgroundColor: backgroundColors,
                hoverBackgroundColor: backgroundColors
              }
            ]
          }
          setData(data)
        }
        setDatasetColors(dataValues)
        prevBalanceMappingRef.current = balanceMapping
        prevPriceMappingRef.current = priceMapping
      }
    }
  }, [balanceMapping, priceMapping])

  const createLabel = (label: string, value: number, token: Token, balance: BigNumber) => {
    const valuePrice = getValuePrice(token, balance)
    if (valuePrice !== null) {
      const priceInCurrency = convertCurrency('USD', valuePrice, currency)
      console.log(priceInCurrency)
      console.log(valuePrice)
      console.log(currency)
      if (priceInCurrency !== null) {
        return `${BigNumber(balance).dividedBy(`1e${token.decimals}`).toNumber()} ${label} (${toCurrencyString(
          priceInCurrency,
          currency
        )})`
      } else {
        return `${BigNumber(balance).dividedBy(`1e${token.decimals}`).toNumber()} ${label}`
      }
    } else {
      return `${BigNumber(balance).dividedBy(`1e${token.decimals}`).toNumber()} ${label}`
    }
  }

  const centerText: Plugin<'doughnut'> = {
    id: 'centerText',
    afterDatasetsDraw(chart: any, args: any, options: any) {
      const {
        ctx,
        chartArea: { left, right, top, bottom, width, height }
      } = chart

      ctx.save()

      ctx.font = '300 1rem Montserrat'
      ctx.fillStyle = theme === 'dark' ? '#fff' : '#000'
      ctx.textAlign = 'center'
      ctx.fillText(`Your`, width / 2, height / 2.25 + top)
      ctx.restore()

      ctx.font = 'bold 1.25rem Montserrat'
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
      responsiveAnimationDuration: true
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context: any) {
            let label = ``
            return label
          }
        }
      }
    }
  }

  return (
    <div>
      {/* Chart */}
      <div className="w-full h-[200px]">
        {data !== defaultData && centerText !== undefined ? (
          <>
            <Doughnut
              id="BalanceChartDoughnut"
              data={data}
              plugins={[centerText]}
              options={options as any}
              ref={chartRef}
              redraw
            />
          </>
        ) : (
          <div className="animate-pulse bg-neutral-300 dark:bg-neutral-800 rounded col-span-2 w-full h-[200px] mx-auto"></div>
        )}
      </div>
    </div>
  )
}

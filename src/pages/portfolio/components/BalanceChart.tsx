import { useContext, useEffect, useRef, useState } from 'react'
import { getBackgroundColors, toCurrencyString } from 'utils/commons'

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

  const [totalValue, setTotalValue] = useState<any>()
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
        const tokenPrice = priceMapping.get(token) || 1

        if (balance.secretBalance !== null && balance.secretBalance instanceof BigNumber) {
          dataValues.push({
            label: token.name === 'SCRT' ? `s${token.name}` : `${token.name}`,
            value: BigNumber(balance.secretBalance)
              .dividedBy(`1e${token.decimals}`)
              .multipliedBy(tokenPrice)
              .toNumber(),
            balance: balance.secretBalance,
            token: token
          })
        }
        if (balance.balance && token.name === 'SCRT') {
          dataValues.push({
            label: `${token.name}`,
            value: BigNumber(balance.balance).dividedBy(`1e${token.decimals}`).multipliedBy(tokenPrice).toNumber(),
            balance: balance.balance,
            token: token
          })
        }

        // Calculate the total value
        setTotalValue(dataValues.reduce((acc, curr) => acc + curr.value, 0))

        async function setDatasetColors(dataValues: any[]) {
          const backgroundColorsMap = await getBackgroundColors()

          const sortedBackgroundColors = dataValues.map((item) => {
            const imgSrc = `/img/assets${item.token.image}`
            const averageColor = backgroundColorsMap.get(imgSrc)
            return averageColor
          })

          const data = {
            labels: dataValues.map((item) => createLabel(item.label, item.value, item.token, item.balance)),
            datasets: [
              {
                data: dataValues.map((item) => item.value),
                backgroundColor: sortedBackgroundColors,
                hoverBackgroundColor: sortedBackgroundColors
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

      if (priceMapping !== null && balanceMapping !== null) {
        ctx.font = '300 1rem RundDisplay'
        ctx.fillStyle = theme === 'dark' ? '#fff' : '#000'
        ctx.textAlign = 'center'
        ctx.fillText(`Your Portfolio`, width / 2, height / 2.25 + top)
        ctx.restore()
      }

      if (priceMapping !== null) {
        ctx.font = 'bold 1.25rem RundDisplay'
        ctx.fillStyle = theme === 'dark' ? '#fff' : '#000'
        ctx.textAlign = 'center'
        ctx.fillText(
          totalValue ? `${toCurrencyString(convertCurrency('USD', totalValue, currency), currency)}` : ``,
          width / 2,
          height / 1.65 + top
        )
      }
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
        {priceMapping !== null && balanceMapping !== null ? (
          <Doughnut
            id="BalanceChartDoughnut"
            data={data}
            plugins={[centerText]}
            options={options as any}
            ref={chartRef}
            redraw
          />
        ) : (
          <div className="animate-pulse bg-neutral-300 dark:bg-neutral-800 rounded col-span-2 w-full h-[200px] mx-auto"></div>
        )}
      </div>
    </div>
  )
}

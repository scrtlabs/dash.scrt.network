import BigNumber from 'bignumber.js'
import { createContext, useEffect, useState } from 'react'
import { SecretNetworkClient } from 'secretjs'
import { useUserPreferencesStore } from 'store/UserPreferences'
import { Currency } from 'types/Currency'
import { Nullable } from 'types/Nullable'
import { allTokens, bech32PrefixToChainName, coinGeckoCurrencyMap, sortDAppsArray } from 'utils/commons'
import { SECRET_LCD, SECRET_CHAIN_ID } from 'utils/config'

const APIContext = createContext(null)

const APIContextProvider = ({ children }: any) => {
  const [dappsData, setDappsData] = useState<any[]>([])
  const [dappsDataSorted, setDappsDataSorted] = useState<any[]>([])
  const [tags, setTags] = useState<string[]>([])

  // totalSupply, bonded, notBonded
  const [totalSupply, setTotalSupply] = useState(Number)
  const [bondedToken, setBondedToken] = useState(Number)
  const [notBondedToken, setNotBondedToken] = useState(Number)
  const [sSCRTTokenSupply, setSSCRTTokenSupply] = useState(Number)
  const [stkdSCRTTokenSupply, setStkdSCRTTokenSupply] = useState(Number)
  const [IBCTokenSupply, setIBCTokenSupply] = useState(Number)
  const [burnedTokenSupply, setBurnedTokenSupply] = useState(Number)
  const [exchangesTokenSupply, setExchangesTokenSupply] = useState(Number)

  const defaultCurrencyPricing = {
    usd: 1,
    eur: 0.924884,
    jpy: 149.82,
    gbp: 0.791714,
    aud: 1.52,
    cad: 1.35,
    chf: 0.879271
  }
  const [currencyPricing, setCurrencyPricing] = useState<any>(defaultCurrencyPricing)

  const [inflation, setInflation] = useState(0)

  const [communityTax, setCommunityTax] = useState('')
  const [secretFoundationTax, setSecretFoundationTax] = useState('')

  const [communityPool, setCommunityPool] = useState(Number) // in uscrt

  function convertCurrency(
    inputCurrency: Currency = 'USD',
    inputAmount: number,
    outputCurrency: Currency
  ): Nullable<number> {
    if (inputCurrency === outputCurrency) return inputAmount

    if (
      !currencyPricing ||
      !currencyPricing[coinGeckoCurrencyMap[inputCurrency]] ||
      !currencyPricing[coinGeckoCurrencyMap[outputCurrency]]
    ) {
      return null
    }

    const amountInUsd = inputAmount / currencyPricing[coinGeckoCurrencyMap[inputCurrency]]

    const convertedAmount = amountInUsd * currencyPricing[coinGeckoCurrencyMap[outputCurrency]]
    return convertedAmount
  }

  const fetchDappsURL = () => {
    fetch('https://raw.githubusercontent.com/SecretFoundation/DappRegistry/main/dAppRegistry.json')
      .then((response) => {
        if (!response.ok) throw new Error()
        else return response.json()
      })
      .then((jsonData) => {
        setDappsData(jsonData)
      })
      .catch((error) => {
        console.error(error)

        setTimeout(() => fetchDappsURL(), 3000)
      })
  }

  const COINGECKO_CURRENCIES_URL =
    //'https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=eur,jpy,gbp,aud,cad,chf'
    'https://priceapibuffer.secretsaturn.net/getCurrencies'

  const fetchCurrencyPricingURL = async () => {
    try {
      const response = await fetch(COINGECKO_CURRENCIES_URL)
      if (!response.ok) throw new Error('Network response was not ok.')
      const jsonData = await response.json()
      let fullData = jsonData.usd
      fullData.usd = 1
      setCurrencyPricing(fullData)
    } catch (error) {
      console.error(error)
      setTimeout(fetchCurrencyPricingURL, 3000)
    }
  }

  useEffect(() => {
    if (dappsData && dappsDataSorted.length === 0 && dappsData?.length !== 0) {
      setDappsDataSorted(sortDAppsArray(dappsData))
      // Tag-Filter
      let allTags: string[] = []

      dappsData.forEach((dapp) => {
        dapp.tags.forEach((tag: any) => {
          if (!allTags.find((tagItem) => tagItem === tag)) {
            allTags.push(tag)
          }
        })
      })
      setTags(allTags.sort())
    }
  }, [dappsData])

  const [coingeckoApiData_Day, setCoinGeckoApiData_Day] = useState()
  const [coingeckoApiData_Month, setCoinGeckoApiData_Month] = useState()
  const [coingeckoApiData_Year, setCoinGeckoApiData_Year] = useState()
  const [defiLamaApiData_Year, setDefiLamaApiData_Year] =
    useState<Nullable<{ date: string; totalLiquidity: number }[]>>(null)
  const [defiLamaApiData_TVL, setDefiLamaApiData_TVL] = useState<any>(null)
  const [currentPrice, setCurrentPrice] = useState(Number)
  const [analyticsData1, setAnalyticsData1] = useState()
  const [analyticsData2, setAnalyticsData2] = useState()
  const [analyticsData3, setAnalyticsData3] = useState()
  const [analyticsData4, setAnalyticsData4] = useState()
  const [analyticsData5, setAnalyticsData5] = useState()
  const [L5AnalyticsApiData, setL5AnalyticsApiData] = useState()
  const [volume, setVolume] = useState(Number)
  const [marketCap, setMarketCap] = useState(Number)

  const { currency } = useUserPreferencesStore()

  useEffect(() => {
    // Coingecko API
    const COINGECKO_API_URL_SCRT_DAY = `https://api.coingecko.com/api/v3/coins/secret/market_chart?vs_currency=${coinGeckoCurrencyMap[currency]}&days=1`
    fetch(COINGECKO_API_URL_SCRT_DAY)
      .catch((error: any) => console.error(error))
      .then((response) => (response as any).json())
      .catch((error: any) => console.error(error))
      .then((response) => {
        setCoinGeckoApiData_Day(response)
      })

    const COINGECKO_API_URL_SCRT_MONTH = `https://api.coingecko.com/api/v3/coins/secret/market_chart?vs_currency=${coinGeckoCurrencyMap[currency]}&days=30`
    fetch(COINGECKO_API_URL_SCRT_MONTH)
      .catch((error: any) => console.error(error))
      .then((response) => (response as any).json())
      .catch((error: any) => console.error(error))
      .then((response) => {
        setCoinGeckoApiData_Month(response)
      })

    const COINGECKO_API_URL_SCRT_YEAR = `https://api.coingecko.com/api/v3/coins/secret/market_chart?vs_currency=${coinGeckoCurrencyMap[currency]}&days=365`
    fetch(COINGECKO_API_URL_SCRT_YEAR)
      .catch((error: any) => console.error(error))
      .then((response) => (response as any).json())
      .catch((error: any) => console.error(error))
      .then((response) => {
        setCoinGeckoApiData_Year(response)
      })

    const DEFI_LLAMA_API_URL_YEAR = `https://api.llama.fi/charts/secret`
    fetch(DEFI_LLAMA_API_URL_YEAR)
      .catch((error: any) => console.error(error))
      .then((response) => (response as any).json())
      .catch((error: any) => console.error(error))
      .then((response) => {
        setDefiLamaApiData_Year(
          response.map((item: { date: string; totalLiquidityUSD: number }) => [
            parseInt(item.date) * 1000,
            currency !== 'USD' ? convertCurrency('USD', item.totalLiquidityUSD, currency) : item.totalLiquidityUSD
          ])
        )
      })

    const DEFI_LLAMA_API_URL_TVL = `https://api.llama.fi/chains`
    fetch(DEFI_LLAMA_API_URL_TVL)
      .catch((error: any) => console.error(error))
      .then((response) => (response as any).json())
      .catch((error: any) => console.error(error))
      .then((response) => {
        const tvlInUsd = response.filter((item: any) => item?.gecko_id === 'secret')[0]?.tvl || null
        const tvlInCorrectCurrency = convertCurrency('USD', tvlInUsd, currency)
        setDefiLamaApiData_TVL(tvlInCorrectCurrency)
      })

    // Coingecko Market Price, Market Cap & Volume
    //const COINGECKO_API_URL_MARKET_CAP_VOLUME = `https://api.coingecko.com/api/v3/simple/price?ids=secret&vs_currencies=usd,eur,jpy,gbp,aud,cad,chf&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true` // includes all supported currencies
    const COINGECKO_API_URL_MARKET_CAP_VOLUME = 'https://priceapibuffer.secretsaturn.net/getVolume'
    fetch(COINGECKO_API_URL_MARKET_CAP_VOLUME)
      .catch((error: any) => console.error(error))
      .then((response) => (response as any).json())
      .catch((error: any) => console.error(error))
      .then((response) => {
        setCurrentPrice(response.secret[coinGeckoCurrencyMap[currency]]) // e.g. response.secret.usd
        setMarketCap(response.secret[coinGeckoCurrencyMap[currency] + '_market_cap']) // e.g. response.secret.usd_market_cap
        setVolume(response.secret[coinGeckoCurrencyMap[currency] + '_24h_vol']) // e.g. response.secret.usd_24h_vol
      })

    const API_DATA_SECRET_1 = `https://dashboardstats.secretsaturn.net/source/wallets/data.json`
    fetch(API_DATA_SECRET_1)
      .catch((error: any) => console.error(error))
      .then((response) => (response as any).json())
      .catch((error: any) => console.error(error))
      .then((response) => {
        setAnalyticsData1(response)
      })

    const API_DATA_SECRET_2 = `https://dashboardstats.secretsaturn.net/source/validator_bonding/data.json`
    fetch(API_DATA_SECRET_2)
      .catch((error: any) => console.error(error))
      .then((response) => (response as any).json())
      .catch((error: any) => console.error(error))
      .then((response) => {
        setAnalyticsData2(response)
      })

    const API_DATA_SECRET_3 = `https://dashboardstats.secretsaturn.net/source/daily_network_stats/data.json`
    fetch(API_DATA_SECRET_3)
      .catch((error: any) => console.error(error))
      .then((response) => (response as any).json())
      .catch((error: any) => console.error(error))
      .then((response) => {
        setAnalyticsData3(response)
      })

    const API_DATA_SECRET_4 = `https://dashboardstats.secretsaturn.net/source/relayer_stats/data.json`
    fetch(API_DATA_SECRET_4)
      .catch((error: any) => console.error(error))
      .then((response) => (response as any).json())
      .catch((error: any) => console.error(error))
      .then((response) => {
        const filteredData = response
          .filter((entry: any) => entry.IBC_Counterpart !== null && entry.IBC_Counterpart !== 'secret')
          .map((entry: any) => {
            const chainName = bech32PrefixToChainName.get(entry.IBC_Counterpart) || entry.IBC_Counterpart
            return {
              ...entry,
              IBC_Counterpart: chainName
            }
          })
        setAnalyticsData4(filteredData)
      })

    const API_DATA_SECRET_5 = `https://dashboardstats.secretsaturn.net/source/weekly_contract_usage_stats/data.json`
    fetch(API_DATA_SECRET_5)
      .catch((error: any) => console.error(error))
      .then((response) => (response as any).json())
      .catch((error: any) => console.error(error))
      .then((response) => {
        setAnalyticsData5(response)
      })

    const LAVENDERFIVE_API_URL_SECRET_STATUS = `https://api.lavenderfive.com/networks/secretnetwork`
    fetch(LAVENDERFIVE_API_URL_SECRET_STATUS)
      .catch((error: any) => console.error(error))
      .then((response) => (response as any).json())
      .catch((error: any) => console.error(error))
      .then((response) => {
        setL5AnalyticsApiData(response)
        setIBCTokenSupply(0)
        if (response.total_ibc_balance_out != null) {
          setIBCTokenSupply(response.total_ibc_balance_out)
        }
      })

    const secretjsquery = new SecretNetworkClient({
      url: SECRET_LCD,
      chainId: SECRET_CHAIN_ID
    })

    secretjsquery?.query?.bank
      ?.supplyOf({ denom: 'uscrt' })
      ?.then((res) => setTotalSupply((res.amount.amount as any) / 1e6))

    secretjsquery?.query?.staking?.pool('')?.then((res) => {
      setBondedToken(parseInt(res.pool.bonded_tokens) / 1e6)
      setNotBondedToken(parseInt(res.pool.not_bonded_tokens) / 1e6)
    })

    secretjsquery?.query?.distribution
      ?.communityPool('')
      ?.then((res) =>
        setCommunityPool(Math.floor(Number(res.pool.find((entry) => entry.denom === 'uscrt').amount) / 1e6))
      )

    secretjsquery?.query?.bank
      ?.balance({
        address: allTokens.find((token) => token.name === 'SCRT').address,
        denom: 'uscrt'
      })
      ?.then((res) => {
        setSSCRTTokenSupply(Number(res.balance?.amount) / 1e6)
      })

    // Hardcoded value that is not expected to change much over time, saving and LCD query.
    /* secretjsquery?.query?.bank
      ?.balance({
        address: 'secret1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3x5k6p',
        denom: 'uscrt'
      })
      ?.then((res) => {
        setBurnedTokenSupply(Number(res.balance?.amount) / 1e6)
      }) */

    setBurnedTokenSupply(Number(1045669000000) / 1e6)

    const exchangeAddresses = [
      'secret1p3ucd3ptpw902fluyjzhq3ffgq4ntdda6qy5vv', // Binance Cold Wallet
      'secret1an5pyzzpu5ez7ep9m43yzmalymwls39qtk8rjd', // Binance Hot Wallet
      'secret1nm0rrq86ucezaf8uj35pq9fpwr5r82cl94vhug', // Kraken
      'secret1uer4mwcq2vlt8l23ncwyjj70mug5pzx8gackej', // Kucoin
      'secret155e8c284v6w725llkwwma36vzly4ujsc2syfcy', // MEXC
      'secret1k3pjdxavzkc4ztxmy4y44z8g8qggpp9ut84yag' // ByBit
    ]

    const getBalance = async (address: string) => {
      const res = await secretjsquery?.query?.bank?.balance({ address, denom: 'uscrt' })
      return Number(res.balance?.amount) / 1e6
    }

    const delay = (ms: any) => new Promise((resolve) => setTimeout(resolve, ms))

    ;(async () => {
      const balances = []
      for (const address of exchangeAddresses) {
        const balance = await getBalance(address)
        balances.push(balance)
        await delay(250) // Delay of 250 milliseconds between each query
      }
      const totalBalance = balances.reduce((acc, balance) => acc + balance, 0)
      setExchangesTokenSupply(totalBalance)
    })()

    setExchangesTokenSupply(Number(0))

    secretjsquery?.query?.staking
      .delegatorDelegations({
        delegator_addr: allTokens.find((token) => token.name === 'stkd-SCRT').address,
        pagination: { limit: '20' }
      })
      ?.then((delegatorDelegations) => {
        const totalDelegations = delegatorDelegations.delegation_responses
          ?.reduce((sum: any, delegation: any) => {
            const amount = new BigNumber(delegation?.balance?.amount || 0)
            return sum.plus(amount)
          }, new BigNumber(0))
          .dividedBy(`1e6`)
        setStkdSCRTTokenSupply(Number(totalDelegations))
      })

    //let totalAmount = 0

    // allTokens[0].deposits.forEach((deposit, index) => {
    //   const channelId = chains[deposit.chain_name].withdraw_channel_id
    //   const isLast = index === allTokens[0].deposits.length - 1
    //   setTimeout(() => {
    //     executeQuery(channelId, isLast)
    //   }, index * 100)
    // })

    // const executeQuery = (channelId: any, isLast: any) => {
    //   secretjsquery?.query?.ibc_transfer
    //     ?.escrowAddress({
    //       channel_id: channelId,
    //       port_id: 'transfer'
    //     })
    //     ?.then((escrow) => {
    //       secretjsquery?.query?.bank
    //         ?.balance({
    //           address: escrow.escrow_address,
    //           denom: 'uscrt'
    //         })
    //         ?.then((res) => {
    //           totalAmount += Number(res.balance?.amount) / 1e6
    //           if (isLast) {
    //             setIBCTokenSupply(totalAmount)
    //           }
    //         })
    //     })
    // }

    // Hardcoded value that is not expected to change much over time, saving and LCD query.

    //secretjsquery?.query?.mint?.inflation('')?.then((res) => setInflation((res as any).inflation))
    setInflation(0.09)

    // Hardcoded value that is not expected to change much over time, saving and LCD query.
    /*secretjsquery?.query?.distribution.params('')?.then((res) => {
      setSecretFoundationTax(res?.params.secret_foundation_tax)
      setCommunityTax(res?.params.community_tax)
    })*/
    setSecretFoundationTax('0.120000000000000000')
    setCommunityTax('0.020000000000000000')

    fetchDappsURL()
    if (currencyPricing === defaultCurrencyPricing) {
      fetchCurrencyPricingURL()
    }
  }, [])

  const providerValue = {
    dappsData,
    dappsDataSorted,
    tags,
    coingeckoApiData_Day,
    coingeckoApiData_Month,
    coingeckoApiData_Year,
    defiLamaApiData_Year,
    defiLamaApiData_TVL,
    currentPrice,
    analyticsData1,
    analyticsData2,
    analyticsData3,
    analyticsData4,
    analyticsData5,
    L5AnalyticsApiData,
    bondedToken,
    notBondedToken,
    totalSupply,
    communityPool,
    sSCRTTokenSupply,
    stkdSCRTTokenSupply,
    IBCTokenSupply,
    burnedTokenSupply,
    exchangesTokenSupply,
    inflation,
    secretFoundationTax,
    communityTax,
    volume,
    marketCap,
    convertCurrency
  }

  return <APIContext.Provider value={providerValue}>{children}</APIContext.Provider>
}

export { APIContext, APIContextProvider }

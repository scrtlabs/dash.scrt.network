import BigNumber from 'bignumber.js'
import { createContext, useEffect, useRef, useState } from 'react'
import { SecretNetworkClient } from 'secretjs'
import { allTokens, dAppsURL, randomDelay, sleep, sortDAppsArray } from 'utils/commons'
import { SECRET_LCD, SECRET_CHAIN_ID, chains } from 'utils/config'

const APIContext = createContext(null)

const APIContextProvider = ({ children }: any) => {
  const [dappsData, setDappsData] = useState<any[]>([])
  const [dappsDataSorted, setDappsDataSorted] = useState<any[]>([])
  const [tags, setTags] = useState<string[]>([])

  // totalSupply, bonded, notBonded
  const [totalSupply, setTotalSupply] = useState(Number)
  const [bondedToken, setBondedToken] = useState(Number)
  const [notBondedToken, setNotBondedToken] = useState(Number)
  const [distributionRewardToken, setDistributionRewardToken] = useState(Number)
  const [sSCRTTokenSupply, setSSCRTTokenSupply] = useState(Number)
  const [stkdSCRTTokenSupply, setStkdSCRTTokenSupply] = useState(Number)
  const [IBCTokenSupply, setIBCTokenSupply] = useState(Number)

  const [inflation, setInflation] = useState(0)

  const [communityTax, setCommunityTax] = useState('')
  const [secretFoundationTax, setSecretFoundationTax] = useState('')

  const [communityPool, setCommunityPool] = useState(Number) // in uscrt

  useEffect(() => {
    const queryData = async () => {
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
        ?.then((res) => setCommunityPool(Math.floor((res.pool[1] as any).amount / 1e6)))

      secretjsquery?.query?.bank
        ?.balance({
          address: allTokens.find((token) => token.name === 'SCRT').address,
          denom: 'uscrt'
        })
        ?.then((res) => {
          setSSCRTTokenSupply(Number(res.balance?.amount) / 1e6)
        })

      secretjsquery?.query?.bank
        ?.balance({
          address: allTokens.find((token) => token.name === 'stkd-SCRT').address,
          denom: 'uscrt'
        })
        ?.then((res) => {
          setStkdSCRTTokenSupply(Number(res.balance?.amount) / 1e6)
          secretjsquery?.query?.staking
            .delegatorDelegations({
              delegator_addr: allTokens.find((token) => token.name === 'stkd-SCRT').address,
              pagination: { limit: '1000' }
            })
            ?.then((delegatorDelegations) => {
              const totalDelegations = delegatorDelegations.delegation_responses
                ?.reduce((sum: any, delegation: any) => {
                  const amount = new BigNumber(delegation?.balance?.amount || 0)
                  return sum.plus(amount)
                }, new BigNumber(0))
                .dividedBy(`1e6`)
              setStkdSCRTTokenSupply(Number(res.balance?.amount) / 1e6 + Number(totalDelegations))
            })
        })

      let totalAmount = 0

      allTokens[0].deposits.forEach((deposit, index) => {
        const chainName = deposit.chain_name
        const channelId = chains[chainName].withdraw_channel_id
        const isLast = index === allTokens[0].deposits.length - 1
        setTimeout(() => {
          executeQuery(channelId, isLast)
        }, index * 100)
      })

      const executeQuery = (channelId: any, isLast: any) => {
        secretjsquery?.query?.ibc_transfer
          ?.escrowAddress({
            channel_id: channelId,
            port_id: 'transfer'
          })
          ?.then((escrow) => {
            secretjsquery?.query?.bank
              ?.balance({
                address: escrow.escrow_address,
                denom: 'uscrt'
              })
              ?.then((res) => {
                totalAmount += Number(res.balance?.amount) / 1e6
                if (isLast) {
                  setIBCTokenSupply(totalAmount)
                }
              })
          })
      }

      secretjsquery?.query?.mint?.inflation('')?.then((res) => setInflation((res as any).inflation))

      secretjsquery?.query?.distribution.params('')?.then((res) => {
        setSecretFoundationTax(res?.params.secret_foundation_tax)
        setCommunityTax(res?.params.community_tax)
      })
    }
    queryData()
  }, [])

  const fetchDappsURL = () => {
    fetch(dAppsURL)
      .then((response) => {
        if (!response.ok) throw new Error()
        else return response.json()
      })
      .then((jsonData) => {
        setDappsData(jsonData.data)
      })
      .catch((error) => {
        console.error(error)

        setTimeout(() => fetchDappsURL(), 3000)
      })
  }

  useEffect(() => {
    fetchDappsURL()
  }, [])

  useEffect(() => {
    if (dappsData && dappsDataSorted.length === 0 && dappsData?.length !== 0) {
      setDappsDataSorted(sortDAppsArray(dappsData))
      // Tag-Filter
      let allTags: string[] = []

      dappsData.forEach((dapp) => {
        dapp.attributes.type
          .map((item: any) => item.name)
          .forEach((tag: any) => {
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
  const [defiLamaApiData_Year, setDefiLamaApiData_Year] = useState()
  const [defiLamaApiData_TVL, setDefiLamaApiData_TVL] = useState()
  const [currentPrice, setCurrentPrice] = useState(Number)
  const [externalApiData, setExternalApiData] = useState()
  const [L5AnalyticslApiData, setL5AnalyticslApiData] = useState()
  const [volume, setVolume] = useState(Number)
  const [marketCap, setMarketCap] = useState(Number)

  useEffect(() => {
    // Coingecko API
    let coingeckoApiUrl_Day = `https://api.coingecko.com/api/v3/coins/secret/market_chart?vs_currency=usd&days=1`
    fetch(coingeckoApiUrl_Day)
      .then((response) => response.json())
      .then((response) => {
        setCoinGeckoApiData_Day(response)
      })

    let coingeckoApiUrl_Month = `https://api.coingecko.com/api/v3/coins/secret/market_chart?vs_currency=usd&days=30`
    fetch(coingeckoApiUrl_Month)
      .then((response) => response.json())
      .then((response) => {
        setCoinGeckoApiData_Month(response)
      })

    let coingeckoApiUrl_Year = `https://api.coingecko.com/api/v3/coins/secret/market_chart?vs_currency=usd&days=365`
    fetch(coingeckoApiUrl_Year)
      .then((response) => response.json())
      .then((response) => {
        setCoinGeckoApiData_Year(response)
      })

    let defiLamaApiUrl_Year = `https://api.llama.fi/charts/secret`
    fetch(defiLamaApiUrl_Year)
      .then((response) => response.json())
      .then((response) => {
        setDefiLamaApiData_Year(
          response.map((x: any[]) => [parseInt((x as any).date) * 1000, (x as any).totalLiquidityUSD])
        )
      })

    let defiLamaApiUrl_TVL = `https://api.llama.fi/chains`
    fetch(defiLamaApiUrl_TVL)
      .then((response) => response.json())
      .then((response) => {
        setDefiLamaApiData_TVL(response.filter((item: any) => item?.gecko_id === 'secret')[0]?.tvl)
      })

    // Coingecko Market Price, Market Cap & Volume
    let coingeckoMarketCapVolumeUrl = `https://api.coingecko.com/api/v3/simple/price?ids=secret&vs_currencies=USD&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
    fetch(coingeckoMarketCapVolumeUrl)
      .then((response) => response.json())
      .then((response) => {
        setCurrentPrice(response.secret.usd)
        setMarketCap(response.secret.usd_market_cap)
        setVolume(response.secret.usd_24h_vol)
      })

    let mintscanApiDataUrl = `https://dev.api.mintscan.io/v1/secret/status`
    fetch(mintscanApiDataUrl)
      .then((response) => response.json())
      .then((response) => {
        setExternalApiData(response)
      })
    let L5AnalyticsApiDataUrl = `https://api.lavenderfive.com/networks`
    fetch(L5AnalyticsApiDataUrl)
      .then((response) => response.json())
      .then((response) => {
        console.log(response['secretnetwork'])
        setL5AnalyticslApiData(response['secretnetwork'])
      })
  }, [])

  const providerValue = {
    dappsData,
    setDappsData,
    dappsDataSorted,
    setDappsDataSorted,
    tags,
    setTags,
    coingeckoApiData_Day,
    setCoinGeckoApiData_Day,
    coingeckoApiData_Month,
    setCoinGeckoApiData_Month,
    coingeckoApiData_Year,
    setCoinGeckoApiData_Year,
    defiLamaApiData_Year,
    setDefiLamaApiData_Year,
    defiLamaApiData_TVL,
    setDefiLamaApiData_TVL,
    currentPrice,
    setCurrentPrice,
    externalApiData,
    setExternalApiData,
    L5AnalyticslApiData,
    setL5AnalyticslApiData,
    bondedToken,
    setBondedToken,
    notBondedToken,
    setNotBondedToken,
    totalSupply,
    setTotalSupply,
    communityPool,
    setCommunityPool,
    sSCRTTokenSupply,
    setSSCRTTokenSupply,
    stkdSCRTTokenSupply,
    setStkdSCRTTokenSupply,
    IBCTokenSupply,
    setIBCTokenSupply,
    inflation,
    setInflation,
    secretFoundationTax,
    setSecretFoundationTax,
    communityTax,
    setCommunityTax,
    volume,
    setVolume,
    marketCap,
    setMarketCap
  }

  return <APIContext.Provider value={providerValue}>{children}</APIContext.Provider>
}

export { APIContext, APIContextProvider }

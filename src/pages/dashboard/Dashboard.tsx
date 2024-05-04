import { useEffect, useState, useContext } from 'react'
import { SecretNetworkClient } from 'secretjs'
import CurrentPrice from './components/CurrentPrice'
import MiniTile from './components/MiniTile'
import PriceVolumeTVL from './components/PriceVolTVLChart/PriceVolumeTVL'
import QuadTile from './components/QuadTile'
import SocialMedia from './components/SocialMedia'
import { SECRET_LCD, SECRET_CHAIN_ID } from 'utils/config'
import StakingChart from './components/StakingChart'
import { currencySymbols, formatNumber } from 'utils/commons'
import { APIContext } from 'context/APIContext'
import { Helmet } from 'react-helmet-async'
import { trackMixPanelEvent, dashboardPageTitle, dashboardPageDescription, dashboardJsonLdSchema } from 'utils/commons'
import UnbondingsChart from './components/UnbondingsChart'
import { useUserPreferencesStore } from 'store/UserPreferences'
import AccountsChart from './components/AccountsChart'

function Dashboard() {
  const {
    defiLamaApiData_TVL,
    currentPrice,
    externalApiData,
    bondedToken,
    notBondedToken,
    totalSupply,
    inflation,
    secretFoundationTax,
    communityTax,
    volume,
    marketCap,
    L5AnalyticsApiData
  } = useContext(APIContext)

  useEffect(() => {
    trackMixPanelEvent('Open Dashboard Tab')
  }, [])

  // block height
  const [blockHeight, setBlockHeight] = useState(null)
  const [blockHeightFormattedString, setblockHeightFormattedString] = useState('')

  useEffect(() => {
    if (blockHeight) {
      setblockHeightFormattedString(parseInt(blockHeight).toLocaleString())
    }
  }, [blockHeight])

  // block time
  const [blockTime, setBlockTime] = useState(null) // in seconds
  const [blockTimeFormattedString, setBlockTimeFormattedString] = useState('')

  useEffect(() => {
    if (blockTime) {
      setBlockTimeFormattedString(
        parseFloat(blockTime).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + 's'
      )
    }
  }, [blockTime])

  // # transactions
  const [transactions, setTransactions] = useState('')
  const [transactionsFormattedString, setTransactionsFormattedString] = useState('')

  useEffect(() => {
    if (transactions) {
      setTransactionsFormattedString(parseInt(transactions).toLocaleString())
    }
  }, [transactions])

  // taxes
  const [taxFormattedString, setTaxFormattedString] = useState('')

  useEffect(() => {
    if (communityTax && secretFoundationTax) {
      setTaxFormattedString(
        (parseFloat(communityTax) * 100).toLocaleString() +
          '%' +
          ' / ' +
          (parseFloat(secretFoundationTax) * 100).toLocaleString() +
          '%'
      )
    }
  }, [communityTax, secretFoundationTax])

  // feesPaid
  const [activeValidators, setActiveValidators] = useState('')
  const [activeValidatorsFormattedString, setActiveValidatorsFormattedString] = useState('')

  useEffect(() => {
    if (activeValidators) {
      setActiveValidatorsFormattedString(formatNumber(parseInt(activeValidators), 2))
    }
  }, [activeValidators])

  // inflation
  const [inflationFormattedString, setInflationFormattedString] = useState('')

  useEffect(() => {
    if (inflation) {
      setInflationFormattedString((inflation * 100).toLocaleString() + '%')
    }
  }, [inflation])

  // APR
  const [growthRateFormattedString, setGrowthRateFormattedString] = useState('')

  //Bonded Ratio
  const [bondedRatio, setBondedRatio] = useState(0)
  const [bondedRatioFormattedString, setBondedRatioFormattedString] = useState('')

  useEffect(() => {
    const queryData = async () => {
      const secretjsquery = new SecretNetworkClient({
        url: SECRET_LCD,
        chainId: SECRET_CHAIN_ID
      })

      secretjsquery?.query?.tendermint.getLatestBlock('')?.then((res1) => {
        setBlockHeight(res1.block.header.height)
      })
    }
    queryData()
  }, [])

  useEffect(() => {
    if (L5AnalyticsApiData) {
      setBlockTime(L5AnalyticsApiData['actual_blocktime'].toFixed(2))
    }
  }, [L5AnalyticsApiData])

  // volume & market cap
  const [volumeFormattedString, setVolumeFormattedString] = useState('')
  const [marketCapFormattedString, setMarketCapFormattedString] = useState('')
  const [TVLFormattedString, setTVLFormattedString] = useState('')

  const { currency } = useUserPreferencesStore()

  useEffect(() => {
    if (volume) {
      setVolumeFormattedString(currencySymbols[currency] + formatNumber(parseInt(volume.toFixed(0).toString()), 2))
    }
    if (marketCap) {
      setMarketCapFormattedString(
        currencySymbols[currency] + formatNumber(parseInt(marketCap.toFixed(0).toString()), 2)
      )
    }
    if (defiLamaApiData_TVL) {
      setTVLFormattedString(
        currencySymbols[currency] + formatNumber(parseInt(defiLamaApiData_TVL.toFixed(0).toString()), 2)
      )
    }
  }, [volume, marketCap, defiLamaApiData_TVL])

  useEffect(() => {
    if (externalApiData) {
      const queryData = async () => {
        setTransactions((externalApiData as any).total_txs_num)
        setActiveValidators((externalApiData as any).unjailed_validator_num)
      }

      queryData()
    }
  }, [externalApiData])

  useEffect(() => {
    if (inflation && secretFoundationTax && communityTax && bondedToken && notBondedToken && totalSupply) {
      // staking ratio missing
      const I = inflation // inflation
      const F = parseFloat(secretFoundationTax) // foundation tax
      const C = 0.0 // validator commision rate; median is 5%
      const T = parseFloat(communityTax) // community tax
      const R = bondedToken / totalSupply // bonded ratio
      setBondedRatio(R * 100)
      const APR = (I / R) * 100
      const realYield = (I / R) * (1 - F - T) * (1 - C) * 100
      setGrowthRateFormattedString(formatNumber(APR, 2) + '%' + ' / ' + formatNumber(realYield, 2) + '%')
      setBondedRatioFormattedString(formatNumber(bondedRatio, 2) + '%')
    }
  }, [inflation, secretFoundationTax, communityTax, bondedToken, notBondedToken, bondedRatio, totalSupply])

  return (
    <>
      <Helmet>
        <title>{dashboardPageTitle}</title>

        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="title" content={dashboardPageTitle} />
        <meta name="application-name" content={dashboardPageTitle} />
        <meta name="description" content={dashboardPageDescription} />
        <meta name="robots" content="index,follow" />

        <meta property="og:title" content={dashboardPageTitle} />
        <meta property="og:description" content={dashboardPageDescription} />
        {/* <meta property='og:image' content='Image URL Here'/> */}

        <meta name="twitter:title" content={dashboardPageTitle} />
        <meta name="twitter:description" content={dashboardPageDescription} />
        {/* <meta name='twitter:image' content='Image URL Here'/> */}

        <script type="application/ld+json">{JSON.stringify(dashboardJsonLdSchema)}</script>
      </Helmet>
      <div className="px-4 mx-auto space-y-4 w-full">
        <div className="grid grid-cols-12 gap-4">
          {/* Price */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-12 xl:col-span-6 2xl:col-span-4">
            <CurrentPrice price={currentPrice} />
          </div>

          {/* Volume */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-12 xl:col-span-6 2xl:col-span-2">
            <MiniTile name="Volume" value={volumeFormattedString} />
          </div>

          {/* Market Cap */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-12 xl:col-span-6 2xl:col-span-2">
            <MiniTile name="Market Cap/TVL" value={`${marketCapFormattedString} / ${TVLFormattedString}`} />
          </div>

          {/* Social Media */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-12 xl:col-span-6 2xl:col-span-4">
            <SocialMedia />
          </div>

          {/* Block Info */}
          <div className="col-span-12 md:col-span-6 lg:col-span-12 xl:col-span-6 2xl:col-span-4">
            <QuadTile
              item1={{ key: 'Block Height', value: blockHeightFormattedString }}
              item2={{
                key: 'Block Time (last block)',
                value: blockTimeFormattedString
              }}
              item3={{
                key: '# Transactions (total)',
                value: transactionsFormattedString
              }}
              item4={{ key: '# Active Validators', value: activeValidatorsFormattedString }}
            />
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-12 xl:col-span-6 2xl:col-span-4">
            <div className="rounded-xl bg-white border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 px-6 py-8">
              <StakingChart />
            </div>
          </div>

          {/* Block Info */}
          <div className="col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 2xl:col-span-4">
            <QuadTile
              item1={{
                key: 'APR/Staking Yield',
                value: growthRateFormattedString
              }}
              item2={{ key: 'Inflation', value: inflationFormattedString }}
              item3={{
                key: 'Community Tax/Secret Foundation Tax',
                value: taxFormattedString
              }}
              item4={{ key: 'Bonded Ratio', value: bondedRatioFormattedString }}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Item */}
          <div className="col-span-12 rounded-xl bg-white border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 p-4">
            <PriceVolumeTVL />
          </div>
          {L5AnalyticsApiData ? (
            <div className="col-span-12 rounded-xl bg-white border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 p-4">
              <UnbondingsChart />
            </div>
          ) : null}
          {/* <div className="col-span-12 rounded-xl bg-white border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 p-4">
            <AccountsChart />
          </div> */}
        </div>
      </div>
    </>
  )
}
export default Dashboard

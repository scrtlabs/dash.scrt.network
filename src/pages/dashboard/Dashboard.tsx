import { useEffect, useState, useContext } from 'react'
import { SecretNetworkClient } from 'secretjs'
import CurrentPrice from './components/CurrentPrice'
import MiniTile from './components/MiniTile'
import PriceVolumeTVL from './components/PriceVolTVLChart/PriceVolumeTVL'
import HexTile from './components/HexTile'
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
    bondedToken,
    notBondedToken,
    totalSupply,
    exchangesTokenSupply,
    inflation,
    secretFoundationTax,
    communityTax,
    volume,
    marketCap,
    L5AnalyticsApiData,
    externalApiData
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

  // # Unique Wallets
  const [uniqueWallets, setUniqueWallets] = useState('')
  const [uniqueWalletsFormattedString, setUniqueWalletsFormattedString] = useState('')

  useEffect(() => {
    if (uniqueWallets) {
      setUniqueWalletsFormattedString(parseInt(uniqueWallets).toLocaleString())
    }
  }, [uniqueWallets])

  // taxes
  const [communityTaxFormattedString, setCommunityTaxFormattedString] = useState('')
  const [SNFTaxFormattedString, setSNFTaxFormattedString] = useState('')

  useEffect(() => {
    if (communityTax && secretFoundationTax) {
      setCommunityTaxFormattedString((parseFloat(communityTax) * 100).toLocaleString() + '%')
      setSNFTaxFormattedString((parseFloat(secretFoundationTax) * 100).toLocaleString() + '%')
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
  const [bondedRateFormattedString, setBondedRateFormattedString] = useState('')
  const [LSBRFormattedString, setLSBRFormattedString] = useState('')

  useEffect(() => {
    const secretjsquery = new SecretNetworkClient({
      url: SECRET_LCD,
      chainId: SECRET_CHAIN_ID
    })

    secretjsquery?.query?.tendermint.getLatestBlock('')?.then((res1) => {
      setBlockHeight(res1.block.header.height)
    })
  }, [])

  // volume & market cap
  const [volumeFormattedString, setVolumeFormattedString] = useState('')
  const [marketCapFormattedString, setMarketCapFormattedString] = useState('')
  const [TVLFormattedString, setTVLFormattedString] = useState('')

  const { currency } = useUserPreferencesStore()

  useEffect(() => {
    if (L5AnalyticsApiData) {
      setBlockTime(L5AnalyticsApiData['actual_blocktime'].toFixed(2))
      setActiveValidators(L5AnalyticsApiData['total_validators'])
      setUniqueWallets(L5AnalyticsApiData['unique_wallets'])
    }
  }, [L5AnalyticsApiData])

  useEffect(() => {
    if (volume) {
      setVolumeFormattedString(currencySymbols[currency] + formatNumber(parseInt(volume.toFixed(0).toString()), 2))
    }
  }, [volume])

  useEffect(() => {
    if (marketCap) {
      setMarketCapFormattedString(
        currencySymbols[currency] + formatNumber(parseInt(marketCap.toFixed(0).toString()), 2)
      )
    }
  }, [marketCap])

  useEffect(() => {
    if (defiLamaApiData_TVL) {
      setTVLFormattedString(
        currencySymbols[currency] + formatNumber(parseInt(defiLamaApiData_TVL.toFixed(0).toString()), 2)
      )
    }
  }, [defiLamaApiData_TVL])

  useEffect(() => {
    if (defiLamaApiData_TVL) {
      setTVLFormattedString(
        currencySymbols[currency] + formatNumber(parseInt(defiLamaApiData_TVL.toFixed(0).toString()), 2)
      )
    }
  }, [defiLamaApiData_TVL])

  useEffect(() => {
    if (inflation && secretFoundationTax && communityTax && bondedToken && notBondedToken && totalSupply) {
      // staking ratio missing
      const I = inflation // inflation
      const F = parseFloat(secretFoundationTax) // foundation tax
      const C = 0.05 // validator commision rate; median is 5%
      const T = parseFloat(communityTax) // community tax
      const R = bondedToken / totalSupply // bonded rate
      const bondedRate = R * 100
      const APR = (I / R) * 100
      const realYield = (I / R) * (1 - F - T) * (1 - C) * 100
      setGrowthRateFormattedString(formatNumber(APR, 2) + '%' + ' / ' + formatNumber(realYield, 2) + '%')
      setBondedRateFormattedString(formatNumber(bondedRate, 2) + '%')
    }
    if (
      inflation &&
      secretFoundationTax &&
      communityTax &&
      bondedToken &&
      notBondedToken &&
      totalSupply &&
      exchangesTokenSupply
    ) {
      const R = bondedToken / (totalSupply - exchangesTokenSupply) // bonded rate
      const bondedRate = R * 100
      setLSBRFormattedString(formatNumber(bondedRate, 2) + '%')
    }
  }, [inflation, secretFoundationTax, communityTax, bondedToken, notBondedToken, totalSupply, exchangesTokenSupply])

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
                key: 'Avg. Block Time',
                value: blockTimeFormattedString
              }}
              item3={{
                key: 'Unique Wallets',
                value: uniqueWalletsFormattedString
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
            <HexTile
              item1={{
                key: 'APR/Staking Yield',
                value: growthRateFormattedString
              }}
              item2={{
                key: 'Inflation (annual)',
                value: inflationFormattedString
              }}
              item3={{
                key: 'Community Tax',
                value: communityTaxFormattedString
              }}
              item4={{
                key: 'SNF Tax',
                value: SNFTaxFormattedString
              }}
              item5={{
                key: 'Bonded Rate',
                value: bondedRateFormattedString
              }}
              item6={{
                key: 'Liquid Supply Bonding Rate',
                value: LSBRFormattedString
              }}
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
          {externalApiData ? (
            <div className="col-span-12 rounded-xl bg-white border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 p-4">
              <AccountsChart />
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}
export default Dashboard

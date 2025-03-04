import { useEffect, useContext } from 'react'
import { APIContext } from 'context/APIContext'
import { Helmet } from 'react-helmet-async'
import { trackMixPanelEvent, analyticsPageTitle, analyticsPageDescription, analyticsJsonLdSchema } from 'utils/commons'
import UnbondingsChart from './components/UnbondingsChart'
import AccountsChart from './components/AccountsChart'
import ValidatorsChart from './components/ValidatorsChart'
import ContractsChart from './components/ContractsChart'
import TransactionsChart from './components/TransactionsChart'
import RelayerChartWithDateSlider from './components/RelayerChartWithDateSlider'
import RelayerChartWithChainSlider from './components/RelayerChartWithChainSlider'
import RelayerChartWithProviderSlider from './components/RelayerChartWithProviderSlider'
import RelayerChartTotal from './components/RelayerChartTotal'
import WeeklyContractsChart from './components/WeeklyContractsChart'

function Analytics() {
  const { L5AnalyticsApiData, analyticsData1, analyticsData2, analyticsData3, analyticsData4, analyticsData5 } =
    useContext(APIContext)

  useEffect(() => {
    trackMixPanelEvent('Open Analytics Tab')
  }, [])

  return (
    <>
      <Helmet>
        <title>{analyticsPageTitle}</title>

        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="title" content={analyticsPageTitle} />
        <meta name="application-name" content={analyticsPageTitle} />
        <meta name="description" content={analyticsPageDescription} />
        <meta name="robots" content="index,follow" />

        <meta property="og:title" content={analyticsPageTitle} />
        <meta property="og:description" content={analyticsPageDescription} />
        {/* <meta property='og:image' content='Image URL Here'/> */}

        <meta name="twitter:title" content={analyticsPageTitle} />
        <meta name="twitter:description" content={analyticsPageDescription} />
        {/* <meta name='twitter:image' content='Image URL Here'/> */}

        <script type="application/ld+json">{JSON.stringify(analyticsJsonLdSchema)}</script>
      </Helmet>
      <div className="px-4 mx-auto space-y-4 w-full">
        <div className="grid grid-cols-12 gap-4">
          {/* Item */}
          {analyticsData1 ? (
            <div className="col-span-12 rounded-xl bg-white border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 p-4">
              <AccountsChart />
            </div>
          ) : null}
          {analyticsData2 ? (
            <div className="col-span-12 rounded-xl bg-white border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 p-4">
              <ValidatorsChart />
            </div>
          ) : null}
          {analyticsData3 ? (
            <>
              <div className="col-span-12 rounded-xl bg-white border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 p-4">
                <ContractsChart />
              </div>
              <div className="col-span-12 rounded-xl bg-white border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 p-4">
                <TransactionsChart />
              </div>
            </>
          ) : null}
          {analyticsData5 ? (
            <>
              <div className="col-span-12 rounded-xl bg-white border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 p-4">
                <WeeklyContractsChart />
              </div>
            </>
          ) : null}
          {analyticsData4 ? (
            <>
              <div className="col-span-12 rounded-xl bg-white border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800">
                <div className="flex flex-col">
                  <div className="border-b border-neutral-200 dark:border-neutral-700 p-4">
                    <RelayerChartTotal />
                  </div>
                  <div className="border-b border-neutral-200 dark:border-neutral-700 p-4">
                    <RelayerChartWithDateSlider />
                  </div>
                  <div className="border-b border-neutral-200 dark:border-neutral-700 p-4">
                    <RelayerChartWithChainSlider />
                  </div>
                  <div className="p-4">
                    <RelayerChartWithProviderSlider />
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {L5AnalyticsApiData ? (
            <div className="col-span-12 rounded-xl bg-white border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 p-4">
              <UnbondingsChart />
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}
export default Analytics

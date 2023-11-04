import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useContext, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import Header from '../../components/Header'
import AppTile from './components/tile/AppTile'
import {
  appsPageTitle,
  appsPageDescription,
  appsJsonLdSchema
} from 'utils/commons'
import { APIContext } from 'context/APIContext'
import { trackMixPanelEvent as trackEvent } from 'utils/commons'
import FilterTag from './components/FilterTag'
import SkeletonLoaders from './components/SkeletonLoaders/SkeletonLoaders'
import Button from 'components/UI/Button/Button'

function Apps() {
  const { dappsData, dappsDataSorted, tags } = useContext(APIContext)

  // Mixpanel
  useEffect(() => {
    trackEvent('Open Apps Tab')
  }, [])

  // Filter + Search
  const [tagsToBeFilteredBy, setTagsToBeFilteredBy] = useState<string[]>([])
  function isTagInFilterList(tag: string) {
    return tagsToBeFilteredBy.find((e) => e === tag)
  }

  function toggleTagFilter(tagName: string) {
    if (tagsToBeFilteredBy.includes(tagName)) {
      setTagsToBeFilteredBy(tagsToBeFilteredBy.filter((tag) => tag !== tagName))
    } else {
      setTagsToBeFilteredBy(tagsToBeFilteredBy.concat(tagName))
    }
  }

  // Search
  const [searchText, setSearchText] = useState<string>('')

  // results apps that match on the search input and chosen tags
  function filteredDappsData() {
    let items = dappsDataSorted
    if (searchText !== '') {
      items = items.filter((app: any) =>
        app.attributes.name.toLowerCase().includes(searchText.toLowerCase())
      )
    }

    if (tagsToBeFilteredBy?.length > 0) {
      items = items.filter((item: any) =>
        item.attributes.type
          .map((item: any) => item.name)
          .find((tag: any) => tagsToBeFilteredBy.includes(tag))
      )
    }
    return items
  }

  return (
    <>
      <Helmet>
        <title>{appsPageTitle}</title>

        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="title" content={appsPageTitle} />
        <meta name="application-name" content={appsPageTitle} />
        <meta name="description" content={appsPageDescription} />
        <meta name="robots" content="index,follow" />

        <meta property="og:title" content={appsPageTitle} />
        <meta property="og:description" content={appsPageDescription} />
        {/* <meta property="og:image" content="Image URL Here"/> */}

        <meta name="twitter:title" content={appsPageTitle} />
        <meta name="twitter:description" content={appsPageDescription} />
        {/* <meta name="twitter:image" content="Image URL Here"/> */}

        <script type="application/ld+json">
          {JSON.stringify(appsJsonLdSchema)}
        </script>
      </Helmet>
      <div className="max-w-screen-2xl mx-auto px-6 pt-6 sm:pt-0">
        <Header
          title="Apps"
          description="A curation of applications running on Secret Network Mainnet!"
        />

        {/* Search */}
        <div className="relative w-full sm:w-96 mx-auto mb-4">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="" />
          </div>
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            type="text"
            id="search"
            className="block w-full p-4 pl-10 text-sm rounded-lg text-neutral-800 dark:text-white bg-white dark:bg-neutral-800 placeholder-neutral-600 dark:placeholder-neutral-400 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 dark:focus-visible:ring-cyan-500"
            placeholder="Search"
          />
        </div>
        {/* Tag-Filter */}
        <div className="mb-4 sm:mb-8 flex gap-2 flex-wrap justify-center">
          {tags?.length > 0 &&
            tags.map((tag: any, index: number) => (
              <>
                {tag && (
                  <FilterTag
                    key={tag + index}
                    name={tag}
                    toggleTagFilter={toggleTagFilter}
                    isTagInFilterList={isTagInFilterList}
                  />
                )}
              </>
            ))}
          {tags?.length === 0 && <div className="h-6"></div>}
        </div>
        {/* App-Items */}
        <div className="grid grid-cols-12 gap-4 auto-rows-auto">
          {dappsData?.length > 0 && (
            <>
              {filteredDappsData().map((dapp: any) => (
                <AppTile
                  key={dapp.attributes.name}
                  name={dapp.attributes.name}
                  description={dapp.attributes.description}
                  tags={dapp.attributes.type.map((item: any) => item.name)}
                  image={dapp.attributes.logo.data.attributes.url}
                  url={dapp.attributes.link}
                />
              ))}
            </>
          )}
          {dappsData.length <= 0 && <SkeletonLoaders />}
        </div>
      </div>
    </>
  )
}

export default Apps

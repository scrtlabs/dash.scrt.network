import { useState } from 'react'
import { Token } from 'utils/config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import './Balances.scss'
import { SendService } from 'services/send.service'
import BalanceItem from 'pages/portfolio/components/BalanceItem'

export const ManageBalances = () => {
  const [searchQuery, setSearchQuery] = useState<string>('')

  const tokens = SendService.getSupportedTokens()

  const displayedAssets = tokens.filter(
    (token: Token) =>
      token.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      ('s' + token.name)?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      token.description?.toLowerCase().includes(searchQuery?.toLowerCase())
  )

  return (
    <>
      {/* All Balances */}
      <div className="flex flex-col gap-4 sm:flex-row items-center mb-4">
        {/* Search */}
        <div className="flex-1 w-full xs:w-auto">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="" />
            </div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
              id="search"
              className="block w-full sm:w-72 p-2.5 pl-10 text-sm rounded-lg text-neutral-800 dark:text-white bg-white dark:bg-neutral-800 placeholder-neutral-600 dark:placeholder-neutral-400 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-500"
              placeholder="Search Asset"
            />
          </div>
        </div>
      </div>

      <div className="balance-item flex flex-col">
        {tokens
          ? displayedAssets.map((token: Token, i: number) => <BalanceItem token={token} key={i} />)
          : [...Array(10)].map((_, index) => <BalanceItem key={index} />)}
      </div>
    </>
  )
}

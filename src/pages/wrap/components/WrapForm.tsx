import { useState, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { tokens } from 'utils/config'
import { WrapService } from 'services/wrap.service'
import { NotificationService } from 'services/notification.service'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { useUserPreferencesStore } from 'store/UserPreferences'
import BalanceUI from 'components/BalanceUI'
import FeeGrant from 'components/FeeGrant/FeeGrant'
import { GetBalanceError } from 'types/GetBalanceError'
import './wrap.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight, faQuestion } from '@fortawesome/free-solid-svg-icons'
import { faCircle } from '@fortawesome/free-regular-svg-icons'

export default function WrapAllTokens() {
  const { secretNetworkClient, feeGrantStatus, isConnected, getBalance, balanceMapping, ibcBalanceMapping } =
    useSecretNetworkClientStore()

  const { debugMode } = useUserPreferencesStore()

  // Tracks user's choice (wrap/unwrap) and amount for each token.
  const [batchOperations, setBatchOperations] = useState<{
    [tokenName: string]: {
      direction: 'wrap' | 'unwrap'
      amount: string
    }
  }>({})

  // Toggles for filtering tokens.
  const [hideZeroBalance, setHideZeroBalance] = useState(true)
  const [hideNoViewingKey, setHideNoViewingKey] = useState(true)

  // Toggle to show an amount input field (for "pro" users).
  const [showAmountInput, setShowAmountInput] = useState(false)

  // New state to control whether the full list is shown or just the first 5 tokens.
  const [expanded, setExpanded] = useState(false)

  // Fetch a balance safely (returns a BigNumber, 'viewingKeyError', 'GenericFetchError', or null).
  function getBalanceSpecial(token: (typeof tokens)[number], isSecretToken: boolean) {
    const result = getBalance(token, isSecretToken)
    if (result === 'viewingKeyError') return 'viewingKeyError' as GetBalanceError
    if (result === 'GenericFetchError') return 'GenericFetchError' as GetBalanceError
    if (result instanceof BigNumber) return result
    return null
  }

  // Check if a token has a valid viewing key.
  function hasViewingKey(token: (typeof tokens)[number]): boolean {
    const secretBalance = getBalanceSpecial(token, true)
    if (secretBalance === 'viewingKeyError') return false
    if (secretBalance === 'GenericFetchError') return false
    if (secretBalance === null) return false
    return true
  }

  // Filter tokens based on toggles (hide zero balance, hide no viewing key).
  const filteredTokens = useMemo(() => {
    return tokens.filter((token) => {
      if (hideNoViewingKey && !hasViewingKey(token)) {
        return false
      }
      if (hideZeroBalance) {
        const unwrapped = getBalanceSpecial(token, false)
        const secret = token.address ? getBalanceSpecial(token, true) : null

        const unwrappedBN = unwrapped instanceof BigNumber ? unwrapped : new BigNumber(0)
        const secretBN = secret instanceof BigNumber ? secret : new BigNumber(0)
        const total = unwrappedBN.plus(secretBN)

        if (total.isZero()) {
          return false
        }
      }
      return true
    })
  }, [hideZeroBalance, hideNoViewingKey, balanceMapping, ibcBalanceMapping])

  // Determine which tokens to display based on the expanded toggle.
  const tokensToDisplay = expanded ? filteredTokens : filteredTokens.slice(0, 5)

  // Update the amount value for a given token.
  const updateAmount = (tokenName: string, amount: string) => {
    setBatchOperations((prev) => ({
      ...prev,
      [tokenName]: {
        ...prev[tokenName],
        amount
      }
    }))
  }

  // When clicking a balance, set both the amount and the mode (wrap or unwrap).
  const handleBalanceClick = (tokenName: string, balanceStr: string, mode: 'wrap' | 'unwrap') => {
    setBatchOperations((prev) => ({
      ...prev,
      [tokenName]: {
        amount: balanceStr,
        direction: mode
      }
    }))
  }

  // Toggle the operation direction between 'wrap' and 'unwrap'.
  const toggleDirection = (tokenName: string) => {
    setBatchOperations((prev: any) => {
      const current = prev[tokenName]?.direction
      let newDirection
      if (!current) {
        // If no direction is selected yet, set it to 'wrap'
        newDirection = 'wrap'
      } else {
        newDirection = current === 'wrap' ? 'unwrap' : 'wrap'
      }
      return {
        ...prev,
        [tokenName]: {
          direction: newDirection,
          amount: prev[tokenName]?.amount || ''
        }
      }
    })
  }

  // Perform the entire batch transaction.
  const handlePerformBatch = async () => {
    if (!isConnected) return

    const items = []
    for (const token of filteredTokens) {
      const op = batchOperations[token.name]
      if (op && op.amount && parseFloat(op.amount) > 0) {
        items.push({
          token,
          amount: op.amount,
          wrappingMode: op.direction // 'wrap' or 'unwrap'
        })
      }
    }

    if (!items.length) {
      NotificationService.notify('No valid items selected for batch transaction', 'error')
      return
    }

    const toastId = NotificationService.notify('Executing batch transaction...', 'loading')
    try {
      await WrapService.performBatchWrapping({
        items,
        secretNetworkClient,
        feeGrantStatus
      })
      NotificationService.notify('Batch transaction successful!', 'success', toastId)
      setBatchOperations({})
    } catch (error) {
      console.error(error)
      NotificationService.notify(`Batch transaction failed: ${error}`, 'error', toastId)
    }
  }

  // "Wrap All" button: fill all unwrapped balances into batch operations for wrapping.
  const handleWrapAll = () => {
    const newBatchOperations = { ...batchOperations }

    for (const token of filteredTokens) {
      const rawBalance = getBalanceSpecial(token, false)
      if (rawBalance instanceof BigNumber) {
        const amount = rawBalance.dividedBy(`1e${token.decimals}`).toString()
        newBatchOperations[token.name] = {
          direction: 'wrap',
          amount
        }
      }
    }

    setBatchOperations(newBatchOperations)
  }

  // "Unwrap All" button: fill all wrapped balances into batch operations for unwrapping.
  const handleUnwrapAll = () => {
    const newBatchOperations = { ...batchOperations }

    for (const token of filteredTokens) {
      const wrappedBalance = getBalanceSpecial(token, true)
      if (wrappedBalance instanceof BigNumber) {
        const amount = wrappedBalance.dividedBy(`1e${token.decimals}`).toString()
        newBatchOperations[token.name] = {
          direction: 'unwrap',
          amount
        }
      }
    }

    setBatchOperations(newBatchOperations)
  }

  // A small summary to show how many tokens are set to wrap vs unwrap, and total amounts.
  const summary = useMemo(() => {
    let wrapCount = 0
    let unwrapCount = 0

    for (const token of filteredTokens) {
      const op = batchOperations[token.name]
      if (op && op.amount && parseFloat(op.amount) > 0) {
        if (op.direction === 'wrap') {
          wrapCount++
        } else if (op.direction === 'unwrap') {
          unwrapCount++
        }
      }
    }

    return {
      wrapCount,
      unwrapCount
    }
  }, [filteredTokens, batchOperations])

  const isLoading = balanceMapping == null && ibcBalanceMapping == null

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      {/* Top Toggles & Global Actions */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          <input type="checkbox" checked={hideZeroBalance} onChange={(e) => setHideZeroBalance(e.target.checked)} />
          <span>Hide tokens with 0 balance</span>
        </div>
        <div className="flex items-center gap-1">
          <input type="checkbox" checked={hideNoViewingKey} onChange={(e) => setHideNoViewingKey(e.target.checked)} />
          <span>Hide tokens without viewing key</span>
        </div>
        <div className="flex items-center gap-1">
          <input type="checkbox" checked={showAmountInput} onChange={(e) => setShowAmountInput(e.target.checked)} />
          <span>Set custom amount</span>
        </div>

        {/* "Wrap All" / "Unwrap All" Buttons */}
        <button
          onClick={handleWrapAll}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded"
          disabled={!isConnected}
          title="Auto-fill all unwrapped balances for wrapping"
        >
          Wrap All
        </button>
        <button
          onClick={handleUnwrapAll}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded"
          disabled={!isConnected}
          title="Auto-fill all wrapped balances for unwrapping"
        >
          Unwrap All
        </button>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto bg-gray-200 dark:bg-neutral-700 p-4 rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-300 dark:border-neutral-600 text-base">
              <th className="py-2 text-center">Token</th>
              <th className="py-2 text-center">Unwrapped Balance</th>
              <th className="py-2 text-center">
                Direction
                <FontAwesomeIcon
                  icon={faQuestion}
                  className="ml-1 text-gray-400 cursor-pointer"
                  title="Wrapping means converting a publicly visible token into a Secret version with privacy features. Unwrapping converts it back to the public chain."
                />
              </th>
              {showAmountInput && <th className="py-2 text-center">Amount</th>}
              <th className="py-2 text-center">Wrapped Balance</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? /* Skeleton Rows While Loading */ Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-neutral-600 last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 bg-gray-300 dark:bg-neutral-600 rounded-full animate-pulse" />
                        <div className="font-semibold bg-gray-300 dark:bg-neutral-600 rounded animate-pulse w-12 h-4" />
                      </div>
                    </td>
                    <td>
                      <div className="bg-gray-300 dark:bg-neutral-600 animate-pulse rounded w-20 h-6 mx-auto" />
                    </td>
                    <td className="text-center">
                      <button className="p-2 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800">
                        <FontAwesomeIcon icon={faCircle} size="xl" />
                      </button>
                    </td>
                    {showAmountInput && (
                      <td className="text-center">
                        <div className="bg-gray-300 dark:bg-neutral-600 animate-pulse rounded w-20 h-6 mx-auto" />
                      </td>
                    )}
                    <td>
                      <div className="bg-gray-300 dark:bg-neutral-600 animate-pulse rounded w-20 h-6 mx-auto" />
                    </td>
                  </tr>
                ))
              : /* Actual Rows When Data is Loaded */ tokensToDisplay.map((token) => {
                  const op = batchOperations[token.name]
                  const direction = op?.direction

                  return (
                    <tr key={token.name} className="border-b border-gray-100 dark:border-neutral-600 last:border-0">
                      {/* Token Info */}
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={`/img/assets/${token.image}`}
                            alt={`${token.name} logo`}
                            className="w-12 h-12 rounded-full"
                          />
                          <div className="font-semibold justify-center">{token.name}</div>
                        </div>
                      </td>

                      {/* Unwrapped Balance (clickable) */}
                      <td>
                        <BalanceUI
                          token={token}
                          isSecretToken={false}
                          showBalanceLabel={false}
                          onBalanceClick={(balanceStr: string) => handleBalanceClick(token.name, balanceStr, 'wrap')}
                          showCurrencyEquiv={false}
                        />
                      </td>

                      {/* Direction Toggle */}
                      <td className="text-center">
                        <button
                          onClick={() => toggleDirection(token.name)}
                          disabled={!isConnected || !token.address}
                          className="p-2 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700"
                          title={
                            !direction
                              ? 'Click to toggle to Wrap'
                              : direction === 'wrap'
                                ? 'Currently set to Wrap (click to switch to Unwrap)'
                                : 'Currently set to Unwrap (click to switch to Wrap)'
                          }
                        >
                          {!direction ? (
                            <FontAwesomeIcon icon={faCircle} size="xl" />
                          ) : direction === 'wrap' ? (
                            <FontAwesomeIcon icon={faArrowRight} size="xl" />
                          ) : (
                            <FontAwesomeIcon icon={faArrowLeft} size="xl" />
                          )}
                        </button>
                      </td>

                      {/* Amount Input (optional) */}
                      {showAmountInput && (
                        <td className="text-center">
                          <input
                            type="number"
                            className="no-spinner text-center w-[90px] rounded px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600"
                            value={op?.amount || ''}
                            onChange={(e) => updateAmount(token.name, e.target.value)}
                            placeholder=""
                            disabled={!isConnected || !token.address}
                          />
                        </td>
                      )}

                      {/* Wrapped Balance (clickable) */}
                      <td>
                        <BalanceUI
                          token={token}
                          isSecretToken={true}
                          showBalanceLabel={false}
                          onBalanceClick={(balanceStr: string) => handleBalanceClick(token.name, balanceStr, 'unwrap')}
                          showCurrencyEquiv={false}
                        />
                      </td>
                    </tr>
                  )
                })}
          </tbody>
        </table>

        {/* Toggle button to expand/collapse the full token list */}
        {!isLoading && filteredTokens.length > 5 && (
          <div className="mt-2 text-center">
            <button onClick={() => setExpanded(!expanded)} className="text-blue-500 hover:underline">
              {expanded ? 'Show less' : 'Show all tokens'}
            </button>
          </div>
        )}
      </div>

      {/* Summary Row (Optional) */}
      {!isLoading && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-neutral-800 rounded">
          <p className="font-semibold mb-2">Transaction Summary</p>
          <p>{`Selected ${summary.wrapCount} token(s) to wrap and ${summary.unwrapCount} token(s) to unwrap.`}</p>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-5 my-5">
        <div className="flex flex-row items-center gap-4">
          <button
            onClick={handlePerformBatch}
            disabled={!isConnected}
            className="enabled:bg-gradient-to-r enabled:from-cyan-600 enabled:to-purple-600 enabled:hover:from-cyan-500 enabled:hover:to-purple-500 text-white font-extrabold py-4 px-8 rounded-lg disabled:bg-neutral-500"
          >
            Perform Batch Transaction
          </button>
        </div>
        <div>
          <FeeGrant />
        </div>
      </div>

      {/* Debug Info (optional) */}
      {debugMode && (
        <div className="text-sky-500 text-xs p-2 bg-blue-500/20 rounded mt-4">
          <div className="mb-2 font-semibold">Debug Info (batchOperations):</div>
          <pre>{JSON.stringify(batchOperations, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

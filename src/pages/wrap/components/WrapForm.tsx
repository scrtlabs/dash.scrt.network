import { useState, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { tokens } from 'utils/config'
import { WrapService } from 'services/wrap.service'
import { NotificationService } from 'services/notification.service'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { useUserPreferencesStore } from 'store/UserPreferences'
import BalanceUI from 'components/BalanceUI'
import FeeGrant from 'components/FeeGrant/FeeGrant'
import { WrappingMode } from 'types/WrappingMode'
import { GetBalanceError } from 'types/GetBalanceError'
import './wrap.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'

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

  function getBalanceSpecial(token: (typeof tokens)[number], isSecretToken: boolean) {
    const result = getBalance(token, isSecretToken)
    // If the store returns a special error string, return it directly.
    if (result === 'viewingKeyError') return 'viewingKeyError' as GetBalanceError
    if (result === 'GenericFetchError') return 'GenericFetchError' as GetBalanceError
    if (result instanceof BigNumber) return result
    // Otherwise null (still loading or no data).
    return null
  }

  function hasViewingKey(token: (typeof tokens)[number]): boolean {
    if (!token.address) return true

    const secretBalance = getBalanceSpecial(token, true)
    if (secretBalance === 'viewingKeyError') return false
    if (secretBalance === 'GenericFetchError') return false
    if (secretBalance === null) return false

    return true
  }

  /**
   * Filter the tokens based on the toggles.
   */
  const filteredTokens = useMemo(() => {
    return tokens.filter((token) => {
      // If hideNoViewingKey is active, skip if we do NOT have a key.
      if (hideNoViewingKey && !hasViewingKey(token)) {
        return false
      }

      if (hideZeroBalance) {
        const unwrapped = getBalanceSpecial(token, false)
        const secret = token.address ? getBalanceSpecial(token, true) : null

        // Convert to BigNumber(0) if not a real BigNumber.
        const unwrappedBN = unwrapped instanceof BigNumber ? unwrapped : new BigNumber(0)
        const secretBN = secret instanceof BigNumber ? secret : new BigNumber(0)
        const total = unwrappedBN.plus(secretBN)

        if (total.isZero()) {
          return false
        }
      }
      return true
    })
  }, [hideZeroBalance, hideNoViewingKey, balanceMapping, ibcBalanceMapping, tokens])

  // Updates the amount value for a given token.
  const updateAmount = (tokenName: string, amount: string) => {
    setBatchOperations((prev) => ({
      ...prev,
      [tokenName]: {
        ...prev[tokenName],
        amount
      }
    }))
  }

  // This function handles clicks on the BalanceUI.
  // When clicking on a balance it sets both the amount and the mode.
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
    setBatchOperations((prev) => {
      const current = prev[tokenName]?.direction || 'wrap'
      const newDirection = current === 'wrap' ? 'unwrap' : 'wrap'
      return {
        ...prev,
        [tokenName]: {
          direction: newDirection,
          amount: prev[tokenName]?.amount || ''
        }
      }
    })
  }

  /**
   * Build and broadcast a single transaction with multiple wrap/unwrap messages.
   */
  const handlePerformBatch = async () => {
    if (!isConnected) return

    // Build the items array.
    const items = []
    for (const token of filteredTokens) {
      const op = batchOperations[token.name]
      // Only include tokens for which an amount was provided.
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

      // Clear the UI.
      setBatchOperations({})
    } catch (error) {
      console.error(error)
      NotificationService.notify(`Batch transaction failed: ${error}`, 'error', toastId)
    }
  }

  const handleWrapAll = () => {
    // Create a new object to hold the updated batch operations.
    const newBatchOperations: {
      [tokenName: string]: {
        direction: 'wrap' | 'unwrap'
        amount: string
      }
    } = { ...batchOperations }

    // Loop through all tokens in your filtered list.
    for (const token of filteredTokens) {
      // Skip SCRT
      if (token.name === 'SCRT') continue

      const rawBalance = getBalanceSpecial(token, false)
      if (rawBalance instanceof BigNumber && rawBalance.gt(0)) {
        const amount = rawBalance.dividedBy(`1e${token.decimals}`).toString()
        // Update the batch operations for this token:
        newBatchOperations[token.name] = {
          direction: 'wrap',
          amount
        }
      }
    }

    // Update the state so the UI input fields display the computed amounts.
    setBatchOperations(newBatchOperations)
  }

  // Determine if we are still loading data.
  const isLoading = balanceMapping == null && ibcBalanceMapping == null

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-5">
        {/* Removed the standalone Wrap All Tokens button in favor of an integrated option */}
        <div className="flex flex-row items-center gap-4">
          <button
            onClick={handlePerformBatch}
            disabled={!isConnected}
            className="enabled:bg-gradient-to-r enabled:from-cyan-600 enabled:to-purple-600 enabled:hover:from-cyan-500 enabled:hover:to-purple-500 text-white font-extrabold py-2 px-4 rounded-lg disabled:bg-neutral-500"
          >
            Perform Batch Transaction
          </button>
        </div>
        <div>
          <FeeGrant />
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={hideZeroBalance} onChange={(e) => setHideZeroBalance(e.target.checked)} />
          <span>Hide tokens with 0 balance</span>
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={hideNoViewingKey} onChange={(e) => setHideNoViewingKey(e.target.checked)} />
          <span>Hide tokens without viewing key</span>
        </label>
      </div>

      <div className="overflow-x-auto bg-gray-200 dark:bg-neutral-700 p-4 rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-300 dark:border-neutral-600">
              <th className="py-2 text-center">Token</th>
              <th className="py-2 text-center">Unwrapped Balance</th>
              <th className="py-2 text-center"></th>
              {/* Added integrated wrap-all option in the Amount header */}
              <th className="py-2 text-center">
                Amount{' '}
                <span
                  onClick={handleWrapAll}
                  className="cursor-pointer text-xs text-blue-500 underline hover:text-blue-400"
                  title="Fill in all tokens with their unwrapped balance"
                >
                  Wrap All
                </span>
              </th>
              <th className="py-2 text-center"></th>
              <th className="py-2 text-center">Wrapped balance</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? // Show 6 animated skeleton rows while loading.
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-neutral-600 last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gray-300 dark:bg-neutral-600 rounded-full animate-pulse"></div>
                        <div className="font-semibold bg-gray-300 dark:bg-neutral-600 rounded animate-pulse w-12 h-4"></div>
                      </div>
                    </td>
                    <td>
                      <div className="bg-gray-300 dark:bg-neutral-600 animate-pulse rounded w-20 h-6 mx-auto"></div>
                    </td>
                    <td>
                      <button className="p-2 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700">
                        <FontAwesomeIcon icon={faArrowRight} />
                      </button>
                    </td>
                    <td className="text-center">
                      <div className="bg-gray-300 dark:bg-neutral-600 animate-pulse rounded w-20 h-6 mx-auto"></div>
                    </td>
                    <td>
                      <button className="p-2 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700">
                        <FontAwesomeIcon icon={faArrowRight} />
                      </button>
                    </td>
                    <td>
                      <div className="bg-gray-300 dark:bg-neutral-600 animate-pulse rounded w-20 h-6 mx-auto"></div>
                    </td>
                  </tr>
                ))
              : // Otherwise render the actual token rows.
                filteredTokens.map((token) => {
                  // Get current operation or default to wrap mode.
                  const currentOp = batchOperations[token.name] || { direction: 'wrap', amount: '' }
                  return (
                    <tr key={token.name} className="border-b border-gray-100 dark:border-neutral-600 last:border-0">
                      {/* Token Info */}
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={`/img/assets/${token.image}`}
                            alt={`${token.name} logo`}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="font-semibold justify-center">{token.name}</div>
                        </div>
                      </td>

                      {/* Unwrapped Balance */}
                      <td>
                        <BalanceUI
                          token={token}
                          isSecretToken={false}
                          showBalanceLabel={false}
                          // When clicking the unwrapped balance, we want to wrap tokens.
                          onBalanceClick={(balanceStr: string) => handleBalanceClick(token.name, balanceStr, 'wrap')}
                          showCurrencyEquiv={false}
                        />
                      </td>

                      {/* Operation Toggle */}
                      <td className="text-center">
                        <button
                          onClick={() => toggleDirection(token.name)}
                          disabled={!isConnected || !token.address}
                          title={
                            (batchOperations[token.name]?.direction || 'wrap') === 'wrap'
                              ? 'Wrap (click to toggle to Unwrap)'
                              : 'Unwrap (click to toggle to Wrap)'
                          }
                          className="p-2 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700"
                        >
                          {(batchOperations[token.name]?.direction || 'wrap') === 'wrap' ? (
                            <FontAwesomeIcon icon={faArrowRight} />
                          ) : (
                            <FontAwesomeIcon icon={faArrowLeft} />
                          )}
                        </button>
                      </td>

                      {/* Amount Input */}
                      <td className="text-center">
                        <input
                          type="number"
                          className="no-spinner text-center w-[90px] rounded px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600"
                          value={currentOp.amount}
                          onChange={(e) => updateAmount(token.name, e.target.value)}
                          placeholder=""
                          disabled={!isConnected || !token.address}
                        />
                      </td>

                      {/* Operation Toggle */}
                      <td className="text-center">
                        <button
                          onClick={() => toggleDirection(token.name)}
                          disabled={!isConnected || !token.address}
                          title={
                            (batchOperations[token.name]?.direction || 'wrap') === 'wrap'
                              ? 'Wrap (click to toggle to Unwrap)'
                              : 'Unwrap (click to toggle to Wrap)'
                          }
                          className="text-center p-2 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700"
                        >
                          {(batchOperations[token.name]?.direction || 'wrap') === 'wrap' ? (
                            <FontAwesomeIcon icon={faArrowRight} />
                          ) : (
                            <FontAwesomeIcon icon={faArrowLeft} />
                          )}
                        </button>
                      </td>

                      {/* Wrapped Balance */}
                      <td className="text-center">
                        <div className="flex flex-col items-start">
                          <BalanceUI
                            token={token}
                            isSecretToken={true}
                            showBalanceLabel={false}
                            onBalanceClick={(balanceStr: string) =>
                              handleBalanceClick(token.name, balanceStr, 'unwrap')
                            }
                            showCurrencyEquiv={false}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
          </tbody>
        </table>
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

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
import { faArrowLeft, faArrowRight, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { faCircle } from '@fortawesome/free-regular-svg-icons'
import { Tooltip } from '@mui/material'

export default function WrapAllTokens() {
  const { secretNetworkClient, feeGrantStatus, isConnected, getBalance, balanceMapping, setBalanceMapping } =
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
      if (hideZeroBalance && hasViewingKey(token)) {
        const unwrapped = getBalanceSpecial(token, false)
        const secret = getBalanceSpecial(token, true)

        const unwrappedBN = unwrapped instanceof BigNumber ? unwrapped : new BigNumber(0)
        const secretBN = secret instanceof BigNumber ? secret : new BigNumber(0)
        const total = unwrappedBN.plus(secretBN)

        if (total.isZero()) {
          return false
        }
      }
      return true
    })
  }, [hideZeroBalance, hideNoViewingKey, balanceMapping])

  const tokensToDisplay = useMemo(() => {
    // Sort filtered tokens by unwrapped (public) balance descending.
    const sortedTokens = [...filteredTokens].sort((a, b) => {
      const balanceAResult = getBalanceSpecial(a, false)
      const balanceBResult = getBalanceSpecial(b, false)
      const balanceA = balanceAResult instanceof BigNumber ? balanceAResult : new BigNumber(0)
      const balanceB = balanceBResult instanceof BigNumber ? balanceBResult : new BigNumber(0)
      return balanceB.minus(balanceA).toNumber()
    })

    // If expanded, display all tokens.
    if (expanded) return sortedTokens

    // Otherwise, take the top 5 tokens.
    const topTokens = sortedTokens.slice(0, 5)

    // Also include any tokens that have been selected via batchOperations.
    const selectedTokens = sortedTokens.filter((token) => batchOperations[token.name])
    const unionTokens = [...topTokens]
    selectedTokens.forEach((token) => {
      if (!unionTokens.find((t) => t.name === token.name)) {
        unionTokens.push(token)
      }
    })
    return unionTokens
  }, [expanded, filteredTokens, batchOperations])

  // Update the amount value for a given token.
  const updateAmount = (tokenName: string, amount: string) => {
    setBatchOperations((prev) => {
      // If the token exists in the batch operations, just update the amount
      if (prev[tokenName]) {
        return {
          ...prev,
          [tokenName]: {
            ...prev[tokenName],
            amount
          }
        }
      }
      // If the token doesn't exist yet or has no direction set, create it with "wrap" as default
      else {
        return {
          ...prev,
          [tokenName]: {
            direction: 'wrap',
            amount
          }
        }
      }
    })
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

  // Toggle the operation direction between 'wrap', 'unwrap', and 'nothing'.
  const toggleDirection = (tokenName: string) => {
    setBatchOperations((prev: any) => {
      const token = tokens.find((t) => t.name === tokenName)
      if (!token) return prev

      const unwrappedBalance = getBalanceSpecial(token, false)
      const wrappedBalance = getBalanceSpecial(token, true)

      // If token is not in batchOperations yet, add it with default wrap direction
      if (!prev[tokenName]) {
        // Default to wrap if there's unwrapped balance, otherwise unwrap
        const defaultDirection = unwrappedBalance instanceof BigNumber && !unwrappedBalance.isZero() ? 'wrap' : 'unwrap'

        // Get the appropriate balance amount based on the chosen direction
        const balanceToUse = defaultDirection === 'wrap' ? unwrappedBalance : wrappedBalance

        // Calculate the human-readable amount if we have a valid balance
        let amountToUse = ''
        if (balanceToUse instanceof BigNumber && !balanceToUse.isZero()) {
          const decimals = token.decimals || 6
          amountToUse = balanceToUse.dividedBy(new BigNumber(10).pow(decimals)).toString()
        }

        return {
          ...prev,
          [tokenName]: {
            direction: defaultDirection,
            amount: amountToUse
          }
        }
      }

      // Define the next direction in the cycle: wrap -> unwrap -> nothing -> wrap
      let newDirection
      if (prev[tokenName].direction === 'wrap') {
        newDirection = 'unwrap'
      } else if (prev[tokenName].direction === 'unwrap') {
        // When going to "nothing", remove the token from batch operations entirely
        const newOps = { ...prev }
        delete newOps[tokenName]
        return newOps
      } else {
        newDirection = 'wrap'
      }

      // Get the appropriate balance amount based on the chosen direction
      let newAmount = newDirection === 'wrap' ? unwrappedBalance : wrappedBalance

      let amountToUse = ''
      if (newAmount instanceof BigNumber) {
        const decimals = token.decimals || 6
        amountToUse = newAmount.dividedBy(new BigNumber(10).pow(decimals)).toString()
      }

      return {
        ...prev,
        [tokenName]: {
          ...prev[tokenName],
          direction: newDirection,
          amount: amountToUse
        }
      }
    })
  }

  // Handle checkbox change for a token
  const handleChange = (tokenName: string, checked: boolean) => {
    if (checked) {
      // When checking the box, add the token to batch operations with default direction
      // and a meaningful amount based on available balance
      const token = tokens.find((t) => t.name === tokenName)
      if (!token) return
      // Determine which balance to use based on the direction we'll choose
      const unwrappedBalance = getBalanceSpecial(token, false)
      const wrappedBalance = getBalanceSpecial(token, true)

      // Default to wrap if there's unwrapped balance, otherwise unwrap
      const defaultDirection = unwrappedBalance instanceof BigNumber && !unwrappedBalance.isZero() ? 'wrap' : 'unwrap'

      // Get the appropriate balance amount based on the chosen direction
      const balanceToUse = defaultDirection === 'wrap' ? unwrappedBalance : wrappedBalance

      // Calculate the human-readable amount if we have a valid balance
      let amountToUse = ''
      if (balanceToUse instanceof BigNumber && !balanceToUse.isZero()) {
        const decimals = token.decimals || 6
        amountToUse = balanceToUse.dividedBy(new BigNumber(10).pow(decimals)).toString()
      }

      setBatchOperations((prev) => ({
        ...prev,
        [tokenName]: {
          direction: defaultDirection,
          amount: amountToUse
        }
      }))
    } else {
      // When unchecking, remove the token from batch operations
      setBatchOperations((prev) => {
        const newOps = { ...prev }
        delete newOps[tokenName]
        return newOps
      })
    }
  }

  // Perform the entire batch transaction.
  const handlePerformBatch = async () => {
    if (!isConnected) return

    const items = []
    for (const tokenName in batchOperations) {
      const op = batchOperations[tokenName]
      // Ensure a valid amount is specified.
      if (op && op.amount && parseFloat(op.amount) > 0) {
        // Find the corresponding token from the full tokens array.
        const token = tokens.find((t) => t.name === tokenName)
        if (token.name === 'SCRT' && op.direction === 'wrap') {
          const rawBalance = getBalanceSpecial(token, false)
          if (rawBalance instanceof BigNumber) {
            const amount = parseFloat(rawBalance.dividedBy(`1e${token.decimals}`).toString())
            const requestedAmount = parseFloat(op.amount)
            const minReserve = 0.5

            // Calculate available amount while maintaining minimum reserve
            const safeAmount = Math.max(0, amount - minReserve)
            const adjustedAmount = Math.min(requestedAmount, safeAmount)

            if (adjustedAmount > 0) {
              items.push({
                token,
                amount: adjustedAmount.toString(),
                wrappingMode: op.direction
              })
            }
          }
        } else if (token) {
          items.push({
            token,
            amount: op.amount,
            wrappingMode: op.direction // 'wrap' or 'unwrap'
          })
        }
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
      setBalanceMapping()
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
      if (token.name === 'SCRT') {
        continue
      }
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
      if (token.name === 'SCRT') {
        continue
      }
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

    Object.values(batchOperations).forEach((op) => {
      if (op && op.amount && parseFloat(op.amount) > 0) {
        if (op.direction === 'wrap') {
          wrapCount++
        } else if (op.direction === 'unwrap') {
          unwrapCount++
        }
      }
    })

    return {
      wrapCount,
      unwrapCount
    }
  }, [batchOperations])

  const isLoading = balanceMapping == null

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      {/* Top Toggles & Global Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* Left: Toggles */}
        <div className="flex flex-wrap items-center gap-4">
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
        </div>
        {/* Right: Global Actions */}
        <div className="flex items-center gap-4">
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
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto bg-gray-200 dark:bg-neutral-700 p-4 rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-300 dark:border-neutral-600 text-base">
              <th className="py-2 text-center">Token</th>
              <th className="py-2 text-center">Unwrapped Balance</th>
              <Tooltip
                title={
                  'Wrapping (->) means converting a publicly visible token into a Secret version with confidential features. Unwrapping (<-) converts it back to the public version.'
                }
                placement="bottom"
                arrow
              >
                <th className="py-2 text-center cursor-pointer">
                  Direction
                  <span className="ml-1 text-neutral-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </span>
                </th>
              </Tooltip>
              {showAmountInput && (
                <>
                  <th className="py-2 text-center">Amount</th>
                  <Tooltip
                    title={
                      'Wrapping (->) means converting a publicly visible token into a Secret version with confidential features. Unwrapping (<-) converts it back to the public version.'
                    }
                    placement="bottom"
                    arrow
                  >
                    <th className="py-2 text-center cursor-pointer">
                      Direction
                      <span className="ml-1 text-neutral-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                        <FontAwesomeIcon icon={faInfoCircle} />
                      </span>
                    </th>
                  </Tooltip>
                </>
              )}
              <th className="py-2 text-center">Wrapped Balance</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-neutral-600 last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={false} />
                        <div className="w-12 h-12 bg-gray-300 dark:bg-neutral-600 rounded-full animate-pulse" />
                        <div className="font-semibold bg-gray-300 dark:bg-neutral-600 rounded animate-pulse w-14 h-6" />
                      </div>
                    </td>
                    <td>
                      <div className="bg-gray-300 dark:bg-neutral-600 animate-pulse rounded w-20 h-6 mx-auto" />
                    </td>
                    <td className="text-center">
                      <button
                        disabled
                        className="p-2 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                      >
                        <div className="flex items-center justify-center w-6 h-6">
                          <FontAwesomeIcon icon={faCircle} size="xl" className="text-gray-600" />
                        </div>
                      </button>
                    </td>
                    {showAmountInput && (
                      <>
                        <td className="text-center">
                          <div className="bg-gray-300 dark:bg-neutral-600 animate-pulse rounded w-20 h-6 mx-auto" />
                        </td>
                        <td className="text-center">
                          <button
                            disabled
                            className="p-2 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                          >
                            <div className="flex items-center justify-center w-6 h-6">
                              <FontAwesomeIcon icon={faCircle} size="xl" className="text-gray-600" />
                            </div>
                          </button>
                        </td>
                      </>
                    )}
                    <td>
                      <div className="bg-gray-300 dark:bg-neutral-600 animate-pulse rounded w-20 h-6 mx-auto" />
                    </td>
                  </tr>
                ))
              : tokensToDisplay.map((token) => {
                  return (
                    <tr key={token.name} className="border-b border-gray-100 dark:border-neutral-600 last:border-0">
                      {/* Token Info with Checkbox */}
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="form-checkbox"
                            checked={!!batchOperations[token.name]}
                            onChange={(e) => handleChange(token.name, e.target.checked)}
                            disabled={!isConnected || !token.address}
                          />
                          <img
                            src={`/img/assets/${token.image}`}
                            alt={`${token.name} logo`}
                            className="w-12 h-12 rounded-full"
                          />
                          <div className="font-semibold justify-center text-base">{token.name}</div>
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

                      {/* Direction Toggle Button*/}
                      <td className="text-center">
                        <button
                          onClick={() => toggleDirection(token.name)}
                          disabled={!isConnected || !token.address}
                          className="p-2 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700"
                          title={
                            !batchOperations[token.name]
                              ? 'No direction selected (click to set to Wrap)'
                              : batchOperations[token.name]?.direction === 'wrap'
                                ? 'Currently set to Wrap (click to switch to Unwrap)'
                                : 'Currently set to Unwrap (click to remove from batch)'
                          }
                        >
                          {!batchOperations[token.name] ? (
                            <div className="flex items-center justify-center w-6 h-6">
                              <FontAwesomeIcon icon={faCircle} size="xl" className="text-gray-600" />
                            </div>
                          ) : batchOperations[token.name]?.direction === 'wrap' ? (
                            <div className="flex items-center justify-center w-6 h-6">
                              <FontAwesomeIcon icon={faArrowRight} size="xl" />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-6 h-6">
                              <FontAwesomeIcon icon={faArrowLeft} size="xl" />
                            </div>
                          )}
                        </button>
                      </td>

                      {/* Amount Input (optional) */}
                      {showAmountInput && (
                        <>
                          <td className="text-center">
                            <input
                              type="number"
                              className="no-spinner text-center w-[90px] rounded px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600"
                              value={batchOperations[token.name]?.amount || ''}
                              onChange={(e) => updateAmount(token.name, e.target.value)}
                              placeholder=""
                              disabled={!isConnected || !token.address}
                            />
                          </td>

                          <td className="text-center">
                            <button
                              onClick={() => toggleDirection(token.name)}
                              disabled={!isConnected || !token.address}
                              className="p-2 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700"
                              title={
                                !batchOperations[token.name]?.direction
                                  ? 'Click to toggle to Wrap'
                                  : batchOperations[token.name]?.direction === 'wrap'
                                    ? 'Currently set to Wrap (click to switch to Unwrap)'
                                    : 'Currently set to Unwrap (click to switch to Wrap)'
                              }
                            >
                              {!batchOperations[token.name] ? (
                                <div className="flex items-center justify-center w-6 h-6">
                                  <FontAwesomeIcon icon={faCircle} size="xl" className="text-gray-600" />
                                </div>
                              ) : batchOperations[token.name]?.direction === 'wrap' ? (
                                <div className="flex items-center justify-center w-6 h-6">
                                  <FontAwesomeIcon icon={faArrowRight} size="xl" />
                                </div>
                              ) : (
                                <div className="flex items-center justify-center w-6 h-6">
                                  <FontAwesomeIcon icon={faArrowLeft} size="xl" />
                                </div>
                              )}
                            </button>
                          </td>
                        </>
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
          <div className="border-t border-gray-300 mt-2 pt-2 text-center">
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
            className="enabled:bg-gradient-to-r enabled:from-cyan-600 enabled:to-purple-600 enabled:hover:from-cyan-500 enabled:hover:to-purple-500 text-white font-extrabold py-4 px-9 rounded-lg disabled:bg-neutral-500"
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

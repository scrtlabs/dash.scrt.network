import { useState } from 'react'
import BigNumber from 'bignumber.js'

import { tokens } from 'utils/config'
import { WrapService } from 'services/wrap.service'
import { NotificationService } from 'services/notification.service'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { useUserPreferencesStore } from 'store/UserPreferences'
import BalanceUI from 'components/BalanceUI'
import FeeGrant from 'components/FeeGrant/FeeGrant'
import { WrappingMode } from 'types/WrappingMode'

export default function WrapAllTokens() {
  const { secretNetworkClient, feeGrantStatus, isConnected, getBalance } = useSecretNetworkClientStore()
  const { theme, debugMode } = useUserPreferencesStore()

  // Tracks user's choice (wrap/unwrap/none) and amount for each token
  const [batchOperations, setBatchOperations] = useState<{
    [tokenName: string]: {
      direction: 'none' | 'wrap' | 'unwrap'
      amount: string
    }
  }>({})

  const updateDirection = (tokenName: string, direction: 'none' | 'wrap' | 'unwrap') => {
    setBatchOperations((prev) => ({
      ...prev,
      [tokenName]: {
        ...prev[tokenName],
        direction
      }
    }))
  }

  const updateAmount = (tokenName: string, amount: string) => {
    setBatchOperations((prev) => ({
      ...prev,
      [tokenName]: {
        ...prev[tokenName],
        amount
      }
    }))
  }

  /**
   * Build and broadcast a single transaction with multiple wrap/unwrap messages
   */
  const handlePerformBatch = async () => {
    if (!isConnected) return

    // Build the items array
    const items = []
    for (const token of tokens) {
      const op = batchOperations[token.name]
      if (op && op.direction !== 'none' && op.amount && parseFloat(op.amount) > 0) {
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

      // Clear the UI
      setBatchOperations({})
    } catch (error) {
      console.error(error)
      NotificationService.notify(`Batch transaction failed: ${error}`, 'error', toastId)
    }
  }

  /**
   * "Wrap All" button
   */
  const handleWrapAll = async () => {
    if (!isConnected) return

    const items = []
    for (const token of tokens) {
      if (token.address) {
        const rawBalance = getBalance(token, false) // unwrapped
        if (rawBalance && rawBalance instanceof BigNumber && rawBalance.gt(0)) {
          const wrapableSCRT =
            token.name === 'SCRT' ? rawBalance.minus(new BigNumber(1).times(`1e${token.decimals}`)) : new BigNumber(0)

          const amount = wrapableSCRT.gt(0)
            ? wrapableSCRT.dividedBy(`1e${token.decimals}`).toFixed(token.decimals)
            : rawBalance.dividedBy(`1e${token.decimals}`).toFixed(token.decimals)

          items.push({
            token,
            amount,
            wrappingMode: 'wrap' as WrappingMode
          })
        }
      }
    }

    if (!items.length) {
      NotificationService.notify('No tokens with unwrapped balance', 'error')
      return
    }

    const toastId = NotificationService.notify('Wrapping all tokens...', 'loading')
    try {
      await WrapService.performBatchWrapping({
        items,
        secretNetworkClient,
        feeGrantStatus
      })
      NotificationService.notify('Successfully wrapped all tokens!', 'success', toastId)
    } catch (error) {
      console.error(error)
      NotificationService.notify(`Wrap All failed: ${error}`, 'error', toastId)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      {/* Example: "Wrap All" button */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <button
          onClick={handleWrapAll}
          disabled={!isConnected}
          className="enabled:bg-gradient-to-r enabled:from-cyan-600 enabled:to-purple-600 enabled:hover:from-cyan-500 enabled:hover:to-purple-500 text-white font-extrabold py-2 px-4 rounded-lg disabled:bg-neutral-500"
        >
          Wrap All Tokens
        </button>
        <button
          onClick={handlePerformBatch}
          disabled={!isConnected}
          className="enabled:bg-gradient-to-r enabled:from-cyan-600 enabled:to-purple-600 enabled:hover:from-cyan-500 enabled:hover:to-purple-500 text-white font-extrabold py-2 px-4 rounded-lg disabled:bg-neutral-500"
        >
          Perform Batch Transaction
        </button>
      </div>

      {/* Fee Grant Section */}
      <div className="my-6">
        <FeeGrant />
      </div>

      <div className="overflow-x-auto bg-gray-200 dark:bg-neutral-700 p-4 rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-300 dark:border-neutral-600">
              <th className="py-2 text-left">Token</th>
              <th className="py-2 text-left">Unwrapped Balance</th>
              <th className="py-2 text-left">Secret Balance</th>
              <th className="py-2 text-center">Operation</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token) => {
              const currentOp = batchOperations[token.name] || {
                direction: 'none',
                amount: ''
              }
              return (
                <tr key={token.name} className="border-b border-gray-100 dark:border-neutral-600 last:border-0">
                  {/* Token Info */}
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={`/img/assets/${token.image}`}
                        alt={`${token.name} logo`}
                        className="w-6 h-6 rounded-full"
                      />
                      <div className="font-bold">{token.name}</div>
                    </div>
                  </td>

                  {/* Unwrapped Balance */}
                  <td>
                    {/* ADD: Pass onBalanceClick so that clicking the displayed balance sets the amount */}
                    <BalanceUI
                      token={token}
                      isSecretToken={false}
                      showBalanceLabel={false}
                      onBalanceClick={(balanceStr: string) => updateAmount(token.name, balanceStr)} // ADD
                    />
                  </td>

                  {/* Secret Balance */}
                  <td>
                    {token.address ? (
                      <BalanceUI
                        token={token}
                        isSecretToken={true}
                        showBalanceLabel={false}
                        onBalanceClick={(balanceStr: string) => updateAmount(token.name, balanceStr)} // ADD
                      />
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>

                  {/* Operation selection */}
                  <td className="text-center">
                    <select
                      className="rounded px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600"
                      value={currentOp.direction}
                      onChange={(e) => updateDirection(token.name, e.target.value as 'none' | 'wrap' | 'unwrap')}
                      disabled={!isConnected || !token.address}
                    >
                      <option value="none">None</option>
                      <option value="wrap">Wrap</option>
                      <option value="unwrap">Unwrap</option>
                    </select>
                  </td>

                  {/* Amount input */}
                  <td>
                    <input
                      type="number"
                      className="text-right w-[90px] rounded px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600"
                      value={currentOp.amount}
                      onChange={(e) => updateAmount(token.name, e.target.value)}
                      placeholder="0"
                      disabled={!isConnected || !token.address || currentOp.direction === 'none'}
                    />
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

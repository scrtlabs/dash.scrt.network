import React, { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { useUserPreferencesStore } from 'store/UserPreferences'
import { tokens } from 'utils/config'
import { WrapService } from 'services/wrap.service'
import toast from 'react-hot-toast'

interface ISelectableToken {
  symbol: string
  balance: BigNumber
  checked: boolean
}

export default function BulkWrapPage() {
  const { secretNetworkClient, feeGrantStatus, isConnected, getBalance } = useSecretNetworkClientStore()
  const { theme } = useUserPreferencesStore()

  const [tokenList, setTokenList] = useState<ISelectableToken[]>([])

  // On connect, fetch unwrapped balances
  useEffect(() => {
    if (!isConnected) return

    const fetchBalances = async () => {
      const newList: ISelectableToken[] = []
      for (const t of tokens) {
        try {
          const bal = getBalance(t, false)
          // Skip if null or errors
          if (bal === null || bal === 'viewingKeyError' || bal === 'GenericFetchError') {
            continue
          }

          if (bal.gt(0)) {
            newList.push({
              symbol: t.name,
              balance: bal,
              checked: false
            })
          }
        } catch (e) {
          console.error(e)
        }
      }
      setTokenList(newList)
    }

    fetchBalances()
  }, [isConnected, getBalance])

  // Toggle selection
  const toggleCheck = (symbol: string) => {
    setTokenList((prev) => prev.map((item) => (item.symbol === symbol ? { ...item, checked: !item.checked } : item)))
  }

  // Select/Unselect all
  const toggleSelectAll = () => {
    const allChecked = tokenList.every((t) => t.checked)
    setTokenList((prev) => prev.map((t) => ({ ...t, checked: !allChecked })))
  }

  const handleWrapSelected = async () => {
    if (!secretNetworkClient) return

    const selectedTokens = tokenList.filter((t) => t.checked)
    if (selectedTokens.length === 0) {
      toast.error('No tokens selected')
      return
    }

    // Build the array for the service
    const tokensToWrap = selectedTokens.map((item) => {
      const amountStr = item.balance.dividedBy(`1e${6}`).toFixed(6, BigNumber.ROUND_DOWN)

      const token = tokens.find((t) => t.name === item.symbol)
      return {
        token: token!,
        amount: amountStr
      }
    })

    const loadingId = toast.loading('Wrapping selected tokens...')

    try {
      await WrapService.performMultipleWrapping({
        tokensToWrap,
        secretNetworkClient,
        feeGrantStatus
      })
      toast.success('Successfully wrapped selected tokens!', { id: loadingId })
      // Optionally refetch balances
    } catch (err: any) {
      console.error(err)
      toast.error(`Bulk wrap failed: ${err.message}`, { id: loadingId })
    }
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 font-bold">Bulk Wrap</h1>
      {!isConnected ? (
        <p>Please connect your wallet to see your tokens.</p>
      ) : tokenList.length === 0 ? (
        <p>You have no unwrapped tokens with a positive balance.</p>
      ) : (
        <>
          <button onClick={toggleSelectAll} className="bg-gray-200 p-2 text-sm rounded mb-2">
            Select / Unselect All
          </button>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Wrap?</th>
                <th className="border p-2 text-left">Token</th>
                <th className="border p-2 text-left">Balance (raw)</th>
              </tr>
            </thead>
            <tbody>
              {tokenList.map((item) => (
                <tr key={item.symbol}>
                  <td className="border p-2">
                    <input type="checkbox" checked={item.checked} onChange={() => toggleCheck(item.symbol)} />
                  </td>
                  <td className="border p-2">{item.symbol}</td>
                  <td className="border p-2">{item.balance.toString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={handleWrapSelected}
            className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded mt-4"
          >
            Wrap Selected
          </button>
        </>
      )}
    </div>
  )
}

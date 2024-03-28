import { useSecretNetworkClientStore } from 'store/secretNetworkClient'

function AvailableBalance() {
  const { scrtBalance } = useSecretNetworkClientStore()

  return (
    <div className="flex-1">
      <div className="font-bold mb-2">Available Balance</div>
      <div className="mb-1">
        <span className="font-medium font-mono">
          {scrtBalance ? (
            <>{Number(scrtBalance) * 0.000001}</>
          ) : (
            <div className="animate-pulse inline-block">
              <div className="h-5 w-24 bg-white dark:bg-neutral-800 rounded-xl"></div>
            </div>
          )}
        </span>
        <span className="text-xs font-semibold text-neutral-400"> SCRT</span>
      </div>
      <div className="text-xs text-neutral-400 font-medium font-mono">
        {scrtBalance ? (
          <>{`$0.00`}</>
        ) : (
          <div className="animate-pulse inline-block">
            <div className="h-5 w-12 bg-white dark:bg-neutral-800 rounded-xl"></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AvailableBalance

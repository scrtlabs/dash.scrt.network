import { Nullable } from 'types/Nullable'

type Props = {
  stakedAmount?: Nullable<Number>
}

function StakingAmount(props: Props) {
  return (
    <div className="flex-1">
      <div className="font-bold mb-2">Staking Amount</div>
      <div className="mb-1">
        <span className="text-base font-medium font-mono">
          {props.stakedAmount ? (
            <>{`${props.stakedAmount} `}</>
          ) : (
            <div className="animate-pulse inline-block">
              <div className="h-5 w-24 bg-white dark:bg-neutral-800 rounded-xl"></div>
            </div>
          )}
        </span>
        <span className="text-xs font-semibold text-neutral-400"> SCRT</span>
      </div>
      <div className="text-xs text-neutral-400 font-medium font-mono">
        {false ? (
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

export default StakingAmount

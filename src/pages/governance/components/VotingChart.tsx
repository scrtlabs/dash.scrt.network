import Tooltip from '@mui/material/Tooltip'
import { formatNumber } from 'utils/commons'

type Props = {
  votes?: {
    yes: number
    abstain: number
    no: number
    noWithVeto: number
  }
  totalBondedStake?: number
}

function VotingChart(props: Props) {
  const isValidVotingData = (): boolean => {
    return (
      props.votes &&
      props.totalBondedStake &&
      props.votes.yes + props.votes.no + props.votes.noWithVeto <= props.totalBondedStake
    )
  }

  if (!isValidVotingData()) {
    return
  }

  const getPercentageOfTotal = (amount: number): number => {
    return (amount / props.totalBondedStake) * 100
  }

  return (
    <div className="mt-4">
      <div className="w-full bg-gray-200 rounded-full h-1 mb-4 dark:bg-gray-700 flex overflow-hidden">
        <Tooltip
          title={`Yes (${formatNumber(props.votes.yes / 1e6)} SCRT/${getPercentageOfTotal(props.votes.yes).toFixed(
            2
          )}%)`}
          placement="bottom"
          arrow
        >
          <div
            className="bg-emerald-600 dark:bg-emerald-500 w-[45%]"
            style={{ width: `${getPercentageOfTotal(props.votes.yes)}%` }}
          ></div>
        </Tooltip>

        <Tooltip
          title={`No (${formatNumber(props.votes.no / 1e6)} SCRT/${getPercentageOfTotal(props.votes.no).toFixed(2)}%)`}
          placement="bottom"
          arrow
        >
          <div
            className="bg-rose-600 dark:bg-rose-500"
            style={{ width: `${getPercentageOfTotal(props.votes.no)}%` }}
          ></div>
        </Tooltip>

        <Tooltip
          title={`No with Veto (${formatNumber(props.votes.noWithVeto / 1e6)} SCRT/${getPercentageOfTotal(
            props.votes.noWithVeto
          ).toFixed(2)}%)`}
          placement="bottom"
          arrow
        >
          <div
            className="bg-pink-600 dark:bg-pink-500"
            style={{ width: `${getPercentageOfTotal(props.votes.noWithVeto)}%` }}
          ></div>
        </Tooltip>

        <Tooltip
          title={`Abstain (${formatNumber(props.votes.abstain / 1e6)} SCRT/${getPercentageOfTotal(
            props.votes.abstain
          ).toFixed(2)}%)`}
          placement="bottom"
          arrow
        >
          <div
            className="bg-gray-200 dark:bg-gray-700"
            style={{ width: `${getPercentageOfTotal(props.votes.abstain)}%` }}
          ></div>
        </Tooltip>
      </div>
    </div>
  )
}

export default VotingChart

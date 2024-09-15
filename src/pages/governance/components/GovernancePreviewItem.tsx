import { ProposalStatus } from 'secretjs'
import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import VotingChart from './VotingChart'
import ReviewCount from './ReviewCount' // Uncomment if you have this component
import ExpeditedBadge from './ExpeditedBadge'

type Props = {
  id: string
  title?: string
  reviewsCount?: number
  votes?: {
    yes: number
    abstain: number
    no: number
    noWithVeto: number
  }
  totalBondedStake: number
  status?: ProposalStatus
  endingTime?: Date
  proposalStatus: ProposalStatus
  isExpedited: boolean
}

function GovernancePreviewItem(props: Props) {
  return (
    <Link
      to={`/governance/id/${props.id}`}
      className="bg-white dark:bg-neutral-800 p-4 flex flex-col h-full rounded-xl overflow-hidden dark:hover:bg-neutral-700 hover:bg-neutral-200 transition-colors"
    >
      {/* Status */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center">
          <StatusBadge proposalStatus={props.proposalStatus} />
          <ReviewCount count={props.reviewsCount} />
        </div>
        {props.isExpedited ? <ExpeditedBadge /> : null}
      </div>

      {/* Title */}
      {props.title && <div className="font-bold">{`#${props.id}: ${props.title}`}</div>}
      {/* Voting Chart Bar */}
      <div className="mt-auto">
        <VotingChart totalBondedStake={props.totalBondedStake} votes={props.votes} />
      </div>
    </Link>
  )
}

export default GovernancePreviewItem

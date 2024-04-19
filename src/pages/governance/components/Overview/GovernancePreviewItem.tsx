import StatusBadge from './StatusBadge'
import ReviewCount from './ReviewCount'
import VotingChart from './VotingChart'
import { ProposalStatus } from 'secretjs'
import { Link } from 'react-router-dom'

type Props = {
  id: string
  title?: string
  // reviewsCount?: number
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
}

function GovernancePreviewItem(props: Props) {
  return (
    <Link
      to={`/governance/id/${props.id}`}
      className="bg-white group-hover:bg-white/95 dark:bg-neutral-800 group-hover:dark:bg-neutral-800/95 p-4 flex flex-col h-full rounded-xl overflow-hidden"
    >
      {/* Status */}
      <div className="mb-2 flex items-center gap-4">
        <StatusBadge proposalStatus={props.proposalStatus} />
        {/* <ReviewCount count={props.reviewsCount} /> */}
      </div>
      {/* Title */}
      {props.title && <div className="font-bold">{`#${props.id}: ${props.title}`}</div>}
      {/* VotingChart / Bar */}
      <div className="mt-auto">
        <VotingChart totalBondedStake={props.totalBondedStake} votes={props.votes} />
      </div>
    </Link>
  )
}

export default GovernancePreviewItem

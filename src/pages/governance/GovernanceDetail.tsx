import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import governanceUtils from 'utils/governanceUtils'
import StatusBadge from './components/Overview/StatusBadge'
import { Nullable } from 'types/Nullable'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { formatNumber } from 'utils/commons'
import { Tooltip } from '@mui/material'

function GovernanceDetail() {
  const navigate = useNavigate()
  let { id } = useParams()

  // Redirect if the proposal is spam
  if (governanceUtils.spamProposalIds.includes(Number(id))) {
    navigate('/governance')
  }

  const [proposal, setProposal] = useState<Nullable<any>>(null)
  const [tally, setTally] = useState<Nullable<any>>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchProposalDetails = async () => {
      try {
        const [fetchedProposal, fetchedTally] = await Promise.all([
          governanceUtils.getProposal(id!),
          governanceUtils.getProposalTally(id!)
        ])

        setProposal(fetchedProposal?.proposal || null)
        setTally(fetchedTally || null)
        setLoading(false)
      } catch (error: any) {
        console.error(error)
        navigate('/governance')
      }
    }
    fetchProposalDetails().catch(console.error)
  }, [id, navigate])

  function convertUTCToLocalTime(utcDateString: string) {
    const date = new Date(utcDateString)

    const dateOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }

    const localDateString = date.toLocaleDateString(undefined, dateOptions)
    const localTimeString = date.toLocaleTimeString(undefined, timeOptions)

    return `${localDateString} - ${localTimeString}`
  }

  const [localVotingStartDate, setLocalVotingStartDate] = useState<Nullable<string>>(null)
  const [localVotingEndDate, setLocalVotingEndDate] = useState<Nullable<string>>(null)

  useEffect(() => {
    if (proposal) {
      setLocalVotingStartDate(convertUTCToLocalTime(proposal.voting_start_time))
      setLocalVotingEndDate(convertUTCToLocalTime(proposal.voting_end_time))
    }
  }, [proposal])

  // Define the type for vote options
  type VoteOption = 'yes' | 'abstain' | 'no' | 'no_with_veto'

  // Calculate total votes from tally data
  const totalVotes = tally
    ? ['yes', 'abstain', 'no', 'no_with_veto'].reduce((sum, key) => sum + Number(tally[key as VoteOption]), 0)
    : 0

  // Define colors with VoteOption keys
  const colors: Record<VoteOption, string> = {
    yes: 'bg-green-500',
    abstain: 'bg-yellow-500',
    no: 'bg-red-500',
    no_with_veto: 'bg-purple-500'
  }

  // Define vote types array with VoteOption type
  const voteTypes: VoteOption[] = ['yes', 'abstain', 'no', 'no_with_veto']

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading proposal details...</p>
        </div>
      ) : proposal ? (
        <>
          {/* Status Badge */}
          <StatusBadge proposalStatus={governanceUtils.getProposalStatus(proposal.status as unknown as string)} />

          {/* Proposal Title */}
          {proposal?.proposal_id && proposal?.content?.title && (
            <h1 className="text-xl font-bold">{`#${proposal.proposal_id} ${proposal.content.title}`}</h1>
          )}

          {/* Proposal Header */}
          <div className="bg-white dark:bg-neutral-800 p-4 flex flex-col h-full rounded-xl overflow-hidden">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-auto">
                <div className="font-bold">Voting Start</div>
                <div>{localVotingStartDate}</div>
              </div>
              <div className="col-auto">
                <div className="font-bold">Voting End</div>
                <div>{localVotingEndDate}</div>
              </div>
            </div>
          </div>

          {/* Proposal Description */}
          <div className="bg-white dark:bg-neutral-800 p-4 flex flex-col h-full rounded-xl overflow-hidden mt-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <div className="prose max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{proposal.content.description}</ReactMarkdown>
            </div>
          </div>

          {/* Voting Results */}
          {tally && (
            <div className="bg-white dark:bg-neutral-800 p-4 flex flex-col h-full rounded-xl overflow-hidden mt-6">
              <h2 className="text-xl font-semibold mb-4">Voting Results</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {voteTypes.map((voteType) => (
                  <div key={voteType} className="text-center">
                    <div className="font-bold capitalize">{voteType.replace('_', ' ')}</div>
                    <div>{formatNumber(Number(tally[voteType]) / 1e6, 2)} SCRT</div>
                  </div>
                ))}
              </div>

              {/* Voting Chart */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Vote Distribution</h3>
                <div className="w-full h-6 flex rounded overflow-hidden">
                  {voteTypes.map((voteType) => {
                    const voteCount = Number(tally[voteType])
                    const percentage = totalVotes ? (voteCount / totalVotes) * 100 : 0

                    return (
                      <Tooltip
                        key={voteType}
                        title={`${formatNumber(voteCount / 1e6, 2)} SCRT (${percentage.toFixed(2)}%)`}
                        placement="bottom"
                        arrow
                      >
                        <div style={{ width: `${percentage}%` }} className={`${colors[voteType]} h-full`}></div>
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Optional: Display Proposal JSON 
                    <div className="bg-blue-900 text-blue-200 p-8 mt-8 border border-blue-500 rounded">
                    {JSON.stringify(proposal)}
                  </div>*/}
        </>
      ) : (
        <div className="text-center text-gray-500">Proposal not found.</div>
      )}
    </div>
  )
}

export default GovernanceDetail

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import governanceUtils from 'utils/governanceUtils'
import StatusBadge from './components/StatusBadge'
import { Nullable } from 'types/Nullable'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { formatNumber } from 'utils/commons'

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

  // Calculate total votes from tally data
  const totalVotes = tally
    ? ['yes', 'abstain', 'no', 'no_with_veto'].reduce((sum, key) => sum + Number(tally[key]), 0)
    : 0

  // Define colors
  const colors: Record<string, string> = {
    yes: 'bg-emerald-600 dark:bg-emerald-500 w-[45%]',
    abstain: 'bg-gray-200 dark:bg-gray-700',
    no: 'bg-rose-600 dark:bg-rose-500',
    no_with_veto: 'bg-pink-600 dark:bg-pink-500'
  }

  // Define vote types array
  const voteTypes: string[] = ['yes', 'no', 'no_with_veto', 'abstain']

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
          <div className="bg-white dark:bg-neutral-800 p-4 flex flex-col h-full rounded-xl overflow-hidden mt-4">
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
              <div className="flex flex-col gap-4">
                {voteTypes.map((voteType) => {
                  const voteCount = Number(tally[voteType])
                  const percentage = totalVotes ? (voteCount / totalVotes) * 100 : 0
                  const label = voteType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                  const displayValue = `${formatNumber(voteCount / 1e6, 2)} SCRT (${percentage.toFixed(2)}%)`

                  return (
                    <div key={voteType}>
                      <div className="flex justify-between mb-1">
                        <span className="text-base font-medium">{label}</span>
                        <span className="text-sm font-medium">{displayValue}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`${colors[voteType]} h-2.5 rounded-full`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-500">Proposal not found.</div>
      )}
    </div>
  )
}

export default GovernanceDetail

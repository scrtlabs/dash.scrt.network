import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import governanceUtils from 'utils/governanceUtils'
import StatusBadge from './components/Overview/StatusBadge'
import { Proposal } from 'secretjs/dist/protobuf/cosmos/gov/v1beta1/gov'
import { Nullable } from 'types/Nullable'
import { ProposalStatus } from 'secretjs'

function GovernanceDetail() {
  const navigate = useNavigate()
  let { id } = useParams()

  // effectively blocks viewing spam proposals
  if (governanceUtils.spamProposalIds.includes(Number(id))) {
    navigate('/governance')
  }

  const [proposal, setProposal] = useState<Nullable<any>>(null)

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const fetchedProposal = await governanceUtils.getProposal(id)
        setProposal(fetchedProposal?.proposal || null)
      } catch (error: any) {
        console.error(error)
        navigate('/governance')
      }
    }
    fetchProposal().catch(console.error)
  }, [])

  function convertUTCToLocalTime(utcDateString: string) {
    const date = new Date(utcDateString)

    // Define options for date and time separately
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

    // Get formatted date and time strings
    const localDateString = date.toLocaleDateString(undefined, dateOptions)
    const localTimeString = date.toLocaleTimeString(undefined, timeOptions)

    // Combine date and time with a comma separator
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

  return (
    <div>
      {proposal && (
        <>
          <StatusBadge proposalStatus={governanceUtils.getProposalStatus(proposal.status as unknown as string)} />
          {proposal?.proposal_id && proposal?.content?.title && (
            <h1 className="text-xl font-bold">{`#${proposal?.proposal_id} ${proposal?.content?.title}`}</h1>
          )}

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

          <div className="bg-blue-900 text-blue-200 p-8 mt-8 border border-blue-500 rounded">
            {JSON.stringify(proposal)}
          </div>
        </>
      )}
    </div>
  )
}

export default GovernanceDetail

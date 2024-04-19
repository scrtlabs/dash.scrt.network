import Title from 'components/Title'
import GovernancePreviewItem from './components/Overview/GovernancePreviewItem'
import governanceUtils from 'utils/governanceUtils'
import { useEffect, useState } from 'react'
import { ProposalStatus } from 'secretjs'

function Governance() {
  const [proposals, setProposals] = useState(null)

  useEffect(() => {
    const fetchProposals = async () => {
      const fetchedProposals = await governanceUtils.getProposals()
      setProposals(fetchedProposals?.proposals || null)
    }

    fetchProposals().catch(console.error)
  }, [])

  return (
    <div>
      <div className="container w-full mx-auto px-4">
        {/* Title*/}
        <Title
          title={`Governance`}
          tooltip={`Voting on proposals, which are submitted by SCRT holders on the mainnet.`}
          className="mb-6"
        />
        {/* Content */}
        <div className="grid grid-cols-12 gap-4">
          {/* Proposals */}
          {proposals?.map((proposal: any, index: number) => {
            const id = proposal.proposal_id || ''

            if (governanceUtils.spamProposalIds.includes(Number(id))) {
              return
            }

            const title = proposal?.content?.title || ''
            const proposalStatus: ProposalStatus | undefined =
              ProposalStatus[proposal.status as keyof typeof ProposalStatus]
            const votes = {
              yes: Number(proposal.final_tally_result.yes),
              abstain: Number(proposal.final_tally_result.abstain),
              no: Number(proposal.final_tally_result.no),
              noWithVeto: Number(proposal.final_tally_result.no_with_veto)
            }
            const totalBondedStake = votes.yes + votes.abstain + votes.no + votes.noWithVeto

            return (
              <div className="col-span-12 sm:col-span-6 lg:col-span-12 xl:col-span-6" key={index}>
                <GovernancePreviewItem
                  id={id}
                  title={title}
                  totalBondedStake={totalBondedStake}
                  votes={votes}
                  // reviewsCount={5}
                  proposalStatus={proposalStatus}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Governance

import Title from 'components/Title'
import GovernancePreviewItem from './components/GovernancePreviewItem'
import governanceUtils from 'utils/governanceUtils'
import { useEffect, useState } from 'react'
import { ProposalStatus } from 'secretjs'
import { Nullable } from 'types/Nullable'
import { Proposal } from 'secretjs/dist/protobuf/cosmos/gov/v1beta1/gov'
import Button from 'components/UI/Button/Button'

function Governance() {
  const [proposals, setProposals] = useState<Nullable<Proposal[]>>(null)
  const [visibleProposalsCount, setVisibleProposalsCount] = useState<number>(10)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchProposals = async () => {
      setLoading(true)
      const fetchedProposals = await governanceUtils.getProposals()
      const filteredProposals =
        fetchedProposals?.proposals?.filter((proposal: any) => {
          const id = proposal.proposal_id || ''
          return !governanceUtils.spamProposalIds.includes(Number(id))
        }) || []
      setProposals(filteredProposals)
      setLoading(false)
    }

    fetchProposals().catch(console.error)
  }, [])

  const loadMoreProposals = () => {
    if (proposals && visibleProposalsCount < proposals.length) {
      setVisibleProposalsCount(visibleProposalsCount + 10)
    }
  }

  const visibleProposals = proposals?.slice(0, visibleProposalsCount)

  return (
    <div>
      <div className="container w-full mx-auto px-4">
        {/* Title */}
        <Title
          title={`Governance`}
          tooltip={`Voting on proposals, which are submitted by SCRT holders on the mainnet.`}
          className="mb-6"
        />
        {/* Content */}
        <div className="grid grid-cols-12 gap-4">
          {/* Proposals */}
          {loading
            ? // Skeleton Loader
              Array.from({ length: 10 }).map((_, index) => (
                <div className="col-span-12 sm:col-span-6 lg:col-span-12 xl:col-span-6 animate-pulse" key={index}>
                  <div className="animate-pulse bg-neutral-300/40 dark:bg-neutral-700/40 rounded col-span-2 mx-auto h-25 w-full rounded"></div>
                </div>
              ))
            : visibleProposals?.map((proposal: any, index: number) => {
                const id = proposal.proposal_id || ''

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
                      proposalStatus={proposalStatus}
                      isExpedited={proposal.is_expedited}
                    />
                  </div>
                )
              })}
        </div>
        {/* More Button */}
        {proposals && visibleProposalsCount < proposals.length && (
          <div className="text-center my-4">
            <Button onClick={loadMoreProposals}>More</Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Governance

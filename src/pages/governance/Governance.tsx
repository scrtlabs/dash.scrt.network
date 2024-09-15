import Title from 'components/Title'
import GovernancePreviewItem from './components/GovernancePreviewItem'
import governanceUtils from 'utils/governanceUtils'
import { useEffect, useRef, useState } from 'react'
import { ProposalStatus } from 'secretjs'
import { Nullable } from 'types/Nullable'
import { Proposal } from 'secretjs/dist/protobuf/cosmos/gov/v1beta1/gov'
import Button from 'components/UI/Button/Button'

function Governance() {
  const [proposals, setProposals] = useState<Nullable<Proposal[]>>(null)
  const [nextKey, setNextKey] = useState<Nullable<string>>(null) // required by API to fetch next entries
  const [loading, setLoading] = useState<boolean>(false)

  const proposalsContainerRef = useRef(null)

  useEffect(() => {
    const fetchProposals = async () => {
      const fetchedProposals = await governanceUtils.getProposals()
      setProposals(fetchedProposals?.proposals || null)
      setNextKey(fetchedProposals?.pagination?.next_key || null)
    }

    fetchProposals().catch(console.error)
  }, [])

  const loadNextProposals = async () => {
    if (nextKey && !loading) {
      setLoading(true)
      const fetchedProposals = await governanceUtils.getProposals(nextKey)
      setProposals((prevProposals) => [...(prevProposals || []), ...(fetchedProposals?.proposals || [])])
      setNextKey(fetchedProposals?.pagination?.next_key || null)
      setLoading(false)
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && nextKey) {
          loadNextProposals()
        }
      },
      {
        root: null,
        rootMargin: '500px',
        threshold: 1
      }
    )

    if (proposalsContainerRef.current) {
      observer.observe(proposalsContainerRef.current)
    }

    return () => {
      if (proposalsContainerRef.current) {
        observer.unobserve(proposalsContainerRef.current)
      }
    }
  }, [nextKey])

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
                  //reviewsCount={reviewsCount}
                  proposalStatus={proposalStatus}
                  isExpedited={proposal.is_expedited}
                />
              </div>
            )
          })}
        </div>
        <div ref={proposalsContainerRef} />
      </div>
    </div>
  )
}

export default Governance

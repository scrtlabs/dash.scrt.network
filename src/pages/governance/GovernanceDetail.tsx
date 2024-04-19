import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import governanceUtils from 'utils/governanceUtils'

function GovernanceDetail() {
  const navigate = useNavigate()
  let { id } = useParams()

  // effectively blocks viewing spam proposals
  if (governanceUtils.spamProposalIds.includes(Number(id))) {
    navigate('/governance')
  }

  const [proposal, setProposal] = useState(null)

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

  return <div>{JSON.stringify(proposal)}</div>
}

export default GovernanceDetail

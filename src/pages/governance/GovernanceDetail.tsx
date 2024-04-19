import { useNavigate, useParams } from 'react-router-dom'
import governanceUtils from 'utils/governanceUtils'

function GovernanceDetail() {
  const navigate = useNavigate()
  let { id } = useParams()

  // effectively blocks viewing spam proposals
  if (governanceUtils.spamProposalIds.includes(Number(id))) {
    navigate('/governance')
  }

  return <div>{id}</div>
}

export default GovernanceDetail

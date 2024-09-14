import { ProposalStatus } from 'secretjs'
import { SECRET_LCD } from './config'

async function getProposals(key?: string) {
  let GET_PROPOSALS_API_URL = SECRET_LCD + '/cosmos/gov/v1beta1/proposals?pagination.reverse=true&pagination.limit=50'

  if (key) {
    GET_PROPOSALS_API_URL = `${GET_PROPOSALS_API_URL}&pagination.key=${key}`
  }

  try {
    const response = await fetch(GET_PROPOSALS_API_URL)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('There was a problem with your fetch operation:', error)
    throw error
  }
}

async function getProposal(id: string) {
  const GET_PROPOSAL_API_URL = SECRET_LCD + `/cosmos/gov/v1beta1/proposals/${id}`

  try {
    const response = await fetch(GET_PROPOSAL_API_URL)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('There was a problem with your fetch operation:', error)
    throw error
  }
}

// **New Function to Get Proposal Tally**
async function getProposalTally(id: string) {
  const GET_TALLY_API_URL = SECRET_LCD + `/cosmos/gov/v1beta1/proposals/${id}/tally`

  try {
    const response = await fetch(GET_TALLY_API_URL)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    return data.tally
  } catch (error) {
    console.error('There was a problem with your fetch operation:', error)
    throw error
  }
}

const proposalStatusMap: { [key: string]: ProposalStatus } = {
  PROPOSAL_STATUS_UNSPECIFIED: ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED,
  PROPOSAL_STATUS_DEPOSIT_PERIOD: ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD,
  PROPOSAL_STATUS_VOTING_PERIOD: ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD,
  PROPOSAL_STATUS_PASSED: ProposalStatus.PROPOSAL_STATUS_PASSED,
  PROPOSAL_STATUS_REJECTED: ProposalStatus.PROPOSAL_STATUS_REJECTED,
  PROPOSAL_STATUS_FAILED: ProposalStatus.PROPOSAL_STATUS_FAILED,
  UNRECOGNIZED: ProposalStatus.UNRECOGNIZED
}

function getProposalStatus(status: string): ProposalStatus {
  return proposalStatusMap[status] ?? ProposalStatus.UNRECOGNIZED
}

const spamProposalIds: number[] = [
  297, 295, 292, 278, 277, 276, 273, 272, 263, 258, 257, 256, 254, 253, 248, 247, 246, 237, 236, 234, 231, 230, 229,
  228, 227, 226, 225, 224, 223, 222, 221, 220, 219, 218, 217, 216, 215, 214, 213, 212, 211, 210, 209, 208, 207, 206,
  205, 204, 203, 202, 201, 200, 199, 198, 197, 196, 195, 194, 193, 192, 191, 190, 189, 188, 187, 186, 185, 184, 182,
  181, 180, 179, 178, 177, 172, 171, 170, 169, 168, 165, 164, 163, 162, 161, 159, 158, 157, 156, 155, 154, 152, 151,
  150, 149, 148, 147, 146, 145, 141, 140, 139, 138, 137, 136, 135, 134, 133, 43, 39, 33, 29, 10, 1
]
export default {
  getProposals,
  getProposal,
  getProposalTally,
  getProposalStatus,
  spamProposalIds
}

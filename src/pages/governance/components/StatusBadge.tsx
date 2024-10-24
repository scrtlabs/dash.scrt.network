import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  IconDefinition,
  faCheckToSlot,
  faCircleCheck,
  faCircleExclamation,
  faCircleQuestion,
  faCircleXmark,
  faMoneyBillTransfer
} from '@fortawesome/free-solid-svg-icons'
import { ProposalStatus } from 'secretjs'
import { Nullable } from 'types/Nullable'

type Props = {
  proposalStatus?: Nullable<ProposalStatus>
}

function StatusBadge(props: Props) {
  if (props.proposalStatus === null) {
    return
  }

  const classListMap: Record<ProposalStatus, string> = {
    [ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD]:
      'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-900',
    [ProposalStatus.PROPOSAL_STATUS_PASSED]:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
    [ProposalStatus.PROPOSAL_STATUS_REJECTED]:
      'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-900',
    [ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED]:
      'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-900',
    [ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD]:
      'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-900',
    [ProposalStatus.PROPOSAL_STATUS_FAILED]:
      'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-900',
    [ProposalStatus.UNRECOGNIZED]:
      'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-900'
  }

  const textMap: Record<ProposalStatus, string> = {
    [ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED]: 'Unspecified',
    [ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD]: 'Deposit Period',
    [ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD]: 'Voting Open',
    [ProposalStatus.PROPOSAL_STATUS_PASSED]: 'Passed',
    [ProposalStatus.PROPOSAL_STATUS_REJECTED]: 'Rejected',
    [ProposalStatus.PROPOSAL_STATUS_FAILED]: 'Failed',
    [ProposalStatus.UNRECOGNIZED]: 'Unrecognized'
  }

  const iconMap: Record<ProposalStatus, IconDefinition> = {
    [ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED]: faCircleQuestion,
    [ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD]: faMoneyBillTransfer,
    [ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD]: faCheckToSlot,
    [ProposalStatus.PROPOSAL_STATUS_PASSED]: faCircleCheck,
    [ProposalStatus.PROPOSAL_STATUS_REJECTED]: faCircleXmark,
    [ProposalStatus.PROPOSAL_STATUS_FAILED]: faCircleExclamation,
    [ProposalStatus.UNRECOGNIZED]: faCircleQuestion
  }

  return (
    <span
      className={[
        'text-xs font-medium px-3 py-1 rounded border inline-flex gap-2 items-center',
        classListMap[props.proposalStatus]
      ].join(' ')}
    >
      {iconMap[props.proposalStatus] ? <FontAwesomeIcon icon={iconMap[props.proposalStatus]} /> : null}

      {textMap[props.proposalStatus]}
    </span>
  )
}

export default StatusBadge

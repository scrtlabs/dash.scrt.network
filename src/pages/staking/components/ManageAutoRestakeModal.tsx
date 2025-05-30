import { useContext } from 'react'
import { BroadcastMode, MsgSetAutoRestake } from 'secretjs'
import { StakingContext } from 'pages/staking/Staking'
import RestakeValidatorItem from './RestakeValidatorItem'
import { queryTxResult, restakeThreshold } from 'utils/commons'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import Modal from 'components/UI/Modal/Modal'
import Button from 'components/UI/Button/Button'
import toast from 'react-hot-toast'
import { Validator } from 'types/Validator'
import { ValidatorRestakeStatus } from 'types/ValidatorRestakeStatus'
import { NotificationService } from 'services/notification.service'

interface Props {
  open: boolean
  onClose: any
}

export default function ManageAutoRestakeModal(props: Props) {
  const { secretNetworkClient, isConnected } = useSecretNetworkClientStore()

  const { delegatorDelegations, validators, restakeChoices, reload, setReload, restakeEntries } =
    useContext(StakingContext)

  if (!props.open) return null

  function doRestake() {
    const filteredRestakeChoices = restakeChoices.filter((validator: ValidatorRestakeStatus) => {
      return (
        Number(validator.stakedAmount) >= restakeThreshold &&
        !!restakeEntries.find(
          (restakeEntry: ValidatorRestakeStatus) =>
            restakeEntry.autoRestake !== validator.autoRestake &&
            restakeEntry.validatorAddress == validator.validatorAddress
        )
      )
    })
    if (filteredRestakeChoices.length > 0) {
      changeRestakeForValidators(filteredRestakeChoices)
    }
  }

  async function changeRestakeForValidators(validatorRestakeStatuses: ValidatorRestakeStatus[]) {
    if (!isConnected) return

    const validatorObjects = validators.filter((validator: Validator) => {
      return validatorRestakeStatuses.find(
        (status: ValidatorRestakeStatus) => validator.operator_address === status.validatorAddress
      )
    })

    try {
      const toastId = NotificationService.notify(
        `Setting Auto Restaking for validators: ${validatorObjects
          .map((validator: Validator) => {
            const matchedStatus = validatorRestakeStatuses.find(
              (status) => status.validatorAddress === validator.operator_address
            )
            return `${matchedStatus?.autoRestake ? 'Enabling for' : 'Disabling for'} ${validator?.description?.moniker}`
          })
          .join(', ')}`,
        'loading'
      )
      const txs: MsgSetAutoRestake[] = validatorRestakeStatuses.map((status: ValidatorRestakeStatus) => {
        return new MsgSetAutoRestake({
          delegator_address: secretNetworkClient?.address,
          validator_address: status.validatorAddress,
          enabled: status.autoRestake
        })
      })

      const broadcastResult = await secretNetworkClient.tx.broadcast(txs, {
        gasLimit: 100_000 * txs.length,
        gasPriceInFeeDenom: 0.25,
        feeDenom: 'uscrt',
        broadcastMode: BroadcastMode.Sync,
        waitForCommit: false
      })
      // Poll the LCD for the transaction result every 10 seconds, 10 retries
      await queryTxResult(secretNetworkClient, broadcastResult.transactionHash, 6000, 10)
        .catch((error: any) => {
          console.error(error)
          toast.dismiss(toastId)
          if (error?.tx?.rawLog) {
            NotificationService.notify(`Setting Auto Restaking failed: ${error.tx.rawLog}`, 'error')
          } else {
            NotificationService.notify(`Setting Auto Restaking failed: ${error.message}`, 'error')
          }
        })
        .then((tx: any) => {
          if (tx) {
            if (tx.code === 0) {
              NotificationService.notify(`Auto Restaking successfully changed`, 'success')
            } else {
              NotificationService.notify(`Changing Auto Restaking failed: ${tx.rawLog}`, 'error')
            }
          }
        })
    } finally {
      setReload(!reload)
    }
  }

  function CommittedDelegators() {
    return (
      <>
        {delegatorDelegations.map((delegation: any, i: number) => {
          const validator = validators.find(
            (item: Validator) => item.operator_address == delegation.delegation.validator_address
          )
          return (
            <RestakeValidatorItem
              key={i}
              name={validator?.description?.moniker}
              validator={validator}
              identity={validator?.description?.identity}
              stakedAmount={delegation?.balance?.amount}
            />
          )
        })}
      </>
    )
  }

  return (
    <Modal
      title={`Manage Auto Restake`}
      subTitle={`Automate the process of claim and restak1e`}
      onClose={props.onClose}
      isOpen={props.open}
    >
      {/* List of user's delegators */}
      <CommittedDelegators />
      {/* Footer */}
      <div className="flex flex-col sm:flex-row-reverse justify-start mt-4 gap-2">
        {restakeChoices.length > 0 && (
          <>
            <Button onClick={() => doRestake()} size="default">
              Submit Changes
            </Button>
          </>
        )}

        <Button onClick={props.onClose} size="default" color="secondary">
          Cancel
        </Button>
      </div>
    </Modal>
  )
}

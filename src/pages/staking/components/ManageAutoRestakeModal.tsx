import { useContext } from 'react'
import { MsgSetAutoRestake, validateAddress } from 'secretjs'
import { StakingContext, ValidatorRestakeStatus } from 'pages/staking/Staking'
import RestakeValidatorItem from './RestakeValidatorItem'
import { restakeThreshold } from 'utils/commons'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import Modal from 'components/UI/Modal/Modal'
import Button from 'components/UI/Button/Button'
import toast from 'react-hot-toast'
import { Validator } from 'types/Validator'

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
      const toastId = toast.loading(
        `Setting Auto Restaking for validators: ${validatorObjects
          .map((validator: Validator) => {
            const matchedStatus = validatorRestakeStatuses.find(
              (status) => status.validatorAddress === validator.operator_address
            )
            return `${matchedStatus?.autoRestake ? 'Enabling for' : 'Disabling for'} ${validator?.description?.moniker}`
          })
          .join(', ')}`
      )
      const txs: MsgSetAutoRestake[] = validatorRestakeStatuses.map((status: ValidatorRestakeStatus) => {
        return new MsgSetAutoRestake({
          delegator_address: secretNetworkClient?.address,
          validator_address: status.validatorAddress,
          enabled: status.autoRestake
        })
      })

      await secretNetworkClient.tx
        .broadcast(txs, {
          gasLimit: 100_000 * txs.length,
          gasPriceInFeeDenom: 0.25,
          feeDenom: 'uscrt'
        })
        .catch((error: any) => {
          console.error(error)
          toast.dismiss(toastId)
          if (error?.tx?.rawLog) {
            toast.error(`Setting Auto Restaking failed: ${error.tx.rawLog}`)
          } else {
            toast.error(`Setting Auto Restaking failed: ${error.message}`)
          }
        })
        .then((tx: any) => {
          if (tx) {
            if (tx.code === 0) {
              toast.success(
                `Set Auto Restaking successfully for validators ${validatorObjects
                  .map((validator: Validator) => {
                    return validator?.description?.moniker
                  })
                  .join(', ')}`
              )
            } else {
              toast.error(`Setting Auto Restaking failed: ${tx.rawLog}`)
            }
          }
        })
    } finally {
      setReload(!reload)
    }
  }

  function CommittedDelegators() {
    return (
      <div className="w-full">
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
      </div>
    )
  }

  return (
    <Modal
      title={`Manage Auto Restake`}
      subTitle={`Automate the process of claim and restake`}
      onClose={props.onClose}
      isOpen={props.open}
    >
      <div className="flex flex-col">
        {/* List of user's delegators */}
        <CommittedDelegators />
      </div>
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

import React, { useContext } from 'react'
import { toast } from 'react-toastify'
import { MsgSetAutoRestake } from 'secretjs'
import { StakingContext, ValidatorRestakeStatus } from 'staking/Staking'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import RestakeValidatorItem from './RestakeValidatorItem'
import { restakeThreshold } from 'shared/utils/commons'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import Modal from 'shared/components/UI/Modal/Modal'
import Button from 'shared/components/UI/Modal/Button/Button'

interface Props {
  open: boolean
  onClose: any
}

const ManageAutoRestakeModal = (props: Props) => {
  const { secretNetworkClient, walletAddress, isConnected } =
    useSecretNetworkClientStore()

  const {
    delegatorDelegations,
    delegationTotalRewards,
    validators,
    restakeChoices,
    setRestakeChoices,
    reload,
    setReload
  } = useContext(StakingContext)

  if (!props.open) return null

  function doRestake() {
    const filteredRestakeChoices = restakeChoices.filter(
      (validator: ValidatorRestakeStatus) =>
        Number(validator.stakedAmount) >= restakeThreshold
    )

    if (filteredRestakeChoices.length > 0) {
      changeRestakeForValidators(filteredRestakeChoices)
    }
  }

  function changeRestakeForValidators(
    validatorRestakeStatuses: ValidatorRestakeStatus[]
  ) {
    async function submit() {
      if (!isConnected) return

      const validatorObjects = validators.filter((validator: any) => {
        return validatorRestakeStatuses.find(
          (status: ValidatorRestakeStatus) =>
            validator.operator_address === status.validatorAddress
        )
      })

      try {
        const toastId = toast.loading(
          `Setting Auto Restaking for validators: ${validatorObjects
            .map((validator: any) => {
              const matchedStatus = validatorRestakeStatuses.find(
                (status) =>
                  status.validatorAddress === validator.operator_address
              )
              return `${
                matchedStatus?.autoRestake ? 'Enabling for' : 'Disabling for'
              } ${validator?.description?.moniker}`
            })
            .join(', ')}`,
          { closeButton: true }
        )
        const txs = validatorRestakeStatuses.map(
          (status: ValidatorRestakeStatus) => {
            return new MsgSetAutoRestake({
              delegator_address: secretNetworkClient?.address,
              validator_address: status.validatorAddress,
              enabled: status.autoRestake
            })
          }
        )

        await secretNetworkClient.tx
          .broadcast(txs, {
            gasLimit: 100_000 * txs.length,
            gasPriceInFeeDenom: 0.25,
            feeDenom: 'uscrt'
          })
          .catch((error: any) => {
            console.error(error)
            if (error?.tx?.rawLog) {
              toast.update(toastId, {
                render: `Setting Auto Restaking failed: ${error.tx.rawLog}`,
                type: 'error',
                isLoading: false,
                closeOnClick: true
              })
            } else {
              toast.update(toastId, {
                render: `Setting Auto Restaking failed: ${error.message}`,
                type: 'error',
                isLoading: false,
                closeOnClick: true
              })
            }
          })
          .then((tx: any) => {
            console.log(tx)
            if (tx) {
              if (tx.code === 0) {
                toast.update(toastId, {
                  render: `Set Auto Restaking successfully for validators ${validatorObjects
                    .map((validator: any) => {
                      return validator?.description?.moniker
                    })
                    .join(', ')}`,
                  type: 'success',
                  isLoading: false,
                  closeOnClick: true
                })
              } else {
                toast.update(toastId, {
                  render: `Setting Auto Restaking failed: ${tx.rawLog}`,
                  type: 'error',
                  isLoading: false,
                  closeOnClick: true
                })
              }
            }
          })
      } finally {
        setReload(!reload)
      }
    }
    submit()
  }

  const CommittedDelegators = () => {
    return (
      <div className="my-validators w-full">
        {delegatorDelegations.map((delegation: any, i: number) => {
          const validator = validators.find(
            (item: any) =>
              item.operator_address == delegation.delegation.validator_address
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
            <Button onClick={() => doRestake()} size="large">
              Submit Changes
            </Button>
          </>
        )}

        <Button onClick={props.onClose} size="large" color="secondary">
          Cancel
        </Button>
      </div>
    </Modal>
  )
}

export default ManageAutoRestakeModal

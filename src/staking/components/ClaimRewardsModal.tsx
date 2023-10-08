import { useContext } from 'react'
import { toast } from 'react-toastify'
import { MsgWithdrawDelegationReward } from 'secretjs'
import { faucetAddress } from 'shared/utils/commons'
import { StakingContext } from 'staking/Staking'
import FeeGrant from '../../shared/components/FeeGrant'
import BigNumber from 'bignumber.js'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { scrtToken } from 'shared/utils/tokens'
import Modal from 'shared/components/Modal'

interface Props {
  open: boolean
  onClose: any
}

const ClaimRewardsModal = (props: Props) => {
  const {
    secretNetworkClient,
    scrtBalance,
    feeGrantStatus,
    requestFeeGrant,
    isConnected
  } = useSecretNetworkClientStore()

  const { delegatorDelegations, delegationTotalRewards } =
    useContext(StakingContext)

  if (!props.open) return null

  const totalPendingRewards = () => {
    return BigNumber(delegationTotalRewards?.total[0]?.amount)
      .dividedBy(`1e${scrtToken.decimals}`)
      .toFormat(scrtToken.decimals)
  }

  function claimRewards() {
    async function submit() {
      if (!secretNetworkClient?.address) return

      try {
        const toastId = toast.loading(`Claiming Staking Rewards`)
        const txs = delegatorDelegations.map((delegation: any) => {
          return new MsgWithdrawDelegationReward({
            delegator_address: secretNetworkClient?.address,
            validator_address: delegation?.delegation?.validator_address
          })
        })

        await secretNetworkClient.tx
          .broadcast(txs, {
            gasLimit: 100_000 * txs.length,
            gasPriceInFeeDenom: 0.25,
            feeDenom: 'uscrt',
            feeGranter: feeGrantStatus === 'success' ? faucetAddress : ''
          })
          .catch((error: any) => {
            console.error(error)
            if (error?.tx?.rawLog) {
              toast.update(toastId, {
                render: `Claiming staking rewards failed: ${error.tx.rawLog}`,
                type: 'error',
                isLoading: false,
                closeOnClick: true
              })
            } else {
              toast.update(toastId, {
                render: `Claiming staking rewards failed: ${error.message}`,
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
                  render: `Claiming staking rewards successful`,
                  type: 'success',
                  isLoading: false,
                  closeOnClick: true
                })
              } else {
                toast.update(toastId, {
                  render: `Claiming staking rewards failed: ${tx.rawLog}`,
                  type: 'error',
                  isLoading: false,
                  closeOnClick: true
                })
              }
            }
          })
      } finally {
      }
    }
    submit()
  }

  return (
    <>
      <Modal
        isOpen={props.open}
        onClose={props.onClose}
        title="Claim Rewards"
        subTitle="Claim your staking rewards!"
      >
        {/* Body */}
        <div className="flex flex-col">
          <div className="text-center my-4">
            <span className="font-semibold">{`Claimable Amount: `}</span>
            <span>{totalPendingRewards()}</span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">{` SCRT`}</span>
          </div>
          <div className="py-2">
            <FeeGrant />
          </div>
          <button
            onClick={() => claimRewards()}
            className="text-medium disabled:bg-neutral-600 enabled:bg-green-600 enabled:hover:bg-green-700 disabled:text-neutral-400 enabled:text-white transition-colors font-semibold px-2 py-2 text-sm rounded-md"
          >
            Claim Rewards
          </button>
        </div>
      </Modal>
    </>
  )
}

export default ClaimRewardsModal

import React, { useContext } from "react";
import { toast } from "react-toastify";
import { MsgWithdrawDelegationReward } from "secretjs";
import { SecretjsContext } from "shared/context/SecretjsContext";
import { faucetAddress } from "shared/utils/commons";
import { StakingContext } from "staking/Staking";
import FeeGrant from "../../shared/components/FeeGrant";
import BigNumber from "bignumber.js";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IClaimRewardsModalProps {
  open: boolean;
  onClose: any;
}

export function ClaimRewardsModal(props: IClaimRewardsModalProps) {
  const {
    secretjs,
    SCRTBalance,
    SCRTToken,
    feeGrantStatus,
    setFeeGrantStatus,
    requestFeeGrant,
  } = useContext(SecretjsContext);

  const { delegatorDelegations, delegationTotalRewards } =
    useContext(StakingContext);

  if (!props.open) return null;

  const totalPendingRewards = () => {
    return BigNumber(delegationTotalRewards?.total[0]?.amount)
      .dividedBy(`1e${SCRTToken.decimals}`)
      .toFormat(SCRTToken.decimals);
  };

  function claimRewards() {
    async function submit() {
      if (!secretjs || !secretjs?.address) return;

      try {
        const toastId = toast.loading(`Claiming Staking Rewards`);
        const txs = delegatorDelegations.map((delegation: any) => {
          return new MsgWithdrawDelegationReward({
            delegator_address: secretjs?.address,
            validator_address: delegation?.delegation?.validator_address,
          });
        });

        await secretjs.tx
          .broadcast(txs, {
            gasLimit: 100_000 * txs.length,
            gasPriceInFeeDenom: 0.25,
            feeDenom: "uscrt",
            feeGranter: feeGrantStatus === "Success" ? faucetAddress : "",
          })
          .catch((error: any) => {
            console.error(error);
            if (error?.tx?.rawLog) {
              toast.update(toastId, {
                render: `Claiming staking rewards failed: ${error.tx.rawLog}`,
                type: "error",
                isLoading: false,
                closeOnClick: true,
              });
            } else {
              toast.update(toastId, {
                render: `Claiming staking rewards failed: ${error.message}`,
                type: "error",
                isLoading: false,
                closeOnClick: true,
              });
            }
          })
          .then((tx: any) => {
            console.log(tx);
            if (tx) {
              if (tx.code === 0) {
                toast.update(toastId, {
                  render: `Claiming staking rewards successful`,
                  type: "success",
                  isLoading: false,
                  closeOnClick: true,
                });
              } else {
                toast.update(toastId, {
                  render: `Claiming staking rewards failed: ${tx.rawLog}`,
                  type: "error",
                  isLoading: false,
                  closeOnClick: true,
                });
              }
            }
          });
      } finally {
      }
    }
    submit();
  }

  return (
    <>
      {/* Outer */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 z-50 flex justify-center items-center"
        onClick={props.onClose}
      >
        {/* Inner */}
        <div className="absolute top-[10%] w-full onEnter_fadeInDown">
          <div className="mx-auto max-w-xl px-4">
            <div
              className="bg-white dark:bg-neutral-900 p-8 rounded-2xl"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {/* Close */}
              <div className="mb-0 text-right">
                <button
                  onClick={props.onClose}
                  className="text-neutral-500 dark:text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors px-1.5 py-1 rounded-lg text-xl"
                >
                  <FontAwesomeIcon icon={faXmark} className="fa-fw" />
                </button>
              </div>
              {/* Header */}
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-medium mb-2">
                  {/* <FontAwesomeIcon icon={faWallet} className="mr-2" /> */}
                  Claim Rewards
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
                  Claim your staking rewards!
                </p>
              </div>
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ClaimRewardsModal;

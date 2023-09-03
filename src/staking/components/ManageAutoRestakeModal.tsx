import React, { useContext } from "react";
import { toast } from "react-toastify";
import { MsgWithdrawDelegationReward } from "secretjs";
import { SecretjsContext } from "shared/context/SecretjsContext";
import { faucetAddress } from "shared/utils/commons";
import { StakingContext } from "staking/Staking";
import FeeGrant from "./validatorModalComponents/FeeGrant";
import BigNumber from "bignumber.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import MyValidatorsItem from "./MyValidatorsItem";
import RestakeValidatorItem from "./RestakeValidatorItem";

interface IManageAutoRestakeModalProps {
  open: boolean;
  onClose: any;
}

export default function ManageAutoRestakeModal(
  props: IManageAutoRestakeModalProps
) {
  const {
    secretjs,
    secretAddress,
    SCRTBalance,
    SCRTToken,
    feeGrantStatus,
    setFeeGrantStatus,
    requestFeeGrant,
  } = useContext(SecretjsContext);

  const { delegatorDelegations, delegationTotalRewards, validators } =
    useContext(StakingContext);

  if (!props.open) return null;

  const totalPendingRewards = () => {
    return BigNumber(delegationTotalRewards?.total[0]?.amount)
      .dividedBy(`1e${SCRTToken.decimals}`)
      .toFormat(SCRTToken.decimals);
  };

  function claimRewards() {
    async function submit() {
      if (!secretjs || !secretAddress) return;

      try {
        const toastId = toast.loading(`Claiming Staking Rewards`);
        const txs = delegatorDelegations.map((delegation: any) => {
          console.log(delegation);
          return new MsgWithdrawDelegationReward({
            delegator_address: secretAddress,
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

  function handleSubmit() {
    alert("Todo!");
  }

  const CommitedDelegators = () => {
    return (
      <div className="my-validators w-full">
        {delegatorDelegations.map((delegation: any, i: number) => {
          return (
            <RestakeValidatorItem
              key={i}
              name={
                validators.find(
                  (validator: any) =>
                    validator.operator_address ==
                    delegation.delegation.validator_address
                )?.description?.moniker
              }
              validator={validators.find(
                (validator: any) =>
                  validator.operator_address ==
                  delegation.delegation.validator_address
              )}
              identity={
                validators.find(
                  (validator: any) =>
                    validator.operator_address ==
                    delegation.delegation.validator_address
                )?.description?.identity
              }
              // restakeEntries={restakeEntries}
              stakedAmount={delegation?.balance?.amount}
              // setSelectedValidator={setSelectedValidator}
              // openModal={setIsValidatorModalOpen}
              // restakeChoice={restakeChoice}
              // setRestakeChoice={setRestakeChoice}
            />
          );
        })}
      </div>
    );
  };

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
                  Manage Auto Restake
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
                  Automating the process of the 'claim and restake' process!
                </p>
              </div>
              {/* Body */}
              <div className="flex flex-col">
                {/* List of user's delegators */}
                <CommitedDelegators />
              </div>
              {/* Footer */}
              <div className="flex flex-col sm:flex-row-reverse justify-start mt-4 gap-2">
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-500 font-semibold px-4 py-2 rounded-md"
                >
                  Submit Changes
                </button>
                <button
                  onClick={props.onClose}
                  className="bg-neutral-800 hover:bg-neutral-700 font-semibold px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

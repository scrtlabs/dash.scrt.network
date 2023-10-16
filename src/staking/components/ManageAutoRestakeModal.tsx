import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { MsgSetAutoRestake } from "secretjs";
import { SecretjsContext } from "shared/context/SecretjsContext";
import { StakingContext, ValidatorRestakeStatus } from "staking/Staking";
import FeeGrant from "../../shared/components/FeeGrant";
import BigNumber from "bignumber.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faXmark } from "@fortawesome/free-solid-svg-icons";
import RestakeValidatorItem from "./RestakeValidatorItem";
import Tooltip from "@mui/material/Tooltip";
import { restakeThreshold } from "shared/utils/commons";

interface IManageAutoRestakeModalProps {
  open: boolean;
  onClose: any;
}

export default function ManageAutoRestakeModal(
  props: IManageAutoRestakeModalProps
) {
  const { secretjs } = useContext(SecretjsContext);

  const {
    delegatorDelegations,
    delegationTotalRewards,
    validators,
    restakeChoices,
    restakeEntries,
    reload,
    setReload,
  } = useContext(StakingContext);

  if (!props.open) return null;

  function doRestake() {
    const filteredRestakeChoices = restakeChoices.filter(
      (validator: ValidatorRestakeStatus) =>
        Number(validator.stakedAmount) >= restakeThreshold
    );

    if (filteredRestakeChoices.length > 0) {
      changeRestakeForValidators(filteredRestakeChoices);
    }
  }

  function changeRestakeForValidators(
    validatorRestakeStatuses: ValidatorRestakeStatus[]
  ) {
    async function submit() {
      if (!secretjs || !secretjs?.address) return;

      const validatorObjects = validators.filter((validator: any) => {
        return validatorRestakeStatuses.find(
          (status: ValidatorRestakeStatus) =>
            validator.operator_address === status.validatorAddress
        );
      });

      console.log(validatorObjects);
      console.log(validatorRestakeStatuses);

      try {
        const toastId = toast.loading(
          `Setting Auto Restaking for validators: ${validatorObjects
            .map((validator: any) => {
              const matchedStatus = validatorRestakeStatuses.find(
                (status) =>
                  status.validatorAddress === validator.operator_address
              );
              return `${
                matchedStatus?.autoRestake ? "Enabling for" : "Disabling for"
              } ${validator?.description?.moniker}`;
            })
            .join(", ")}`,
          { closeButton: true }
        );

        const txs = validatorRestakeStatuses
          .filter((status: ValidatorRestakeStatus) => {
            const isInRestakeEntries = restakeEntries.includes(
              status.validatorAddress
            );
            return isInRestakeEntries !== status.autoRestake;
          })
          .map((status: ValidatorRestakeStatus) => {
            return new MsgSetAutoRestake({
              delegator_address: secretjs?.address,
              validator_address: status.validatorAddress,
              enabled: status.autoRestake,
            });
          });

        await secretjs.tx
          .broadcast(txs, {
            gasLimit: 50_000 * txs.length,
            gasPriceInFeeDenom: 0.25,
            feeDenom: "uscrt",
          })
          .catch((error: any) => {
            console.error(error);
            if (error?.tx?.rawLog) {
              toast.update(toastId, {
                render: `Setting Auto Restaking failed: ${error.tx.rawLog}`,
                type: "error",
                isLoading: false,
                closeOnClick: true,
              });
            } else {
              toast.update(toastId, {
                render: `Setting Auto Restaking failed: ${error.message}`,
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
                  render: `Set Auto Restaking successfully for validators ${validatorObjects
                    .map((validator: any) => {
                      return validator?.description?.moniker;
                    })
                    .join(", ")}`,
                  type: "success",
                  isLoading: false,
                  closeOnClick: true,
                });
              } else {
                toast.update(toastId, {
                  render: `Setting Auto Restaking failed: ${tx.rawLog}`,
                  type: "error",
                  isLoading: false,
                  closeOnClick: true,
                });
              }
            }
          });
      } finally {
        setReload(!reload);
      }
    }
    submit();
  }

  const CommittedDelegators = () => {
    return (
      <div className="my-validators w-full">
        {delegatorDelegations.map((delegation: any, i: number) => {
          const validator = validators.find(
            (item: any) =>
              item.operator_address == delegation.delegation.validator_address
          );
          return (
            <RestakeValidatorItem
              key={i}
              name={validator?.description?.moniker}
              validator={validator}
              identity={validator?.description?.identity}
              stakedAmount={delegation?.balance?.amount}
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
          <div className="mx-auto max-w-4xl px-4">
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
                <CommittedDelegators />
              </div>
              {/* Footer */}
              <div className="flex flex-col sm:flex-row-reverse justify-start mt-4 gap-2">
                {restakeChoices.length > 0 && (
                  <button
                    onClick={() => doRestake()}
                    className="enabled:bg-gradient-to-r enabled:from-cyan-600 enabled:to-purple-600 enabled:hover:from-cyan-500 enabled:hover:to-purple-500 transition-colors text-white font-semibold px-4 py-2 rounded-lg disabled:bg-neutral-500 focus:outline-none focus-visible:ring-4 ring-sky-500/40"
                  >
                    Submit Changes
                  </button>
                )}
                <button
                  onClick={props.onClose}
                  className="bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 font-semibold px-4 py-2 rounded-md transition-colors"
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

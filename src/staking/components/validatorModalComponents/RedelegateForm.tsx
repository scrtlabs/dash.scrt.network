import BigNumber from "bignumber.js";
import React, { useContext, useEffect, useState } from "react";
import { APIContext } from "shared/context/APIContext";
import { SecretjsContext } from "shared/context/SecretjsContext";
import {
  formatNumber,
  usdString,
  faucetAddress,
  shuffleArray,
} from "shared/utils/commons";
import { StakingContext } from "staking/Staking";
import { toast } from "react-toastify";
import FeeGrant from "./FeeGrant";
import Select from "react-select";

export default function RedelegateForm() {
  const { delegatorDelegations, validators, selectedValidator, setView } =
    useContext(StakingContext);
  const { secretjs, secretAddress, SCRTBalance, SCRTToken, feeGrantStatus } =
    useContext(SecretjsContext);
  const { currentPrice } = useContext(APIContext);

  const [redelegateValidator, setRedelegateValidator] = useState<any>();

  const [amountString, setAmountString] = useState<string>("");
  const [amountInDollarString, setAmountInDollarString] = useState<string>("");

  const handleInputChange = (e: any) => {
    setAmountString(e.target.value);
  };

  useEffect(() => {
    const scrtBalanceUsdString = usdString.format(
      new BigNumber(amountString!).multipliedBy(Number(currentPrice)).toNumber()
    );
    setAmountInDollarString(scrtBalanceUsdString);
  }, [amountString]);

  const handleSubmit = () => {
    async function submit() {
      if (!secretjs || !secretAddress) return;

      try {
        const toastId = toast.loading(
          `Redelegating ${amountString} SCRT from ${selectedValidator?.description?.moniker} to ${redelegateValidator?.description?.moniker}`
        );
        await secretjs.tx.staking
          .beginRedelegate(
            {
              delegator_address: secretAddress,
              validator_src_address: selectedValidator?.operator_address,
              validator_dst_address: redelegateValidator?.operator_address,
              amount: {
                amount: BigNumber(amountString)
                  .multipliedBy(`1e${SCRTToken.decimals}`)
                  .toFixed(0, BigNumber.ROUND_DOWN),
                denom: "uscrt",
              },
            },
            {
              gasLimit: 100_000,
              gasPriceInFeeDenom: 0.25,
              feeDenom: "uscrt",
              feeGranter: feeGrantStatus === "Success" ? faucetAddress : "",
            }
          )
          .catch((error: any) => {
            console.error(error);
            if (error?.tx?.rawLog) {
              toast.update(toastId, {
                render: `Redelgating failed: ${error.tx.rawLog}`,
                type: "error",
                isLoading: false,
                closeOnClick: true,
              });
            } else {
              toast.update(toastId, {
                render: `Redelgating failed: ${error.message}`,
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
                  render: `Successfully redelegated ${amountString} SCRT from ${selectedValidator?.description?.moniker} to ${redelegateValidator?.description?.moniker}`,
                  type: "success",
                  isLoading: false,
                  closeOnClick: true,
                });
              } else {
                toast.update(toastId, {
                  render: `Redelgating failed: ${tx.rawLog}`,
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
  };

  function PercentagePicker() {
    return (
      <div className="inline-flex rounded-full text-xs font-bold">
        <button
          onClick={() => setAmountByPercentage(25)}
          className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-l-md transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40 focus:z-10"
          disabled={!secretjs || !secretAddress}
        >
          25%
        </button>
        <button
          onClick={() => setAmountByPercentage(50)}
          className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 border-l border-neutral-300 dark:border-neutral-700 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40 focus:z-10"
          disabled={!secretjs || !secretAddress}
        >
          50%
        </button>
        <button
          onClick={() => setAmountByPercentage(75)}
          className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 border-l border-neutral-300 dark:border-neutral-700 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40 focus:z-10"
          disabled={!secretjs || !secretAddress}
        >
          75%
        </button>
        <button
          onClick={() => setAmountByPercentage(100)}
          className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-r-md border-l border-neutral-300 dark:border-neutral-700 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40 focus:z-10"
          disabled={!secretjs || !secretAddress}
        >
          MAX
        </button>
      </div>
    );
  }

  function setAmountByPercentage(percentage: number) {
    const maxValue = delegatorDelegations?.find(
      (delegatorDelegation: any) =>
        selectedValidator?.operator_address ==
        delegatorDelegation.delegation.validator_address
    )?.balance?.amount;

    if (maxValue) {
      let availableAmount = new BigNumber(maxValue).dividedBy(
        `1e${SCRTToken.decimals}`
      );
      let potentialInput = availableAmount.toNumber() * (percentage * 0.01);
      if (Number(potentialInput) < 0) {
        setAmountString("");
      } else {
        setAmountString(potentialInput.toFixed(SCRTToken.decimals));
      }
    }
  }

  const customFilter = (option: any, searchText: any) => {
    if (searchText.length == 0) return true;
    console.log(option);
    if (!option || !option?.data?.name) return false;
    const name = option?.data?.name.toLowerCase();
    const search = searchText.toLowerCase();

    return name.includes(search);
  };

  return (
    <>
      <div className="bg-neutral-200 dark:bg-neutral-800 p-4 rounded-xl my-4">
        <div className="font-bold mb-2 text-center sm:text-left">Amount</div>

        <input
          value={amountString}
          onChange={handleInputChange}
          type="number"
          min="0"
          step="0.000001"
          className={
            "remove-arrows block flex-1 min-w-0 w-full bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white px-4 py-4 rounded-lg disabled:placeholder-neutral-300 dark:disabled:placeholder-neutral-700 transition-colors font-medium focus:outline-0 focus:ring-2 ring-sky-500/40"
          }
          name="toValue"
          id="toValue"
          placeholder="0"
          disabled={!secretjs || !secretAddress}
        />
        <div className="mt-2 flex flex-col sm:flex-row gap-2">
          <div className="flex-1 text-sm text-center sm:text-left">
            {amountInDollarString !== "$NaN" ? amountInDollarString : "$ -"}
          </div>
          <div className="text-center sm:text-left flex-initial">
            <PercentagePicker />
          </div>
        </div>
        <div className="mt-4">
          <div className="font-bold mb-2 text-center sm:text-left">To</div>
          <Select
            isDisabled={!secretjs || !secretAddress}
            options={shuffleArray(
              validators
                ?.filter((item: any) => item.status === "BOND_STATUS_BONDED")
                .map((validator: any) => {
                  return {
                    name: validator?.description?.moniker,
                    value: validator?.operator_address,
                  };
                })
            )}
            onChange={(item: any) => {
              console.log(item);
              setRedelegateValidator(
                validators.find(
                  (validator: any) => validator.operator_address === item.value
                )
              );
            }}
            isSearchable={true}
            filterOption={customFilter}
            formatOptionLabel={(validator: any) => {
              return (
                <div className="flex items-center">
                  <span className="font-semibold text-base">
                    {validator?.name}
                  </span>
                </div>
              );
            }}
            className="react-select-container"
            classNamePrefix="react-select-inset"
          />
        </div>
      </div>

      {/* Fee Grant */}
      <div className="col-span-12">
        <FeeGrant />
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row-reverse justify-start mt-4 gap-2">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-500 font-semibold px-4 py-2 rounded-md"
        >
          Redelegate
        </button>
        <button
          onClick={() => setView(null)}
          className="bg-neutral-800 hover:bg-neutral-700 font-semibold px-4 py-2 rounded-md"
        >
          Back
        </button>
      </div>
    </>
  );
}

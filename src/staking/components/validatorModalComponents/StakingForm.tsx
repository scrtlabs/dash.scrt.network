import BigNumber from "bignumber.js";
import React, { useContext, useEffect, useState } from "react";
import { APIContext } from "shared/context/APIContext";
import { SecretjsContext } from "shared/context/SecretjsContext";
import { formatNumber, usdString, faucetAddress } from "shared/utils/commons";
import { StakingContext } from "staking/Staking";
import { toast } from "react-toastify";
import FeeGrant from "./FeeGrant";

export default function StakingForm() {
  const { selectedValidator, setView } = useContext(StakingContext);
  const { secretjs, secretAddress, SCRTBalance, SCRTToken, feeGrantStatus } =
    useContext(SecretjsContext);
  const { currentPrice } = useContext(APIContext);

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
          `Staking ${amountString} SCRT with validator: ${selectedValidator?.description?.moniker}`
        );
        await secretjs.tx.staking
          .delegate(
            {
              delegator_address: secretAddress,
              validator_address: selectedValidator?.operator_address,
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
                render: `Staking failed: ${error.tx.rawLog}`,
                type: "error",
                isLoading: false,
                closeOnClick: true,
              });
            } else {
              toast.update(toastId, {
                render: `Staking failed: ${error.message}`,
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
                  render: `Staking ${amountString} SCRT successfully with validator: ${selectedValidator?.description?.moniker}`,
                  type: "success",
                  isLoading: false,
                  closeOnClick: true,
                });
              } else {
                toast.update(toastId, {
                  render: `Staking failed: ${tx.rawLog}`,
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
    if (SCRTBalance) {
      let availableAmount = new BigNumber(SCRTBalance).dividedBy(
        `1e${SCRTToken.decimals}`
      );
      let potentialInput = availableAmount.toNumber() * (percentage * 0.01);
      potentialInput = potentialInput - 0.05;
      if (Number(potentialInput) < 0) {
        setAmountString("");
      } else {
        setAmountString(potentialInput.toFixed(SCRTToken.decimals));
      }
    }
  }

  return (
    <>
      <div className="bg-neutral-200 dark:bg-neutral-800 p-4 rounded-xl my-4">
        <div className="font-bold mb-2 text-center sm:text-left">
          Amount to Stake
        </div>

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
      </div>

      {/* Fee Grant */}
      <div className="col-span-12">
        <FeeGrant />
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row-reverse justify-start mt-4 gap-2">
        <button
          onClick={handleSubmit}
          className="bg-sky-600 hover:bg-sky-700 font-semibold px-4 py-2 rounded-md"
        >
          Delegate
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

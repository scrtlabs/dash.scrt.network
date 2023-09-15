import BigNumber from "bignumber.js";
import React, { useContext, useEffect, useState } from "react";
import { APIContext } from "shared/context/APIContext";
import { SecretjsContext } from "shared/context/SecretjsContext";
import { formatNumber, usdString, faucetAddress } from "shared/utils/commons";
import { StakingContext } from "staking/Staking";
import { toast } from "react-toastify";
import FeeGrant from "../../../shared/components/FeeGrant";
import PercentagePicker from "shared/components/PercentagePicker";

export default function StakingForm() {
  const { selectedValidator, setView } = useContext(StakingContext);
  const { secretjs, SCRTBalance, SCRTToken, feeGrantStatus } =
    useContext(SecretjsContext);
  const { currentPrice } = useContext(APIContext);

  const [amountString, setAmountString] = useState<string>("0");
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
      if (!secretjs || !secretjs?.address) return;

      try {
        const toastId = toast.loading(
          `Staking ${amountString} SCRT with validator: ${selectedValidator?.description?.moniker}`
        );
        await secretjs.tx.staking
          .delegate(
            {
              delegator_address: secretjs?.address,
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
        <div className="font-semibold mb-2 text-center sm:text-left">
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
          disabled={!secretjs || !secretjs?.address}
        />
        <div className="mt-2 flex flex-col sm:flex-row gap-2">
          <div className="flex-1 text-sm text-center sm:text-left">
            {amountInDollarString !== "$NaN" ? amountInDollarString : "$ -"}
          </div>
          <div className="text-center sm:text-left flex-initial">
            {PercentagePicker(
              setAmountByPercentage,
              !secretjs || !secretjs?.address
            )}
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
          className="enabled:bg-gradient-to-r enabled:from-cyan-600 enabled:to-purple-600 enabled:hover:from-cyan-500 enabled:hover:to-purple-500 transition-colors text-white font-semibold px-4 py-2 rounded-lg disabled:bg-neutral-500 focus:outline-none focus-visible:ring-4 ring-sky-500/40"
        >
          Delegate
        </button>
        <button
          onClick={() => setView(null)}
          className="bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 font-semibold px-4 py-2 rounded-md transition-colors"
        >
          Back
        </button>
      </div>
    </>
  );
}

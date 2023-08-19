import BigNumber from "bignumber.js";
import React, { useContext, useEffect, useState } from "react";
import { APIContext } from "shared/context/APIContext";
import { SecretjsContext } from "shared/context/SecretjsContext";
import { formatNumber, usdString } from "shared/utils/commons";
import { StakingContext } from "staking/Staking";
import { toast } from "react-toastify";

function StakingForm() {
  const { selectedValidator } = useContext(StakingContext);
  const { secretjs, secretAddress, SCRTBalance, SCRTToken } =
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

  const handleSetMaxVal = () => {
    const maxScrt: string = new BigNumber(SCRTBalance!)
      .dividedBy(`1e${SCRTToken.decimals}`)
      .toFormat();
    if (maxScrt && maxScrt !== "0") {
      setAmountString(maxScrt);
    } else {
      setAmountString("");
    }
  };

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
                amount: BigNumber(amountString).multipliedBy(
                  `1e${SCRTToken.decimals}`
                ),
                denom: "uscrt",
              },
            },
            {
              gasLimit: 100_000,
              gasPriceInFeeDenom: 0.25,
              feeDenom: "uscrt",
            }
          )
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
                  render: `Setting Auto Restaking successfully for validators ${validatorObjects
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
      }
    }
    submit();
  };

  return (
    <>
      <div className="bg-neutral-200 dark:bg-neutral-800 p-4 rounded-xl my-4">
        <div className="font-bold mb-2 text-center sm:text-left">
          Amount to Stake
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <button
              onClick={() => handleSetMaxVal()}
              className="z-50 inline-block font-bold text-xs bg-sky-500 px-1.5 py-1 rounded mr-1.5"
            >
              MAX
            </button>
            <span className="font-medium text-xs">SCRT</span>
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
        </div>
        <div className="mt-2 ml-2 text-sm text-center sm:text-left">
          {amountInDollarString !== "$NaN" ? amountInDollarString : "$ -"}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row-reverse justify-start mt-4 gap-2">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-500 font-semibold px-4 py-2 rounded-md"
        >
          Stake
        </button>
        <button className="bg-neutral-800 hover:bg-neutral-700 font-semibold px-4 py-2 rounded-md">
          Back
        </button>
      </div>
    </>
  );
}

export default StakingForm;

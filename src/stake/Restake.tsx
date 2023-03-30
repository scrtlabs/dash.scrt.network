import { useEffect, useState, useContext, createContext } from "react";
import { MsgSetAutoRestake } from "secretjs";
import { SECRET_LCD } from "shared/utils/config";
import { sleep, faucetURL, faucetAddress } from "shared/utils/commons";
import BigNumber from "bignumber.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faKey,
  faArrowRightArrowLeft,
  faRightLeft,
  faInfoCircle,
  faCheckCircle,
  faXmarkCircle,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import Select from "react-select";
import Tooltip from "@mui/material/Tooltip";
import { Helmet } from "react-helmet-async";
import { websiteName } from "App";
import { SecretjsContext } from "shared/context/SecretjsContext";

export function Restake() {
  const queryParams = new URLSearchParams(window.location.search);

  const { secretjs, secretAddress, connectWallet } =
    useContext(SecretjsContext);

  const restakeThreshold = 10000000;

  const [isRestakeEnabled, setIsRestakeEnabled] = useState(false);

  const [validators, setValidators] = useState<any>();
  const [validatorsForDelegator, setValidatorsForDelegator] = useState<any>();
  const [restakeEntries, setRestakeEntries] = useState<any>();
  const [selectedValidator, setSelectedValidator] = useState<any>();

  useEffect(() => {
    if (!secretjs || !secretAddress) {
      setValidators(undefined);
      setValidatorsForDelegator(undefined);
      setRestakeEntries(undefined);
      return;
    }
    const fetchData = async () => {
      const { validators } = await secretjs.query.staking.validators({
        status: "BOND_STATUS_BONDED",
      });
      setValidators(validators);
      const validatorsForDelegator =
        await secretjs.query.staking.delegatorDelegations({
          delegator_addr: secretAddress,
        });
      setValidatorsForDelegator(validatorsForDelegator);
      console.log(validatorsForDelegator);
    };
    fetchData();
    const url = `${SECRET_LCD}/cosmos/distribution/v1beta1/restake_entries?delegator=${secretAddress}`;
    fetch(url)
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
        setRestakeEntries(response);
      });
  }, [secretAddress, secretjs]);

  useEffect(() => {
    if (!secretjs || !secretAddress) return;
    console.log(selectedValidator);
    const isRestakeActive =
      restakeEntries?.validators.find(
        (validator: any) => validator == selectedValidator.value
      ) === selectedValidator?.value;
    setIsRestakeEnabled(isRestakeActive);
  }, [selectedValidator]);

  function SubmitButton(props: { disabled: boolean; enableRestake: boolean }) {
    const disabled = props.disabled;
    const enableRestake = props.enableRestake;

    async function submit() {
      if (!secretjs || !secretAddress) return;

      try {
        const toastId = toast.loading(
          `Changing restaking for validator ${selectedValidator.name}`,
          { closeButton: true }
        );
        await secretjs.tx
          .broadcast(
            [
              new MsgSetAutoRestake({
                delegator_address: secretAddress,
                validator_address: selectedValidator.value,
                enabled: !isRestakeEnabled,
              } as any),
            ],
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
                render: `Changing restaking failed: ${error.tx.rawLog}`,
                type: "error",
                isLoading: false,
                closeOnClick: true,
              });
            } else {
              toast.update(toastId, {
                render: `Changing restaking failed: ${error.message}`,
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
                  render: `Changed restaking successfully`,
                  type: "success",
                  isLoading: false,
                  closeOnClick: true,
                });
              } else {
                toast.update(toastId, {
                  render: `Changing restaking failed: ${tx.rawLog}`,
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

    return (
      <>
        <div className="flex items-center">
          <button
            className={
              "enabled:bg-gradient-to-r enabled:from-cyan-600 enabled:to-purple-600 enabled:hover:from-cyan-500 enabled:hover:to-purple-500 transition-colors text-white font-semibold py-2.5 w-full rounded-lg disabled:bg-neutral-500"
            }
            disabled={disabled}
            onClick={() => submit()}
          >
            {secretAddress && secretjs && isRestakeEnabled === false && (
              <>{`Enable auto-restake`}</>
            )}
            {secretAddress && secretjs && isRestakeEnabled === true && (
              <>{`Disable auto-restake`}</>
            )}
            {!secretAddress && !secretjs && <>{`Connect wallet`}</>}
          </button>
        </div>
      </>
    );
  }

  const handleClick = () => {
    if (!secretAddress || !secretjs) {
      connectWallet();
    }
  };

  return (
    <>
      <Helmet>
        <title>Secret Dashboard | Auto-Restake</title>
      </Helmet>

      <div className="w-full max-w-xl mx-auto px-4 onEnter_fadeInDown relative">
        {!secretjs && !secretAddress ? (
          // Overlay to connect on click
          <div
            className="absolute block top-0 left-0 right-0 bottom-0 z-10"
            onClick={handleClick}
          ></div>
        ) : null}
        {/* Content */}
        <div className="border border-neutral-200 dark:border-neutral-700 rounded-2xl p-8 w-full text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900">
          {/* Header */}
          <div className="flex items-center mb-4">
            <h1 className="inline text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500">
              Auto-Restake enabler
            </h1>
            <Tooltip
              title={
                "Use the auto-restake feature to automatically claim and restake your staked SCRT."
              }
              placement="right"
              arrow
            >
              <span className="ml-2 mt-1 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
                <FontAwesomeIcon icon={faInfoCircle} />
              </span>
            </Tooltip>
          </div>

          {/* *** From *** */}
          <div className="bg-neutral-200 dark:bg-neutral-800 p-4 rounded-xl">
            {/* Title Bar */}
            <div className="flex flex-col sm:flex-row">
              <div className="flex-1 font-semibold mb-2 text-center sm:text-left">
                Your active delegations
              </div>
            </div>

            {/* Input Field */}
            <div className="w-full" id="fromInputWrapper">
              <Select
                isDisabled={!secretjs || !secretAddress}
                options={validatorsForDelegator?.delegation_responses.map(
                  (item: any) => {
                    return {
                      name: `${
                        validators?.find(
                          (validator: any) =>
                            validator.operator_address ==
                            item?.delegation?.validator_address
                        )?.description?.moniker
                      } (${(item.balance.amount * 1e-6).toFixed(1)} SCRT): ${
                        restakeEntries?.validators.find(
                          (validator: any) =>
                            validator == item?.delegation?.validator_address
                        ) === item?.delegation?.validator_address
                          ? "Auto-restake enabled ✅"
                          : "Auto-restake not enabled ❌"
                      }`,
                      value: item?.delegation?.validator_address,
                      balance: item.balance.amount,
                    };
                  }
                )}
                value={selectedValidator}
                onChange={setSelectedValidator}
                isSearchable={false}
                isOptionDisabled={(validator) => {
                  return validator.balance < restakeThreshold;
                }}
                formatOptionLabel={(validator) => {
                  return (
                    <div className="flex items-center">
                      <span className="font-semibold text-base">
                        {validator.balance >= restakeThreshold
                          ? validator.name
                          : `${validator.name} (below threshold)`}
                      </span>
                    </div>
                  );
                }}
                className="react-select-wrap-container"
                classNamePrefix="react-select-wrap"
              />
            </div>
            <div className="flex mt-4 center">
              {secretAddress && secretjs && selectedValidator ? (
                isRestakeEnabled ? (
                  <label>
                    Auto-restaking <b>is enabled</b> ✅ for validator{" "}
                    {
                      validators?.find(
                        (validator: any) =>
                          validator.operator_address == selectedValidator?.value
                      )?.description?.moniker
                    }
                  </label>
                ) : (
                  <label>
                    Auto-restaking <b>is NOT enabled</b> ❌ for validator{" "}
                    {
                      validators?.find(
                        (validator: any) =>
                          validator.operator_address == selectedValidator?.value
                      )?.description?.moniker
                    }
                  </label>
                )
              ) : (
                <label></label>
              )}
            </div>
          </div>
          <div className="mt-4">
            {/* Submit Button */}
            <SubmitButton
              disabled={!secretjs || !secretAddress || !selectedValidator}
              enableRestake={isRestakeEnabled}
            />
          </div>
        </div>
      </div>
    </>
  );
}

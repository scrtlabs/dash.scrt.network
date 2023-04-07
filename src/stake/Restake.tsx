import { useEffect, useState, useContext } from "react";
import { MsgSetAutoRestake } from "secretjs";
import { SECRET_LCD } from "shared/utils/config";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpRightFromSquare,
  faInfoCircle,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import Tooltip from "@mui/material/Tooltip";
import { Helmet } from "react-helmet-async";
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

  const fetchDelegations = async () => {
    const { validators } = await secretjs.query.staking.validators({
      status: "BOND_STATUS_BONDED",
    });
    setValidators(validators);
    const validatorsForDelegator =
      await secretjs.query.staking.delegatorDelegations({
        delegator_addr: secretAddress,
      });
    setValidatorsForDelegator(validatorsForDelegator);
    const url = `${SECRET_LCD}/cosmos/distribution/v1beta1/restake_entries?delegator=${secretAddress}`;
    await fetch(url)
      .then((response) => response.json())
      .then((response) => {
        setRestakeEntries(response);
      });
  };

  useEffect(() => {
    if (!secretjs || !secretAddress) {
      setValidators(undefined);
      setValidatorsForDelegator(undefined);
      setRestakeEntries(undefined);
    } else {
      fetchDelegations();
    }
  }, [secretAddress, secretjs]);

  useEffect(() => {
    if (!secretjs || !secretAddress) return;

    const interval = setInterval(fetchDelegations, 10000);
    return () => {
      clearInterval(interval);
    };
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
          !isRestakeEnabled
            ? `Enabling Auto Restaking for validator ${selectedValidator.validatorName}`
            : `Disabling Auto Restaking for validator ${selectedValidator.validatorName}`,
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
                render: !isRestakeEnabled
                  ? `Enabling Auto Restaking failed: ${error.tx.rawLog}`
                  : `Disabling Auto Restaking failed: ${error.tx.rawLog}`,
                type: "error",
                isLoading: false,
                closeOnClick: true,
              });
            } else {
              toast.update(toastId, {
                render: !isRestakeEnabled
                  ? `Enabling Auto Restaking failed: ${error.message}`
                  : `Disabling Auto Restaking failed: ${error.message}`,
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
                  render: !isRestakeEnabled
                    ? `Enabled Auto Restaking successfully for validator ${selectedValidator.validatorName}`
                    : `Disabled Auto Restaking successfully for validator ${selectedValidator.validatorName}`,
                  type: "success",
                  isLoading: false,
                  closeOnClick: true,
                });
              } else {
                toast.update(toastId, {
                  render: !isRestakeEnabled
                    ? `Enabling Auto Restaking failed: ${tx.rawLog}`
                    : `Disabling Auto Restaking failed: ${tx.rawLog}`,
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
            {selectedValidator
              ? secretjs && secretAddress && isRestakeEnabled === true
                ? `Disable Auto Restake for ${selectedValidator?.validatorName}`
                : `Enable Auto Restake for ${selectedValidator?.validatorName}`
              : "Auto Restake"}
          </button>
        </div>
      </>
    );
  }

  const handleClick = () => {
    if (!secretjs || !secretAddress) {
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
              Auto Restake
            </h1>
            <Tooltip
              title={
                'Automating the process of "claim and restake" for your SCRT'
              }
              placement="right"
              arrow
            >
              <span className="ml-2 mt-1 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
                <FontAwesomeIcon icon={faInfoCircle} />
              </span>
            </Tooltip>
          </div>

          {validatorsForDelegator?.delegation_responses?.length == 0 && (
            <div className="bg-neutral-200 border border-yellow-500 dark:border-yellow-600 dark:bg-yellow-800/40 text-yellow-500 p-4 rounded-xl mb-4">
              {/* Title Bar */}
              <div className="flex flex-col sm:flex-row">
                <div className="flex-1 font-semibold mb-4 text-center sm:text-left">
                  <FontAwesomeIcon
                    icon={faTriangleExclamation}
                    className="mr-2"
                  />
                  {`You do not have any SCRT staked`}
                </div>
              </div>

              <div className="flex center">
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    <a
                      href="https://scrt.network/about/get-scrt#buy-scrt"
                      target="_blank"
                      className="text-neutral-300 border-b border-transparent hover:border-inherit transition-colors"
                    >
                      {`Get SCRT`}
                      <FontAwesomeIcon
                        icon={faArrowUpRightFromSquare}
                        className="text-xs ml-2"
                        size={"xs"}
                      />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://scrt.network/learn/secret-basics/how-to-buy-store-stake-scrt"
                      target="_blank"
                      className="text-neutral-300 border-b border-transparent hover:border-inherit transition-colors"
                    >
                      {`Learn more about Staking`}
                      <FontAwesomeIcon
                        icon={faArrowUpRightFromSquare}
                        className="text-xs ml-2"
                        size={"xs"}
                      />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* *** From *** */}
          <div className="bg-neutral-200 dark:bg-neutral-800 p-4 rounded-xl">
            {/* Title Bar */}
            <div className="flex flex-col sm:flex-row">
              <div className="flex-1 font-semibold mb-2 text-center sm:text-left">
                Active Delegations
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
                      validatorName: validators?.find(
                        (validator: any) =>
                          validator.operator_address ==
                          item?.delegation?.validator_address
                      )?.description?.moniker,
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
                          : `${validator.validatorName} (below threshold)`}
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
                    Auto-restaking <b>is enabled</b> ✅ for validator <br />
                    {selectedValidator?.validatorName}
                  </label>
                ) : (
                  <label>
                    Auto-restaking <b>is NOT enabled</b> ❌ for validator <br />
                    {selectedValidator?.validatorName}
                  </label>
                )
              ) : (
                <label></label>
              )}
            </div>
          </div>
          <div className="mt-2">
            <a
              href="https://wallet.keplr.app/chains/secret-network?tab=staking"
              target="_blank"
              className="text-neutral-500 hover:text-white border-b border-transparent hover:border-inherit transition-colors text-sm"
            >
              {`Manual Staking`}
              <FontAwesomeIcon
                icon={faArrowUpRightFromSquare}
                className="text-xs ml-2"
                size={"xs"}
              />
            </a>
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

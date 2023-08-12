import {
  faInfoCircle,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { websiteName } from "App";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import MyValidatorsItem from "./components/MyValidatorsItem";
import { Validator } from "./components/Validator";
import { shuffleArray } from "shared/utils/commons";
import Tooltip from "@mui/material/Tooltip";
import "./Staking.scss";
import { SecretjsContext } from "shared/context/SecretjsContext";
import NoScrtWarning from "./components/NoScrtWarning";
import ValidatorModal from "./components/ValidatorModal";
import { SECRET_LCD, SECRET_CHAIN_ID } from "shared/utils/config";
import { SecretNetworkClient, MsgSetAutoRestake } from "secretjs";
import Select from "react-select";
import Title from "./components/Title";
import { useSearchParams } from "react-router-dom";
import { Nullable } from "shared/types/Nullable";

// dummy interface for better code readability
interface IValidator {
  [prop: string]: any;
}

export type StakingView = "delegate" | "redelegate" | "undelegate";

export const StakingContext = createContext(null);

export const Staking = () => {
  // URL params
  const [searchParams, setSearchParams] = useSearchParams();
  const valUrlParam = searchParams.get("val"); // selected validator

  const [view, setView] = useState<Nullable<StakingView>>(null);

  const viewUrlParam = searchParams.get("view"); // "undelegate" | "redelegate" | "delegate"

  const { secretjs, secretAddress, SCRTBalance } = useContext(SecretjsContext);

  const [validators, setValidators] = useState<IValidator[]>(null);

  const [delegatorDelegations, setDelegatorDelegations] = useState<any>();

  const [selectedValidator, setSelectedValidator] = useState<IValidator>(null);

  const [activeValidators, setActiveValidators] = useState<IValidator[]>(null);
  const [inactiveValidators, setInactiveValidators] =
    useState<IValidator[]>(null);

  const [shuffledActiveValidators, setShuffledActiveValidators] =
    useState<IValidator[]>(null);
  const [validatorsBySearch, setValidatorsBySearch] =
    useState<IValidator>(null);

  type ValidatorDisplayStatus = "active" | "inactive";
  const [validatorDisplayStatus, setValidatorDisplayStatus] =
    useState<ValidatorDisplayStatus>("active");

  const [restakeEntries, setRestakeEntries] = useState<any>();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isValidatorModalOpen, setIsValidatorModalOpen] =
    useState<boolean>(false);

  const getValByAddressStringSnippet = (addressSnippet: String) => {
    return (
      validators.find((val) => {
        return (
          val.operator_address.toLowerCase().includes(addressSnippet) ||
          val.description.moniker.toLowerCase().includes(addressSnippet)
        );
      }) || null
    );
  };

  function getViewByString(input: String): StakingView {
    input = input.toLowerCase();
    switch (input) {
      case "delegate": {
        return "delegate";
      }
      case "redelegate": {
        return "redelegate";
      }
      case "undelegate": {
        return "undelegate";
      }
      default: {
        return null;
      }
    }
  }

  useEffect(() => {
    if (viewUrlParam && validators && validators.length > 0) {
      const viewByUrlParam: Nullable<StakingView> =
        getViewByString(viewUrlParam);
      if (viewByUrlParam !== null) {
        setView(viewByUrlParam);
      }
    }
  }, [validators]);

  useEffect(() => {
    if (valUrlParam && validators && validators.length > 0) {
      const valByUrlParam: Nullable<IValidator> =
        getValByAddressStringSnippet(valUrlParam);
      if (valByUrlParam !== null) {
        setSelectedValidator(valByUrlParam);
      }
    }
  }, [validators]);

  useEffect(() => {
    const fetchDelegatorValidators = async () => {
      if (secretjs && secretAddress) {
        const { delegation_responses } =
          await secretjs.query.staking.delegatorDelegations({
            delegator_addr: secretAddress,
            "pagination.limit": 1000,
          });
        const { validators } =
          await secretjs.query.distribution.restakingEntries({
            delegator: secretAddress,
            "pagination.limit": 1000,
          });
        setRestakeEntries(validators);
        setDelegatorDelegations(delegation_responses);
      }
    };
    fetchDelegatorValidators();
  }, [secretjs, secretAddress]);

  useEffect(() => {
    const fetchValidators = async () => {
      const secretjsquery = new SecretNetworkClient({
        url: SECRET_LCD,
        chainId: SECRET_CHAIN_ID,
      });
      const { validators } = await secretjsquery.query.staking.validators({
        status: "",
        pagination: {
          limit: "1000",
        },
      });
      setValidators(validators);
      const activeValidators = validators.filter(
        (item: any) => item.status === "BOND_STATUS_BONDED"
      );
      setActiveValidators(activeValidators);
      setShuffledActiveValidators(shuffleArray(activeValidators));
      setInactiveValidators(
        validators.filter((item: any) => item.status === "BOND_STATUS_UNBONDED")
      );
    };
    fetchValidators();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setValidatorsBySearch(null);
      return;
    }
    if (shuffledActiveValidators && validatorDisplayStatus == "active") {
      setValidatorsBySearch(
        shuffledActiveValidators.filter((validator: any) =>
          validator?.description?.moniker
            .toLowerCase()
            .includes(searchQuery?.toLowerCase())
        )
      );
    }
    if (inactiveValidators && validatorDisplayStatus == "inactive") {
      setValidatorsBySearch(
        inactiveValidators.filter((validator: any) =>
          validator?.description?.moniker
            .toLowerCase()
            .includes(searchQuery?.toLowerCase())
        )
      );
    }
  }, [searchQuery, validatorDisplayStatus]);

  function enableRestakeForValidators(validatorAddresses: string[]) {
    async function submit() {
      if (!secretjs || !secretAddress) return;

      const validatorObjects = validators.filter((validator: any) => {
        return validatorAddresses.find(
          (validator_address: any) =>
            validator.operator_address === validator_address
        );
      });

      try {
        const toastId = toast.loading(
          `Enabling Auto Restaking for validators ${validatorObjects
            .map((validator: any) => {
              return validator?.description?.moniker;
            })
            .join(", ")}`,
          { closeButton: true }
        );
        const txs = delegatorDelegations.map((delegation: any) => {
          return new MsgSetAutoRestake({
            delegator_address: secretAddress,
            validator_address: delegation?.delegation?.validator_address,
            enabled: true,
          });
        });

        await secretjs.tx
          .broadcast(txs, {
            gasLimit: 100_000 * txs.length,
            gasPriceInFeeDenom: 0.25,
            feeDenom: "uscrt",
          })
          .catch((error: any) => {
            console.error(error);
            if (error?.tx?.rawLog) {
              toast.update(toastId, {
                render: `Enabling Auto Restaking failed: ${error.tx.rawLog}`,
                type: "error",
                isLoading: false,
                closeOnClick: true,
              });
            } else {
              toast.update(toastId, {
                render: `Enabling Auto Restaking failed: ${error.message}`,
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
                  render: `Enabled Auto Restaking successfully for validators ${validatorObjects
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
                  render: `Enabling Auto Restaking failed: ${tx.rawLog}`,
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

  function enableRestakeForAll() {
    async function submit() {
      if (!secretjs || !secretAddress) return;
      const toastId = toast.loading(
        `Enabling Auto Restaking for all delegations`,
        { closeButton: true }
      );
      try {
        const txs = delegatorDelegations.map((delegation: any) => {
          return new MsgSetAutoRestake({
            delegator_address: secretAddress,
            validator_address: delegation?.delegation?.validator_address,
            enabled: true,
          });
        });

        await secretjs.tx
          .broadcast(txs, {
            gasLimit: 100_000 * txs.length,
            gasPriceInFeeDenom: 0.25,
            feeDenom: "uscrt",
          })
          .catch((error: any) => {
            console.error(error);
            if (error?.tx?.rawLog) {
              toast.update(toastId, {
                render: `Enabling Auto Restaking failed: ${error.tx.rawLog}`,
                type: "error",
                isLoading: false,
                closeOnClick: true,
              });
            } else {
              toast.update(toastId, {
                render: `Enabling Auto Restaking failed: ${error.message}`,
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
                  render: `Enabled Auto Restaking successfully for all delegations`,
                  type: "success",
                  isLoading: false,
                  closeOnClick: true,
                });
              } else {
                toast.update(toastId, {
                  render: `Enabling Auto Restaking failed: ${tx.rawLog}`,
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

  function disableRestakeForAll() {
    async function submit() {
      if (!secretjs || !secretAddress) return;
      const toastId = toast.loading(
        `Disabling Auto Restaking for all delegations`,
        { closeButton: true }
      );
      try {
        const txs = delegatorDelegations.map((delegation: any) => {
          return new MsgSetAutoRestake({
            delegator_address: secretAddress,
            validator_address: delegation?.delegation?.validator_address,
            enabled: false,
          });
        });

        await secretjs.tx
          .broadcast(txs, {
            gasLimit: 100_000 * txs.length,
            gasPriceInFeeDenom: 0.25,
            feeDenom: "uscrt",
          })
          .catch((error: any) => {
            console.error(error);
            if (error?.tx?.rawLog) {
              toast.update(toastId, {
                render: `Disabling Auto Restaking failed: ${error.tx.rawLog}`,
                type: "error",
                isLoading: false,
                closeOnClick: true,
              });
            } else {
              toast.update(toastId, {
                render: `Disabling Auto Restaking failed: ${error.message}`,
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
                  render: `Disabling Auto Restaking successfully for all delegations`,
                  type: "success",
                  isLoading: false,
                  closeOnClick: true,
                });
              } else {
                toast.update(toastId, {
                  render: `Disabling Auto Restaking failed: ${tx.rawLog}`,
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

  const providerValue = {
    selectedValidator,
    setSelectedValidator,
    view,
    setView,
  };

  return (
    <StakingContext.Provider value={providerValue}>
      <>
        <Helmet>
          <title>{websiteName} | Staking</title>
        </Helmet>

        <ValidatorModal
          open={!!selectedValidator}
          delegatorDelegations={delegatorDelegations}
          restakeEntries={restakeEntries}
          onClose={() => {
            setSelectedValidator(null);
            setIsValidatorModalOpen(false);
            document.body.classList.remove("overflow-hidden");
          }}
        />

        {/* Title */}
        <Title title={"Staking"} />

        {secretjs && secretAddress && SCRTBalance === 0 ? (
          <NoScrtWarning />
        ) : null}

        {/* My Validators */}
        {delegatorDelegations && validators && (
          <div className="my-validators mb-20 max-w-6xl mx-auto">
            <div className="font-bold text-lg mb-4 px-4">My Validators</div>

            <div className="px-4 pb-2">
              <button
                onClick={() => enableRestakeForAll()}
                className="text-medium disabled:bg-neutral-600 enabled:bg-green-600 enabled:hover:bg-green-700 disabled:text-neutral-400 enabled:text-white transition-colors font-semibold px-2 py-2 text-sm rounded-md"
              >
                Enable Auto Restake
              </button>
              <Tooltip
                title={
                  'Automating the process of "claim and restake" for your SCRT. Auto-compounds your staked SCRT for increased staking returns'
                }
                placement="right"
                arrow
              >
                <FontAwesomeIcon
                  icon={faInfoCircle}
                  className="ml-2 text-neutral-400"
                />
              </Tooltip>
            </div>
            {
              <div className="my-validators flex flex-col px-4">
                {delegatorDelegations?.map((delegation: any, i: any) => (
                  <MyValidatorsItem
                    name={
                      validators.find(
                        (validator: any) =>
                          validator.operator_address ==
                          delegation.delegation.validator_address
                      )?.description?.moniker
                    }
                    commissionPercentage={
                      validators.find(
                        (validator: any) =>
                          validator.operator_address ==
                          delegation.delegation.validator_address
                      )?.commission.commission_rates?.rate
                    }
                    validator={validators.find(
                      (validator: any) =>
                        validator.operator_address ==
                        delegation.delegation.validator_address
                    )}
                    identity={validators.find(
                      (validator: any) =>
                        validator.operator_address ==
                        delegation.delegation.validator_address?.description
                          ?.identity
                    )}
                    restakeEntries={restakeEntries}
                    stakedAmount={delegation?.balance?.amount}
                    setSelectedValidator={setSelectedValidator}
                    openModal={setIsValidatorModalOpen}
                  />
                ))}
              </div>
            }
          </div>
        )}

        {/* All Validators */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="font-bold text-xl mb-4 px-4">
            Validators
            <Tooltip
              title={
                "To promote decentralization, all validators are ordered randomly."
              }
              placement="right"
              arrow
            >
              <FontAwesomeIcon
                icon={faInfoCircle}
                className="ml-2 text-neutral-400"
              />
            </Tooltip>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row items-center px-4 mb-4">
            {/* Search */}
            <div className="flex-1 w-full xs:w-auto">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="" />
                </div>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  id="search"
                  className="block w-full sm:w-72 p-2.5 pl-10 text-sm rounded-lg text-neutral-800 dark:text-white bg-white dark:bg-neutral-800 placeholder-neutral-600 dark:placeholder-neutral-400 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-500"
                  placeholder="Search Validator"
                />
              </div>
            </div>
            <div className="flex-initial items-center rounded-md" role="group">
              <button
                onClick={() => setValidatorDisplayStatus("active")}
                type="button"
                className={
                  "px-3 text-xs font-semibold rounded-l-lg py-2" +
                  (validatorDisplayStatus === "active"
                    ? " bg-green-500 text-white"
                    : " bg-gray-300 text-gray-800 hover:bg-gray-400 focus:bg-gray-400")
                }
              >
                {`Active Set ${activeValidators ? "(" : ""}${
                  activeValidators ? activeValidators?.length : ""
                }${activeValidators ? ")" : ""}`}
              </button>
              <button
                onClick={() => setValidatorDisplayStatus("inactive")}
                type="button"
                className={`px-3 text-xs font-semibold rounded-r-lg py-2 ${
                  validatorDisplayStatus === "inactive"
                    ? " bg-red-500 text-white"
                    : " bg-gray-300 text-gray-800 hover:bg-gray-400 focus:bg-gray-400"
                }`}
              >
                {`Inactive Set ${inactiveValidators ? "(" : ""}${
                  inactiveValidators ? inactiveValidators?.length : ""
                }${inactiveValidators ? ")" : ""}`}
              </button>
            </div>
          </div>

          <div className="all-validators flex flex-col px-4">
            {(validatorsBySearch
              ? validatorsBySearch
              : validatorDisplayStatus == "active"
              ? shuffledActiveValidators
              : inactiveValidators
            )?.map((validator: any, i: any) => (
              <Validator
                position={i}
                validator={validator}
                name={validator?.description?.moniker}
                commissionPercentage={
                  validator?.commission.commission_rates?.rate
                }
                votingPower={validator?.tokens}
                identity={validator?.description?.identity}
                website={validator?.description?.website}
                setSelectedValidator={setSelectedValidator}
                openModal={setIsValidatorModalOpen}
              />
            ))}
          </div>

          {validators ? (
            <>
              <div className="italic text-center mt-4 px-4 text-sm">
                Validator order is randomized.
                <Tooltip
                  title={
                    "To promote decentralization, all validators are ordered randomly."
                  }
                  placement="right"
                  arrow
                >
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="ml-2 text-neutral-400"
                  />
                </Tooltip>
              </div>
            </>
          ) : null}
        </div>
      </>
    </StakingContext.Provider>
  );
};

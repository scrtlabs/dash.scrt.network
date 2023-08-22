import {
  faInfoCircle,
  faMagnifyingGlass,
  faXmarkCircle,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { websiteName } from "App";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import MyValidatorsItem from "./components/MyValidatorsItem";
import { Validator } from "./components/Validator";
import {
  shuffleArray,
  faucetAddress,
  stakingPageTitle,
  stakingPageDescription,
  stakingJsonLdSchema,
} from "shared/utils/commons";
import Tooltip from "@mui/material/Tooltip";
import "./Staking.scss";
import { SecretjsContext } from "shared/context/SecretjsContext";
import NoScrtWarning from "./components/NoScrtWarning";
import ValidatorModal from "./components/ValidatorModal";
import { SECRET_LCD, SECRET_CHAIN_ID } from "shared/utils/config";
import {
  SecretNetworkClient,
  MsgSetAutoRestake,
  MsgWithdrawDelegationReward,
} from "secretjs";
import Select from "react-select";
import Title from "./components/Title";
import { useSearchParams } from "react-router-dom";
import { Nullable } from "shared/types/Nullable";
import BigNumber from "bignumber.js";
import { StakingView, isStakingView } from "shared/types/StakingView";

// dummy interface for better code readability
export interface IValidator {
  [prop: string]: any;
}

export interface ValidatorRestakeStatus {
  validator_address: string;
  autoRestake: boolean;
}

export const StakingContext = createContext(null);

export const Staking = () => {
  // URL params
  const [searchParams, setSearchParams] = useSearchParams();
  const validatorUrlParam = searchParams.get("validator"); // selected validator
  const viewUrlParam: Nullable<string> = searchParams.get("view"); // "undelegate" | "redelegate" | "delegate"

  const [view, setView] = useState<Nullable<StakingView>>(null);

  const handleModalClose = () => {
    setIsValidatorModalOpen(false);

    searchParams.get("validator") ? searchParams.delete("validator") : null;
    searchParams.get("view") ? searchParams.delete("view") : null;
    setSearchParams(searchParams);

    setSelectedValidator(null);
    setView(null);

    document.body.classList.remove("overflow-hidden");
  };

  const {
    secretjs,
    secretAddress,
    SCRTBalance,
    SCRTToken,
    feeGrantStatus,
    setFeeGrantStatus,
    requestFeeGrant,
  } = useContext(SecretjsContext);

  const [validators, setValidators] = useState<IValidator[]>(null);

  //Delegations that a Delegetor has
  const [delegatorDelegations, setDelegatorDelegations] = useState<any>();

  //Rewards for each delegator
  const [delegationTotalRewards, setDelegationTotalRewards] = useState<any>();

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

  //Auto Restake

  const [restakeEntries, setRestakeEntries] = useState<any>();
  const [restakeChoice, setRestakeChoice] = useState<ValidatorRestakeStatus[]>(
    []
  );

  //Search Query
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

  useEffect(() => {
    if (validatorUrlParam && validators) {
      if (getValByAddressStringSnippet(validatorUrlParam.toLowerCase())) {
        setSelectedValidator(
          getValByAddressStringSnippet(validatorUrlParam.toLowerCase())
        );
      } else {
        searchParams.delete("validator");
        searchParams.delete("view");
        setSearchParams(searchParams);
      }
    }
  }, [validatorUrlParam, validators]);

  useEffect(() => {
    if (viewUrlParam && !validatorUrlParam) {
    }
  }, [validatorUrlParam, viewUrlParam]);

  // sets view by url param
  useEffect(() => {
    if (viewUrlParam && validators) {
      if (isStakingView(viewUrlParam)) {
        setView(viewUrlParam as StakingView);
      } else {
        setView(null);
        searchParams.delete("view");
        setSearchParams(searchParams);
      }
    }
  }, [viewUrlParam, validators]);

  // sets url param by view
  useEffect(() => {
    var params = {};
    if (selectedValidator || view) {
      if (selectedValidator) {
        params = { ...params, validator: selectedValidator.operator_address };
      }
      if (view) {
        params = { ...params, view: view };
      }
      setSearchParams(params);
    }
  }, [selectedValidator, view]);

  function getViewByString(input: string): Nullable<StakingView> {
    return isStakingView(input.toLowerCase())
      ? (input.toLowerCase() as StakingView)
      : null;
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

        const result = await secretjs.query.distribution.delegationTotalRewards(
          {
            delegator_address: secretAddress,
          }
        );
        setDelegationTotalRewards(result);
        console.log(result);
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

  function doRestake() {
    if (restakeChoice.length > 0) {
      changeRestakeForValidators(restakeChoice);
    }
  }

  function changeRestakeForValidators(
    validatorRestakeStatuses: ValidatorRestakeStatus[]
  ) {
    async function submit() {
      if (!secretjs || !secretAddress) return;

      const validatorObjects = validators.filter((validator: any) => {
        return validatorRestakeStatuses.find(
          (status: ValidatorRestakeStatus) =>
            validator.operator_address === status.validator_address
        );
      });

      try {
        const toastId = toast.loading(
          `Setting Auto Restaking for validators: ${validatorObjects
            .map((validator: any) => {
              const matchedStatus = validatorRestakeStatuses.find(
                (status) =>
                  status.validator_address === validator.operator_address
              );
              return `${
                matchedStatus?.autoRestake ? "Enabling for" : "Disabling for"
              } ${validator?.description?.moniker}`;
            })
            .join(", ")}`,
          { closeButton: true }
        );
        const txs = validatorRestakeStatuses.map(
          (status: ValidatorRestakeStatus) => {
            return new MsgSetAutoRestake({
              delegator_address: secretAddress,
              validator_address: status.validator_address,
              enabled: status.autoRestake,
            });
          }
        );

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
  }

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

  const FeeGrant = () => {
    return (
      <>
        {/* Fee Grant */}
        <div className="bg-neutral-200 dark:bg-neutral-800 p-4 rounded-lg select-none flex items-center my-4">
          <div className="flex-1 flex items-center">
            <span className="font-semibold text-sm">Fee Grant</span>
            <Tooltip
              title={`Request Fee Grant so that you don't have to pay gas fees (up to 0.1 SCRT)`}
              placement="right"
              arrow
            >
              <span className="ml-2 mt-1 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
                <FontAwesomeIcon icon={faInfoCircle} />
              </span>
            </Tooltip>
          </div>
          <div className="flex-initial">
            {/* Untouched */}
            {feeGrantStatus === "Untouched" && (
              <>
                <button
                  id="feeGrantButton"
                  onClick={requestFeeGrant}
                  className="font-semibold text-xs bg-neutral-100 dark:bg-neutral-900 px-1.5 py-1 rounded-md transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-100 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40"
                  disabled={!secretjs || !secretAddress}
                >
                  Request Fee Grant
                </button>
              </>
            )}
            {/* Success */}
            {feeGrantStatus === "Success" && (
              <div className="font-semibold text-sm flex items-center h-[1.6rem]">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-green-500 mr-1.5"
                />
                Fee Granted
              </div>
            )}
            {/* Fail */}
            {feeGrantStatus === "Fail" && (
              <div className="font-semibold text-sm h-[1.6rem]">
                <FontAwesomeIcon
                  icon={faXmarkCircle}
                  className="text-red-500 mr-1.5"
                />
                Request failed
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  const providerValue = {
    validators,
    setValidators,
    delegatorDelegations,
    setDelegatorDelegations,
    selectedValidator,
    setSelectedValidator,
    view,
    setView,
  };

  return (
    <StakingContext.Provider value={providerValue}>
      <>
        <Helmet>
          <title>{stakingPageTitle}</title>

          <meta charSet="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />

          <meta name="title" content={stakingPageTitle} />
          <meta name="application-name" content={stakingPageTitle} />
          <meta name="description" content={stakingPageDescription} />
          <meta name="robots" content="index,follow" />

          <meta property="og:title" content={stakingPageTitle} />
          <meta property="og:description" content={stakingPageDescription} />
          <meta
            property="og:image"
            content={`/img/secret_dashboard_preview.png`}
          />

          <meta name="twitter:title" content={stakingPageTitle} />
          <meta name="twitter:description" content={stakingPageDescription} />
          <meta
            property="twitter:image"
            content={`/img/secret_dashboard_preview.png`}
          />

          <script type="application/ld+json">
            {JSON.stringify(stakingJsonLdSchema)}
          </script>
        </Helmet>

        <ValidatorModal
          open={!!selectedValidator}
          restakeEntries={restakeEntries}
          onClose={handleModalClose}
          delegatorDelegations={delegatorDelegations}
        />

        {/* Title */}
        <Title title={"Staking"} />

        {secretjs && secretAddress && SCRTBalance === 0 ? (
          <NoScrtWarning />
        ) : null}

        {/* My Validators */}
        {delegatorDelegations?.length != 0 && validators && (
          <div className="my-validators mb-20 max-w-6xl mx-auto">
            <div className="font-bold text-lg mb-4 px-4">My Validators</div>
            <div className="px-4 pb-2">
              <div className="staked-amount">
                <div>
                  <span className="font-semibold">
                    {" "}
                    Total amount staked:{" "}
                    {delegatorDelegations
                      ?.reduce((sum: any, delegation: any) => {
                        const amount = new BigNumber(
                          delegation?.balance?.amount || 0
                        );
                        return sum.plus(amount);
                      }, new BigNumber(0))
                      .dividedBy(`1e${SCRTToken.decimals}`)
                      .toFormat(SCRTToken.decimals)}
                  </span>
                  <span className="text-xs font-semibold text-neutral-400">
                    {" "}
                    SCRT
                  </span>
                </div>
              </div>
            </div>
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
                  identity={
                    validators.find(
                      (validator: any) =>
                        validator.operator_address ==
                        delegation.delegation.validator_address
                    )?.description?.identity
                  }
                  restakeEntries={restakeEntries}
                  stakedAmount={delegation?.balance?.amount}
                  setSelectedValidator={setSelectedValidator}
                  openModal={setIsValidatorModalOpen}
                  restakeChoice={restakeChoice}
                  setRestakeChoice={setRestakeChoice}
                />
              ))}
            </div>
            {restakeChoice.length > 0 && (
              <div className="px-4 pb-2">
                <button
                  onClick={() => doRestake()}
                  className="text-medium disabled:bg-neutral-600 enabled:bg-green-600 enabled:hover:bg-green-700 disabled:text-neutral-400 enabled:text-white transition-colors font-semibold px-2 py-2 text-sm rounded-md"
                >
                  Set Auto Restake
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
            )}
            {/* Claim Rewards*/}
            <div className="px-4 pb-2">
              <div className="staked-amount">
                {delegationTotalRewards && (
                  <div>
                    <span className="font-semibold">
                      {" "}
                      Total pending rewards:{" "}
                      {BigNumber(delegationTotalRewards?.total[0]?.amount)
                        .dividedBy(`1e${SCRTToken.decimals}`)
                        .toFormat(SCRTToken.decimals)}
                    </span>
                    <span className="text-xs font-semibold text-neutral-400">
                      {" "}
                      SCRT
                    </span>
                    <button
                      onClick={() => claimRewards()}
                      className="text-medium disabled:bg-neutral-600 enabled:bg-green-600 enabled:hover:bg-green-700 disabled:text-neutral-400 enabled:text-white transition-colors font-semibold px-2 py-2 text-sm rounded-md"
                    >
                      Claim Rewards
                    </button>
                    <Tooltip
                      title={"Claim your staking rewards"}
                      placement="right"
                      arrow
                    >
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        className="ml-2 text-neutral-400"
                      />
                    </Tooltip>
                    <FeeGrant />
                  </div>
                )}
              </div>
            </div>
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

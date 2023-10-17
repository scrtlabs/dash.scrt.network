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
import { SecretNetworkClient } from "secretjs";
import Select from "react-select";
import Title from "../shared/components/Title";
import { useSearchParams } from "react-router-dom";
import { Nullable } from "shared/types/Nullable";
import BigNumber from "bignumber.js";
import { StakingView, isStakingView } from "shared/types/StakingView";
import ClaimRewardsModal from "./components/ClaimRewardsModal";
import ManageAutoRestakeModal from "./components/ManageAutoRestakeModal";

// dummy interface for better code readability
export interface IValidator {
  [prop: string]: any;
}

export interface ValidatorRestakeStatus {
  validatorAddress: string;
  autoRestake: boolean;
  stakedAmount: string;
}

export const StakingContext = createContext(null);

export const Staking = () => {
  // URL params
  const [searchParams, setSearchParams] = useSearchParams();
  const validatorUrlParam = searchParams.get("validator"); // selected validator
  const viewUrlParam: Nullable<string> = searchParams.get("view"); // "undelegate" | "redelegate" | "delegate"

  const [view, setView] = useState<Nullable<StakingView>>(null);

  const [reload, setReload] = useState(false);

  const handleStakingModalClose = () => {
    setIsValidatorModalOpen(false);

    searchParams.get("validator") ? searchParams.delete("validator") : null;
    searchParams.get("view") ? searchParams.delete("view") : null;
    setSearchParams(searchParams);

    setSelectedValidator(null);
    setView(null);

    document.body.classList.remove("overflow-hidden");
  };

  const handleClaimRewardsModal = () => {
    setIsClaimRewardsModalOpen(false);

    document.body.classList.remove("overflow-hidden");
  };

  const { secretjs, SCRTBalance, SCRTToken } = useContext(SecretjsContext);

  const [validators, setValidators] = useState<IValidator[]>(null);
  const [activeValidators, setActiveValidators] = useState<IValidator[]>(null);
  const [inactiveValidators, setInactiveValidators] =
    useState<IValidator[]>(null);

  //Delegations that a Delegetor has
  const [delegatorDelegations, setDelegatorDelegations] = useState<any>();

  //Rewards for each delegator
  const [delegationTotalRewards, setDelegationTotalRewards] = useState<any>();

  const totalPendingRewards = () => {
    return BigNumber(delegationTotalRewards?.total[0]?.amount)
      .dividedBy(`1e${SCRTToken.decimals}`)
      .toFormat(SCRTToken.decimals);
  };

  const totalAmountStaked = () => {
    return delegatorDelegations
      ?.reduce((sum: any, delegation: any) => {
        const amount = new BigNumber(delegation?.balance?.amount || 0);
        return sum.plus(amount);
      }, new BigNumber(0))
      .dividedBy(`1e${SCRTToken.decimals}`)
      .toFormat(SCRTToken.decimals);
  };

  const [selectedValidator, setSelectedValidator] = useState<IValidator>(null);

  const [shuffledActiveValidators, setShuffledActiveValidators] =
    useState<IValidator[]>(null);
  const [validatorsBySearch, setValidatorsBySearch] =
    useState<IValidator>(null);

  type ValidatorDisplayStatus = "active" | "inactive";
  const [validatorDisplayStatus, setValidatorDisplayStatus] =
    useState<ValidatorDisplayStatus>("active");

  //Auto Restake
  const [restakeChoices, setRestakeChoices] = useState<
    ValidatorRestakeStatus[]
  >([]);
  const [restakeEntries, setRestakeEntries] = useState<any>();

  //Search Query
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isValidatorModalOpen, setIsValidatorModalOpen] =
    useState<boolean>(false);

  const [isClaimRewardsModalOpen, setIsClaimRewardsModalOpen] =
    useState<boolean>(false);

  const [isManageAutoRestakeModalOpen, setIsManageAutoRestakeModalOpen] =
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
      if (secretjs && secretjs?.address) {
        const { delegation_responses } =
          await secretjs.query.staking.delegatorDelegations({
            delegator_addr: secretjs?.address,
            pagination: { limit: "1000" },
          });
        const { validators } =
          await secretjs.query.distribution.restakingEntries({
            delegator: secretjs?.address,
            pagination: { limit: "1000" },
          });
        setRestakeEntries(validators);
        setRestakeChoices(
          delegation_responses.map((validator: any) => ({
            validatorAddress: validator?.delegation?.validator_address,
            autoRestake: validators.some((item: any) => {
              return item === validator?.delegation?.validator_address;
            }),
            stakedAmount: validator?.balance?.amount,
          }))
        );
        setDelegatorDelegations(delegation_responses);

        const result = await secretjs.query.distribution.delegationTotalRewards(
          {
            delegator_address: secretjs?.address,
          }
        );
        setDelegationTotalRewards(result);
      }
    };
    fetchDelegatorValidators();
  }, [secretjs, secretjs?.address, reload]);

  useEffect(() => {
    const fetchValidators = async () => {
      const secretjsquery = new SecretNetworkClient({
        url: SECRET_LCD,
        chainId: SECRET_CHAIN_ID,
      });
      const { validators } = await secretjsquery.query.staking.validators({
        status: "",
        pagination: { limit: "1000" },
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

  function handleManageAutoRestakeModal() {
    setIsManageAutoRestakeModalOpen(false);
  }

  const providerValue = {
    validators,
    setValidators,
    delegatorDelegations,
    setDelegatorDelegations,
    selectedValidator,
    setSelectedValidator,
    delegationTotalRewards,
    setDelegationTotalRewards,
    view,
    setView,
    reload,
    setReload,
    restakeChoices,
    setRestakeChoices,
    restakeEntries,
    setRestakeEntries,
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

        <ManageAutoRestakeModal
          open={isManageAutoRestakeModalOpen}
          onClose={handleManageAutoRestakeModal}
        />

        <ClaimRewardsModal
          open={isClaimRewardsModalOpen}
          onClose={handleClaimRewardsModal}
        />

        <ValidatorModal
          open={!!selectedValidator}
          restakeEntries={restakeEntries}
          onClose={handleStakingModalClose}
        />

        {/* Title */}
        <Title title={"Staking"} />

        {secretjs && secretjs?.address && SCRTBalance == 0 ? (
          <NoScrtWarning />
        ) : null}

        {/* My Validators */}
        {secretjs &&
          secretjs?.address &&
          delegatorDelegations &&
          delegatorDelegations?.length != 0 &&
          validators && (
            <div className="my-validators mb-20 max-w-6xl mx-auto">
              <div className="font-semibold text-xl mb-4 px-4">
                My Validators
              </div>

              {/* Claim Rewards*/}
              {delegationTotalRewards && (
                <div className="px-4 mb-4 flex items-center flex-col sm:flex-row gap-2 sm:gap-4 text-center sm:text-left">
                  <div className="flex-1">
                    <span className="font-semibold">{`Total Pending Rewards: `}</span>
                    <span>{totalPendingRewards()}</span>
                    <span className="text-xs font-semibold text-neutral-400">
                      {" "}
                      SCRT
                    </span>
                  </div>

                  <button
                    onClick={() => setIsClaimRewardsModalOpen(true)}
                    className="flex-initial text-medium disabled:bg-neutral-600 enabled:bg-green-600 enabled:hover:bg-green-700 disabled:text-neutral-400 enabled:text-white transition-colors font-semibold px-2 py-2 text-sm rounded-md"
                  >
                    Claim Pending Rewards
                  </button>
                </div>
              )}

              <div className="my-validators flex flex-col px-4">
                {delegatorDelegations?.map((delegation: any, i: number) => {
                  const validator = validators.find(
                    (item: any) =>
                      item.operator_address ==
                      delegation.delegation.validator_address
                  );
                  return (
                    <MyValidatorsItem
                      key={i}
                      name={validator?.description?.moniker}
                      commissionPercentage={
                        validator?.commission.commission_rates?.rate
                      }
                      validator={validator}
                      identity={validator?.description?.identity}
                      restakeEntries={restakeEntries}
                      stakedAmount={delegation?.balance?.amount}
                      setSelectedValidator={setSelectedValidator}
                      openModal={setIsValidatorModalOpen}
                    />
                  );
                })}
              </div>

              {/* Total Staked | Auto Restake */}
              <div className="px-4 mt-4 flex flex-col sm:flex-row gap-2 sm:gap-4 text-center sm:text-left">
                <div className="flex-1">
                  <span className="font-semibold">{`Total Amount Staked: `}</span>
                  <span>{`${totalAmountStaked()} `}</span>
                  <span className="text-xs font-semibold text-neutral-400">
                    SCRT
                  </span>
                </div>

                <button
                  onClick={() => setIsManageAutoRestakeModalOpen(true)}
                  className="flex-initial text-medium disabled:bg-neutral-600 enabled:bg-sky-600 enabled:hover:bg-sky-700 disabled:text-neutral-400 enabled:text-white transition-colors font-semibold px-2 py-2 text-sm rounded-md"
                >
                  Manage Auto Restake
                </button>
              </div>
            </div>
          )}

        {/* All Validators */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="font-semibold text-xl mb-4 px-4">
            All Validators
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
            {validatorsBySearch ||
            shuffledActiveValidators ||
            inactiveValidators ? (
              (validatorsBySearch
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
              ))
            ) : (
              <div className="animate-pulse flex">
                <Validator
                  position={0}
                  validator={undefined}
                  name={""}
                  commissionPercentage={undefined}
                  votingPower={undefined}
                  identity={undefined}
                  website={undefined}
                  setSelectedValidator={null}
                  openModal={null}
                />
              </div>
            )}
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

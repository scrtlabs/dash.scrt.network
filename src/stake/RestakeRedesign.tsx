import {
  faArrowUpRightFromSquare,
  faChevronRight,
  faGlobe,
  faInfoCircle,
  faMagnifyingGlass,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { websiteName } from "App";
import React, { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import MyValidatorsItem from "./components/MyValidatorsItem";
import AllValidatorsItem from "./components/AllValidatorsItem";
import { shuffleArray } from "shared/utils/commons";
import Tooltip from "@mui/material/Tooltip";
import "./RestakeRedesign.scss";
import { SecretjsContext } from "shared/context/SecretjsContext";
import NoScrtWarning from "./components/NoScrtWarning";
import ValidatorModal from "./components/ValidatorModal";
import { SECRET_LCD, SECRET_CHAIN_ID } from "shared/utils/config";
import { SecretNetworkClient } from "secretjs";
import { APIContext } from "shared/context/APIContext";

// for html-head

function RestakeRedesign() {
  const { secretjs, secretAddress } = useContext(SecretjsContext);
  const [validators, setValidators] = useState<any>();
  const [delegatorDelegations, setDelegatorDelegations] = useState<any>();
  const [activeValidators, setActiveValidators] = useState<any>();
  const [shuffledActiveValidators, setShuffledActiveValidators] =
    useState<any>();
  const [searchedActiveValidators, setSearchedActiveValidators] =
    useState<any>();
  const [inactiveValidators, setInactiveValidators] = useState<any>();
  const [searchText, setSearchText] = useState<any>();

  const [isValidatorModalOpen, setIsValidatorModalOpen] = useState(false);

  const { currentPrice, setCurrentPrice } = useContext(APIContext);

  useEffect(() => {
    const fetchDelegatorValidators = async () => {
      if (secretjs && secretAddress) {
        const { delegation_responses } =
          await secretjs.query.staking.delegatorDelegations({
            delegator_addr: secretAddress,
            "pagination.limit": 1000,
          });
        console.log(delegation_responses);
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
        "pagination.limit": 1000,
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
    if (shuffledActiveValidators) {
      setSearchedActiveValidators(
        shuffledActiveValidators.filter((validator: any) =>
          validator?.description?.moniker
            .toLowerCase()
            .includes(searchText.toLowerCase())
        )
      );
    }
  }, [searchText]);

  return (
    <>
      <Helmet>
        <title>{websiteName} | Staking</title>
      </Helmet>

      <ValidatorModal
        open={isValidatorModalOpen}
        onClose={() => {
          setIsValidatorModalOpen(false);
          document.body.classList.remove("overflow-hidden");
        }}
      />

      {/* Title */}
      <div className="text-center mb-4 max-w-6xl mx-auto">
        <h1 className="font-bold text-4xl inline text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500">
          Staking
        </h1>
      </div>

      {/* TODO: Check if user has SCRT */}
      {secretjs && secretAddress ? <NoScrtWarning /> : null}

      {/* My Validators */}
      <div className="my-validators mb-20 max-w-6xl mx-auto">
        <div className="font-bold text-lg mb-4 px-4">My Validators</div>

        <div className="px-4 pb-2">
          <button
            disabled
            onClick={() => alert("In implementation")}
            className="text-medium disabled:bg-neutral-600 enabled:bg-green-600 enabled:hover:bg-green-700 disabled:text-neutral-400 enabled:text-white transition-colors font-semibold px-2 py-2 text-sm rounded-md"
          >
            Enable Auto Restake
          </button>
          <Tooltip
            title={
              'Automating the process of "claim and restake" for your SCRT'
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
            {delegatorDelegations &&
              validators &&
              delegatorDelegations?.map((delegation: any, i: any) => (
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
                  stakedAmount={delegation?.balance?.amount}
                  openModal={setIsValidatorModalOpen}
                />
              ))}
          </div>
        }
      </div>

      {/* All Validators */}
      <div className="max-w-6xl mx-auto">
        <div className="font-bold text-lg mb-4 px-4">All Validators</div>
        <div className="grid grid-cols-12 px-4">
          {/* Search */}
          <div className="col-span-12 md:col-span-6">
            <div className="relative w-full sm:w-96 mb-4">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="" />
              </div>
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                type="text"
                id="search"
                className="block w-full p-2.5 pl-10 text-sm rounded-lg text-neutral-800 dark:text-white bg-white dark:bg-neutral-800 placeholder-neutral-600 dark:placeholder-neutral-400 border border-neutra-300 dark:border-neutral-700"
                placeholder="Search"
              />
            </div>
          </div>
        </div>
        <div className="all-validators flex flex-col px-4">
          {searchedActiveValidators &&
            searchedActiveValidators?.map((validator: any, i: any) => (
              <AllValidatorsItem
                position={i}
                name={validator?.description?.moniker}
                commissionPercentage={
                  validator?.commission.commission_rates?.rate
                }
                votingPower={validator?.tokens}
                identity={validator?.description?.identity}
                website={validator?.description?.website}
                openModal={setIsValidatorModalOpen}
              />
            ))}
          {!searchedActiveValidators &&
            shuffledActiveValidators?.map((validator: any, i: any) => (
              <AllValidatorsItem
                position={i}
                name={validator?.description?.moniker}
                commissionPercentage={
                  validator?.commission.commission_rates?.rate
                }
                votingPower={validator?.tokens}
                identity={validator?.description?.identity}
                website={validator?.description?.website}
                openModal={setIsValidatorModalOpen}
              />
            ))}
        </div>
      </div>
    </>
  );
}

export default RestakeRedesign;

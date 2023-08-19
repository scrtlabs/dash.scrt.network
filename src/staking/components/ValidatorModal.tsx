import {
  faGlobe,
  faLink,
  faXmark,
  faInfoCircle,
  faMagnifyingGlass,
  faXmarkCircle,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useState } from "react";
import { APIContext } from "shared/context/APIContext";
import { usdString, formatNumber } from "shared/utils/commons";
import BigNumber from "bignumber.js";
import { SECRET_LCD, SECRET_CHAIN_ID } from "shared/utils/config";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import Tooltip from "@mui/material/Tooltip";
import { chains } from "shared/utils/config";
import {
  SecretNetworkClient,
  validatorAddressToSelfDelegatorAddress,
} from "secretjs";
import { Nullable } from "shared/types/Nullable";
import { StakingContext } from "staking/Staking";
import StakingForm from "./validatorModalComponents/StakingForm";
import { SecretjsContext } from "shared/context/SecretjsContext";

interface IValidatorModalProps {
  open: boolean;
  onClose: any;
  delegatorDelegations: any;
  restakeEntries: any;
}

const ValidatorModal = (props: IValidatorModalProps) => {
  const [imgUrl, setImgUrl] = useState<Nullable<string>>(null);

  const {
    dappsData,
    setDappsData,
    dappsDataSorted,
    setDappsDataSorted,
    tags,
    setTags,
    coingeckoApiData_Day,
    setCoinGeckoApiData_Day,
    coingeckoApiData_Month,
    setCoinGeckoApiData_Month,
    coingeckoApiData_Year,
    setCoinGeckoApiData_Year,
    defiLamaApiData_Year,
    setDefiLamaApiData_Year,
    spartanApiData,
    setSpartanApiData,
    currentPrice,
    setCurrentPrice,
    volume,
    setVolume,
    blockHeight,
    inflation,
    communityTax,
    communityPool,
    pool,
    totalSupply,
    bondedToken,
    notBondedToken,
    secretFoundationTax,
    marketCap,
    setMarketCap,
  } = useContext(APIContext);

  const {
    SCRTBalance,
    SCRTToken,
    feeGrantStatus,
    setFeeGrantStatus,
    requestFeeGrant,
    secretjs,
    secretAddress,
  } = useContext(SecretjsContext);

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

  const [realYield, setRealYield] = useState<Nullable<number>>(null);

  const { selectedValidator, setSelectedValidator, view, setView } =
    useContext(StakingContext);

  //debug
  setView("delegate");

  useEffect(() => {
    if (
      inflation &&
      secretFoundationTax >= 0 &&
      selectedValidator?.commission?.commission_rates?.rate &&
      communityTax &&
      bondedToken &&
      totalSupply
    ) {
      const I = inflation; // inflation
      const F = secretFoundationTax; // foundation tax
      const C = selectedValidator?.commission?.commission_rates?.rate; // validator commision rate; median is 5%
      const T = parseFloat(communityTax); // community tax
      const R = bondedToken / totalSupply; // bonded ratio
      setRealYield((I / R) * (1 - F - T) * (1 - C) * 100);
    }
  }, [
    inflation,
    secretFoundationTax,
    selectedValidator?.commission?.commission_rates?.rate,
    communityTax,
    bondedToken,
    totalSupply,
  ]);

  const [validatorSelfDelegation, setValidatorSelfDelegation] = useState<any>();

  // disable body scroll on open
  useEffect(() => {
    if (props.open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    const fetchValidatorSelfDelegations = async () => {
      const selfDelegatingAddr = validatorAddressToSelfDelegatorAddress(
        selectedValidator?.operator_address
      );
      const secretjsquery = new SecretNetworkClient({
        url: SECRET_LCD,
        chainId: SECRET_CHAIN_ID,
      });
      const { delegation_response } =
        await secretjsquery.query.staking.delegation({
          delegator_addr: selfDelegatingAddr,
          validator_addr: selectedValidator?.operator_address,
        });
      setValidatorSelfDelegation(delegation_response?.balance.amount);
    };
    const fetchKeybaseImgUrl = async () => {
      const url = `https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${selectedValidator?.description?.identity}&fields=pictures`;
      await fetch(url)
        .then((response) => response.json())
        .catch((e) => {})
        .then((response) => {
          if (response?.them[0]) {
            setImgUrl(response?.them[0].pictures?.primary?.url);
          } else {
            setImgUrl(undefined);
          }
        })
        .catch((e) => {});
    };
    if (selectedValidator?.description?.identity) {
      setImgUrl(undefined);
      fetchKeybaseImgUrl();
    }
    if (selectedValidator?.operator_address) {
      setValidatorSelfDelegation(undefined);
      fetchValidatorSelfDelegations();
    }
  }, [props]);

  if (!props.open) return null;

  return (
    <>
      {/* Outer */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 z-50 flex justify-center items-center"
        onClick={props.onClose}
      >
        {/* Inner */}
        <div className="absolute top-[10%] w-full onEnter_fadeInDown">
          <div className="mx-auto max-w-4xl px-4">
            <div
              className="bg-neutral-900 p-8 rounded-2xl"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {/* Header */}
              <div className="mb-0 text-right">
                <button
                  onClick={props.onClose}
                  className="text-neutral-500 hover:bg-neutral-800 transition-colors px-1.5 py-1 rounded-lg text-xl"
                >
                  <FontAwesomeIcon icon={faXmark} className="fa-fw" />
                </button>
              </div>
              <div className="max-h-[80vh] overflow-y-auto">
                {/* Your content goes here */}
                {/* Header */}
                {/* <div className="mb-4 text-center">
                 <h2 className="text-2xl font-medium mb-4">Lorem Ipsum</h2>
                 <p className="text-neutral-400 mx-auto mb-6">
                   Lorem, ipsum dolor sit amet consectetur adipisicing elit
                 </p>
                 <button
                   onClick={props.onClose}
                   className="sm:max-w-[225px] w-full md:px-4 bg-cyan-600 text-cyan-00 hover:text-cyan-100 hover:bg-cyan-500 text-center transition-colors py-2.5 rounded-xl font-semibold text-sm"
                 >
                   Close
                 </button>
               </div> */}

                {/* Body */}
                <div className="grid grid-cols-12 gap-4">
                  {/* Picture | Title | Info */}
                  <div className="col-span-12">
                    <div className="flex gap-4 items-center">
                      <div className="image">
                        {imgUrl ? (
                          <>
                            <img
                              src={imgUrl}
                              alt={`validator logo`}
                              className="rounded-full w-10"
                            />
                          </>
                        ) : (
                          <>
                            <div className="relative bg-blue-500 rounded-full w-10 h-10">
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold">
                                {/* .charAt(0) or .slice(0,1) won't work here with emojis! */}
                                {[
                                  ...selectedValidator?.description?.moniker,
                                ][0].toUpperCase()}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      <div>
                        <div className="mb-1">
                          <span className="font-semibold">
                            {selectedValidator?.description?.moniker}
                          </span>
                          {selectedValidator?.description?.website && (
                            <a
                              href={selectedValidator?.description?.website}
                              target="_blank"
                              className="group font-medium text-sm"
                            >
                              <FontAwesomeIcon
                                icon={faGlobe}
                                size="sm"
                                className="ml-3 mr-1 text-neutral-500 group-hover:text-white"
                              />
                              <span className="hidden group-hover:inline-block">
                                Website
                              </span>
                            </a>
                          )}
                        </div>
                        <div className="flex gap-4 items-center">
                          {/*                       {selectedValidator?.status === "BOND_STATUS_BONDED" && (
                        <div className="border border-green-500 bg-transparent text-green-500 text-sm rounded px-4 py-2 flex items-center justify-start">
                          Active Set
                        </div>
                      )} */}
                          {selectedValidator?.status ===
                            "BOND_STATUS_UNBONDED" && (
                            <div className="border border-red-500 bg-transparent text-red-500 text-sm rounded px-4 py-2 flex items-center justify-start">
                              Inactive
                            </div>
                          )}
                        </div>
                        <div className="text-neutral-400 font-medium text-sm">
                          <div className="commission font-semibold">
                            Commission{" "}
                            {(
                              selectedValidator?.commission?.commission_rates
                                ?.rate * 100
                            ).toFixed(2)}
                            % | APR {formatNumber(realYield, 2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedValidator?.description?.details ? (
                    <div className="col-span-12">
                      <div className="text-sm border dark:border-neutral-600 rounded-md p-4 text-center sm:text-left">
                        <div className="font-semibold text-white mb-1">
                          Description
                        </div>
                        <div className="italic text-neutral-400">
                          {selectedValidator?.description?.details}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {view === null ? (
                    <>
                      <div className="col-span-12">
                        {/* Properties of the Val */}
                        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-8 rounded-md grid grid-cols-12 gap-6">
                          {/* First Item */}
                          {selectedValidator?.description?.identity && (
                            <CopyToClipboard
                              text={selectedValidator?.description?.identity}
                              onCopy={() => {
                                toast.success(
                                  "Validator identity copied to clipboard!"
                                );
                              }}
                            >
                              <div className="col-span-12 sm:col-span-6 flex flex-col gap-0.5 text-neutral-400 dark:text-neutral-500 font-semibold">
                                <div className="text-xs">Identity</div>
                                <div className="text-sm">
                                  {`${selectedValidator?.description?.identity}  `}
                                  <Tooltip
                                    title={"Copy to clipboard"}
                                    placement="bottom"
                                    arrow
                                  >
                                    <button className="text-neutral-500 enabled:hover:text-white enabled:active:text-neutral-500 transition-colors">
                                      <FontAwesomeIcon icon={faCopy} />
                                    </button>
                                  </Tooltip>
                                </div>
                              </div>
                            </CopyToClipboard>
                          )}
                          {/* Second Item */}
                          {selectedValidator?.description?.security_contact && (
                            <CopyToClipboard
                              text={
                                selectedValidator?.description?.security_contact
                              }
                              onCopy={() => {
                                toast.success(
                                  "Validator security contact copied to clipboard!"
                                );
                              }}
                            >
                              <div className="col-span-12 sm:col-span-6 flex flex-col gap-0.5 text-neutral-400 dark:text-neutral-500 font-semibold">
                                <div className="text-xs">Contact</div>
                                <div className="text-sm">
                                  {`${selectedValidator?.description?.security_contact}  `}
                                  <Tooltip
                                    title={"Copy to clipboard"}
                                    placement="bottom"
                                    arrow
                                  >
                                    <button className="text-neutral-500 enabled:hover:text-white enabled:active:text-neutral-500 transition-colors">
                                      <FontAwesomeIcon icon={faCopy} />
                                    </button>
                                  </Tooltip>
                                </div>
                              </div>
                            </CopyToClipboard>
                          )}
                          {/* Third Item */}
                          <div className="col-span-12 sm:col-span-6 flex flex-col gap-0.5">
                            <div className="text-neutral-400 dark:text-neutral-500 text-xs font-semibold">
                              Staked Tokens
                            </div>
                            <div className="text-neutral-400 dark:text-neutral-500 text-sm font-semibold">
                              {`${formatNumber(
                                selectedValidator?.tokens / 1e6,
                                2
                              )} SCRT`}
                            </div>
                          </div>
                          {/*
                    <div className="col-span-12 sm:col-span-6 flex flex-col gap-0.5">
                      <div className="text-neutral-400 dark:text-neutral-500 text-xs font-semibold">
                        Minimum Self Delegation
                      </div>
                      <div className="text-neutral-400 dark:text-neutral-500 text-sm font-semibold">
                        {`${selectedValidator?.min_self_delegation} SCRT`}
                      </div>
                    </div>*/}
                          {/* Fourth Item */}

                          <div className="col-span-12 sm:col-span-6 flex flex-col gap-0.5">
                            <div className="text-neutral-400 dark:text-neutral-500 text-xs font-semibold">
                              Self Delegation
                            </div>
                            <div className="text-neutral-400 dark:text-neutral-500 text-sm font-semibold">
                              {" "}
                              {validatorSelfDelegation &&
                                `${formatNumber(
                                  validatorSelfDelegation / 1e6,
                                  2
                                )} SCRT`}{" "}
                              {!validatorSelfDelegation && (
                                <div className="animate-pulse">
                                  <div className="bg-neutral-700/40 rounded col-span-2 w-16 h-8"></div>
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Fifth Item */}
                          <CopyToClipboard
                            text={selectedValidator?.operator_address}
                            onCopy={() => {
                              toast.success(
                                "Operator address copied to clipboard!"
                              );
                            }}
                          >
                            <div className="col-span-12 sm:col-span-6 flex flex-col gap-0.5">
                              <div className="text-neutral-400 dark:text-neutral-500 text-xs font-semibold">
                                Operator Address
                              </div>
                              <div className="text-neutral-400 dark:text-neutral-500 text-sm font-semibold">
                                {`${
                                  selectedValidator?.operator_address.slice(
                                    0,
                                    15
                                  ) +
                                  "..." +
                                  selectedValidator?.operator_address.slice(-15)
                                } `}
                                <Tooltip
                                  title={"Copy to clipboard"}
                                  placement="bottom"
                                  arrow
                                >
                                  <button className="text-neutral-500 enabled:hover:text-white enabled:active:text-neutral-500 transition-colors">
                                    <FontAwesomeIcon icon={faCopy} />
                                  </button>
                                </Tooltip>
                              </div>
                            </div>
                          </CopyToClipboard>
                          {/* Sixth Item */}
                          <CopyToClipboard
                            text={validatorAddressToSelfDelegatorAddress(
                              selectedValidator?.operator_address
                            )}
                            onCopy={() => {
                              toast.success(
                                "Validator address copied to clipboard!"
                              );
                            }}
                          >
                            <div className="col-span-12 sm:col-span-6 flex flex-col gap-0.5">
                              <div className="text-neutral-400 dark:text-neutral-500 text-xs font-semibold">
                                Validator Address
                              </div>

                              <div className="text-neutral-400 dark:text-neutral-500 text-sm font-semibold">
                                <a
                                  href={`${
                                    chains["Secret Network"].explorer_account
                                  }${validatorAddressToSelfDelegatorAddress(
                                    selectedValidator?.operator_address
                                  )}`}
                                  target="_blank"
                                >
                                  {`${
                                    validatorAddressToSelfDelegatorAddress(
                                      selectedValidator?.operator_address
                                    ).slice(0, 15) +
                                    "..." +
                                    validatorAddressToSelfDelegatorAddress(
                                      selectedValidator?.operator_address
                                    ).slice(-15)
                                  } `}
                                </a>
                                <Tooltip
                                  title={"Copy to clipboard"}
                                  placement="bottom"
                                  arrow
                                >
                                  <button className="text-neutral-500 enabled:hover:text-white enabled:active:text-neutral-500 transition-colors">
                                    <FontAwesomeIcon icon={faCopy} />
                                  </button>
                                </Tooltip>
                              </div>
                            </div>
                          </CopyToClipboard>
                        </div>
                      </div>
                    </>
                  ) : null}

                  {/* Available to Stake */}
                  <div className="col-span-12 md:col-span-6">
                    <div className="bg-white/5 rounded-xl px-4 py-8 mt-4 text-center sm:text-left">
                      <div className="font-bold mb-2">Available to Stake</div>
                      <div className="font-semibold">
                        {new BigNumber(SCRTBalance!)
                          .dividedBy(`1e${SCRTToken.decimals}`)
                          .toFormat()}
                        <span className="text-neutral-400 text-xs">{` SCRT`}</span>
                      </div>
                      <div className="font-semibold text-neutral-400 mt-0.5 text-sm">
                        {usdString.format(
                          new BigNumber(SCRTBalance!)
                            .dividedBy(`1e${SCRTToken.decimals}`)
                            .toNumber()
                        )}
                      </div>
                    </div>
                  </div>

                  {props.delegatorDelegations?.find(
                    (delegatorDelegation: any) =>
                      selectedValidator?.operator_address ==
                      delegatorDelegation.delegation.validator_address
                  ) ? (
                    <>
                      {/* Your Delegation */}
                      <div className="col-span-12 md:col-span-6">
                        <div className="bg-white/5 rounded-xl px-4 py-8 mt-4 text-center sm:text-left">
                          <div className="font-bold mb-2">Your Delegation</div>
                          <div className="font-semibold">
                            {props.delegatorDelegations?.find(
                              (delegatorDelegation: any) =>
                                selectedValidator?.operator_address ==
                                delegatorDelegation.delegation.validator_address
                            )?.balance?.amount / 1e6}
                            <span className="text-neutral-400 text-xs">{` SCRT`}</span>
                          </div>
                          <div className="font-semibold text-neutral-400 mt-0.5 text-sm">
                            {usdString.format(
                              new BigNumber(
                                props.delegatorDelegations?.find(
                                  (delegatorDelegation: any) =>
                                    selectedValidator?.operator_address ==
                                    delegatorDelegation.delegation
                                      .validator_address
                                )?.balance?.amount
                              )
                                .dividedBy(`1e6`)
                                .multipliedBy(Number(currentPrice))
                                .toNumber()
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Your Delegation */}
                      <div className="col-span-12 md:col-span-6">
                        <div className="bg-white/5 rounded-xl px-4 py-8 mt-4 text-center sm:text-left">
                          <div className="font-bold mb-2">Your Delegation</div>
                          <div className="font-semibold">
                            {0}
                            <span className="text-neutral-400 text-xs">{` SCRT`}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {view === "delegate" ? (
                    <>
                      <div className="col-span-12">
                        <StakingForm />
                      </div>
                    </>
                  ) : null}
                  {view === null ? (
                    <>
                      <div className="col-span-12">
                        {/* Navigation */}
                        <div className="flex flex-col sm:flex-row-reverse justify-start mt-4 gap-2">
                          {/* <div className="py-4">
                      <button className="bg-neutral-800 hover:bg-neutral-700 font-semibold px-3 py-2 rounded-md">
                        <FontAwesomeIcon icon={faLink} className="fa-fw" />
                      </button>
                    </div> */}
                          <button className="bg-blue-600 hover:bg-blue-500 font-semibold px-4 py-2 rounded-md">
                            Delegate
                          </button>
                          <button className="bg-neutral-800 hover:bg-neutral-700 font-semibold px-4 py-2 rounded-md">
                            Redelegate
                          </button>
                          <button className="bg-neutral-800 hover:bg-neutral-700 font-semibold px-4 py-2 rounded-md">
                            Undelegate
                          </button>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ValidatorModal;

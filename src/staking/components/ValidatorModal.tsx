import { faGlobe, faLink, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useState } from "react";
import { APIContext } from "shared/context/APIContext";
import { usdString, formatNumber } from "shared/utils/commons";
import BigNumber from "bignumber.js";
import { SECRET_LCD, SECRET_CHAIN_ID } from "shared/utils/config";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import {
  SecretNetworkClient,
  validatorAddressToSelfDelegatorAddress,
} from "secretjs";
import { Nullable } from "shared/types/Nullable";

interface IValidatorModalProps {
  open: boolean;
  onClose: any;
  delegatorDelegations: any;
  selectedValidator: any;
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

  const [realYield, setRealYield] = useState<Nullable<number>>(null);

  useEffect(() => {
    if (
      inflation &&
      secretFoundationTax >= 0 &&
      props.selectedValidator?.commission?.commission_rates?.rate &&
      communityTax &&
      bondedToken &&
      totalSupply
    ) {
      const I = inflation; // inflation
      const F = secretFoundationTax; // foundation tax
      const C = props.selectedValidator?.commission?.commission_rates?.rate; // validator commision rate; median is 5%
      const T = parseFloat(communityTax); // community tax
      const R = bondedToken / totalSupply; // bonded ratio
      setRealYield((I / R) * (1 - F - T) * (1 - C) * 100);
    }
  }, [
    inflation,
    secretFoundationTax,
    props.selectedValidator?.commission?.commission_rates?.rate,
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
        props.selectedValidator?.operator_address
      );
      const secretjsquery = new SecretNetworkClient({
        url: SECRET_LCD,
        chainId: SECRET_CHAIN_ID,
      });
      const { delegation_response } =
        await secretjsquery.query.staking.delegation({
          delegator_addr: selfDelegatingAddr,
          validator_addr: props.selectedValidator?.operator_address,
        });
      setValidatorSelfDelegation(delegation_response?.balance.amount);
    };
    const fetchKeybaseImgUrl = async () => {
      const url = `https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${props.selectedValidator?.description?.identity}&fields=pictures`;
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
    if (props.selectedValidator?.description?.identity) {
      setImgUrl(undefined);
      fetchKeybaseImgUrl();
    }
    if (props.selectedValidator?.operator_address) {
      setValidatorSelfDelegation(undefined);
      fetchValidatorSelfDelegations();
    }
  }, [props]);

  if (!props.open) return null;

  return (
    <>
      {/* Outer */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 z-50"
        onClick={props.onClose}
      >
        {/* Inner */}
        <div className="absolute top-[5%] w-full onEnter_fadeInDown">
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
              <div className="flex flex-col gap-4">
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
                              ...props.selectedValidator?.description?.moniker,
                            ][0].toUpperCase()}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div>
                    <div className="mb-1">
                      <span className="font-semibold">
                        {props.selectedValidator?.description?.moniker}
                      </span>
                      {props.selectedValidator?.description?.website && (
                        <a
                          href={props.selectedValidator?.description?.website}
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
                    {/* <div className="flex gap-4 items-center">
                       {props.selectedValidator?.status === "BOND_STATUS_BONDED" && (
                         <div className="border border-green-500 bg-transparent text-green-500 text-sm rounded px-4 py-2 flex items-center justify-start">
                           Active Set
                         </div>
                       )}
                       {props.selectedValidator?.status === "BOND_STATUS_UNBONDED" && (
                         <div className="border border-red-500 bg-transparent text-red-500 text-sm rounded px-4 py-2 flex items-center justify-start">
                           Inactive
                         </div>
                       )}
                     </div> */}
                    <div className="text-neutral-400 font-medium text-sm">
                      <div className="commission font-semibold">
                        Commission{" "}
                        {(
                          props.selectedValidator?.commission?.commission_rates
                            ?.rate * 100
                        ).toFixed(2)}
                        % | APR {formatNumber(realYield, 2)}%
                      </div>
                    </div>
                  </div>
                </div>
                {props.selectedValidator?.description?.details ? (
                  <div>
                    <div className="text-sm border dark:border-neutral-600 rounded-md p-4">
                      <div className="font-semibold text-white mb-1">
                        Description
                      </div>
                      <div className="italic text-neutral-400">
                        {props.selectedValidator?.description?.details}
                      </div>
                    </div>
                  </div>
                ) : null}
                {/* Properties of the Val */}
                <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-8 rounded-md grid grid-cols-12 gap-6">
                  {/* First Item */}
                  {props.selectedValidator?.description?.identity && (
                    <CopyToClipboard
                      text={props.selectedValidator?.description?.identity}
                      onCopy={() => {
                        toast.success(
                          "Validator identity copied to clipboard!"
                        );
                      }}
                    >
                      <div className="col-span-12 sm:col-span-6 flex flex-col gap-0.5 text-neutral-400 dark:text-neutral-500 font-semibold">
                        <div className="text-xs">Identity</div>
                        <div className="text-sm">
                          {`${props.selectedValidator?.description?.identity} `}
                          <button className="text-neutral-500 enabled:hover:text-white enabled:active:text-neutral-500 transition-colors">
                            <FontAwesomeIcon icon={faCopy} />
                          </button>
                        </div>
                      </div>
                    </CopyToClipboard>
                  )}
                  {/* Second Item */}
                  {props.selectedValidator?.description?.security_contact && (
                    <CopyToClipboard
                      text={
                        props.selectedValidator?.description?.security_contact
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
                          {`${props.selectedValidator?.description?.security_contact} `}
                          <button className="text-neutral-500 enabled:hover:text-white enabled:active:text-neutral-500 transition-colors">
                            <FontAwesomeIcon icon={faCopy} />
                          </button>
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
                        props.selectedValidator?.tokens / 1e6,
                        2
                      )} SCRT`}
                    </div>
                  </div>
                  {/* Fourth Item */}
                  <div className="col-span-12 sm:col-span-6 flex flex-col gap-0.5">
                    <div className="text-neutral-400 dark:text-neutral-500 text-xs font-semibold">
                      Minimum Self Delegation
                    </div>
                    <div className="text-neutral-400 dark:text-neutral-500 text-sm font-semibold">
                      {`${props.selectedValidator?.min_self_delegation} SCRT`}
                    </div>
                  </div>
                  {/* Fifth Item */}
                  {validatorSelfDelegation && (
                    <div className="col-span-12 sm:col-span-6 flex flex-col gap-0.5">
                      <div className="text-neutral-400 dark:text-neutral-500 text-xs font-semibold">
                        Self Delegation
                      </div>
                      <div className="text-neutral-400 dark:text-neutral-500 text-sm font-semibold">{`${formatNumber(
                        validatorSelfDelegation / 1e6,
                        2
                      )} SCRT`}</div>
                    </div>
                  )}
                  {/* Sixth Item */}
                  <CopyToClipboard
                    text={props.selectedValidator?.operator_address}
                    onCopy={() => {
                      toast.success("Validator address copied to clipboard!");
                    }}
                  >
                    <div className="col-span-12 sm:col-span-6 flex flex-col gap-0.5">
                      <div className="text-neutral-400 dark:text-neutral-500 text-xs font-semibold">
                        Validator Address
                      </div>
                      <div className="text-neutral-400 dark:text-neutral-500 text-sm font-semibold">
                        {`${
                          props.selectedValidator?.operator_address.slice(
                            0,
                            19
                          ) +
                          "..." +
                          props.selectedValidator?.operator_address.slice(-19)
                        } `}
                        <button className="text-neutral-500 enabled:hover:text-white enabled:active:text-neutral-500 transition-colors">
                          <FontAwesomeIcon icon={faCopy} />
                        </button>
                      </div>
                    </div>
                  </CopyToClipboard>
                </div>
                {/* Seventh Item */}
                <CopyToClipboard
                  text={props.selectedValidator?.operator_address}
                  onCopy={() => {
                    toast.success("Validator address copied to clipboard!");
                  }}
                >
                  <div className="col-span-12 sm:col-span-6 flex flex-col gap-0.5">
                    <div className="text-neutral-400 dark:text-neutral-500 text-xs font-semibold">
                      Validator Address
                    </div>
                    <div className="text-neutral-400 dark:text-neutral-500 text-sm font-semibold">
                      {`${
                        props.selectedValidator?.operator_address.slice(0, 19) +
                        "..." +
                        props.selectedValidator?.operator_address.slice(-19)
                      } `}
                      <button className="text-neutral-500 enabled:hover:text-white enabled:active:text-neutral-500 transition-colors">
                        <FontAwesomeIcon icon={faCopy} />
                      </button>
                    </div>
                  </div>
                </CopyToClipboard>
                {/* Highlighted Box */}
                {props.delegatorDelegations?.find(
                  (delegatorDelegation: any) =>
                    props.selectedValidator?.operator_address ==
                    delegatorDelegation.delegation.validator_address
                ) && (
                  <div className="bg-white/5 rounded-xl px-4 py-8 mt-4">
                    <div className="font-bold mb-2">Your Delegation</div>
                    <div className="font-semibold">
                      {props.delegatorDelegations?.find(
                        (delegatorDelegation: any) =>
                          props.selectedValidator?.operator_address ==
                          delegatorDelegation.delegation.validator_address
                      )?.balance?.amount / 1e6}
                      <span className="text-neutral-400">{` SCRT`}</span>
                    </div>
                    <div className="font-semibold text-neutral-400 mt-0.5 text-sm">
                      {usdString.format(
                        new BigNumber(
                          props.delegatorDelegations?.find(
                            (delegatorDelegation: any) =>
                              props.selectedValidator?.operator_address ==
                              delegatorDelegation.delegation.validator_address
                          )?.balance?.amount
                        )
                          .dividedBy(`1e6`)
                          .multipliedBy(Number(currentPrice))
                          .toNumber()
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
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
          </div>
        </div>
      </div>
    </>
  );
};

export default ValidatorModal;

import { useEffect, useState, useContext, createContext } from "react";
import { MsgExecuteContract } from "secretjs";
import { Token, tokens } from "shared/utils/config";
import {
  sleep,
  faucetURL,
  faucetAddress,
  viewingKeyErrorString,
  usdString,
  wrapPageTitle,
  wrapPageDescription,
  wrapJsonLdSchema,
} from "shared/utils/commons";
import BigNumber from "bignumber.js";
import { toast } from "react-toastify";
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
import UnknownBalanceModal from "./components/UnknownBalanceModal";
import FeeGrantInfoModal from "./components/FeeGrantInfoModal";
import {
  getWalletViewingKey,
  SecretjsContext,
} from "shared/context/SecretjsContext";
import mixpanel from "mixpanel-browser";
import { useSearchParams } from "react-router-dom";
import { WrappingMode } from "shared/types/WrappingMode";
import { APIContext } from "shared/context/APIContext";

export const WrapContext = createContext(null);

export function Wrap() {
  const {
    feeGrantStatus,
    setFeeGrantStatus,
    requestFeeGrant,
    loadingTokenBalance,
    setLoadingTokenBalance,
    setViewingKey,
    SCRTBalance,
    setSCRTBalance,
    sSCRTBalance,
    setSSCRTBalance,
    secretjs,
    secretAddress,
    connectWallet,
  } = useContext(SecretjsContext);

  const { prices } = useContext(APIContext);

  const secretToken: Token = tokens.find((token) => token.name === "SCRT");
  const [selectedToken, setSelectedToken] = useState<Token>(secretToken);
  const [selectedTokenPrice, setSelectedTokenPrice] = useState<number>(0);
  const [amountString, setAmountString] = useState<string>("");
  const [wrappingMode, setWrappingMode] = useState<WrappingMode>("wrap");

  useEffect(() => {
    setSelectedTokenPrice(
      prices.find(
        (price: { coingecko_id: string }) =>
          price.coingecko_id === selectedToken.coingecko_id
      )?.priceUsd
    );
  }, [selectedToken, prices]);

  // URL params
  const [searchParams, setSearchParams] = useSearchParams();
  const modeUrlParam = searchParams.get("mode");
  const tokenUrlParam = searchParams.get("token");

  const isValidTokenParam = () => {
    return tokens.find(
      (token) => token.name.toLowerCase() === tokenUrlParam.toLowerCase()
    )
      ? true
      : false;
  };

  useEffect(() => {
    if (
      modeUrlParam?.toLowerCase() === "wrap" ||
      modeUrlParam?.toLowerCase() === "unwrap"
    ) {
      setWrappingMode(modeUrlParam.toLowerCase() as WrappingMode);
    }
  }, []);

  useEffect(() => {
    if (tokenUrlParam && isValidTokenParam()) {
      setSelectedToken(
        tokens.find(
          (token) => token.name.toLowerCase() === tokenUrlParam.toLowerCase()
        )
      );
    }
  }, []);

  useEffect(() => {
    var params = {};
    if (wrappingMode) {
      params = { ...params, mode: wrappingMode.toLowerCase() };
    }
    if (selectedToken) {
      params = { ...params, token: selectedToken.name.toLowerCase() };
    }
    setSearchParams(params);
  }, [wrappingMode, selectedToken]);

  const [isUnknownBalanceModalOpen, setIsUnknownBalanceModalOpen] =
    useState(false);
  const [isFeeGrantInfoModalOpen, setIsFeeGrantInfoModalOpen] = useState(false);

  // UI
  const [isValidAmount, setisValidAmount] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [isValidationActive, setIsValidationActive] = useState<boolean>(false);

  const [loadingCoinBalance, setLoadingCoinBalance] = useState<boolean>(true);

  function validateForm() {
    let isValid = false;
    const availableAmount = new BigNumber(
      wrappingMode === "wrap" ? SCRTBalance : sSCRTBalance
    ).dividedBy(`1e${selectedToken.decimals}`);

    const numberRegex = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;

    function matchExact(r: any, str: any) {
      const match = str.match(r);
      return match && str === match[0];
    }

    if (
      new BigNumber(amountString).isGreaterThan(
        new BigNumber(availableAmount)
      ) &&
      !(sSCRTBalance == viewingKeyErrorString && wrappingMode === "unwrap") &&
      amountString !== ""
    ) {
      setValidationMessage("Not enough balance");
      setisValidAmount(false);
    } else if (!matchExact(numberRegex, amountString) || amountString === "") {
      setValidationMessage("Please enter a valid amount");
      setisValidAmount(false);
    } else {
      setisValidAmount(true);
      isValid = true;
    }
    return isValid;
  }

  useEffect(() => {
    // setting amountToWrap to max. value, if entered value is > available
    const availableAmount =
      wrappingMode === "wrap"
        ? new BigNumber(SCRTBalance).dividedBy(`1e${selectedToken.decimals}`)
        : new BigNumber(sSCRTBalance).dividedBy(`1e${selectedToken.decimals}`);
    if (
      !new BigNumber(amountString).isNaN() &&
      availableAmount.isGreaterThan(new BigNumber(0)) &&
      new BigNumber(amountString).isGreaterThan(
        new BigNumber(availableAmount)
      ) &&
      !(sSCRTBalance == viewingKeyErrorString && wrappingMode === "unwrap") &&
      amountString !== ""
    ) {
      setAmountString(availableAmount.toString());
    }

    if (isValidationActive) {
      validateForm();
    }
  }, [amountString, wrappingMode, isValidationActive]);

  useEffect(() => {
    setAmountString("");
  }, [selectedToken, wrappingMode]);

  function handleInputChange(e: any) {
    const filteredValue = e.target.value.replace(/[^0-9.]+/g, "");
    setAmountString(filteredValue);
  }

  function showModal() {
    setIsUnknownBalanceModalOpen(true);
    document.body.classList.add("overflow-hidden");
  }

  function toggleWrappingMode() {
    if (wrappingMode === "wrap") {
      setWrappingMode("unwrap");
    } else if (wrappingMode === "unwrap") {
      setWrappingMode("wrap");
    }
  }

  const message =
    wrappingMode === "wrap"
      ? `Converting publicly visible ${selectedToken.name} into its privacy-preserving equivalent s${selectedToken.name}. These tokens are not publicly visible and require a viewing key!`
      : `Converting privacy-preserving s${selectedToken.name} into its publicly visible equivalent ${selectedToken.name}!`;

  {
    new BigNumber(sSCRTBalance!)
      .dividedBy(`1e${selectedToken.decimals}`)
      .toFormat();
  }

  // handles [25% | 50% | 75% | Max] Button-Group
  function setAmountByPercentage(percentage: number) {
    let maxValue = "0";
    if (wrappingMode === "wrap") {
      maxValue = SCRTBalance;
    } else {
      maxValue = sSCRTBalance;
    }

    if (maxValue) {
      let availableAmount = new BigNumber(maxValue).dividedBy(
        `1e${selectedToken.decimals}`
      );
      let potentialInput = availableAmount.toNumber() * (percentage * 0.01);
      if (
        percentage == 100 &&
        potentialInput > 0.05 &&
        selectedToken.name === "SCRT"
      ) {
        potentialInput = potentialInput - 0.05;
      }
      if (Number(potentialInput) == 0) {
        setAmountString("");
      } else {
        setAmountString(potentialInput.toFixed(selectedToken.decimals));
      }

      validateForm();
    }
  }

  async function setBalance() {
    try {
      setLoadingCoinBalance(true);
      setLoadingTokenBalance(true);
      await updateCoinBalance();
      await updateTokenBalance();
    } finally {
      setLoadingCoinBalance(false);
      setLoadingTokenBalance(false);
    }
  }

  async function updateBalance() {
    try {
      await updateCoinBalance();
      await updateTokenBalance();
    } catch (e) {
      console.log(e);
    }
  }

  const updateTokenBalance = async () => {
    if (!selectedToken.address || !secretjs) {
      return;
    }

    const key = await getWalletViewingKey(selectedToken.address);
    if (!key) {
      setSSCRTBalance(viewingKeyErrorString);
      return;
    }

    try {
      const result: {
        viewing_key_error: any;
        balance: {
          amount: string;
        };
      } = await secretjs.query.compute.queryContract({
        contract_address: selectedToken.address,
        code_hash: selectedToken.code_hash,
        query: {
          balance: { address: secretAddress, key },
        },
      });

      if (result.viewing_key_error) {
        setSSCRTBalance(viewingKeyErrorString);
        return;
      }

      setSSCRTBalance(result.balance.amount);
    } catch (e) {
      console.error(`Error getting balance for s${selectedToken.name}`, e);

      setSSCRTBalance(viewingKeyErrorString);
    }
  };

  function PercentagePicker() {
    return (
      <div className="inline-flex rounded-full text-xs font-bold">
        <button
          onClick={() => setAmountByPercentage(25)}
          className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-l-md transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40 focus:z-10"
          disabled={
            !secretjs ||
            !secretAddress ||
            (wrappingMode === "unwrap" && sSCRTBalance == viewingKeyErrorString)
          }
        >
          25%
        </button>
        <button
          onClick={() => setAmountByPercentage(50)}
          className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 border-l border-neutral-300 dark:border-neutral-700 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40 focus:z-10"
          disabled={
            !secretjs ||
            !secretAddress ||
            (wrappingMode === "unwrap" && sSCRTBalance == viewingKeyErrorString)
          }
        >
          50%
        </button>
        <button
          onClick={() => setAmountByPercentage(75)}
          className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 border-l border-neutral-300 dark:border-neutral-700 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40 focus:z-10"
          disabled={
            !secretjs ||
            !secretAddress ||
            (wrappingMode === "unwrap" && sSCRTBalance == viewingKeyErrorString)
          }
        >
          75%
        </button>
        <button
          onClick={() => setAmountByPercentage(100)}
          className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-r-md border-l border-neutral-300 dark:border-neutral-700 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40 focus:z-10"
          disabled={
            !secretjs ||
            !secretAddress ||
            (wrappingMode === "unwrap" && sSCRTBalance == viewingKeyErrorString)
          }
        >
          MAX
        </button>
      </div>
    );
  }

  function NativeTokenBalanceUi() {
    if (!loadingCoinBalance && secretjs && secretAddress && SCRTBalance) {
      return (
        <>
          <span className="font-semibold">Available:</span>
          <span className="font-medium">
            {" " +
              new BigNumber(SCRTBalance!)
                .dividedBy(`1e${selectedToken.decimals}`)
                .toFormat()}{" "}
            {selectedToken.name} (
            {usdString.format(
              new BigNumber(SCRTBalance!)
                .dividedBy(`1e${selectedToken.decimals}`)
                .multipliedBy(Number(selectedTokenPrice))
                .toNumber()
            )}
            )
          </span>

          <Tooltip title={`IBC Transfer`} placement="bottom" arrow>
            <Link
              to="/ibc"
              className="ml-2 hover:text-w dark:hover:text-white transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900 px-1.5 py-0.5 rounded focus:outline-0 focus:ring-2 ring-sky-500/40"
            >
              <FontAwesomeIcon icon={faArrowRightArrowLeft} />
            </Link>
          </Tooltip>
        </>
      );
    } else {
      return <></>;
    }
  }

  function WrappedTokenBalanceUi() {
    if (loadingTokenBalance || !secretjs || !secretAddress || !sSCRTBalance) {
      return <></>;
    } else if (sSCRTBalance == viewingKeyErrorString) {
      return (
        <>
          <span className="font-semibold">Available:</span>
          <button
            className="ml-2 font-semibold bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-md border-neutral-300 dark:border-neutral-700 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-100 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40"
            onClick={() => setViewingKey(selectedToken)}
          >
            <FontAwesomeIcon icon={faKey} className="mr-2" />
            Set Viewing Key
          </button>
          <Tooltip
            title={
              "Balances on Secret Network are private by default. Create a viewing key to view your encrypted balances."
            }
            placement="right"
            arrow
          >
            <span className="ml-2 mt-1 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
              <FontAwesomeIcon icon={faInfoCircle} />
            </span>
          </Tooltip>
        </>
      );
    } else if (Number(sSCRTBalance) > -1) {
      return (
        <>
          {/* Available: 0.123456 sSCRT () */}
          <span className="font-semibold">Available:</span>
          <span className="font-medium">
            {` ${new BigNumber(sSCRTBalance!)
              .dividedBy(`1e${selectedToken.decimals}`)
              .toFormat()} s` +
              selectedToken.name +
              ` (${usdString.format(
                new BigNumber(sSCRTBalance!)
                  .dividedBy(`1e${selectedToken.decimals}`)
                  .multipliedBy(Number(selectedTokenPrice))
                  .toNumber()
              )})`}
          </span>
        </>
      );
    }
  }

  interface IWrappingModeSwitchProps {
    wrappingMode: WrappingMode;
    disabled: boolean;
  }

  function WrappingModeSwitch(props: IWrappingModeSwitchProps) {
    return (
      <div className="text-center my-4">
        <Tooltip
          disableHoverListener={props.disabled}
          title={`Switch to ${
            wrappingMode === "wrap" ? "Unwrapping" : "Wrapping"
          }`}
          placement="right"
          arrow
        >
          <span>
            <button
              onClick={toggleWrappingMode}
              disabled={props.disabled}
              className={
                "inline-block bg-neutral-200 dark:bg-neutral-800 px-3 py-2 text-cyan-500 dark:text-cyan-500 transition-colors rounded-xl disabled:text-neutral-500 dark:disabled:text-neutral-500 focus:outline-0 focus:ring-2 ring-sky-500/40" +
                (!props.disabled
                  ? " hover:text-cyan-600 dark:hover:text-cyan-300"
                  : "")
              }
            >
              <FontAwesomeIcon icon={faRightLeft} className="fa-rotate-90" />
            </button>
          </span>
        </Tooltip>
      </div>
    );
  }

  function SubmitButton(props: {
    disabled: boolean;
    amount: string | undefined;
    nativeCurrency: string;
    wrappedAmount: string | undefined;
    wrappedCurrency: string;
    wrappingMode: WrappingMode;
  }) {
    const disabled = props.disabled;
    const amount = props.amount;
    const nativeCurrency = props.nativeCurrency;
    const wrappedCurrency = props.wrappedCurrency;
    const wrappingMode = props.wrappingMode;

    function uiFocusInput() {
      document
        .getElementById("fromInputWrapper")
        ?.classList.add("animate__animated");
      document
        .getElementById("fromInputWrapper")
        ?.classList.add("animate__headShake");
      setTimeout(() => {
        document
          .getElementById("fromInputWrapper")
          ?.classList.remove("animate__animated");
        document
          .getElementById("fromInputWrapper")
          ?.classList.remove("animate__headShake");
      }, 1000);
    }

    async function submit() {
      setIsValidationActive(true);
      let isValidForm = validateForm();

      if (!secretjs || !secretAddress) return;

      if (!isValidForm || amountString === "") {
        uiFocusInput();
        return;
      }

      const baseAmount = amountString;
      const amount = new BigNumber(Number(baseAmount))
        .multipliedBy(`1e${selectedToken.decimals}`)
        .toFixed(0, BigNumber.ROUND_DOWN);

      if (amount === "NaN") {
        console.error("NaN amount", baseAmount);
        return;
      }

      var errorMessage = "";

      try {
        const toastId = toast.loading(
          wrappingMode === "wrap"
            ? `Wrapping ${selectedToken.name}`
            : `Unwrapping s${selectedToken.name}`,
          { closeButton: true }
        );
        if (wrappingMode === "wrap") {
          await secretjs.tx
            .broadcast(
              [
                new MsgExecuteContract({
                  sender: secretAddress,
                  contract_address: selectedToken.address,
                  code_hash: selectedToken.code_hash,
                  sent_funds: [
                    { denom: selectedToken.withdrawals[0].from_denom, amount },
                  ],
                  msg: { deposit: {} },
                } as any),
              ],
              {
                gasLimit: 150_000,
                gasPriceInFeeDenom: 0.25,
                feeDenom: "uscrt",
                feeGranter: feeGrantStatus === "Success" ? faucetAddress : "",
              }
            )
            .catch((error: any) => {
              console.error(error);
              if (error?.tx?.rawLog) {
                toast.update(toastId, {
                  render: `Wrapping of ${selectedToken.name} failed: ${error.tx.rawLog}`,
                  type: "error",
                  isLoading: false,
                  closeOnClick: true,
                });
              } else {
                toast.update(toastId, {
                  render: `Wrapping of ${selectedToken.name} failed: ${error.message}`,
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
                  setAmountString("");
                  toast.update(toastId, {
                    render: `Wrapped ${selectedToken.name} successfully`,
                    type: "success",
                    isLoading: false,
                    closeOnClick: true,
                  });
                  setIsValidationActive(false);
                } else {
                  toast.update(toastId, {
                    render: `Wrapping of ${selectedToken.name} failed: ${tx.rawLog}`,
                    type: "error",
                    isLoading: false,
                    closeOnClick: true,
                  });
                }
              }
            });
        } else {
          await secretjs.tx
            .broadcast(
              [
                new MsgExecuteContract({
                  sender: secretAddress,
                  contract_address: selectedToken.address,
                  code_hash: selectedToken.code_hash,
                  sent_funds: [],
                  msg: {
                    redeem: {
                      amount,
                      denom:
                        selectedToken.name === "SCRT"
                          ? undefined
                          : selectedToken.withdrawals[0].from_denom,
                    },
                  },
                } as any),
              ],
              {
                gasLimit: 150_000,
                gasPriceInFeeDenom: 0.25,
                feeDenom: "uscrt",
                feeGranter: feeGrantStatus === "Success" ? faucetAddress : "",
              }
            )
            .catch((error: any) => {
              console.error(error);
              if (error?.tx?.rawLog) {
                toast.update(toastId, {
                  render: `Unwrapping of s${selectedToken.name} failed: ${error.tx.rawLog}`,
                  type: "error",
                  isLoading: false,
                  closeOnClick: true,
                });
              } else {
                toast.update(toastId, {
                  render: `Unwrapping of s${selectedToken.name} failed: ${error.message}`,
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
                  setAmountString("");
                  toast.update(toastId, {
                    render: `Unwrapped s${selectedToken.name} successfully`,
                    type: "success",
                    isLoading: false,
                    closeOnClick: true,
                  });
                  setIsValidationActive(false);
                } else {
                  toast.update(toastId, {
                    render: `Unwrapping of s${selectedToken.name} failed: ${tx.rawLog}`,
                    type: "error",
                    isLoading: false,
                    closeOnClick: true,
                  });
                }
              }
            });
        }
      } finally {
        if (import.meta.env.VITE_MIXPANEL_ENABLED === "true") {
          mixpanel.init(import.meta.env.VITE_MIXPANEL_PROJECT_TOKEN, {
            debug: true,
          });
          mixpanel.identify("Dashboard-App");
          mixpanel.track("Secret Wrap", {
            "Wrapping Mode": wrappingMode,
            From: (wrappingMode == "wrap" ? "" : "s") + selectedToken.name,
            To: (wrappingMode == "wrap" ? "s" : "") + selectedToken.name,
            // "Amount": amountToWrap,
            "Fee Grant used": feeGrantStatus === "Success" ? true : false,
          });
        }
        try {
          setLoadingCoinBalance(true);
          setLoadingTokenBalance(true);
          await sleep(1000); // sometimes query nodes lag
          await updateBalance();
        } finally {
          setLoadingCoinBalance(false);
          setLoadingTokenBalance(false);
        }
      }
    }

    return (
      <>
        <div className="flex flex-col gap-4 items-center">
          <button
            className={
              "enabled:bg-gradient-to-r enabled:from-cyan-600 enabled:to-purple-600 enabled:hover:from-cyan-500 enabled:hover:to-purple-500 transition-colors text-white font-semibold py-3 w-full rounded-lg disabled:bg-neutral-500 focus:outline-0 focus:ring-4 ring-sky-500/40"
            }
            disabled={disabled}
            onClick={() => submit()}
          >
            {secretAddress && secretjs && wrappingMode === "wrap" && amount ? (
              <>
                {`Wrap ${amount} ${nativeCurrency} into ${amount} ${wrappedCurrency}`}
              </>
            ) : null}

            {/* text for unwrapping with value */}
            {secretAddress &&
            secretjs &&
            wrappingMode === "unwrap" &&
            amount ? (
              <>
                {`Unwrap ${amount} ${wrappedCurrency} into ${amount} ${nativeCurrency}`}
              </>
            ) : null}

            {/* general text without value */}
            {!amount || !secretAddress || !secretAddress
              ? wrappingMode === "wrap"
                ? "Wrap"
                : "Unwrap"
              : null}
          </button>
        </div>
      </>
    );
  }

  const updateCoinBalance = async () => {
    try {
      const {
        balance: { amount },
      } = await secretjs.query.bank.balance({
        address: secretAddress,
        denom: selectedToken.withdrawals[0]?.from_denom,
      });
      setSCRTBalance(amount);
    } catch (e) {
      console.error(`Error while trying to query ${selectedToken.name}:`, e);
    }
  };

  useEffect(() => {
    if (!secretjs || !secretAddress) return;

    (async () => {
      setBalance();
    })();

    const interval = setInterval(updateBalance, 10000);
    return () => {
      clearInterval(interval);
    };
  }, [secretAddress, secretjs, selectedToken, feeGrantStatus]);

  const handleClick = () => {
    if (!secretAddress || !secretjs) {
      connectWallet();
    }
  };

  return (
    <>
      <Helmet>
        <title>{wrapPageTitle}</title>

        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="title" content={wrapPageTitle} />
        <meta name="application-name" content={wrapPageTitle} />
        <meta name="description" content={wrapPageDescription} />
        <meta name="robots" content="index,follow" />

        <meta property="og:title" content={wrapPageTitle} />
        <meta property="og:description" content={wrapPageDescription} />
        {/* <meta property="og:image" content="Image URL Here"/> */}

        <meta name="twitter:title" content={wrapPageTitle} />
        <meta name="twitter:description" content={wrapPageDescription} />
        {/* <meta name="twitter:image" content="Image URL Here"/> */}

        <script type="application/ld+json">
          {JSON.stringify(wrapJsonLdSchema)}
        </script>
      </Helmet>

      <WrapContext.Provider
        value={{
          isUnknownBalanceModalOpen,
          setIsUnknownBalanceModalOpen,
          selectedTokenName: selectedToken.name,
          amountToWrap: amountString,
          hasEnoughBalanceForUnwrapping: false,
        }}
      >
        <FeeGrantInfoModal
          open={isFeeGrantInfoModalOpen}
          onClose={() => {
            setIsFeeGrantInfoModalOpen(false);
            document.body.classList.remove("overflow-hidden");
          }}
        />
        <UnknownBalanceModal
          open={isUnknownBalanceModalOpen}
          onClose={() => {
            setIsUnknownBalanceModalOpen(false);
            document.body.classList.remove("overflow-hidden");
          }}
        />
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
                Secret {wrappingMode === "wrap" ? "Wrap" : "Unwrap"}
              </h1>

              <Tooltip title={message} placement="right" arrow>
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
                  From
                </div>
                {!isValidAmount && isValidationActive && (
                  <div className="flex-initial">
                    <div className="text-red-500 dark:text-red-500 text-xs text-center sm:text-right mb-2">
                      {validationMessage}
                    </div>
                  </div>
                )}
              </div>

              {/* Input Field */}
              <div className="flex" id="fromInputWrapper">
                <Select
                  isDisabled={!selectedToken.address || !secretAddress}
                  options={tokens.sort((a, b) => a.name.localeCompare(b.name))}
                  value={selectedToken}
                  onChange={setSelectedToken}
                  isSearchable={false}
                  formatOptionLabel={(token) => (
                    <div className="flex items-center">
                      <img
                        src={`/img/assets/${token.image}`}
                        alt={`${token.name} logo`}
                        className="w-6 h-6 mr-2 rounded-full"
                      />
                      <span className="font-semibold text-sm">
                        {wrappingMode == "unwrap" && "s"}
                        {token.name}
                      </span>
                    </div>
                  )}
                  className="react-select-wrap-container"
                  classNamePrefix="react-select-wrap"
                />
                <input
                  value={amountString}
                  onChange={handleInputChange}
                  type="number"
                  min="0"
                  step="0.000001"
                  className={
                    "text-right focus:z-10 block flex-1 min-w-0 w-full bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white px-4 rounded-r-lg disabled:placeholder-neutral-300 dark:disabled:placeholder-neutral-700 transition-colors font-medium focus:outline-0 focus:ring-2 ring-sky-500/40" +
                    (!isValidAmount && isValidationActive
                      ? "  border border-red-500 dark:border-red-500"
                      : "")
                  }
                  name="fromValue"
                  id="fromValue"
                  placeholder="0"
                  disabled={!secretjs || !secretAddress}
                />
              </div>

              {/* Balance | [25%|50%|75%|Max] */}
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 mt-2">
                <div className="flex-1 text-xs">
                  {wrappingMode === "wrap" && <NativeTokenBalanceUi />}
                  {wrappingMode === "unwrap" && <WrappedTokenBalanceUi />}
                </div>
                <div className="sm:flex-initial text-xs">
                  <PercentagePicker />
                </div>
              </div>
            </div>

            {/* Wrapping Mode Switch */}
            <WrappingModeSwitch
              wrappingMode={wrappingMode}
              disabled={!secretAddress || !secretjs}
            />

            <div className="bg-neutral-200 dark:bg-neutral-800 p-4 rounded-xl mb-5">
              <div className="flex">
                <div className="flex-1 font-semibold mb-2 text-center sm:text-left">
                  To
                </div>
              </div>

              <div className="flex">
                <Select
                  isDisabled={!selectedToken.address || !secretAddress}
                  options={tokens.sort((a, b) => a.name.localeCompare(b.name))}
                  value={selectedToken}
                  onChange={setSelectedToken}
                  isSearchable={false}
                  formatOptionLabel={(token) => (
                    <div className="flex items-center">
                      <img
                        src={`/img/assets/${token.image}`}
                        alt={`${token.name} logo`}
                        className="w-6 h-6 mr-2 rounded-full"
                      />
                      <span className="font-semibold text-sm">
                        {wrappingMode == "wrap" && "s"}
                        {token.name}
                      </span>
                    </div>
                  )}
                  className="react-select-wrap-container"
                  classNamePrefix="react-select-wrap"
                />
                <input
                  value={amountString}
                  onChange={handleInputChange}
                  type="number"
                  min="0"
                  step="0.000001"
                  className={
                    "text-right focus:z-10 block flex-1 min-w-0 w-full bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white px-4 rounded-r-lg disabled:placeholder-neutral-300 dark:disabled:placeholder-neutral-700 transition-colors font-medium focus:outline-0 focus:ring-2 ring-sky-500/40"
                  }
                  name="toValue"
                  id="toValue"
                  placeholder="0"
                  disabled={!secretjs || !secretAddress}
                />
              </div>
              <div className="flex-1 text-xs mt-3 text-center sm:text-left h-[1rem]">
                {wrappingMode === "wrap" && <WrappedTokenBalanceUi />}
                {wrappingMode === "unwrap" && <NativeTokenBalanceUi />}
              </div>
            </div>

            {/* Fee Grant */}
            <div className="bg-neutral-200 dark:bg-neutral-800 p-4 rounded-lg select-none flex items-center my-4">
              <div className="flex-1 flex items-center">
                <span className="font-semibold text-sm">Fee Grant</span>
                <Tooltip
                  title={`Request Fee Grant so that you don't have to pay gas fees (up to 0.1 SCRT)`}
                  placement="right"
                  arrow
                >
                  <FontAwesomeIcon icon={faInfoCircle} className="ml-2" />
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
                      className="text-green-500 dark:text-green-500 mr-1.5"
                    />
                    Fee Granted
                  </div>
                )}
                {/* Fail */}
                {feeGrantStatus === "Fail" && (
                  <div className="font-semibold text-sm h-[1.6rem]">
                    <FontAwesomeIcon
                      icon={faXmarkCircle}
                      className="text-red-500 dark:text-red-500 mr-1.5"
                    />
                    Request failed
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <SubmitButton
              disabled={!secretjs || !selectedToken.address || !secretAddress}
              amount={amountString}
              nativeCurrency={selectedToken.name}
              wrappedAmount={amountString}
              wrappedCurrency={"s" + selectedToken.name}
              wrappingMode={wrappingMode}
            />
          </div>
        </div>
      </WrapContext.Provider>
    </>
  );
}

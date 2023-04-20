import { useEffect, useState, useContext, createContext } from "react";
import { MsgExecuteContract } from "secretjs";
import { Token, tokens } from "shared/utils/config";
import {
  sleep,
  faucetURL,
  faucetAddress,
  viewingKeyErrorString,
  usdString,
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
import { websiteName } from "App";
import UnknownBalanceModal from "./components/UnknownBalanceModal";
import FeeGrantInfoModal from "./components/FeeGrantInfoModal";
import {
  getKeplrViewingKey,
  SecretjsContext,
  setKeplrViewingKey,
} from "shared/context/SecretjsContext";
import mixpanel from "mixpanel-browser";

export const WrapContext = createContext(null);

export function Wrap() {
  const { feeGrantStatus, setFeeGrantStatus, requestFeeGrant } =
    useContext(SecretjsContext);

  const [isUnknownBalanceModalOpen, setIsUnknownBalanceModalOpen] =
    useState(false);
  const [isFeeGrantInfoModalOpen, setIsFeeGrantInfoModalOpen] = useState(false);

  type WrappingMode = "Wrap" | "Unwrap";

  const queryParams = new URLSearchParams(window.location.search);
  const tokenByQueryParam = queryParams.get("token"); // 'scrt', 'akash', etc.
  const modeByQueryParam = queryParams.get("mode"); // 'wrap' or 'unwrap'
  const tokenPreselection = tokens.filter(
    (token) => token.name === tokenByQueryParam?.toUpperCase()
  )[0]
    ? tokenByQueryParam?.toUpperCase()
    : "SCRT";
  const modePreselection =
    modeByQueryParam?.toLowerCase() === "unwrap" ? "Unwrap" : "Wrap";

  const { secretjs, secretAddress, connectWallet } =
    useContext(SecretjsContext);

  const [amountToWrap, setAmountToWrap] = useState<string>("");
  const [wrappingMode, setWrappingMode] =
    useState<WrappingMode>(modePreselection);
  const [selectedToken, setselectedToken] = useState<Token>(
    tokens.filter((token) => token.name === tokenPreselection)[0]
  );

  // UI
  const [price, setPrice] = useState<number>();
  const [isValidAmount, setisValidAmount] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [isValidationActive, setIsValidationActive] = useState<boolean>(false);

  const [loadingWrapOrUnwrap, setLoadingWrapOrUnwrap] =
    useState<boolean>(false);
  const [loadingTokenBalance, setLoadingTokenBalance] = useState<boolean>(true);
  const [loadingCoinBalance, setLoadingCoinBalance] = useState<boolean>(true);

  const [tokenNativeBalance, setTokenNativeBalance] = useState<string>("");
  const [tokenWrappedBalance, setTokenWrappedBalance] = useState<string>("");

  function validateForm() {
    let isValid = false;
    const availableAmount = new BigNumber(
      wrappingMode === "Wrap" ? tokenNativeBalance : tokenWrappedBalance
    ).dividedBy(`1e${selectedToken.decimals}`);

    const numberRegex = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;

    function matchExact(r: any, str: any) {
      const match = str.match(r);
      return match && str === match[0];
    }

    if (
      new BigNumber(amountToWrap).isGreaterThan(
        new BigNumber(availableAmount)
      ) &&
      !(
        tokenWrappedBalance == viewingKeyErrorString &&
        wrappingMode === "Unwrap"
      ) &&
      amountToWrap !== ""
    ) {
      setValidationMessage("Not enough balance");
      setisValidAmount(false);
    } else if (!matchExact(numberRegex, amountToWrap) || amountToWrap === "") {
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
      wrappingMode === "Wrap"
        ? new BigNumber(tokenNativeBalance).dividedBy(
            `1e${selectedToken.decimals}`
          )
        : new BigNumber(tokenWrappedBalance).dividedBy(
            `1e${selectedToken.decimals}`
          );
    if (
      !new BigNumber(amountToWrap).isNaN() &&
      availableAmount.isGreaterThan(new BigNumber(0)) &&
      new BigNumber(amountToWrap).isGreaterThan(
        new BigNumber(availableAmount)
      ) &&
      !(
        tokenWrappedBalance == viewingKeyErrorString &&
        wrappingMode === "Unwrap"
      ) &&
      amountToWrap !== ""
    ) {
      setAmountToWrap(availableAmount.toString());
    }

    if (isValidationActive) {
      validateForm();
    }
  }, [amountToWrap, wrappingMode, isValidationActive]);

  // reset amountToWrap on selectedToken change
  useEffect(() => {
    setAmountToWrap("");
  }, [selectedToken, wrappingMode]);

  function handleInputChange(e: any) {
    const filteredValue = e.target.value.replace(/[^0-9.]+/g, "");
    setAmountToWrap(filteredValue);
  }

  function showModal() {
    setIsUnknownBalanceModalOpen(true);
    document.body.classList.add("overflow-hidden");
  }

  const updateFeeGrantButton = (text: string, color: string) => {
    const btnFeeGrant = document.getElementById("grantButton");
    if (btnFeeGrant != null) {
      btnFeeGrant.style.color = color;
      btnFeeGrant.textContent = text;
    }
  };

  function toggleWrappingMode() {
    if (wrappingMode === "Wrap") {
      setWrappingMode("Unwrap");
    } else {
      setWrappingMode("Wrap");
    }
  }

  const message =
    wrappingMode === "Wrap"
      ? `Converting publicly visible ${selectedToken.name} into its privacy-preserving equivalent s${selectedToken.name}. These tokens are not publicly visible and require a viewing key!`
      : `Convert privacy-preserving s${selectedToken.name} into its publicly visible equivalent ${selectedToken.name}!`;

  {
    new BigNumber(tokenWrappedBalance!)
      .dividedBy(`1e${selectedToken.decimals}`)
      .toFormat();
  }

  // handles [25% | 50% | 75% | Max] Button-Group
  function setAmountByPercentage(percentage: number) {
    let maxValue = "0";
    if (wrappingMode === "Wrap") {
      maxValue = tokenNativeBalance;
    } else {
      maxValue = tokenWrappedBalance;
    }

    if (maxValue) {
      let availableAmount = new BigNumber(maxValue).dividedBy(
        `1e${selectedToken.decimals}`
      );
      let potentialInput = availableAmount.toNumber() * (percentage * 0.01);
      console.log("availableAmount", availableAmount);
      console.log("potentialInput", potentialInput);
      if (Number(potentialInput) == 0) {
        setAmountToWrap("");
      } else {
        setAmountToWrap(potentialInput.toString());
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

    const key = await getKeplrViewingKey(selectedToken.address);
    if (!key) {
      setTokenWrappedBalance(viewingKeyErrorString);
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
        setTokenWrappedBalance(viewingKeyErrorString);
        return;
      }

      setTokenWrappedBalance(result.balance.amount);
    } catch (e) {
      console.error(`Error getting balance for s${selectedToken.name}`, e);

      setTokenWrappedBalance(viewingKeyErrorString);
    }
  };

  function PercentagePicker() {
    return (
      <div className="inline-flex rounded-full text-xs font-bold">
        <button
          onClick={() => setAmountByPercentage(25)}
          className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-l-md transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 focus:bg-neutral-500 dark:focus:bg-neutral-500 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-neutral-900 disabled:cursor-default"
          disabled={
            !secretjs ||
            !secretAddress ||
            (wrappingMode === "Unwrap" &&
              tokenWrappedBalance == viewingKeyErrorString)
          }
        >
          25%
        </button>
        <button
          onClick={() => setAmountByPercentage(50)}
          className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 border-l border-neutral-300 dark:border-neutral-700 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 focus:bg-neutral-500 dark:focus:bg-neutral-500 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-neutral-900 disabled:cursor-default"
          disabled={
            !secretjs ||
            !secretAddress ||
            (wrappingMode === "Unwrap" &&
              tokenWrappedBalance == viewingKeyErrorString)
          }
        >
          50%
        </button>
        <button
          onClick={() => setAmountByPercentage(75)}
          className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 border-l border-neutral-300 dark:border-neutral-700 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 focus:bg-neutral-500 dark:focus:bg-neutral-500 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-neutral-900 disabled:cursor-default"
          disabled={
            !secretjs ||
            !secretAddress ||
            (wrappingMode === "Unwrap" &&
              tokenWrappedBalance == viewingKeyErrorString)
          }
        >
          75%
        </button>
        <button
          onClick={() => setAmountByPercentage(100)}
          className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-r-md border-l border-neutral-300 dark:border-neutral-700 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 focus:bg-neutral-500 dark:focus:bg-neutral-500 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-neutral-900 disabled:cursor-default"
          disabled={
            !secretjs ||
            !secretAddress ||
            (wrappingMode === "Unwrap" &&
              tokenWrappedBalance == viewingKeyErrorString)
          }
        >
          MAX
        </button>
      </div>
    );
  }

  function NativeTokenBalanceUi() {
    if (
      !loadingCoinBalance &&
      secretjs &&
      secretAddress &&
      tokenNativeBalance
    ) {
      return (
        <>
          <span className="font-semibold">Available:</span>
          <span className="font-medium">
            {" " +
              new BigNumber(tokenNativeBalance!)
                .dividedBy(`1e${selectedToken.decimals}`)
                .toFormat()}{" "}
            {selectedToken.name} (
            {usdString.format(
              new BigNumber(tokenNativeBalance!)
                .dividedBy(`1e${selectedToken.decimals}`)
                .multipliedBy(Number(price))
                .toNumber()
            )}
            )
          </span>

          <Tooltip title={`IBC Transfer`} placement="bottom" arrow>
            <Link
              to="/ibc"
              className="ml-2 hover:text-w dark:hover:text-white transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900 px-1.5 py-0.5 rounded"
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
    if (
      loadingTokenBalance ||
      !secretjs ||
      !secretAddress ||
      !tokenWrappedBalance
    ) {
      return <></>;
    } else if (tokenWrappedBalance == viewingKeyErrorString) {
      return (
        <>
          <span className="font-semibold">Available:</span>
          <button
            className="ml-2 font-semibold bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-md border-neutral-300 dark:border-neutral-700 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 focus:bg-neutral-500 dark:focus:bg-neutral-500 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-100 dark:disabled:hover:bg-neutral-900 disabled:cursor-default"
            onClick={async () => {
              await setKeplrViewingKey(selectedToken.address);
              try {
                setLoadingTokenBalance(true);
                await sleep(1000); // sometimes query nodes lag
                await updateTokenBalance();
              } finally {
                setLoadingTokenBalance(false);
              }
            }}
          >
            <FontAwesomeIcon icon={faKey} className="mr-2" />
            Set Viewing Key
          </button>
        </>
      );
    } else if (Number(tokenWrappedBalance) > -1) {
      return (
        <>
          {/* Available: 0.123456 sSCRT () */}
          <span className="font-bold">Available:</span>
          <span className="font-medium">
            {` ${new BigNumber(tokenWrappedBalance!)
              .dividedBy(`1e${selectedToken.decimals}`)
              .toFormat()} s` +
              selectedToken.name +
              ` (${usdString.format(
                new BigNumber(tokenWrappedBalance!)
                  .dividedBy(`1e${selectedToken.decimals}`)
                  .multipliedBy(Number(price))
                  .toNumber()
              )})`}
          </span>
        </>
      );
    }
  }

  function WrappingModeSwitch(props: {
    wrappingMode: WrappingMode;
    disabled: boolean;
  }) {
    const disabled = props.disabled;

    return (
      <div className="text-center my-4">
        <Tooltip
          disableHoverListener={disabled}
          title={`Switch to ${
            wrappingMode === "Wrap" ? "Unwrapping" : "Wrapping"
          }`}
          placement="right"
          arrow
        >
          <span>
            <button
              onClick={() => toggleWrappingMode()}
              disabled={disabled}
              className={
                "inline-block bg-neutral-200 dark:bg-neutral-800 px-3 py-2 text-cyan-500 dark:text-cyan-500 transition-colors rounded-xl disabled:text-neutral-500 dark:disabled:text-neutral-500" +
                (!disabled
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

      if (!isValidForm || amountToWrap === "") {
        uiFocusInput();
        return;
      }

      const baseAmount = amountToWrap;
      const amount = new BigNumber(Number(baseAmount))
        .multipliedBy(`1e${selectedToken.decimals}`)
        .toFixed(0, BigNumber.ROUND_DOWN);

      if (amount === "NaN") {
        console.error("NaN amount", baseAmount);
        return;
      }

      var errorMessage = "";

      try {
        setLoadingWrapOrUnwrap(true);
        const toastId = toast.loading(
          wrappingMode === "Wrap"
            ? `Wrapping ${selectedToken.name}`
            : `Unwrapping s${selectedToken.name}`,
          { closeButton: true }
        );
        if (wrappingMode === "Wrap") {
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
                  setAmountToWrap("");
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
                  setAmountToWrap("");
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
            From: (wrappingMode == "Wrap" ? "" : "s") + selectedToken.name,
            To: (wrappingMode == "Wrap" ? "s" : "") + selectedToken.name,
            // "Amount": amountToWrap,
            "Fee Grant used": feeGrantStatus === "Success" ? true : false,
          });
        }

        setLoadingWrapOrUnwrap(false);
        try {
          setLoadingCoinBalance(true);
          await sleep(1000); // sometimes query nodes lag
          await updateCoinBalance();
        } finally {
          setLoadingCoinBalance(false);
        }
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
            {/* {wrappingMode === 'Wrap' ? 'Wrap' : 'Unwrap'} */}
            {/* text for wrapping with value */}
            {secretAddress && secretjs && wrappingMode === "Wrap" && amount && (
              <>
                {`Wrap ${amount} ${nativeCurrency} into ${amount} ${wrappedCurrency}`}
              </>
            )}

            {/* text for unwrapping with value */}
            {secretAddress &&
              secretjs &&
              wrappingMode === "Unwrap" &&
              amount && (
                <>
                  {`Unwrap ${amount} ${wrappedCurrency} into ${amount} ${nativeCurrency}`}
                </>
              )}

            {/* general text without value */}
            {(!amount || !secretAddress || !secretAddress) &&
              (wrappingMode === "Wrap" ? "Wrap" : "Unwrap")}
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
      setTokenNativeBalance(amount);
      if (
        selectedToken.withdrawals[0]?.from_denom == "uscrt" &&
        amount == "0" &&
        feeGrantStatus === "Untouched"
      ) {
        try {
          const response = await fetch(faucetURL, {
            method: "POST",
            body: JSON.stringify({ Address: secretAddress }),
            headers: { "Content-Type": "application/json" },
          });
          const result = await response;
          const textBody = await result.text();
          if (result.ok == true) {
            updateFeeGrantButton("Fee Granted", "green");
            toast.success(
              `Your wallet does not have any SCRT to pay for transaction costs. Successfully sent new fee grant (0.1 SCRT) to address ${secretAddress}.`
            );
            setFeeGrantStatus("Success");
          } else if (textBody == "Existing Fee Grant did not expire\n") {
            updateFeeGrantButton("Fee Granted", "green");
            toast.success(
              `Your wallet does not have any SCRT to pay for transaction costs. Your address ${secretAddress} however does already have an existing fee grant.`
            );
            setFeeGrantStatus("Success");
          } else {
            updateFeeGrantButton("Fee Grant failed", "red");
            toast.error(
              `Fee Grant for address ${secretAddress} failed with status code: ${result.status}`
            );
            setFeeGrantStatus("Fail");
          }
        } catch (e) {
          updateFeeGrantButton("Fee Grant failed", "red");
          toast.error(
            `Fee Grant for address ${secretAddress} failed with error: ${e}`
          );
          setFeeGrantStatus("Fail");
        }
      }
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

  useEffect(() => {
    fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${selectedToken.coingecko_id}&vs_currencies=USD`
    )
      .then((resp) => resp.json())
      .then((result: { [coingecko_id: string]: { usd: number } }) => {
        setPrice(result[selectedToken.coingecko_id].usd);
      });
  }, []);

  const handleClick = () => {
    if (!secretAddress || !secretjs) {
      connectWallet();
    }
  };

  return (
    <>
      <Helmet>
        <title>{websiteName} | Wrap</title>
      </Helmet>

      <WrapContext.Provider
        value={{
          isUnknownBalanceModalOpen,
          setIsUnknownBalanceModalOpen,
          selectedTokenName: selectedToken.name,
          amountToWrap,
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
                Secret {wrappingMode === "Wrap" ? "Wrap" : "Unwrap"}
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
                  onChange={setselectedToken}
                  isSearchable={false}
                  formatOptionLabel={(token) => (
                    <div className="flex items-center">
                      <img
                        src={`/img/assets/${token.image}`}
                        className="w-5 h-5 mr-2 rounded-full"
                      />
                      <span className="font-semibold text-sm">
                        {wrappingMode == "Unwrap" && "s"}
                        {token.name}
                      </span>
                    </div>
                  )}
                  className="react-select-wrap-container"
                  classNamePrefix="react-select-wrap"
                />
                <input
                  value={amountToWrap}
                  onChange={handleInputChange}
                  type="text"
                  className={
                    "text-right focus:z-10 block flex-1 min-w-0 w-full bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white px-4 rounded-r-lg disabled:placeholder-neutral-300 dark:disabled:placeholder-neutral-700 transition-colors font-medium" +
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
                  {wrappingMode === "Wrap" && <NativeTokenBalanceUi />}
                  {wrappingMode === "Unwrap" && <WrappedTokenBalanceUi />}
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
                  onChange={setselectedToken}
                  isSearchable={false}
                  formatOptionLabel={(token) => (
                    <div className="flex items-center">
                      <img
                        src={`/img/assets/${token.image}`}
                        className="w-6 h-6 mr-2 rounded-full"
                      />
                      <span className="font-semibold text-sm">
                        {wrappingMode == "Wrap" && "s"}
                        {token.name}
                      </span>
                    </div>
                  )}
                  className="react-select-wrap-container"
                  classNamePrefix="react-select-wrap"
                />
                <input
                  value={amountToWrap}
                  onChange={handleInputChange}
                  type="text"
                  className={
                    "text-right focus:z-10 block flex-1 min-w-0 w-full bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white px-4 rounded-r-lg disabled:placeholder-neutral-300 dark:disabled:placeholder-neutral-700 transition-colors font-medium"
                  }
                  name="toValue"
                  id="toValue"
                  placeholder="0"
                  disabled={!secretjs || !secretAddress}
                />
              </div>
              <div className="flex-1 text-xs mt-3 text-center sm:text-left h-[1rem]">
                {wrappingMode === "Wrap" && <WrappedTokenBalanceUi />}
                {wrappingMode === "Unwrap" && <NativeTokenBalanceUi />}
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
                      className="font-semibold text-xs bg-neutral-100 dark:bg-neutral-900 px-1.5 py-1 rounded-md transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 focus:bg-neutral-500 dark:focus:bg-neutral-500 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-100 dark:disabled:hover:bg-neutral-900 disabled:cursor-default"
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
              amount={amountToWrap}
              nativeCurrency={selectedToken.name}
              wrappedAmount={amountToWrap}
              wrappedCurrency={"s" + selectedToken.name}
              wrappingMode={wrappingMode}
            />
          </div>
        </div>
      </WrapContext.Provider>
    </>
  );
}

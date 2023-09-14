import { useEffect, useState, useContext, createContext } from "react";
import { MsgExecuteContract, BroadcastMode } from "secretjs";
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
  randomPadding,
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
import { WrappingMode, isWrappingMode } from "shared/types/WrappingMode";
import { APIContext } from "shared/context/APIContext";
import FeeGrant from "shared/components/FeeGrant";
import {
  NativeTokenBalanceUi,
  WrappedTokenBalanceUi,
} from "shared/components/BalanceUI";
import Title from "shared/components/Title";

export const WrapContext = createContext(null);

export function Wrap() {
  const {
    feeGrantStatus,
    setFeeGrantStatus,
    requestFeeGrant,
    setViewingKey,
    secretjs,
    connectWallet,
  } = useContext(SecretjsContext);

  const { prices } = useContext(APIContext);

  const secretToken: Token = tokens.find((token) => token.name === "SCRT");
  const [selectedToken, setSelectedToken] = useState<Token>(secretToken);
  const [selectedTokenPrice, setSelectedTokenPrice] = useState<number>(0);
  const [amountString, setAmountString] = useState<string>("0");
  const [wrappingMode, setWrappingMode] = useState<WrappingMode>("wrap");

  const [nativeBalance, setNativeBalance] = useState<any>();
  const [tokenBalance, setTokenBalance] = useState<any>();

  useEffect(() => {
    setSelectedTokenPrice(
      prices.find(
        (price: { coingecko_id: string }) =>
          price.coingecko_id === selectedToken.coingecko_id
      )?.priceUsd
    );
  }, [selectedToken, prices]);

  useEffect(() => {
    if (import.meta.env.VITE_MIXPANEL_ENABLED === "true") {
      mixpanel.init(import.meta.env.VITE_MIXPANEL_PROJECT_TOKEN, {
        debug: false,
      });
      mixpanel.identify("Dashboard-App");
      mixpanel.track("Open Wrap Tab");
    }
  }, []);

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
    if (isWrappingMode(modeUrlParam?.toLowerCase())) {
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
  const [isValidAmount, setIsValidAmount] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [isValidationActive, setIsValidationActive] = useState<boolean>(false);

  function validateForm() {
    let isValid = false;
    const availableAmount = new BigNumber(
      wrappingMode === "wrap" ? nativeBalance : tokenBalance
    ).dividedBy(`1e${selectedToken.decimals}`);

    if (
      new BigNumber(amountString).isGreaterThan(
        new BigNumber(availableAmount)
      ) &&
      !(tokenBalance == viewingKeyErrorString && wrappingMode === "unwrap") &&
      amountString !== ""
    ) {
      setValidationMessage("Not enough balance");
      setIsValidAmount(false);
    } else if (amountString === "") {
      setValidationMessage("Please enter a valid amount");
      setIsValidAmount(false);
    } else {
      setIsValidAmount(true);
      isValid = true;
    }
    return isValid;
  }

  useEffect(() => {
    // setting amountToWrap to max. value, if entered value is > available
    const availableAmount =
      wrappingMode === "wrap"
        ? new BigNumber(nativeBalance).dividedBy(`1e${selectedToken.decimals}`)
        : new BigNumber(tokenBalance).dividedBy(`1e${selectedToken.decimals}`);
    if (
      !new BigNumber(amountString).isNaN() &&
      availableAmount.isGreaterThan(new BigNumber(0)) &&
      new BigNumber(amountString).isGreaterThan(
        new BigNumber(availableAmount)
      ) &&
      !(tokenBalance == viewingKeyErrorString && wrappingMode === "unwrap") &&
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
    new BigNumber(tokenBalance!)
      .dividedBy(`1e${selectedToken.decimals}`)
      .toFormat();
  }

  // handles [25% | 50% | 75% | Max] Button-Group
  function setAmountByPercentage(percentage: number) {
    let maxValue = "0";
    if (wrappingMode === "wrap") {
      maxValue = nativeBalance;
    } else {
      maxValue = tokenBalance;
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
      if (Number(potentialInput) < 0) {
        setAmountString("");
      } else {
        setAmountString(potentialInput.toFixed(selectedToken.decimals));
      }

      validateForm();
    }
  }

  async function setBalance() {
    try {
      setNativeBalance(undefined);
      setTokenBalance(undefined);
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
      setTokenBalance(viewingKeyErrorString);
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
          balance: { address: secretjs?.address, key },
        },
      });

      if (result.viewing_key_error) {
        setTokenBalance(viewingKeyErrorString);
        return;
      }

      setTokenBalance(result.balance.amount);
    } catch (e) {
      console.error(`Error getting balance for s${selectedToken.name}`, e);

      setTokenBalance(viewingKeyErrorString);
    }
  };

  function PercentagePicker() {
    return (
      <div className="inline-flex rounded-full text-xs font-semibold">
        <button
          onClick={() => setAmountByPercentage(25)}
          className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-l-md transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40 focus:z-10"
          disabled={
            !secretjs ||
            !secretjs?.address ||
            (wrappingMode === "unwrap" && tokenBalance == viewingKeyErrorString)
          }
        >
          25%
        </button>
        <button
          onClick={() => setAmountByPercentage(50)}
          className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 border-l border-neutral-300 dark:border-neutral-700 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40 focus:z-10"
          disabled={
            !secretjs ||
            !secretjs?.address ||
            (wrappingMode === "unwrap" && tokenBalance == viewingKeyErrorString)
          }
        >
          50%
        </button>
        <button
          onClick={() => setAmountByPercentage(75)}
          className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 border-l border-neutral-300 dark:border-neutral-700 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40 focus:z-10"
          disabled={
            !secretjs ||
            !secretjs?.address ||
            (wrappingMode === "unwrap" && tokenBalance == viewingKeyErrorString)
          }
        >
          75%
        </button>
        <button
          onClick={() => setAmountByPercentage(100)}
          className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-r-md border-l border-neutral-300 dark:border-neutral-700 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40 focus:z-10"
          disabled={
            !secretjs ||
            !secretjs?.address ||
            (wrappingMode === "unwrap" && tokenBalance == viewingKeyErrorString)
          }
        >
          MAX
        </button>
      </div>
    );
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

      if (!secretjs || !secretjs?.address) return;

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
                  sender: secretjs?.address,
                  contract_address: selectedToken.address,
                  code_hash: selectedToken.code_hash,
                  sent_funds: [
                    { denom: selectedToken.withdrawals[0].from_denom, amount },
                  ],
                  msg: {
                    deposit: {
                      padding: randomPadding(),
                    },
                  },
                } as any),
              ],
              {
                gasLimit: 150_000,
                gasPriceInFeeDenom: 0.25,
                feeDenom: "uscrt",
                feeGranter: feeGrantStatus === "Success" ? faucetAddress : "",
                broadcastMode: BroadcastMode.Sync,
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
                  sender: secretjs?.address,
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
                      padding: randomPadding(),
                    },
                  },
                } as any),
              ],
              {
                gasLimit: 150_000,
                gasPriceInFeeDenom: 0.25,
                feeDenom: "uscrt",
                feeGranter: feeGrantStatus === "Success" ? faucetAddress : "",
                broadcastMode: BroadcastMode.Sync,
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
            debug: false,
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
          await sleep(1000); // sometimes query nodes lag
          await setBalance();
        } finally {
        }
      }
    }

    return (
      <>
        <div className="flex flex-col gap-4 items-center">
          <button
            className={
              "enabled:bg-gradient-to-r enabled:from-cyan-600 enabled:to-purple-600 enabled:hover:from-cyan-500 enabled:hover:to-purple-500 transition-colors text-white font-semibold py-3 w-full rounded-lg disabled:bg-neutral-500 focus:outline-none focus-visible:ring-4 ring-sky-500/40"
            }
            disabled={disabled}
            onClick={() => submit()}
          >
            {secretjs?.address &&
            secretjs &&
            wrappingMode === "wrap" &&
            amount ? (
              <>
                {`Wrap ${amount} ${nativeCurrency} into ${amount} ${wrappedCurrency}`}
              </>
            ) : null}

            {/* text for unwrapping with value */}
            {secretjs?.address &&
            secretjs &&
            wrappingMode === "unwrap" &&
            amount ? (
              <>
                {`Unwrap ${amount} ${wrappedCurrency} into ${amount} ${nativeCurrency}`}
              </>
            ) : null}

            {/* general text without value */}
            {!amount || !secretjs?.address
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
    setNativeBalance(undefined);
    try {
      const {
        balance: { amount },
      } = await secretjs.query.bank.balance({
        address: secretjs?.address,
        denom: selectedToken.withdrawals[0]?.from_denom,
      });
      setNativeBalance(amount);
    } catch (e) {
      console.error(`Error while trying to query ${selectedToken.name}:`, e);
    }
  };

  useEffect(() => {
    if (!secretjs || !secretjs?.address) return;

    (async () => {
      setBalance();
    })();

    const interval = setInterval(setBalance, 10000);
    return () => {
      clearInterval(interval);
    };
  }, [secretjs?.address, secretjs, selectedToken, feeGrantStatus]);

  const handleClick = () => {
    if (!secretjs?.address || !secretjs) {
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
          selectedToken: selectedToken,
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
          {!secretjs && !secretjs?.address ? (
            // Overlay to connect on click
            <div
              className="absolute block top-0 left-0 right-0 bottom-0 z-10"
              onClick={handleClick}
            ></div>
          ) : null}

          {/* Title */}
          <Title
            title={`Secret ${wrappingMode === "wrap" ? "Wrap" : "Unwrap"}`}
          >
            <Tooltip title={message} placement="right" arrow>
              <span className="ml-2 mt-1 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
                <FontAwesomeIcon icon={faInfoCircle} />
              </span>
            </Tooltip>
          </Title>

          {/* Content */}
          <div className="border border-neutral-200 dark:border-neutral-700 rounded-2xl p-8 w-full text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900">
            {/* *** From *** */}
            <div className="bg-neutral-200 dark:bg-neutral-800 p-4 rounded-xl">
              {/* Title Bar */}
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-center sm:text-left">
                  From
                </span>
                {!isValidAmount && isValidationActive && (
                  <span className="text-red-500 dark:text-red-500 text-xs font-normal">
                    {validationMessage}
                  </span>
                )}
              </div>

              {/* Input Field */}
              <div className="flex" id="fromInputWrapper">
                <Select
                  isDisabled={!selectedToken.address || !secretjs?.address}
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
                    "remove-arrows text-right focus:z-10 block flex-1 min-w-0 w-full bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white px-4 rounded-r-lg disabled:placeholder-neutral-300 dark:disabled:placeholder-neutral-700 transition-colors font-medium focus:outline-0 focus:ring-2 ring-sky-500/40" +
                    (!isValidAmount && isValidationActive
                      ? "  border border-red-500 dark:border-red-500"
                      : "")
                  }
                  name="fromValue"
                  id="fromValue"
                  placeholder="0"
                  disabled={!secretjs || !secretjs?.address}
                />
              </div>

              {/* Balance | [25%|50%|75%|Max] */}
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 mt-2">
                <div className="flex-1 text-xs">
                  {wrappingMode === "unwrap" &&
                    WrappedTokenBalanceUi(
                      tokenBalance,
                      selectedToken,
                      selectedTokenPrice
                    )}
                  {wrappingMode === "wrap" &&
                    NativeTokenBalanceUi(
                      nativeBalance,
                      selectedToken,
                      selectedTokenPrice
                    )}
                </div>
                <div className="sm:flex-initial text-xs">
                  <PercentagePicker />
                </div>
              </div>
            </div>

            {/* Wrapping Mode Switch */}
            <WrappingModeSwitch
              wrappingMode={wrappingMode}
              disabled={!secretjs?.address || !secretjs}
            />

            <div className="bg-neutral-200 dark:bg-neutral-800 p-4 rounded-xl mb-5">
              <div className="flex">
                <div className="flex-1 font-semibold mb-2 text-center sm:text-left">
                  To
                </div>
              </div>

              <div className="flex">
                <Select
                  isDisabled={!selectedToken.address || !secretjs?.address}
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
                    "remove-arrows text-right focus:z-10 block flex-1 min-w-0 w-full bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white px-4 rounded-r-lg disabled:placeholder-neutral-300 dark:disabled:placeholder-neutral-700 transition-colors font-medium focus:outline-0 focus:ring-2 ring-sky-500/40"
                  }
                  name="toValue"
                  id="toValue"
                  placeholder="0"
                  disabled={!secretjs || !secretjs?.address}
                />
              </div>
              <div className="flex-1 text-xs mt-3 text-center sm:text-left h-[1rem]">
                {wrappingMode === "wrap" &&
                  WrappedTokenBalanceUi(
                    tokenBalance,
                    selectedToken,
                    selectedTokenPrice
                  )}
                {wrappingMode === "unwrap" &&
                  NativeTokenBalanceUi(
                    nativeBalance,
                    selectedToken,
                    selectedTokenPrice
                  )}
              </div>
            </div>

            {/* Fee Grant */}
            <FeeGrant />

            {/* Submit Button */}
            <SubmitButton
              disabled={
                !secretjs || !selectedToken.address || !secretjs?.address
              }
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

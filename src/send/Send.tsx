import { useEffect, useState, useContext, createContext } from "react";
import {
  MsgExecuteContract,
  BroadcastMode,
  MsgSend,
  validateAddress,
} from "secretjs";
import { Token } from "shared/utils/config";
import {
  sleep,
  faucetURL,
  faucetAddress,
  viewingKeyErrorString,
  usdString,
  sendPageTitle,
  sendPageDescription,
  sendJsonLdSchema,
  allTokens,
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
import {
  getWalletViewingKey,
  SecretjsContext,
} from "shared/context/SecretjsContext";
import mixpanel from "mixpanel-browser";
import { useSearchParams } from "react-router-dom";
import { APIContext } from "shared/context/APIContext";
import FeeGrant from "shared/components/FeeGrant";
import {
  NativeTokenBalanceUi,
  WrappedTokenBalanceUi,
} from "shared/components/BalanceUI";
import Title from "shared/components/Title";
import PercentagePicker from "shared/components/PercentagePicker";

export function Send() {
  const { feeGrantStatus, secretjs, connectWallet } =
    useContext(SecretjsContext);

  const { prices } = useContext(APIContext);

  let tokens = JSON.parse(JSON.stringify(allTokens));
  const tokenToModify = tokens.find((token: any) => token.name === "SCRT");
  if (tokenToModify) {
    tokenToModify.address = "native";
  }

  const SCRT = allTokens[0];

  tokens = [SCRT, ...tokens];

  const secretToken: Token = tokens.find(
    (token: any) =>
      token.name === "SCRT" &&
      token.address === "secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8fzek"
  );

  const [selectedToken, setSelectedToken] = useState<Token>(secretToken);
  const [selectedTokenPrice, setSelectedTokenPrice] = useState<number>(0);
  const [amountString, setAmountString] = useState<string>("0");

  const [destinationAddress, setDestinationAddress] = useState<string>("");
  const [memo, setMemo] = useState<string>("");

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
  const tokenUrlParam = searchParams.get("token");

  const isValidTokenParam = () => {
    return tokens.find(
      (token: any) => token.name.toLowerCase() === tokenUrlParam.toLowerCase()
    )
      ? true
      : false;
  };

  useEffect(() => {
    if (tokenUrlParam && isValidTokenParam()) {
      setSelectedToken(
        tokens.find(
          (token: any) =>
            token.name.toLowerCase() === tokenUrlParam.toLowerCase()
        )
      );
    }
  }, []);

  // UI
  const [isValidAmount, setIsValidAmount] = useState<boolean>(false);
  const [isValidDestination, setIsValidDestination] = useState<boolean>(false);
  const [amountValidationMessage, setAmountValidationMessage] =
    useState<string>("");
  const [destinationValidationMessage, setDestinationValidationMessage] =
    useState<string>("");
  const [isValidationActive, setIsValidationActive] = useState<boolean>(false);

  function validateForm() {
    let isValidAmount = false;
    let isValidDestination = false;

    const availableAmount = new BigNumber(
      selectedToken.address === "native" ? nativeBalance : tokenBalance
    ).dividedBy(`1e${selectedToken.decimals}`);

    if (
      new BigNumber(amountString).isGreaterThan(
        new BigNumber(availableAmount)
      ) &&
      !(tokenBalance == viewingKeyErrorString) &&
      amountString !== ""
    ) {
      setAmountValidationMessage("Not enough balance");
    } else if (amountString === "") {
      setAmountValidationMessage("Please enter a valid amount");
    } else {
      isValidAmount = true;
    }
    setIsValidAmount(isValidAmount);

    if (validateAddress(destinationAddress).isValid) {
      isValidDestination = true;
    } else {
      setDestinationValidationMessage("Please enter a valid address");
    }
    setIsValidDestination(isValidDestination);

    return isValidAmount && isValidDestination;
  }

  useEffect(() => {
    // setting amountToWrap to max. value, if entered value is > available
    const availableAmount =
      selectedToken.address === "native"
        ? new BigNumber(nativeBalance).dividedBy(`1e${selectedToken.decimals}`)
        : new BigNumber(tokenBalance).dividedBy(`1e${selectedToken.decimals}`);
    if (
      !new BigNumber(amountString).isNaN() &&
      availableAmount.isGreaterThan(new BigNumber(0)) &&
      new BigNumber(amountString).isGreaterThan(
        new BigNumber(availableAmount)
      ) &&
      !(
        tokenBalance == viewingKeyErrorString &&
        selectedToken.address !== "native"
      ) &&
      amountString !== ""
    ) {
      setAmountString(availableAmount.toString());
    }

    if (isValidationActive) {
      validateForm();
    }
  }, [amountString, selectedToken, isValidationActive]);

  useEffect(() => {
    setAmountString("");
  }, [selectedToken]);

  function handleInputChange(e: any) {
    const filteredValue = e.target.value.replace(/[^0-9.]+/g, "");
    setAmountString(filteredValue);
  }

  const message = `Send ${
    selectedToken.address === "native" ? "public " : "privacy preserving "
  }${selectedToken.address === "native" || selectedToken.is_snip20 ? "" : "s"}${
    selectedToken.name
  }`;

  // handles [25% | 50% | 75% | Max] Button-Group
  function setAmountByPercentage(percentage: number) {
    let maxValue = "0";
    if (selectedToken.address === "native") {
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
        selectedToken.address === "native"
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

  function SubmitButton(props: {
    disabled: boolean;
    amount: string | undefined;
    currency: string;
  }) {
    const disabled = props.disabled;
    const amount = props.amount;
    const currency = props.currency;

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
      const isValidForm = validateForm();

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

      try {
        const toastId = toast.loading(`Sending s${selectedToken.name}`, {
          closeButton: true,
        });
        secretjs?.address;
        destinationAddress;
        amount;
        await secretjs.tx
          .broadcast(
            [
              selectedToken.address === "native"
                ? new MsgSend({
                    from_address: secretjs?.address,
                    to_address: destinationAddress,
                    amount: [
                      {
                        amount: amount,
                        denom: "uscrt",
                      },
                    ],
                  } as any)
                : new MsgExecuteContract({
                    sender: secretjs?.address,
                    contract_address: selectedToken.address,
                    code_hash: selectedToken.code_hash,
                    sent_funds: [],
                    msg: {
                      transfer: {
                        recipient: destinationAddress,
                        amount: amount,
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
              memo: memo,
            }
          )
          .catch((error: any) => {
            console.error(error);
            if (error?.tx?.rawLog) {
              toast.update(toastId, {
                render: `Sending of s${selectedToken.name} failed: ${error.tx.rawLog}`,
                type: "error",
                isLoading: false,
                closeOnClick: true,
              });
            } else {
              toast.update(toastId, {
                render: `Sending of s${selectedToken.name} failed: ${error.message}`,
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
                  render: `Sent s${selectedToken.name} to ${destinationAddress} successfully`,
                  type: "success",
                  isLoading: false,
                  closeOnClick: true,
                });
                setIsValidationActive(false);
              } else {
                toast.update(toastId, {
                  render: `Sending of s${selectedToken.name} failed: ${tx.rawLog}`,
                  type: "error",
                  isLoading: false,
                  closeOnClick: true,
                });
              }
            }
          });
      } finally {
        if (import.meta.env.VITE_MIXPANEL_ENABLED === "true") {
          mixpanel.init(import.meta.env.VITE_MIXPANEL_PROJECT_TOKEN, {
            debug: false,
          });
          mixpanel.identify("Dashboard-App");
          mixpanel.track("Secret Send", {
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
            {secretjs?.address && secretjs && amount ? (
              <>{`Send ${amount} ${currency}`}</>
            ) : null}

            {/* general text without value */}
            {!amount || !secretjs?.address ? "Send" : null}
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
        <title>{sendPageTitle}</title>

        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="title" content={sendPageTitle} />
        <meta name="application-name" content={sendPageTitle} />
        <meta name="description" content={sendPageDescription} />
        <meta name="robots" content="index,follow" />

        <meta property="og:title" content={sendPageTitle} />
        <meta property="og:description" content={sendPageDescription} />
        {/* <meta property="og:image" content="Image URL Here"/> */}

        <meta name="twitter:title" content={sendPageTitle} />
        <meta name="twitter:description" content={sendPageDescription} />
        {/* <meta name="twitter:image" content="Image URL Here"/> */}

        <script type="application/ld+json">
          {JSON.stringify(sendJsonLdSchema)}
        </script>
      </Helmet>

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
          title={`${
            selectedToken.address === "native" ? "Public " : "Secret"
          } Send`}
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
          <div className="bg-neutral-200 dark:bg-neutral-800 p-4 rounded-xl mb-4">
            {/* Title Bar */}

            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-center sm:text-left">
                Amount
              </span>
              {!isValidAmount && isValidationActive && (
                <span className="text-red-500 dark:text-red-500 text-xs font-normal">
                  {amountValidationMessage}
                </span>
              )}
            </div>

            {/* Input Field */}
            <div className="flex mt-2" id="destinationInputWrapper">
              <Select
                isDisabled={!selectedToken.address || !secretjs?.address}
                options={tokens.sort((a: any, b: any) =>
                  a.name.localeCompare(b.name)
                )}
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
                      {token.address === "native" || token.is_snip20
                        ? null
                        : "s"}
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
                disabled={!secretjs || !secretjs?.address}
              />
            </div>

            {/* Balance | [25%|50%|75%|Max] */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 mt-2">
              <div className="flex-1 text-xs">
                {selectedToken.address === "native"
                  ? NativeTokenBalanceUi(
                      tokenBalance,
                      selectedToken,
                      selectedTokenPrice
                    )
                  : WrappedTokenBalanceUi(
                      tokenBalance,
                      selectedToken,
                      selectedTokenPrice
                    )}
              </div>
              <div className="sm:flex-initial text-xs">
                {PercentagePicker(
                  setAmountByPercentage,
                  !secretjs ||
                    !secretjs?.address ||
                    (tokenBalance == viewingKeyErrorString &&
                      selectedToken.address !== "native")
                )}
              </div>
            </div>
          </div>

          {/* *** Destination Address *** */}
          <div className="bg-neutral-200 dark:bg-neutral-800 p-4 rounded-xl mb-4">
            {/* Title Bar */}
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-center sm:text-left">
                Destination Address
              </span>
              {!isValidDestination && isValidationActive && (
                <span className="text-red-500 dark:text-red-500 text-xs font-normal">
                  {destinationValidationMessage}
                </span>
              )}
            </div>

            {/* Input Field */}
            <div className="flex" id="destinationInputWrapper">
              <input
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                type="text"
                className={
                  "py-2 text-left focus:z-10 block flex-1 min-w-0 w-full bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white px-4 rounded-md disabled:placeholder-neutral-300 dark:disabled:placeholder-neutral-700 transition-colors font-medium focus:outline-0 focus:ring-2 ring-sky-500/40" +
                  (!isValidDestination && isValidationActive
                    ? "  border border-red-500 dark:border-red-500"
                    : "")
                }
                name="destinationAddress"
                id="destinationAddress"
                placeholder="Destination Address (secret1 ...)"
                disabled={!secretjs || !secretjs?.address}
              />
            </div>
          </div>

          {/* *** Memo *** */}
          <div className="bg-neutral-200 dark:bg-neutral-800 p-4 rounded-xl">
            {/* Title Bar */}
            <div className="flex flex-col sm:flex-row">
              <div className="flex-1 font-semibold mb-2 text-center sm:text-left">
                Memo (optional)
              </div>
            </div>

            {/* Input Field */}
            <div className="flex" id="memoInputWrapper">
              <input
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                type="text"
                className={
                  "py-2 text-left focus:z-10 block flex-1 min-w-0 w-full bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white px-4 rounded-md disabled:placeholder-neutral-300 dark:disabled:placeholder-neutral-700 transition-colors font-medium focus:outline-0 focus:ring-2 ring-sky-500/40"
                }
                name="memo"
                id="memo"
                placeholder="Memo"
                disabled={!secretjs || !secretjs?.address}
              />
            </div>
          </div>

          {/* Fee Grant */}
          <FeeGrant />

          {/* Submit Button */}
          <SubmitButton
            disabled={!secretjs || !selectedToken.address || !secretjs?.address}
            amount={amountString}
            currency={
              selectedToken.address === "native" || selectedToken.is_snip20
                ? null
                : "s" + selectedToken.name
            }
          />
        </div>
      </div>
    </>
  );
}

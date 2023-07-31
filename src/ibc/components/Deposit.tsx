import { CircularProgress, DialogActionsClassKey } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import Select from "react-select";
import { createTxIBCMsgTransfer } from "@tharsis/transactions";
import { cosmos } from "@tharsis/proto/dist/proto/cosmos/tx/v1beta1/tx";
import BigNumber from "bignumber.js";
import Long from "long";
import { useEffect, useState, useContext, Component } from "react";
import {
  sleep,
  suggestCrescenttoWallet,
  suggestChihuahuatoWallet,
  suggestInjectivetoWallet,
  suggestKujiratoWallet,
  suggestTerratoWallet,
  suggestComposabletoWallet,
  faucetAddress,
  viewingKeyErrorString,
} from "shared/utils/commons";
import {
  fromBase64,
  SecretNetworkClient,
  toBase64,
  TxResponse,
  toUtf8,
} from "secretjs";
import {
  chains,
  Token,
  tokens,
  snips,
  ICSTokens,
  Deposit,
} from "shared/utils/config";
import { TxRaw } from "secretjs/dist/protobuf/cosmos/tx/v1beta1/tx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faRightLeft,
  faKey,
  faXmarkCircle,
  faCheckCircle,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { IbcContext } from "ibc/Ibc";
import {
  getWalletViewingKey,
  isViewingKeyAvailable,
  SecretjsContext,
  setWalletViewingKey,
} from "shared/context/SecretjsContext";
import CopyToClipboard from "react-copy-to-clipboard";
import mixpanel, { track } from "mixpanel-browser";
import { trackMixPanelEvent } from "shared/utils/commons";
import {
  AxelarAssetTransfer,
  AxelarQueryAPI,
  CHAINS,
  Environment,
} from "@axelar-network/axelarjs-sdk";

function Deposit() {
  const { feeGrantStatus, setFeeGrantStatus, requestFeeGrant } =
    useContext(SecretjsContext);
  const {
    setIsWrapModalOpen,
    setSelectedTokenName,
    ibcMode,
    toggleIbcMode,
    selectedToken,
    setSelectedToken,
    selectableChains,
    selectedSource,
    setSelectedSource,
  } = useContext(IbcContext);
  const { secretjs, secretAddress } = useContext(SecretjsContext);

  const [sourceAddress, setSourceAddress] = useState<string>("");
  const [availableBalance, setAvailableBalance] = useState<string>("");
  const [loadingTx, setLoadingTx] = useState<boolean>(false);
  const [sourceChainSecretjs, setSourceChainSecretjs] =
    useState<SecretNetworkClient | null>(null);
  const [fetchBalanceInterval, setFetchBalanceInterval] = useState<any>(null);
  const [amountToTransfer, setAmountToTransfer] = useState<string>("");
  const [axelarTransferFee, setAxelarTransferFee] = useState<any>();

  const sdk = new AxelarAssetTransfer({
    environment: Environment.MAINNET,
  });
  const axelarQuery = new AxelarQueryAPI({
    environment: Environment.MAINNET,
  });

  useEffect(() => {
    setSelectedTokenName(selectedToken.name);
  }, [selectedToken]);

  function handleInputChange(e: any) {
    setAmountToTransfer(e.target.value);
  }

  useEffect(() => {
    trackMixPanelEvent("Open IBC Tab");
  }, []);
  const message =
    ibcMode === "deposit"
      ? `Deposit your SCRT via IBC transfer from ${selectedSource.chain_name} to Secret Network`
      : `Withdraw your SCRT via IBC transfer from Secret Network to ${selectedSource.chain_name}`;

  class ChainSelect extends Component {
    render() {
      return (
        <>
          <Select
            options={selectableChains}
            value={selectedSource}
            onChange={setSelectedSource}
            isSearchable={false}
            isDisabled={!secretjs || !secretAddress}
            formatOptionLabel={(option) => (
              <div className="flex items-center">
                <img
                  src={`/img/assets/${chains[option.chain_name].chain_image}`}
                  alt={`/img/assets/${
                    chains[option.chain_name].chain_name
                  } asset logo`}
                  className="w-6 h-6 mr-2 rounded-full"
                />
                <span className="font-semibold text-sm">
                  {option.chain_name}
                </span>
              </div>
            )}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </>
      );
    }
  }

  // handles [25% | 50% | 75% | Max] Button-Group
  function setAmountByPercentage(percentage: number) {
    if (availableBalance) {
      let availableAmount = new BigNumber(availableBalance).dividedBy(
        `1e${selectedToken.decimals}`
      );
      let potentialInput = availableAmount.toNumber() * (percentage * 0.01);
      if (Number(potentialInput) == 0) {
        setAmountToTransfer("");
      } else {
        setAmountToTransfer(potentialInput.toFixed(selectedToken.decimals));
      }
    }
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
            {ibcMode === "withdrawal" && feeGrantStatus === "Untouched" && (
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
            {ibcMode === "withdrawal" && feeGrantStatus === "Success" && (
              <div className="font-semibold text-sm flex items-center h-[1.6rem]">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-green-500 mr-1.5"
                />
                Fee Granted
              </div>
            )}
            {/* Fail */}
            {ibcMode === "withdrawal" && feeGrantStatus === "Fail" && (
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

  useEffect(() => {
    async function getAxelarTransferFee() {
      if (selectedToken.is_ics20) {
        const chain = (selectedToken as any).deposits.filter(
          (chain: any) => chain.chain_name === selectedSource.chain_name
        )[0];
        const fromChain =
            ibcMode === "deposit" ? chain.axelar_chain_name : "secret-snip",
          toChain =
            ibcMode === "deposit" ? "secret-snip" : chain.axelar_chain_name,
          asset = selectedToken.axelar_denom;

        const normalizedAmount = (amountToTransfer as string).replace(/,/g, "");

        if (!(Number(normalizedAmount) > 0)) {
          console.error(`${normalizedAmount} not bigger than 0`);
          return;
        }
        const amount = new BigNumber(normalizedAmount)
          .multipliedBy(`1e${selectedToken.decimals}`)
          .toNumber();
        const fee = await axelarQuery.getTransferFee(
          fromChain,
          toChain,
          asset,
          amount
        );
        setAxelarTransferFee(fee);
      }
    }
    setAxelarTransferFee(undefined);
    getAxelarTransferFee();
  }, [amountToTransfer, selectedToken, selectedSource]);

  const FeesInfo = () => {
    return (
      <>
        {/* Fee Grant */}
        <div className="bg-neutral-200 dark:bg-neutral-800 p-4 rounded-lg select-none flex items-center my-4">
          <div className="flex-1 flex items-center">
            <span className="font-semibold text-sm">Transfer Fees</span>
            <Tooltip
              title={`Make sure to always transfer a higher amount than the transfer fees!`}
              placement="right"
              arrow
            >
              <span className="ml-2 mt-1 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
                <FontAwesomeIcon icon={faInfoCircle} />
              </span>
            </Tooltip>
          </div>
          <div className="flex-initial">
            {selectedToken.is_ics20 && axelarTransferFee && (
              <>
                <div className="text-s font-semibold text-neutral-600 dark:text-neutral-400 flex items-center h-[1.6rem]">
                  <span>
                    {new BigNumber(axelarTransferFee.fee.amount)
                      .dividedBy(`1e${selectedToken.decimals}`)
                      .toFormat()}{" "}
                    {ibcMode == "withdrawal" && "s"}
                    {
                      ICSTokens.filter(
                        (icstoken: any) =>
                          icstoken.axelar_denom === axelarTransferFee.fee.denom
                      )[0].name
                    }
                  </span>
                </div>
              </>
            )}
            {selectedToken.is_ics20 && !axelarTransferFee && (
              <>
                <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 flex items-center h-[1.6rem]">
                  <span> - </span>
                </div>
              </>
            )}
          </div>
        </div>
      </>
    );
  };

  const updateCoinBalance = async () => {
    if (secretjs && secretAddress) {
      if (selectedToken.is_snip20 || selectedToken.is_ics20) {
        const key = await getWalletViewingKey(selectedToken.address);
        if (!key) {
          setAvailableBalance(viewingKeyErrorString);
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
            setAvailableBalance(viewingKeyErrorString);
            return;
          }

          setAvailableBalance(result.balance.amount);
        } catch (e) {
          console.error(`Error getting balance for s${selectedToken.name}`, e);

          setAvailableBalance(viewingKeyErrorString);
        }
      } else {
        try {
          const {
            balance: { amount },
          } = await secretjs.query.bank.balance({
            address: secretAddress,
            denom: selectedToken.withdrawals[0]?.from_denom,
          });
          setAvailableBalance(amount);
        } catch (e) {
          console.error(
            `Error while trying to query ${selectedToken.name}:`,
            e
          );
        }
      }
    }
  };

  const targetChain = chains["Secret Network"];

  const fetchSourceBalance = async (newAddress: String | null) => {
    if (secretjs && secretAddress) {
      if (ibcMode === "deposit") {
        const url = `${
          chains[selectedSource.chain_name].lcd
        }/cosmos/bank/v1beta1/balances/${
          newAddress ? newAddress : sourceAddress
        }`;
        try {
          const {
            balances,
          }: {
            balances: Array<{ denom: string; amount: string }>;
          } = await (await fetch(url)).json();

          const balance =
            balances.find(
              (c) =>
                c.denom ===
                selectedToken.deposits.filter(
                  (deposit: any) =>
                    deposit.chain_name === selectedSource.chain_name
                )[0].from_denom
            )?.amount || "0";
          setAvailableBalance(balance);
        } catch (e) {
          console.error(`Error while trying to query ${url}:`, e);
          setAvailableBalance("Error");
        }
      } else if (ibcMode === "withdrawal") {
        updateCoinBalance();
      }
    }
  };

  useEffect(() => {
    setAvailableBalance("");
    if (!(secretjs && secretAddress)) {
      return;
    }
    if (!sourceAddress) {
      return;
    }
    if (fetchBalanceInterval) {
      clearInterval(fetchBalanceInterval);
    }

    if (ibcMode === "withdrawal") {
      fetchSourceBalance(null);
    }

    const interval = setInterval(() => fetchSourceBalance(null), 10_000);
    setFetchBalanceInterval(interval);

    return () => clearInterval(interval);
  }, [
    selectedSource,
    selectedToken,
    sourceAddress,
    ibcMode,
    secretAddress,
    secretjs,
  ]);

  useEffect(() => {
    if (!(secretjs && secretAddress)) {
      return;
    }
    const possibleICS20 = ICSTokens.filter(
      (token) =>
        token.deposits.find(
          (token) => token.chain_name == selectedSource.chain_name
        )!
    );
    const possibleSnips = snips.filter(
      (token) =>
        token.deposits.find(
          (token) => token.chain_name == selectedSource.chain_name
        )!
    );
    const possibleTokens = tokens.filter(
      (token) =>
        token.deposits.find(
          (token) => token.chain_name == selectedSource.chain_name
        )!
    );
    const supportedTokens = possibleTokens
      .concat(possibleICS20)
      .concat(possibleSnips);

    setSupportedTokens(supportedTokens);

    if (!supportedTokens.includes(selectedToken)) {
      setSelectedToken(supportedTokens[0]);
    }
    (async () => {
      while (
        !(window as any).wallet ||
        !(window as any).wallet.getOfflineSignerOnlyAmino
      ) {
        await sleep(100);
      }
      console.log(selectedSource.chain_name);
      if (selectedSource.chain_name === "Terra") {
        await suggestTerratoWallet((window as any).wallet);
      } else if (selectedSource.chain_name === "Injective") {
        await suggestInjectivetoWallet((window as any).wallet);
      } else if (selectedSource.chain_name === "Crescent") {
        await suggestCrescenttoWallet((window as any).wallet);
      } else if (selectedSource.chain_name === "Kujira") {
        await suggestKujiratoWallet((window as any).wallet);
      } else if (selectedSource.chain_name === "Chihuahua") {
        await suggestChihuahuatoWallet((window as any).wallet);
      } else if (selectedSource.chain_name === "Composable") {
        await suggestComposabletoWallet((window as any).wallet);
      }

      const { chain_id, lcd, bech32_prefix } =
        chains[selectedSource.chain_name];
      await (window as any).wallet.enable(chain_id);

      (window as any).wallet.defaultOptions = {
        sign: {
          preferNoSetFee: false,
          disableBalanceCheck: true,
        },
      };

      const sourceOfflineSigner = (
        window as any
      ).wallet.getOfflineSignerOnlyAmino(chain_id);
      const depositFromAccounts = await sourceOfflineSigner.getAccounts();
      setSourceAddress(depositFromAccounts[0].address);

      const secretjs = new SecretNetworkClient({
        url: lcd,
        chainId: chain_id,
        wallet: sourceOfflineSigner,
        walletAddress: depositFromAccounts[0].address,
      });

      setSourceChainSecretjs(secretjs);

      fetchSourceBalance(depositFromAccounts[0].address);
    })();
  }, [
    selectedSource,
    selectedToken,
    sourceAddress,
    ibcMode,
    secretAddress,
    secretjs,
  ]);

  const [isCopied, setIsCopied] = useState<boolean>(false);

  const [supportedTokens, setSupportedTokens] = useState<Token[]>([]);

  function uiFocusInput() {
    document.getElementById("inputWrapper")?.classList.add("animate__animated");
    document
      .getElementById("inputWrapper")
      ?.classList.add("animate__headShake");
    setTimeout(() => {
      document
        .getElementById("inputWrapper")
        ?.classList.remove("animate__animated");
      document
        .getElementById("inputWrapper")
        ?.classList.remove("animate__headShake");
    }, 1000);
  }

  function SubmitButton() {
    async function submit() {
      // TODO: add validation to form, including message
      // if (!isValidAmount || amount === "") {
      //   uiFocusInput();
      //   return;
      // }

      if (ibcMode === "deposit") {
        if (!sourceChainSecretjs) {
          console.error("No cosmjs");
          return;
        }

        if (!amountToTransfer) {
          console.error("Empty deposit");
          return;
        }

        const normalizedAmount = (amountToTransfer as string).replace(/,/g, "");

        if (!(Number(normalizedAmount) > 0)) {
          console.error(`${normalizedAmount} not bigger than 0`);
          return;
        }

        setLoadingTx(true);

        const amount = new BigNumber(normalizedAmount)
          .multipliedBy(`1e${selectedToken.decimals}`)
          .toFixed(0, BigNumber.ROUND_DOWN);

        let {
          deposit_channel_id,
          deposit_gas,
          deposit_gas_denom,
          lcd: lcdSrcChain,
        } = chains[selectedSource.chain_name];

        const depositChain = selectedToken.deposits.filter(
          (deposit: any) => deposit.chain_name === selectedSource.chain_name
        )[0];

        deposit_channel_id = depositChain.channel_id || deposit_channel_id;
        deposit_gas = depositChain.gas || deposit_gas;

        const toastId = toast.loading(
          `Sending ${normalizedAmount} ${selectedToken.name} from ${selectedSource.chain_name} to Secret Network`,
          {
            closeButton: true,
          }
        );

        try {
          let tx: TxResponse;
          if (
            !["Evmos", "Injective"].includes(selectedSource.chain_name) &&
            (!selectedToken.is_ics20 ||
              depositChain.axelar_chain_name == CHAINS.MAINNET.AXELAR)
          ) {
            const source_channel_id =
              depositChain.axelar_chain_name == CHAINS.MAINNET.AXELAR &&
              selectedToken.name !== "SCRT"
                ? depositChain.channel_id
                : deposit_channel_id;
            // Regular cosmos chain (not ethermint signing)
            tx = await sourceChainSecretjs.tx.ibc.transfer(
              {
                sender: sourceAddress,
                receiver: secretAddress,
                source_channel: deposit_channel_id,
                source_port: "transfer",
                token: {
                  amount,
                  denom: selectedToken.deposits.filter(
                    (deposit: any) =>
                      deposit.chain_name === selectedSource.chain_name
                  )[0].from_denom,
                },
                timeout_timestamp: String(
                  Math.floor(Date.now() / 1000) + 10 * 60
                ), // 10 minute timeout
              },
              {
                gasLimit: deposit_gas,
                feeDenom: deposit_gas_denom,
                ibcTxsOptions: {
                  resolveResponses: true,
                  resolveResponsesCheckIntervalMs: 10_000,
                  resolveResponsesTimeoutMs: 12 * 60 * 1000,
                },
              }
            );
          } else if (
            selectedToken.is_ics20 &&
            depositChain.axelar_chain_name != CHAINS.MAINNET.AXELAR
          ) {
            const fromChain = depositChain.axelar_chain_name,
              toChain = "secret-snip",
              destinationAddress = secretAddress,
              asset = selectedToken.axelar_denom; // denom of asset. See note (2) below

            const depositAddress = await sdk.getDepositAddress({
              fromChain,
              toChain,
              destinationAddress,
              asset,
            });
            tx = await sourceChainSecretjs.tx.ibc.transfer(
              {
                sender: sourceAddress,
                receiver: depositAddress,
                source_channel: deposit_channel_id,
                source_port: "transfer",
                token: {
                  amount,
                  denom: depositChain.from_denom,
                },
                timeout_timestamp: String(
                  Math.floor(Date.now() / 1000) + 10 * 60
                ), // 10 minute timeout
              },
              {
                gasLimit: deposit_gas,
                feeDenom: deposit_gas_denom,
                ibcTxsOptions: {
                  resolveResponses: true,
                  resolveResponsesCheckIntervalMs: 10_000,
                  resolveResponsesTimeoutMs: 10.25 * 60 * 1000,
                },
              }
            );
          } else {
            // Handle IBC transfers from Ethermint chains like Evmos & Injective

            // Get Evmos/Injective account_number & sequence
            const {
              account: {
                base_account: {
                  account_number: accountNumber,
                  sequence: accountSequence,
                },
              },
            }: {
              account: {
                base_account: {
                  account_number: string;
                  sequence: string;
                };
              };
            } = await (
              await fetch(
                `${
                  chains[selectedSource.chain_name].lcd
                }/cosmos/auth/v1beta1/accounts/${sourceAddress}`
              )
            ).json();

            // Get account pubkey
            // Can't get it from the chain because an account without txs won't have its pubkey listed on-chain
            const evmosProtoSigner = window.getOfflineSigner!(
              chains[selectedSource.chain_name].chain_id
            );
            const [{ pubkey }] = await evmosProtoSigner.getAccounts();

            // Create IBC MsgTransfer tx
            const txIbcMsgTransfer = createTxIBCMsgTransfer(
              {
                chainId: 9001, // Evmos EIP155, this is ignored in Injective
                cosmosChainId: chains[selectedSource.chain_name].chain_id,
              },
              {
                accountAddress: sourceAddress,
                accountNumber: Number(accountNumber),
                sequence: Number(accountSequence),
                pubkey: toBase64(pubkey),
              },
              {
                gas: String(deposit_gas),
                amount: "0", // filled in by Keplr
                denom: "aevmos", // filled in by Keplr
              },
              "",
              {
                sourcePort: "transfer",
                sourceChannel: deposit_channel_id,
                amount,
                denom: selectedToken.deposits.filter(
                  (deposit: Deposit) =>
                    deposit.chain_name === selectedSource.chain_name
                )[0].from_denom,
                receiver: secretAddress,
                revisionNumber: 0,
                revisionHeight: 0,
                timeoutTimestamp: `${
                  Math.floor(Date.now() / 1000) + 10 * 60
                }000000000`, // 10 minute timeout (ns)
              }
            );

            if (chains[selectedSource.chain_name].chain_name === "Injective") {
              const signer_info =
                txIbcMsgTransfer.signDirect.authInfo.signer_infos[0].toObject();
              signer_info.public_key!.type_url =
                "/injective.crypto.v1beta1.ethsecp256k1.PubKey";

              txIbcMsgTransfer.signDirect.authInfo.signer_infos[0] =
                cosmos.tx.v1beta1.SignerInfo.fromObject(signer_info);
            }

            // Sign the tx
            const sig = await (window as any).wallet?.signDirect(
              chains[selectedSource.chain_name].chain_id,
              sourceAddress,
              {
                bodyBytes: txIbcMsgTransfer.signDirect.body.serializeBinary(),
                authInfoBytes:
                  txIbcMsgTransfer.signDirect.authInfo.serializeBinary(),
                chainId: chains[selectedSource.chain_name].chain_id,
                accountNumber: new Long(Number(accountNumber)),
              },
              { isEthereum: true }
            );

            // Encode the Evmos tx to a TxRaw protobuf binary
            const txRaw = TxRaw.fromPartial({
              body_bytes: sig!.signed.bodyBytes,
              auth_info_bytes: sig!.signed.authInfoBytes,
              signatures: [fromBase64(sig!.signature.signature)],
            });
            const txBytes = TxRaw.encode(txRaw).finish();

            // cosmjs can broadcast to Ethermint but cannot handle the response

            // Broadcast the tx to Evmos
            tx = await sourceChainSecretjs.tx.broadcastSignedTx(
              toBase64(txBytes),
              {
                ibcTxsOptions: {
                  resolveResponses: true,
                  resolveResponsesCheckIntervalMs: 10_000,
                  resolveResponsesTimeoutMs: 10.25 * 60 * 1000,
                },
              }
            );
          }

          if (tx.code !== 0) {
            toast.update(toastId, {
              render: `Failed sending ${normalizedAmount} ${selectedToken.name} from ${selectedSource.chain_name} to Secret Network: ${tx.rawLog}`,
              type: "error",
              isLoading: false,
            });
            return;
          } else {
            toast.update(toastId, {
              render: `Receiving ${normalizedAmount} ${selectedToken.name} on Secret Network from ${selectedSource.chain_name}`,
            });

            const ibcResp = await tx.ibcResponses[0];

            if (ibcResp.type === "ack") {
              updateCoinBalance();
              toast.update(toastId, {
                render: `Received ${normalizedAmount} ${selectedToken.name} on Secret Network from ${selectedSource.chain_name}`,
                type: "success",
                isLoading: false,
                closeOnClick: true,
              });
              setIsWrapModalOpen(true);
            } else {
              toast.update(toastId, {
                render: `Timed out while waiting to receive ${normalizedAmount} ${selectedToken.name} on Secret Network from ${selectedSource.chain_name}`,
                type: "warning",
                isLoading: false,
              });
            }
          }
        } catch (e) {
          if (import.meta.env.VITE_MIXPANEL_ENABLED === "true") {
            mixpanel.init(import.meta.env.VITE_MIXPANEL_PROJECT_TOKEN, {
              debug: false,
            });
            mixpanel.identify("Dashboard-App");
            mixpanel.track("IBC Transfer", {
              "Source Chain":
                ibcMode === "deposit"
                  ? selectedSource.chain_name
                  : "Secret Network",
              "Target Chain":
                ibcMode === "withdrawal"
                  ? selectedSource.chain_name
                  : "Secret Network",
              // "Amount": amountToTransfer,
              "Fee Grant used":
                feeGrantStatus === "Success" && ibcMode === "withdrawal"
                  ? true
                  : false,
            });
          }

          toast.update(toastId, {
            render: `Failed sending ${normalizedAmount} ${
              selectedToken.name
            } from ${selectedSource.chain_name} to Secret Network: ${
              (e as any).message
            }`,
            type: "error",
            isLoading: false,
          });
        } finally {
          setLoadingTx(false);
        }
      }
      if (ibcMode === "withdrawal") {
        if (!secretjs) {
          console.error("No secretjs");
          return;
        }

        if (!amountToTransfer) {
          console.error("Empty withdraw");
          return;
        }

        const normalizedAmount = (amountToTransfer as string).replace(/,/g, "");

        if (!(Number(normalizedAmount) > 0)) {
          console.error(`${normalizedAmount} not bigger than 0`);
          return;
        }

        setLoadingTx(true);

        const amount = new BigNumber(normalizedAmount)
          .multipliedBy(`1e${selectedToken.decimals}`)
          .toFixed(0, BigNumber.ROUND_DOWN);

        let {
          withdraw_channel_id,
          withdraw_gas,
          lcd: lcdDstChain,
        } = chains[selectedSource.chain_name];

        const withdrawalChain = selectedToken.withdrawals.filter(
          (withdrawal: any) =>
            withdrawal.chain_name === selectedSource.chain_name
        )[0];

        withdraw_channel_id = withdrawalChain.channel_id || withdraw_channel_id;
        withdraw_gas = withdrawalChain.gas || withdraw_gas;

        console.log(withdrawalChain);

        const toastId = toast.loading(
          `Sending ${normalizedAmount} ${selectedToken.name} from Secret Network to ${selectedSource.chain_name}`,
          {
            closeButton: true,
          }
        );

        try {
          let tx: TxResponse;

          if (selectedToken.is_snip20) {
            tx = await secretjs.tx.compute.executeContract(
              {
                contract_address: selectedToken.address,
                code_hash: selectedToken.code_hash,
                sender: secretAddress,
                msg: {
                  send: {
                    recipient: "secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4", // cw20-ics20
                    recipient_code_hash:
                      "f85b413b547b9460162958bafd51113ac266dac96a84c33b9150f68f045f2641",
                    amount,
                    msg: toBase64(
                      toUtf8(
                        JSON.stringify({
                          channel: withdraw_channel_id,
                          remote_address: sourceAddress,
                          timeout: 600, // 10 minute timeout
                        })
                      )
                    ),
                  },
                },
              },
              {
                gasLimit: withdraw_gas,
                gasPriceInFeeDenom: 0.1,
                feeDenom: "uscrt",
                feeGranter: feeGrantStatus === "Success" ? faucetAddress : "",
                ibcTxsOptions: {
                  resolveResponses: true,
                  resolveResponsesCheckIntervalMs: 10_000,
                  resolveResponsesTimeoutMs: 12 * 60 * 1000,
                },
              }
            );
          } else if (
            selectedToken.is_ics20 &&
            withdrawalChain?.axelar_chain_name !== CHAINS.MAINNET.AXELAR
          ) {
            const fromChain = "secret-snip",
              toChain = withdrawalChain.axelar_chain_name,
              destinationAddress = sourceAddress,
              asset = selectedToken.axelar_denom;

            const depositAddress = await sdk.getDepositAddress({
              fromChain,
              toChain,
              destinationAddress,
              asset,
            });
            tx = await secretjs.tx.compute.executeContract(
              {
                contract_address: selectedToken.address,
                code_hash: selectedToken.code_hash,
                sender: secretAddress,
                msg: {
                  send: {
                    recipient: "secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83", // ics20
                    recipient_code_hash:
                      "2976a2577999168b89021ecb2e09c121737696f71c4342f9a922ce8654e98662",
                    amount,
                    msg: toBase64(
                      toUtf8(
                        JSON.stringify({
                          channel: withdraw_channel_id,
                          remote_address: depositAddress,
                          timeout: 600, // 10 minute timeout
                        })
                      )
                    ),
                  },
                },
              },
              {
                gasLimit: 300_000,
                gasPriceInFeeDenom: 0.1,
                feeDenom: "uscrt",
                feeGranter: feeGrantStatus === "Success" ? faucetAddress : "",
                ibcTxsOptions: {
                  resolveResponses: true,
                  resolveResponsesCheckIntervalMs: 10_000,
                  resolveResponsesTimeoutMs: 12 * 60 * 1000,
                },
              }
            );
          } else {
            const source_channel_id =
              withdrawalChain?.axelar_chain_name == CHAINS.MAINNET.AXELAR &&
              selectedToken.name !== "SCRT"
                ? withdrawalChain.channel_id
                : withdraw_channel_id;
            tx = await secretjs.tx.ibc.transfer(
              {
                sender: secretAddress,
                receiver: sourceAddress,
                source_channel: source_channel_id,
                source_port: "transfer",
                token: {
                  amount,
                  denom: withdrawalChain.from_denom,
                },
                timeout_timestamp: String(
                  Math.floor(Date.now() / 1000) + 10 * 60
                ), // 10 minute timeout
              },
              {
                gasLimit: withdraw_gas,
                gasPriceInFeeDenom: 0.1,
                feeDenom: "uscrt",
                feeGranter: feeGrantStatus === "Success" ? faucetAddress : "",
                ibcTxsOptions: {
                  resolveResponses: true,
                  resolveResponsesCheckIntervalMs: 10_000,
                  resolveResponsesTimeoutMs: 12 * 60 * 1000,
                },
              }
            );
          }
          if (tx.code !== 0) {
            toast.update(toastId, {
              render: `Failed sending ${normalizedAmount} ${selectedToken.name} from Secret Network to ${selectedSource.chain_name}: ${tx.rawLog}`,
              type: "error",
              isLoading: false,
            });
          } else {
            toast.update(toastId, {
              render: `Receiving ${normalizedAmount} ${selectedToken.name} on ${selectedSource.chain_name}`,
            });

            const ibcResp = await tx.ibcResponses[0];

            if (ibcResp.type === "ack") {
              updateCoinBalance();
              toast.update(toastId, {
                render: `Received ${normalizedAmount} ${selectedToken.name} on ${selectedSource.chain_name}`,
                type: "success",
                isLoading: false,
                closeOnClick: true,
              });
            } else {
              toast.update(toastId, {
                render: `Timed out while waiting to receive ${normalizedAmount} ${selectedToken.name} on ${selectedSource.chain_name} from Secret Network`,
                type: "warning",
                isLoading: false,
              });
            }
          }
        } catch (e) {
          toast.update(toastId, {
            render: `Failed sending ${normalizedAmount} ${selectedToken.name} from Secret Network to ${selectedSource.chain_name}: ${e}`,
            type: "error",
            isLoading: false,
          });
        } finally {
          setLoadingTx(false);
        }
      }
    }

    return (
      <button
        className={
          "enabled:bg-gradient-to-r enabled:from-cyan-600 enabled:to-purple-600 enabled:hover:from-cyan-500 enabled:hover:to-purple-500 transition-colors text-white font-semibold py-3 w-full rounded-lg disabled:bg-neutral-500 focus:outline-none focus-visible:ring-4 ring-sky-500/40"
        }
        disabled={!secretjs || !secretAddress}
        onClick={() => submit()}
      >
        Execute Transfer
      </button>
    );
  }

  return (
    <>
      {/* [From|To] Picker */}
      <div className="flex flex-col md:flex-row mb-8">
        {/* *** From *** */}
        <div className="flex-initial w-full md:w-1/3">
          {/* circle */}
          <div
            className="w-full relative rounded-full overflow-hidden border-2 border-cyan-500 hidden md:block"
            style={{ paddingTop: "100%" }}
          >
            <div className="img-wrapper absolute top-1/2 left-0 right-0 -translate-y-1/2 text-center">
              <div className="w-1/2 inline-block">
                <div className="relative">
                  <div
                    className={`absolute inset-0 bg-cyan-500 blur-md rounded-full overflow-hidden ${
                      secretjs && secretAddress
                        ? "fadeInAndOutLoop"
                        : "opacity-40"
                    }`}
                  ></div>
                  <img
                    src={
                      "/img/assets/" +
                      (ibcMode === "deposit"
                        ? chains[selectedSource.chain_name].chain_image
                        : "scrt.svg")
                    }
                    className="w-full relative inline-block rounded-full overflow-hiden"
                    alt={`${
                      ibcMode === "deposit"
                        ? chains[selectedSource.chain_name].chain_name
                        : "SCRT"
                    } logo`}
                  />
                </div>
              </div>
            </div>
            <div
              className="absolute left-1/2 -translate-x-1/2 text-center text-sm font-bold text-black dark:text-white"
              style={{ bottom: "10%" }}
            >
              From
            </div>
          </div>
          {/* Chain Picker */}
          <div className="-mt-3 relative z-10 w-full">
            {/* {value} */}
            {ibcMode === "deposit" && <ChainSelect />}
            {ibcMode === "withdrawal" && (
              <div
                style={{ paddingTop: ".76rem", paddingBottom: ".76rem" }}
                className="flex items-center w-full text-sm font-semibold select-none bg-white dark:bg-neutral-800 rounded text-neutral-800 dark:text-neutral-200 focus:bg-neutral-300 dark:focus:bg-neutral-700 disabled:hover:bg-neutral-200 dark:disabled:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-600"
              >
                <div className="flex-1 px-3 text-center">
                  <span>Secret Network</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 py-2 md:py-0">
          <div className="md:relative" id="ibcSwitchButton">
            <div className="md:absolute md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 text-center md:text-left">
              <Tooltip
                title={`Switch chains`}
                placement="bottom"
                disableHoverListener={!secretjs && !secretAddress}
                arrow
              >
                <span>
                  <button
                    onClick={toggleIbcMode}
                    className={
                      "focus:outline-none focus-visible:ring-2 ring-sky-500/40 inline-block bg-neutral-200 dark:bg-neutral-800 px-3 py-2 text-cyan-500 dark:text-cyan-500 transition-colors rounded-xl disabled:text-neutral-500 dark:disabled:text-neutral-500" +
                      (secretjs && secretAddress
                        ? "hover:text-cyan-700 dark:hover:text-cyan-300"
                        : "")
                    }
                    disabled={!secretjs || !secretAddress}
                  >
                    <FontAwesomeIcon
                      icon={faRightLeft}
                      className="rotate-90 md:rotate-0"
                    />
                  </button>
                </span>
              </Tooltip>
            </div>
          </div>
        </div>
        {/* *** To *** */}
        <div className="flex-initial w-full md:w-1/3">
          <div
            className="w-full relative rounded-full overflow-hidden border-2 border-violet-500 hidden md:block"
            style={{ paddingTop: "100%" }}
          >
            <div className="img-wrapper absolute top-1/2 left-0 right-0 -translate-y-1/2 text-center">
              <div className="w-1/2 inline-block">
                <div className="relative">
                  <div
                    className={`absolute inset-0 bg-violet-500 blur-md rounded-full overflow-hidden ${
                      secretjs && secretAddress
                        ? "fadeInAndOutLoop"
                        : "opacity-40"
                    }`}
                  ></div>
                  <img
                    src={
                      "/img/assets/" +
                      (ibcMode === "withdrawal"
                        ? chains[selectedSource.chain_name].chain_image
                        : "scrt.svg")
                    }
                    className="w-full relative inline-block rounded-full overflow-hiden"
                    alt={`${
                      ibcMode === "withdrawal"
                        ? chains[selectedSource.chain_name].chain_name
                        : "SCRT"
                    } logo`}
                  />
                </div>
              </div>
            </div>
            <div
              className="absolute left-0 right-0 text-center text-sm font-bold text-black dark:text-white"
              style={{ bottom: "10%" }}
            >
              To
            </div>
          </div>
          {/* Chain Picker */}
          <div className="md:-mt-3 md:relative z-10 w-full">
            {ibcMode === "withdrawal" && <ChainSelect />}
            {ibcMode === "deposit" && (
              <div
                style={{ paddingTop: ".76rem", paddingBottom: ".76rem" }}
                className="flex items-center w-full text-sm font-semibold select-none bg-neutral-200 dark:bg-neutral-800 rounded text-neutral-800 dark:text-neutral-200 focus:bg-neutral-300 dark:focus:bg-neutral-700 disabled:hover:bg-neutral-200 dark:disabled:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-600"
              >
                <div className="flex-1 px-3 text-center">
                  <span>Secret Network</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-neutral-200 dark:bg-neutral-800 p-4 rounded-xl space-y-6 my-4">
        <div className="flex items-center">
          <div className="font-semibold mr-4 w-10">From:</div>
          <div className="flex-1 truncate font-medium text-sm">
            {ibcMode === "deposit" && secretjs && secretAddress && (
              <a
                href={`${
                  chains[selectedSource.chain_name].explorer_account
                }${sourceAddress}`}
                target="_blank"
              >
                {sourceAddress.slice(0, 19) + "..." + sourceAddress.slice(-19)}
              </a>
            )}
            {ibcMode === "withdrawal" && secretjs && secretAddress && (
              <a
                href={`${
                  chains[selectedSource.chain_name].explorer_account
                }${secretAddress}`}
                target="_blank"
              >
                {secretAddress.slice(0, 19) + "..." + secretAddress.slice(-19)}
              </a>
            )}
          </div>
          <div className="flex-initial ml-4">
            <CopyToClipboard
              text={ibcMode === "deposit" ? sourceAddress : secretAddress}
              onCopy={() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 3000);
                toast.success("Address copied to clipboard!");
              }}
            >
              <Tooltip
                title={"Copy to clipboard"}
                placement="bottom"
                disableHoverListener={!secretjs && !secretAddress}
                arrow
              >
                <span>
                  <button
                    className="text-neutral-500 enabled:hover:text-white enabled:active:text-neutral-500 transition-colors"
                    disabled={!secretjs && !secretAddress}
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                </span>
              </Tooltip>
            </CopyToClipboard>
          </div>
        </div>

        <div className="flex items-center">
          <div className="flex-initial font-semibold mr-4 w-10">To:</div>
          <div className="flex-1 truncate font-medium text-sm">
            {ibcMode === "withdrawal" && (
              <a
                href={`${
                  chains[selectedSource.chain_name].explorer_account
                }${sourceAddress}`}
                target="_blank"
              >
                {sourceAddress.slice(0, 19) + "..." + sourceAddress.slice(-19)}
              </a>
            )}
            {ibcMode === "deposit" && (
              <a
                href={`${targetChain.explorer_account}${secretAddress}`}
                target="_blank"
              >
                {secretAddress.slice(0, 19) + "..." + secretAddress.slice(-19)}
              </a>
            )}
          </div>
          <div className="flex-initial ml-4">
            <CopyToClipboard
              text={ibcMode === "withdrawal" ? sourceAddress : secretAddress}
              onCopy={() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 3000);
                toast.success("Address copied to clipboard!");
              }}
            >
              <Tooltip
                title={"Copy to clipboard"}
                placement="bottom"
                disableHoverListener={!secretjs && !secretAddress}
                arrow
              >
                <span>
                  <button
                    className="text-neutral-500 enabled:hover:text-white enabled:active:text-neutral-500 transition-colors"
                    disabled={!secretjs && !secretAddress}
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                </span>
              </Tooltip>
            </CopyToClipboard>
          </div>
        </div>
      </div>

      <div className="bg-neutral-200 dark:bg-neutral-800 p-4 rounded-xl">
        <div className="flex" id="inputWrapper">
          <Select
            options={supportedTokens}
            value={selectedToken}
            onChange={setSelectedToken}
            isSearchable={false}
            isDisabled={!secretjs || !secretAddress}
            formatOptionLabel={(token) => (
              <div className="flex items-center">
                <img
                  src={`/img/assets/${token.image}`}
                  alt={`${token.name} asset logo`}
                  className="w-6 h-6 mr-2 rounded-full"
                />
                <span className="font-semibold text-sm">
                  {token.is_ics20 && ibcMode == "withdrawal" && "s"}
                  {token.name}
                </span>
              </div>
            )}
            className="react-select-wrap-container"
            classNamePrefix="react-select-wrap"
          />
          <input
            type="number"
            min="0"
            step="0.000001"
            value={amountToTransfer}
            onChange={handleInputChange}
            className={
              "text-right focus:z-10 block flex-1 min-w-0 w-full bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white px-4 rounded-r-lg disabled:placeholder-neutral-300 dark:disabled:placeholder-neutral-700 transition-colors font-medium focus:outline-0 focus:ring-2 ring-sky-500/40" +
              (false ? "  border border-red-500 dark:border-red-500" : "")
            }
            name="amount"
            id="amount"
            placeholder="0"
            disabled={!secretAddress}
          />
        </div>

        {/* Balance | [25%|50%|75%|Max] */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 mt-3">
          <div className="flex-1 text-xs">
            <span className="font-semibold">Available: </span>
            <span className="font-medium">
              {(() => {
                if (availableBalance === "" && sourceAddress && secretjs) {
                  return <CircularProgress size="0.6em" />;
                }
                const prettyBalance = new BigNumber(availableBalance)
                  .dividedBy(`1e${selectedToken.decimals}`)
                  .toFormat();
                if (
                  prettyBalance === "NaN" &&
                  availableBalance === viewingKeyErrorString
                ) {
                  return (
                    <>
                      <button
                        className="ml-2 font-semibold bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-md border-neutral-300 dark:border-neutral-700 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-100 dark:disabled:hover:bg-neutral-900 disabled:cursor-default"
                        onClick={async () => {
                          await setWalletViewingKey(selectedToken.address);
                          try {
                            setAvailableBalance("");
                            //setLoadingTokenBalance(true);
                            await sleep(1000); // sometimes query nodes lag
                            await updateCoinBalance();
                          } finally {
                            //setLoadingTokenBalance(false);
                          }
                        }}
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
                }
                if (!secretAddress && !secretjs) {
                  return "";
                }
                if (prettyBalance === "NaN") {
                  return "Error";
                }
                return `${prettyBalance} ${
                  selectedToken.is_ics20 && ibcMode == "withdrawal" ? "s" : ""
                }${selectedToken.name}`;
              })()}
            </span>
          </div>
          <div className="sm:flex-initial text-xs">
            <div className="inline-flex rounded-full text-xs font-semibold">
              <button
                onClick={() => setAmountByPercentage(25)}
                className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-l-md transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40 focus:z-10"
                disabled={!secretAddress}
              >
                25%
              </button>
              <button
                onClick={() => setAmountByPercentage(50)}
                className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40 focus:z-10"
                disabled={!secretAddress}
              >
                50%
              </button>
              <button
                onClick={() => setAmountByPercentage(75)}
                className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40 focus:z-10"
                disabled={!secretAddress}
              >
                75%
              </button>
              <button
                onClick={() => setAmountByPercentage(100)}
                className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-r-md transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40 focus:z-10"
                disabled={!secretAddress}
              >
                MAX
              </button>
            </div>
          </div>
        </div>
      </div>

      {ibcMode == "withdrawal" && !selectedToken.is_ics20 && <FeeGrant />}

      {selectedToken.is_ics20 &&
        selectedToken.deposits.filter(
          (deposit: any) => deposit.chain_name === selectedSource.chain_name
        )[0]?.axelar_chain_name !== CHAINS.MAINNET.AXELAR && <FeesInfo />}

      <div className="mt-4">
        <SubmitButton />
      </div>
    </>
  );
}

export default Deposit;

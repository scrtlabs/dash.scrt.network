import {
  CircularProgress,
  Avatar,
  Button,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  InputAdornment,
  Input,
  FormControl,
  InputLabel,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import BigNumber from "bignumber.js";
import React, { useRef, useState, useEffect } from "react";
import { isMobile } from "react-device-detect";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import CopyToClipboard from "react-copy-to-clipboard";
import { SigningCosmWasmClient } from "secretjs";
import { getKeplrViewingKey, setKeplrViewingKey } from "./KeplrStuff";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { FileCopyOutlined } from "@mui/icons-material";
import { SigningStargateClient, StdFee } from "@cosmjs/stargate";
import { Token, chains } from "./config";
import { TabContext, TabPanel } from "@mui/lab";

const viewingKeyErroString = "🧐";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const gasPriceUscrt = 0.25;
function getFeeFromGas(gas: number): StdFee {
  return {
    amount: [
      { amount: String(Math.floor(gas * gasPriceUscrt) + 1), denom: "uscrt" },
    ],
    gas: String(gas),
  };
}

export default function TokenRow({
  secretjs,
  secretAddress,
  token,
  balances,
  loadingCoinBalances,
}: {
  secretjs: SigningCosmWasmClient | null;
  secretAddress: string;
  loadingCoinBalances: boolean;
  token: Token;
  balances: Map<string, string>;
}) {
  const wrapInputRef = useRef<any>();
  const depositInputRef = useRef<any>();
  const withdrawInputRef = useRef<any>();
  const [selectedTab, setSelectedTab] = useState<string>("deposit");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [sourceChainAddress, setSourceAddress] = useState<string>("");
  const [sourceChainBalance, setSourceBalance] = useState<string>("");
  const [depositCosmJs, setDepositCosmJs] =
    useState<SigningStargateClient | null>(null);
  const [withdrawCosmJs, setWithdrawCosmJs] =
    useState<SigningStargateClient | null>(null);
  const [loadingWrap, setLoadingWrap] = useState<boolean>(false);
  const [loadingUnwrap, setLoadingUnwrap] = useState<boolean>(false);
  const [loadingDeposit, setLoadingDeposit] = useState<boolean>(false);
  const [loadingWithdraw, setLoadingWithdraw] = useState<boolean>(false);
  const [tokenBalance, setTokenBalance] = useState<string>("");
  const [loadingTokenBalance, setLoadingTokenBalance] =
    useState<boolean>(false);

  const updateTokenBalance = async () => {
    if (!token.address) {
      return;
    }

    if (!secretjs) {
      return;
    }

    const key = await getKeplrViewingKey(token.address);
    if (!key) {
      setTokenBalance(viewingKeyErroString);
      return;
    }

    try {
      const result = await secretjs.queryContractSmart(
        token.address,
        {
          balance: { address: secretAddress, key },
        },
        undefined,
        token.code_hash
      );

      if (result.viewing_key_error) {
        setTokenBalance(viewingKeyErroString);
        return;
      }
      setTokenBalance(result.balance.amount);
    } catch (e) {
      setTokenBalance(viewingKeyErroString);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoadingTokenBalance(true);
        await updateTokenBalance();
      } finally {
        setLoadingTokenBalance(false);
      }
    })();
  }, [secretjs]);

  const denomOnSecret = token.withdraw_to[0]?.source_denom;
  let balanceIbcCoin;
  let balanceToken;

  if (token.address) {
    if (loadingCoinBalances) {
      balanceIbcCoin = (
        <span>
          Balance: <CircularProgress size="0.8em" />
        </span>
      );
    } else if (balances.get(denomOnSecret)) {
      balanceIbcCoin = (
        <span
          style={{ cursor: "pointer" }}
          onClick={() => {
            wrapInputRef.current.value = new BigNumber(
              balances.get(denomOnSecret) as string
            )
              .dividedBy(`1e${token.decimals}`)
              .toFixed();
          }}
        >
          Balance:{" "}
          {new BigNumber(balances.get(denomOnSecret) as string)
            .dividedBy(`1e${token.decimals}`)
            .toFormat()}
        </span>
      );
    } else {
      balanceIbcCoin = <>connect wallet</>;
    }
  } else {
    balanceIbcCoin = <>coming soon</>;
  }

  if (token.address) {
    if (!secretjs) {
      balanceToken = <>connect wallet</>;
    } else if (loadingTokenBalance) {
      balanceToken = (
        <span>
          Balance: <CircularProgress size="0.8em" />
        </span>
      );
    } else if (tokenBalance == viewingKeyErroString) {
      balanceToken = (
        <Tooltip title="Set Viewing Key" placement="top">
          <span
            style={{ cursor: "pointer" }}
            onClick={async () => {
              await setKeplrViewingKey(token.address);
              try {
                setLoadingTokenBalance(true);
                await sleep(1000); // sometimes query nodes lag
                await updateTokenBalance();
              } finally {
                setLoadingTokenBalance(false);
              }
            }}
          >
            Balance:{` ${viewingKeyErroString}`}
          </span>
        </Tooltip>
      );
    } else if (Number(tokenBalance) > -1) {
      balanceToken = (
        <span
          style={{ cursor: "pointer" }}
          onClick={() => {
            wrapInputRef.current.value = new BigNumber(tokenBalance)
              .dividedBy(`1e${token.decimals}`)
              .toFixed();
          }}
        >
          Balance:{" "}
          {new BigNumber(tokenBalance)
            .dividedBy(`1e${token.decimals}`)
            .toFormat()}
        </span>
      );
    }
  } else {
    balanceToken = <>coming soon</>;
  }

  return (
    <div
      key={token.name}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.8rem",
        padding: "1rem",
        borderRadius: 20,
        width: isMobile ? "100%" : undefined,
      }}
    >
      <Avatar
        src={token.image}
        sx={{
          width: 38,
          height: 38,
          boxShadow: "rgba(0, 0, 0, 0.15) 0px 6px 10px",
        }}
      />
      <div
        style={{
          display: "flex",
          width: isMobile ? undefined : 150,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              minWidth: "5em",
            }}
          >
            <span>{token.name}</span>
            {token.name !== "SCRT" && token.address ? (
              <>
                <Tooltip title={`IBC Deposit & Withdraw`} placement="top">
                  <Button
                    style={{ minWidth: 0 }}
                    onClick={async () => {
                      setIsDialogOpen(true);

                      while (
                        !window.keplr ||
                        !window.getEnigmaUtils ||
                        !window.getOfflineSigner
                      ) {
                        await sleep(100);
                      }

                      if (["Luna", "UST"].includes(token.name)) {
                        window.keplr.experimentalSuggestChain({
                          rpc: "https://rpc-columbus.keplr.app",
                          rest: "https://lcd-columbus.keplr.app",
                          chainId: "columbus-5",
                          chainName: "Terra",
                          stakeCurrency: {
                            coinDenom: "LUNA",
                            coinMinimalDenom: "uluna",
                            coinDecimals: 6,
                            coinGeckoId: "terra-luna",
                            // coinImageUrl:
                            //   window.location.origin +
                            //   "/public/assets/tokens/luna.png",
                          },
                          bip44: {
                            coinType: 330,
                          },
                          bech32Config:
                            Bech32Address.defaultBech32Config("terra"),
                          currencies: [
                            {
                              coinDenom: "LUNA",
                              coinMinimalDenom: "uluna",
                              coinDecimals: 6,
                              coinGeckoId: "terra-luna",
                              // coinImageUrl:
                              //   window.location.origin +
                              //   "/public/assets/tokens/luna.png",
                            },
                            {
                              coinDenom: "UST",
                              coinMinimalDenom: "uusd",
                              coinDecimals: 6,
                              coinGeckoId: "terrausd",
                              // coinImageUrl:
                              //   window.location.origin +
                              //   "/public/assets/tokens/ust.png",
                            },
                          ],
                          feeCurrencies: [
                            {
                              coinDenom: "LUNA",
                              coinMinimalDenom: "uluna",
                              coinDecimals: 6,
                              coinGeckoId: "terra-luna",
                              // coinImageUrl:
                              //   window.location.origin +
                              //   "/public/assets/tokens/luna.png",
                            },
                            {
                              coinDenom: "UST",
                              coinMinimalDenom: "uusd",
                              coinDecimals: 6,
                              coinGeckoId: "terrausd",
                              // coinImageUrl:
                              //   window.location.origin +
                              //   "/public/assets/tokens/ust.png",
                            },
                          ],
                          gasPriceStep: {
                            low: 0.015,
                            average: 0.015,
                            high: 0.015,
                          },
                          features: [
                            "stargate",
                            "ibc-transfer",
                            "no-legacy-stdTx",
                          ],
                          // explorerUrlToTx: "https://finder.terra.money/columbus-5/tx/{txHash}",
                        });
                      }

                      const { chain_id, rpc, lcd, bech32_prefix } =
                        chains[token.deposit_from[0].soure_chain_name];

                      await window.keplr.enable(chain_id);

                      const depositOfflineSigner =
                        window.getOfflineSigner(chain_id);

                      const depositFromAccounts =
                        await depositOfflineSigner.getAccounts();
                      setSourceAddress(depositFromAccounts[0].address);

                      const cosmJsForDeposit =
                        await SigningStargateClient.connectWithSigner(
                          rpc,
                          depositOfflineSigner,
                          { prefix: bech32_prefix }
                        );
                      setDepositCosmJs(cosmJsForDeposit);

                      const url = `${lcd}/bank/balances/${depositFromAccounts[0].address}`;
                      try {
                        const response = await fetch(url);
                        const result: {
                          height: string;
                          result: Array<{ denom: string; amount: string }>;
                        } = await response.json();

                        const balance =
                          result.result.find(
                            (c) =>
                              c.denom === token.deposit_from[0].source_denom
                          )?.amount || "0";

                        setSourceBalance(balance);
                      } catch (e) {
                        console.error(`Error while trying to query ${url}:`, e);
                        setSourceBalance("Error");
                      }

                      await window.keplr.enable(
                        chains["Secret Network"].chain_id
                      );
                      const withdrawOfflineSigner = window.getOfflineSigner(
                        chains["Secret Network"].chain_id
                      );

                      const cosmJsForWithdraw =
                        await SigningStargateClient.connectWithSigner(
                          chains["Secret Network"].rpc,
                          withdrawOfflineSigner,
                          { prefix: chains["Secret Network"].bech32_prefix }
                        );
                      setWithdrawCosmJs(cosmJsForWithdraw);
                    }}
                  >
                    <img src="/deposit.svg" style={{ height: "0.8em" }} />
                  </Button>
                </Tooltip>
                <Dialog
                  open={isDialogOpen}
                  fullWidth={true}
                  onClose={() => {
                    setIsDialogOpen(false);
                    setSourceBalance("");
                  }}
                >
                  <TabContext value={selectedTab}>
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                      <Tabs
                        value={selectedTab}
                        variant="fullWidth"
                        onChange={(
                          _event: React.SyntheticEvent,
                          newSelectedTab: string
                        ) => setSelectedTab(newSelectedTab)}
                      >
                        <Tab label="IBC Deposit" value={"deposit"} />
                        <Tab label="IBC Withdraw" value={"withdraw"} />
                      </Tabs>
                    </Box>
                    <TabPanel value={"deposit"}>
                      <DialogContent>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1em",
                          }}
                        >
                          <Typography>
                            Deposit <strong>{token.name}</strong> from{" "}
                            <strong>
                              {token.withdraw_to[0].destination_chain_name}
                            </strong>{" "}
                            to <strong>Secret Network</strong>
                          </Typography>
                        </div>
                        <br />
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "1em",
                          }}
                        >
                          <Typography sx={{ fontWeight: "bold" }}>
                            From:
                          </Typography>
                          {sourceChainAddress !== "" ? (
                            <CopiableAddress address={sourceChainAddress} />
                          ) : (
                            <CircularProgress size="1em" />
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "1em",
                          }}
                        >
                          <Typography sx={{ fontWeight: "bold" }}>
                            To:
                          </Typography>
                          {secretAddress !== "" ? (
                            <CopiableAddress address={secretAddress} />
                          ) : (
                            <CircularProgress size="1em" />
                          )}
                        </div>
                        <br />
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3em",
                            marginBottom: "0.8em",
                          }}
                        >
                          <Typography
                            sx={{ fontSize: "0.8em", fontWeight: "bold" }}
                          >
                            Available Balance:
                          </Typography>
                          <Typography sx={{ fontSize: "0.8em", opacity: 0.8 }}>
                            {(() => {
                              if (sourceChainBalance === "") {
                                return <CircularProgress size="0.6em" />;
                              }

                              const prettyBalance = new BigNumber(
                                sourceChainBalance
                              )
                                .dividedBy(`1e${token.decimals}`)
                                .toFormat();

                              if (prettyBalance === "NaN") {
                                return "Error";
                              }

                              return `${prettyBalance} ${token.name}`;
                            })()}
                          </Typography>
                        </div>
                        <FormControl sx={{ width: "100%" }} variant="standard">
                          <InputLabel htmlFor="Amount to Deposit">
                            Amount to Deposit
                          </InputLabel>
                          <Input
                            autoFocus
                            id="Amount to Deposit"
                            fullWidth
                            type="text"
                            inputRef={depositInputRef}
                            startAdornment={
                              <InputAdornment position="start">
                                <Avatar
                                  src={token.image}
                                  sx={{
                                    width: "1em",
                                    height: "1em",
                                    boxShadow:
                                      "rgba(0, 0, 0, 0.15) 0px 6px 10px",
                                  }}
                                />
                              </InputAdornment>
                            }
                            endAdornment={
                              <InputAdornment position="end">
                                <Button
                                  style={{
                                    padding: "0.1em 0.5em",
                                    minWidth: 0,
                                  }}
                                  onClick={() => {
                                    if (sourceChainBalance === "") {
                                      return;
                                    }

                                    const prettyBalance = new BigNumber(
                                      sourceChainBalance
                                    )
                                      .dividedBy(`1e${token.decimals}`)
                                      .toFormat();

                                    if (prettyBalance === "NaN") {
                                      return;
                                    }

                                    depositInputRef.current.value =
                                      prettyBalance;
                                  }}
                                >
                                  MAX
                                </Button>
                              </InputAdornment>
                            }
                          />
                        </FormControl>
                      </DialogContent>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginBottom: "1em",
                        }}
                      >
                        <LoadingButton
                          variant="contained"
                          sx={{
                            padding: "0.5em 0",
                            width: "10em",
                            fontWeight: "bold",
                            fontSize: "1.2em",
                          }}
                          loading={loadingDeposit}
                          onClick={async () => {
                            if (!depositCosmJs) {
                              console.error("No cosmjs");
                              return;
                            }

                            if (!depositInputRef?.current?.value) {
                              console.error("Empty deposit");
                              return;
                            }

                            const depositNormalizedAmount = (
                              depositInputRef.current.value as string
                            ).replace(/,/g, "");

                            if (!(Number(depositNormalizedAmount) > 0)) {
                              console.error(
                                `${depositNormalizedAmount} not bigger than 0`
                              );
                              return;
                            }

                            setLoadingDeposit(true);

                            const amount = new BigNumber(
                              depositNormalizedAmount
                            )
                              .multipliedBy(`1e${token.decimals}`)
                              .toFixed(0, BigNumber.ROUND_DOWN);

                            const { deposit_channel_id, deposit_gas } =
                              chains[token.deposit_from[0].soure_chain_name];
                            try {
                              const { transactionHash } =
                                await depositCosmJs.sendIbcTokens(
                                  sourceChainAddress,
                                  secretAddress,
                                  {
                                    amount,
                                    denom: token.deposit_from[0].source_denom,
                                  },
                                  "transfer",
                                  deposit_channel_id,
                                  undefined,
                                  Math.floor(Date.now() / 1000) + 15 * 60, // 15 minute timeout
                                  getFeeFromGas(deposit_gas)
                                );
                              depositInputRef.current.value = "";
                              setIsDialogOpen(false);
                            } finally {
                              setLoadingDeposit(false);
                            }
                          }}
                        >
                          Deposit
                        </LoadingButton>
                      </div>
                    </TabPanel>
                    <TabPanel value={"withdraw"}>
                      <DialogContent>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1em",
                          }}
                        >
                          <Typography>
                            Withdraw <strong>{token.name}</strong> from{" "}
                            <strong>Secret Network</strong> to{" "}
                            <strong>
                              {token.withdraw_to[0].destination_chain_name}
                            </strong>
                          </Typography>
                        </div>
                        <br />
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "1em",
                          }}
                        >
                          <Typography sx={{ fontWeight: "bold" }}>
                            From:
                          </Typography>
                          {secretAddress !== "" ? (
                            <CopiableAddress address={secretAddress} />
                          ) : (
                            <CircularProgress size="1em" />
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "1em",
                          }}
                        >
                          <Typography sx={{ fontWeight: "bold" }}>
                            To:
                          </Typography>
                          {sourceChainAddress !== "" ? (
                            <CopiableAddress address={sourceChainAddress} />
                          ) : (
                            <CircularProgress size="1em" />
                          )}
                        </div>

                        <br />
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3em",
                            marginBottom: "0.8em",
                          }}
                        >
                          <Typography
                            sx={{ fontSize: "0.8em", fontWeight: "bold" }}
                          >
                            Available Balance:
                          </Typography>
                          <Typography sx={{ fontSize: "0.8em", opacity: 0.8 }}>
                            {(() => {
                              const prettyBalance = new BigNumber(
                                balances.get(
                                  token.withdraw_to[0].source_denom
                                ) as string
                              )
                                .dividedBy(`1e${token.decimals}`)
                                .toFormat();

                              if (prettyBalance === "NaN") {
                                return "Error";
                              }

                              return `${prettyBalance} ${token.name}`;
                            })()}
                          </Typography>
                        </div>
                        <FormControl sx={{ width: "100%" }} variant="standard">
                          <InputLabel htmlFor="Amount to Withdraw">
                            Amount to Withdraw
                          </InputLabel>
                          <Input
                            autoFocus
                            id="Amount to Withdraw"
                            fullWidth
                            type="text"
                            inputRef={withdrawInputRef}
                            startAdornment={
                              <InputAdornment position="start">
                                <Avatar
                                  src={token.image}
                                  sx={{
                                    width: "1em",
                                    height: "1em",
                                    boxShadow:
                                      "rgba(0, 0, 0, 0.15) 0px 6px 10px",
                                  }}
                                />
                              </InputAdornment>
                            }
                            endAdornment={
                              <InputAdornment position="end">
                                <Button
                                  style={{
                                    padding: "0.1em 0.5em",
                                    minWidth: 0,
                                  }}
                                  onClick={() => {
                                    if (
                                      !balances.get(
                                        token.withdraw_to[0].source_denom
                                      )
                                    ) {
                                      return;
                                    }

                                    const prettyBalance = new BigNumber(
                                      balances.get(
                                        token.withdraw_to[0].source_denom
                                      ) as string
                                    )
                                      .dividedBy(`1e${token.decimals}`)
                                      .toFormat();

                                    if (prettyBalance === "NaN") {
                                      return;
                                    }

                                    withdrawInputRef.current.value =
                                      prettyBalance;
                                  }}
                                >
                                  MAX
                                </Button>
                              </InputAdornment>
                            }
                          />
                        </FormControl>
                      </DialogContent>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginBottom: "1em",
                        }}
                      >
                        <LoadingButton
                          variant="contained"
                          sx={{
                            padding: "0.5em 0",
                            width: "10em",
                            fontWeight: "bold",
                            fontSize: "1.2em",
                          }}
                          loading={loadingWithdraw}
                          onClick={async () => {
                            if (!withdrawCosmJs) {
                              console.error("No cosmjs");
                              return;
                            }

                            if (!withdrawInputRef?.current?.value) {
                              console.error("Empty withdraw");
                              return;
                            }

                            const withdrawNormalizedAmount = (
                              withdrawInputRef.current.value as string
                            ).replace(/,/g, "");

                            if (!(Number(withdrawNormalizedAmount) > 0)) {
                              console.error(
                                `${withdrawNormalizedAmount} not bigger than 0`
                              );
                              return;
                            }

                            setLoadingWithdraw(true);

                            const amount = new BigNumber(
                              withdrawNormalizedAmount
                            )
                              .multipliedBy(`1e${token.decimals}`)
                              .toFixed(0, BigNumber.ROUND_DOWN);

                            const { withdraw_channel_id, withdraw_gas } =
                              chains[
                                token.withdraw_to[0].destination_chain_name
                              ];
                            try {
                              const { transactionHash } =
                                await withdrawCosmJs.sendIbcTokens(
                                  secretAddress,
                                  sourceChainAddress,
                                  {
                                    amount,
                                    denom: token.withdraw_to[0].source_denom,
                                  },
                                  "transfer",
                                  withdraw_channel_id,
                                  undefined,
                                  Math.floor(Date.now() / 1000) + 15 * 60, // 15 minute timeout
                                  getFeeFromGas(withdraw_gas)
                                );
                              withdrawInputRef.current.value = "";
                              setIsDialogOpen(false);
                            } finally {
                              setLoadingWithdraw(false);
                            }
                          }}
                        >
                          Withdraw
                        </LoadingButton>
                      </div>
                    </TabPanel>
                  </TabContext>
                </Dialog>
              </>
            ) : null}
          </div>
          <span style={{ fontSize: "0.75rem" }}>{balanceIbcCoin}</span>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
        }}
      >
        <Button
          disabled={token.address === ""}
          size="small"
          variant="text"
          startIcon={
            loadingUnwrap ? (
              <CircularProgress size="0.8em" />
            ) : (
              <KeyboardArrowLeftIcon />
            )
          }
          onClick={async () => {
            if (!secretjs || !secretAddress || loadingWrap || loadingUnwrap) {
              return;
            }

            const baseAmount = wrapInputRef?.current?.value;
            const amount = new BigNumber(baseAmount)
              .multipliedBy(`1e${token.decimals}`)
              .toFixed(0, BigNumber.ROUND_DOWN);

            if (amount === "NaN") {
              console.error("NaN amount", baseAmount);
              return;
            }

            setLoadingUnwrap(true);

            try {
              const { transactionHash } = await secretjs.execute(
                token.address,
                {
                  redeem: {
                    amount,
                    denom:
                      token.name === "SCRT"
                        ? undefined
                        : token.withdraw_to[0].source_denom,
                  },
                },
                "",
                [],
                getFeeFromGas(40_000),
                token.code_hash
              );

              while (true) {
                try {
                  const tx = await secretjs.restClient.txById(
                    transactionHash,
                    true
                  );

                  if (!tx.raw_log.startsWith("[")) {
                    console.error(`Tx failed: ${tx.raw_log}`);
                  } else {
                    wrapInputRef.current.value = "";
                    console.log(`Unwrapped successfully`);
                  }

                  break;
                } catch (error) {
                  console.log("Still waiting for tx to commit on-chain...");
                }

                await sleep(5000);
              }
            } finally {
              setLoadingUnwrap(false);
              try {
                setLoadingTokenBalance(true);
                await sleep(1000); // sometimes query nodes lag
                await updateTokenBalance();
              } finally {
                setLoadingTokenBalance(false);
              }
            }
          }}
        >
          {isMobile ? "" : "Unwrap"}
        </Button>
        <Input
          disabled={token.address === ""}
          // TODO add input validation
          placeholder="Amount"
          inputProps={{
            style: {
              textAlign: "center",
              textOverflow: "ellipsis",
            },
          }}
          inputRef={wrapInputRef}
        />
        <Button
          disabled={token.address === ""}
          size="small"
          variant="text"
          endIcon={
            loadingWrap ? (
              <CircularProgress size="0.8em" />
            ) : (
              <KeyboardArrowRightIcon />
            )
          }
          onClick={async () => {
            if (!secretjs || !secretAddress || loadingWrap || loadingUnwrap) {
              return;
            }

            const baseAmount = wrapInputRef?.current?.value;
            const amount = new BigNumber(baseAmount)
              .multipliedBy(`1e${token.decimals}`)
              .toFixed(0, BigNumber.ROUND_DOWN);

            if (amount === "NaN") {
              console.error("NaN amount", baseAmount);
              return;
            }

            setLoadingWrap(true);
            try {
              const { transactionHash } = await secretjs.execute(
                token.address,
                { deposit: {} },
                "",
                [{ denom: token.withdraw_to[0].source_denom, amount }],
                getFeeFromGas(40_000),
                token.code_hash
              );

              while (true) {
                try {
                  const tx = await secretjs.restClient.txById(
                    transactionHash,
                    true
                  );

                  if (!tx.raw_log.startsWith("[")) {
                    console.error(`Tx failed: ${tx.raw_log}`);
                  } else {
                    wrapInputRef.current.value = "";
                    console.log(`Wrapped successfully`);
                  }

                  break;
                } catch (error) {
                  console.log("Still waiting for tx to commit on-chain...");
                }

                await sleep(5000);
              }
            } finally {
              setLoadingWrap(false);
              try {
                setLoadingTokenBalance(true);
                await sleep(1000); // sometimes query nodes lag
                await updateTokenBalance();
              } finally {
                setLoadingTokenBalance(false);
              }
            }
          }}
        >
          {isMobile ? "" : "Wrap"}
        </Button>
      </div>
      <div
        style={{
          display: "flex",
          width: isMobile ? undefined : 150,
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <span>s{token.name}</span>
          <div
            style={{
              fontSize: "0.75rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.2em",
            }}
          >
            <span>{balanceToken}</span>
            {token.address ? (
              <Tooltip title="Refresh Balance" placement="top">
                <Button
                  style={{
                    color: "black",
                    minWidth: 0,
                    padding: 0,
                    display: loadingTokenBalance ? "none" : undefined,
                  }}
                  onClick={async () => {
                    try {
                      setLoadingTokenBalance(true);
                      await updateTokenBalance();
                    } finally {
                      setLoadingTokenBalance(false);
                    }
                  }}
                >
                  <RefreshIcon sx={{ height: "0.7em" }} />
                </Button>
              </Tooltip>
            ) : null}
          </div>
        </div>
      </div>
      <Avatar
        src={token.image}
        sx={{
          width: 38,
          height: 38,
          boxShadow: "rgba(0, 0, 0, 0.15) 0px 6px 10px",
        }}
      />
    </div>
  );
}

function CopiableAddress({ address }: { address: string }) {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.1em",
      }}
    >
      <Typography sx={{ opacity: 0.8 }}>
        {address ?? <CircularProgress size="0.8em" />}
      </Typography>
      <CopyToClipboard
        text={address}
        onCopy={() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 3000);
        }}
      >
        <Button style={{ color: "black", minWidth: 0 }}>
          <FileCopyOutlined
            fontSize="small"
            style={isCopied ? { fill: "green" } : undefined}
          />
        </Button>
      </CopyToClipboard>
    </div>
  );
}

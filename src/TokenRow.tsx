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
} from "@mui/material";
import BigNumber from "bignumber.js";
import React, { useRef, useState, useEffect } from "react";
import { isMobile } from "react-device-detect";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import CopyToClipboard from "react-copy-to-clipboard";
import { getFeeForExecute } from "./App";
import { SigningCosmWasmClient } from "secretjs";
import { getKeplrViewingKey, setKeplrViewingKey } from "./KeplrStuff";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { FileCopyOutlined } from "@mui/icons-material";
import { SigningStargateClient } from "@cosmjs/stargate";

const viewingKeyErroString = "🧐";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
  token: {
    name: string;
    address: string;
    code_hash: string;
    image: string;
    decimals: number;
    denom: string;
    source_denom: string;
    chain_id: string;
    bech32_prefix: string;
    lcd: string;
    rpc: string;
    chain_name: string;
    channel_id: string;
    transfer_gas: number;
  };
  balances: Map<string, string>;
}) {
  const wrapInputRef = useRef<any>();
  const depositInputRef = useRef<any>();
  const [isDepositDialogOpen, setIsDepositDialogOpen] =
    useState<boolean>(false);
  const [sourceAddress, setSourceAddress] = useState<string>("");
  const [sourceBalance, setSourceBalance] = useState<string>("");
  const [sourceCosmJs, setSourceCosmJs] =
    useState<SigningStargateClient | null>(null);
  const [loadingWrap, setLoadingWrap] = useState<boolean>(false);
  const [loadingUnwrap, setLoadingUnwrap] = useState<boolean>(false);
  const [loadingDeposit, setLoadingDeposit] = useState<boolean>(false);
  const [tokenBalance, setTokenBalance] = useState<string>("");
  const [loadingTokenBalance, setLoadingTokenBalance] =
    useState<boolean>(false);

  const updateTokenBalance = async () => {
    if (!token.address) {
      return;
    }

    while (!secretjs) {
      await sleep(50);
    }

    const key = await getKeplrViewingKey(token.address);
    if (!key) {
      setTokenBalance(viewingKeyErroString);
      console.log(3, token.name);
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
        console.log(4, token.name);
        return;
      }
      console.log(5, token.name);
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
  }, []);

  let balanceIbcCoin;
  let balanceToken;

  if (loadingCoinBalances) {
    balanceIbcCoin = (
      <span>
        Balance: <CircularProgress size="0.8em" />
      </span>
    );
  } else if (balances.get(token.denom)) {
    balanceIbcCoin = (
      <span
        style={{ cursor: "pointer" }}
        onClick={() => {
          wrapInputRef.current.value = new BigNumber(
            balances.get(token.denom) as string
          )
            .dividedBy(`1e${token.decimals}`)
            .toFixed();
        }}
      >
        Balance:{" "}
        {new BigNumber(balances.get(token.denom) as string)
          .dividedBy(`1e${token.decimals}`)
          .toFormat()}
      </span>
    );
  } else {
    balanceIbcCoin = <>connect wallet</>;
  }

  if (token.address) {
    if (loadingTokenBalance) {
      balanceToken = (
        <span>
          Balance: <CircularProgress size="0.8em" />
        </span>
      );
    } else if (tokenBalance == viewingKeyErroString) {
      balanceToken = (
        <span
          style={{ cursor: "pointer" }}
          onClick={() => {
            setKeplrViewingKey(token.address);
          }}
        >
          Balance:{` ${viewingKeyErroString}`}
        </span>
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
    } else {
      balanceToken = <>connect wallet</>;
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
          width: 40,
          height: 40,
          boxShadow: "rgba(0, 0, 0, 0.15) 0px 6px 10px",
        }}
      />
      <div
        style={{
          display: "flex",
          width: isMobile ? undefined : 125,
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
            {token.chain_name !== "Secret Network" ? (
              <>
                {" "}
                <Tooltip title={`IBC Deposit`} placement="top">
                  <Button
                    style={{ minWidth: 0 }}
                    onClick={async () => {
                      setIsDepositDialogOpen(true);

                      while (
                        !window.keplr ||
                        !window.getEnigmaUtils ||
                        !window.getOfflineSigner
                      ) {
                        await sleep(100);
                      }

                      if (token.chain_name === "Terra") {
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
                            coinImageUrl:
                              window.location.origin +
                              "/public/assets/tokens/luna.png",
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
                              coinImageUrl:
                                window.location.origin +
                                "/public/assets/tokens/luna.png",
                            },
                            {
                              coinDenom: "UST",
                              coinMinimalDenom: "uusd",
                              coinDecimals: 6,
                              coinGeckoId: "terrausd",
                              coinImageUrl:
                                window.location.origin +
                                "/public/assets/tokens/ust.png",
                            },
                          ],
                          feeCurrencies: [
                            {
                              coinDenom: "LUNA",
                              coinMinimalDenom: "uluna",
                              coinDecimals: 6,
                              coinGeckoId: "terra-luna",
                              coinImageUrl:
                                window.location.origin +
                                "/public/assets/tokens/luna.png",
                            },
                            {
                              coinDenom: "UST",
                              coinMinimalDenom: "uusd",
                              coinDecimals: 6,
                              coinGeckoId: "terrausd",
                              coinImageUrl:
                                window.location.origin +
                                "/public/assets/tokens/ust.png",
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

                      await window.keplr.enable(token.chain_id);

                      const offlineSigner = window.getOfflineSigner(
                        token.chain_id
                      );

                      const accounts = await offlineSigner.getAccounts();
                      const { address } = accounts[0];
                      setSourceAddress(address);

                      const cosmJs =
                        await SigningStargateClient.connectWithSigner(
                          token.rpc,
                          offlineSigner,
                          { prefix: token.bech32_prefix }
                        );
                      setSourceCosmJs(cosmJs);

                      const url = `${token.lcd}/bank/balances/${address}`;
                      try {
                        const response = await fetch(url);
                        const result: {
                          height: string;
                          result: Array<{ denom: string; amount: string }>;
                        } = await response.json();

                        const balance =
                          result.result.find(
                            (c) => c.denom === token.source_denom
                          )?.amount || "0";

                        setSourceBalance(balance);
                      } catch (e) {
                        console.error(`Error while trying to query ${url}:`, e);
                        setSourceBalance("Error");
                      }
                    }}
                  >
                    <img src="/deposit.png" style={{ height: "0.8em" }} />
                  </Button>
                </Tooltip>
                <Dialog
                  open={isDepositDialogOpen}
                  onClose={() => {
                    setIsDepositDialogOpen(false);
                    console.log(1);
                    setSourceBalance("");
                  }}
                >
                  <DialogTitle>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="h5">Deposit IBC Asset</Typography>

                      <IconButton onClick={() => setIsDepositDialogOpen(false)}>
                        <CloseIcon />
                      </IconButton>
                    </div>
                  </DialogTitle>
                  <DialogContent>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "1em",
                      }}
                    >
                      <Typography sx={{ fontWeight: "bold" }}>From:</Typography>
                      {sourceAddress !== "" ? (
                        <CopiableAddress address={sourceAddress} />
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
                      <Typography sx={{ fontWeight: "bold" }}>To:</Typography>
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
                          if (sourceBalance === "") {
                            return <CircularProgress size="0.6em" />;
                          }

                          const prettyBalance = new BigNumber(sourceBalance)
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
                                boxShadow: "rgba(0, 0, 0, 0.15) 0px 6px 10px",
                              }}
                            />
                          </InputAdornment>
                        }
                        endAdornment={
                          <InputAdornment position="end">
                            <Button
                              style={{ padding: "0.1em 0.5em", minWidth: 0 }}
                              onClick={() => {
                                if (sourceBalance === "") {
                                  return;
                                }

                                const prettyBalance = new BigNumber(
                                  sourceBalance
                                )
                                  .dividedBy(`1e${token.decimals}`)
                                  .toFormat();

                                if (prettyBalance === "NaN") {
                                  return;
                                }

                                depositInputRef.current.value = prettyBalance;
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
                    <Button
                      variant="contained"
                      sx={{
                        padding: "0.5em 5em",
                        fontWeight: "bold",
                        fontSize: "1.2em",
                      }}
                      onClick={async () => {
                        if (!sourceCosmJs) {
                          console.error("No cosmjs");
                          return;
                        }

                        if (!(Number(depositInputRef?.current?.value) > 0)) {
                          console.error(
                            `${depositInputRef?.current?.value} not bigger than 0`
                          );
                          return;
                        }

                        setLoadingDeposit(true);

                        const amount = new BigNumber(
                          depositInputRef?.current?.value
                        )
                          .multipliedBy(`1e${token.decimals}`)
                          .toFixed(0, BigNumber.ROUND_DOWN);

                        const { transactionHash } =
                          await sourceCosmJs.sendIbcTokens(
                            sourceAddress,
                            secretAddress,
                            { amount, denom: token.source_denom },
                            "transfer",
                            token.channel_id,
                            undefined,
                            Math.floor(Date.now() / 1000) + 30, // 30 seconds timeout
                            getFeeForExecute(token.transfer_gas)
                          );
                        depositInputRef.current.value = "";
                        setLoadingDeposit(false);
                      }}
                    >
                      {loadingDeposit ? <CircularProgress /> : "Deposit"}
                    </Button>
                  </div>
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
          style={{ minWidth: 0 }}
          onClick={async () => {
            if (!secretjs || !secretAddress || loadingWrap || loadingUnwrap) {
              return;
            }

            const amount = new BigNumber(wrapInputRef?.current?.value)
              .multipliedBy(`1e${token.decimals}`)
              .toFixed(0, BigNumber.ROUND_DOWN);

            if (amount === "NaN") {
              console.error("NaN amount", wrapInputRef?.current?.value);
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
                      token.chain_name === "Secret Network"
                        ? undefined
                        : token.denom,
                  },
                },
                "",
                [],
                getFeeForExecute(30_000),
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
          style={{ minWidth: 0 }}
          onClick={async () => {
            if (!secretjs || !secretAddress || loadingWrap || loadingUnwrap) {
              return;
            }

            const amount = new BigNumber(wrapInputRef?.current?.value)
              .multipliedBy(`1e${token.decimals}`)
              .toFixed(0, BigNumber.ROUND_DOWN);

            if (amount === "NaN") {
              console.error("NaN amount", wrapInputRef?.current?.value);
              return;
            }

            setLoadingWrap(true);
            try {
              const { transactionHash } = await secretjs.execute(
                token.address,
                { deposit: {} },
                "",
                [{ denom: token.denom, amount }],
                getFeeForExecute(30_000),
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
          width: isMobile ? undefined : 125,
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
              <Button
                style={{ color: "black", minWidth: 0, padding: 0 }}
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
            ) : null}
          </div>
        </div>
      </div>
      <Avatar
        src={token.image}
        sx={{
          width: 40,
          height: 40,
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

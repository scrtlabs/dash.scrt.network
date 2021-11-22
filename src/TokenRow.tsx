import CircularProgress from "@mui/material/CircularProgress";
import BigNumber from "bignumber.js";
import React, { useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { getFeeForExecute, sleep, viewingKeyErroString } from "./App";
import { SigningCosmWasmClient } from "secretjs";
import { setKeplrViewingKey } from "./KeplrStuff";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { FileCopyOutlined } from "@mui/icons-material";
import CopyToClipboard from "react-copy-to-clipboard";
import InputAdornment from "@mui/material/InputAdornment";
import Input from "@mui/material/Input";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { SigningStargateClient } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";

export default function TokenRow({
  secretjs,
  mySecretAddress,
  token,
  balances,
  loadingBalances,
}: {
  secretjs: SigningCosmWasmClient | null;
  mySecretAddress: string;
  loadingBalances: boolean;
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
  };
  balances: Map<string, string>;
}) {
  const wrapInputRef = useRef<any>();
  const depositInputRef = useRef<any>();
  const [isDepositDialogOpen, setIsDepositDialogOpen] =
    useState<boolean>(false);
  const [mySourceAddress, setMySourceAddress] = useState<string>("");
  const [mySourceBalance, setMySourceBalance] = useState<string>("");
  const [mySourceCosmJs, setMySourceCosmJs] =
    useState<SigningStargateClient | null>(null);

  let balanceIbcCoin;
  let balanceToken;

  if (loadingBalances) {
    balanceIbcCoin = (
      <span>
        Balance: <CircularProgress size="0.8em" />
      </span>
    );
    balanceToken = (
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

    if (token.address) {
      if (balances.get(token.address) == viewingKeyErroString) {
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
      } else {
        balanceToken = (
          <span
            style={{ cursor: "pointer" }}
            onClick={() => {
              wrapInputRef.current.value = new BigNumber(
                balances.get(token.address) as string
              )
                .dividedBy(`1e${token.decimals}`)
                .toFixed();
            }}
          >
            Balance:{" "}
            {new BigNumber(balances.get(token.address) as string)
              .dividedBy(`1e${token.decimals}`)
              .toFormat()}
          </span>
        );
      }
    } else {
      balanceToken = <>comming soon</>;
    }
  } else {
    balanceIbcCoin = <>connect wallet</>;
    balanceToken = <>connect wallet</>;
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

                      const cosmJS =
                        await SigningStargateClient.connectWithSigner(
                          token.rpc,
                          offlineSigner,
                          { prefix: token.bech32_prefix }
                        );

                      setMySourceAddress(address);

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

                        setMySourceBalance(balance);
                      } catch (e) {
                        console.error(`Error while trying to query ${url}:`, e);
                        setMySourceBalance("Error");
                      }
                    }}
                  >
                    <img src="/deposit.png" style={{ height: "0.8em" }} />
                  </Button>
                </Tooltip>
                <Dialog
                  open={isDepositDialogOpen}
                  onClose={() => setIsDepositDialogOpen(false)}
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
                      {mySourceAddress !== "" ? (
                        <CopiableAddress address={mySourceAddress} />
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
                      {mySecretAddress !== "" ? (
                        <CopiableAddress address={mySecretAddress} />
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
                          if (mySourceBalance === "") {
                            return <CircularProgress size="0.6em" />;
                          }

                          const prettyBalance = new BigNumber(mySourceBalance)
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
                                if (mySourceBalance === "") {
                                  return;
                                }

                                const prettyBalance = new BigNumber(
                                  mySourceBalance
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
                  {/* <DialogActions> */}
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
                        padding: "0.8em 5em",
                        borderRadius: "20px",
                        fontWeight: "bold",
                      }}
                      disabled={Number(depositInputRef?.current?.value) <= 0}
                      /* onClick={TODO} */
                    >
                      Deposit
                    </Button>
                  </div>
                  {/* </DialogActions> */}
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
          size="small"
          variant="text"
          startIcon={<KeyboardArrowLeftIcon />}
          style={{ minWidth: 0 }}
          onClick={() => {
            if (!secretjs || !mySecretAddress) {
              return;
            }

            const amount = new BigNumber(wrapInputRef?.current?.value)
              .multipliedBy(`1e${token.decimals}`)
              .toFixed(0, BigNumber.ROUND_DOWN);

            if (amount === "NaN") {
              console.error("NaN amount", wrapInputRef?.current?.value);
              return;
            }

            secretjs.execute(
              token.address,
              { redeem: { amount } },
              "",
              [],
              getFeeForExecute(250_000),
              token.code_hash
            );
          }}
        >
          {isMobile ? "" : "Unwrap"}
        </Button>
        <Input
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
          size="small"
          variant="text"
          endIcon={<KeyboardArrowRightIcon />}
          style={{ minWidth: 0 }}
          onClick={() => {
            if (!secretjs || !mySecretAddress) {
              return;
            }

            const amount = new BigNumber(wrapInputRef?.current?.value)
              .multipliedBy(`1e${token.decimals}`)
              .toFixed(0, BigNumber.ROUND_DOWN);

            if (amount === "NaN") {
              console.error("NaN amount", wrapInputRef?.current?.value);
              return;
            }

            secretjs.execute(
              token.address,
              { deposit: {} },
              "",
              [{ denom: token.denom, amount }],
              getFeeForExecute(250_000),
              token.code_hash
            );
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
          <span style={{ fontSize: "0.75rem" }}>{balanceToken}</span>
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

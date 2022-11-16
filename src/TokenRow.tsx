import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Avatar,
  Button,
  CircularProgress,
  Input,
  Tooltip,
} from "@mui/material";
import BigNumber from "bignumber.js";
import React, { useEffect, useRef, useState } from "react";
import { Else, If, Then, When } from "react-if";
import { Breakpoint } from "react-socks";
import { MsgExecuteContract, SecretNetworkClient } from "secretjs";
import { sleep, viewingKeyErrorString ,faucetAddress} from "./commons";
import { Token } from "./config";
import DepositWithdrawDialog from "./DepositWithdrawDialog";
import { getKeplrViewingKey, setKeplrViewingKey } from "./KeplrStuff";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TokenRow({
  secretjs,
  secretAddress,
  token,
  balances,
  loadingCoinBalances,
  price,
  useFeegrant,
}: {
  secretjs: SecretNetworkClient | null;
  secretAddress: string;
  loadingCoinBalances: boolean;
  token: Token;
  balances: Map<string, string>;
  price: number;
  useFeegrant: boolean;
}) {
  const wrapInputRef = useRef<any>();

  const [loadingWrap, setLoadingWrap] = useState<boolean>(false);
  const [loadingUnwrap, setLoadingUnwrap] = useState<boolean>(false);
  const [tokenBalance, setTokenBalance] = useState<string>("");
  const [loadingTokenBalance, setLoadingTokenBalance] =
    useState<boolean>(false);
  const [isDepositWithdrawDialogOpen, setIsDepositWithdrawDialogOpen] =
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
      setTokenBalance(viewingKeyErrorString);
      balances.set(token.address, viewingKeyErrorString);
      return;
    }

    try {
      const result: {
        viewing_key_error: any;
        balance: {
          amount: string;
        };
      } = await secretjs.query.compute.queryContract({
        contractAddress: token.address,
        codeHash: token.code_hash,
        query: {
          balance: { address: secretAddress, key },
        },
      });

      if (result.viewing_key_error) {
        setTokenBalance(viewingKeyErrorString);
        balances.set(token.address, viewingKeyErrorString);
        return;
      }

      setTokenBalance(result.balance.amount);
      balances.set(token.address, result.balance.amount);
    } catch (e) {
      console.error(`Error getting balance for s${token.name}`, e);

      setTokenBalance(viewingKeyErrorString);
      balances.set(token.address, viewingKeyErrorString);
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

  const denomOnSecret = token.withdrawals[0]?.from_denom;
  let balanceIbcCoin;
  let balanceToken;

  if (token.address) {
    if (loadingCoinBalances) {
      balanceIbcCoin = (
        <div>
          <div>
            Balance: <CircularProgress size="0.8em" />
          </div>
          <div style={{ opacity: 0 }}>placeholder</div>
        </div>
      );
    } else if (
      balances.get(denomOnSecret) ||
      (balances.get("uscrt") && token.is_snip20)
    ) {
      balanceIbcCoin = (
        <div>
          <div
            style={{ cursor: !token.is_snip20 ? "pointer" : "auto" }}
            onClick={() => {
              if (token.is_snip20) {
                return;
              }

              wrapInputRef.current.value = new BigNumber(
                balances.get(denomOnSecret)!
              )
                .dividedBy(`1e${token.decimals}`)
                .toFixed();
            }}
          >
            <If condition={token.is_snip20}>
              <Then>SNIP-20</Then>
              <Else>
                {`Balance: ${new BigNumber(balances.get(denomOnSecret)!)
                  .dividedBy(`1e${token.decimals}`)
                  .toFormat()}`}
              </Else>
            </If>
          </div>
          <div style={{ display: "flex", opacity: token.is_snip20 ? 0 : 0.7 }}>
            {usdString.format(
              new BigNumber(balances.get(denomOnSecret)!)
                .dividedBy(`1e${token.decimals}`)
                .multipliedBy(price)
                .toNumber()
            )}
          </div>
        </div>
      );
    } else {
      balanceIbcCoin = (
        <div>
          <div
            style={{ cursor: "pointer" }}
            onClick={() => {
              document.getElementById("keplr-button")?.click();
            }}
          >
            connect wallet
          </div>
          <div style={{ opacity: 0 }}>(please)</div>
        </div>
      );
    }
  } else {
    balanceIbcCoin = (
      <div>
        <div>coming soon</div>
        <div>(🤫)</div>
      </div>
    );
  }

  if (token.address) {
    if (!secretjs) {
      balanceToken = (
        <div>
          <div
            style={{ cursor: "pointer" }}
            onClick={() => {
              document.getElementById("keplr-button")?.click();
            }}
          >
            connect wallet
          </div>
          <div style={{ opacity: 0 }}>(please)</div>
        </div>
      );
    } else if (loadingTokenBalance) {
      balanceToken = (
        <div>
          <div>
            Balance: <CircularProgress size="0.8em" />
          </div>
          <div style={{ opacity: 0 }}>placeholder</div>
        </div>
      );
    } else if (tokenBalance == viewingKeyErrorString) {
      balanceToken = (
        <div>
          <Tooltip title="Set Viewing Key" placement="top">
            <div
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
              {`Balance: ${viewingKeyErrorString}`}
            </div>
          </Tooltip>
          <div style={{ opacity: 0 }}>placeholder</div>
        </div>
      );
    } else if (Number(tokenBalance) > -1) {
      balanceToken = (
        <div>
          <div
            style={{ cursor: "pointer" }}
            onClick={() => {
              wrapInputRef.current.value = new BigNumber(tokenBalance)
                .dividedBy(`1e${token.decimals}`)
                .toFixed();
            }}
          >
            {`Balance: ${new BigNumber(tokenBalance)
              .dividedBy(`1e${token.decimals}`)
              .toFormat()}`}
          </div>
          <div
            style={{ display: "flex", placeContent: "flex-end", opacity: 0.7 }}
          >
            {usdString.format(
              new BigNumber(tokenBalance)
                .dividedBy(`1e${token.decimals}`)
                .multipliedBy(price)
                .toNumber()
            )}
          </div>
        </div>
      );
    }
  } else {
    balanceToken = (
      <div>
        <div>coming soon</div>
        <div style={{ display: "flex", placeContent: "flex-end" }}>(🤫)</div>
      </div>
    );
  }

  const inputRow = (
    <div
      style={{
        display: "flex",
        placeItems: "center",
        gap: "0.3rem",
      }}
    >
      <Button
        disabled={token.address === "" || token.is_snip20}
        size="small"
        variant="text"
        startIcon={
          <If condition={loadingUnwrap}>
            <Then>
              <CircularProgress size="0.8em" />
            </Then>
            <Else>
              <KeyboardArrowLeftIcon />
            </Else>
          </If>
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
          const toastId = toast.loading(
            `Unwrapping ${token.name}`,
            {
              closeButton: true,
            }
          );
          try {
            const tx = await secretjs.tx.broadcast(
              [
                new MsgExecuteContract({
                  sender: secretAddress,
                  contractAddress: token.address,
                  codeHash: token.code_hash,
                  sentFunds: [],
                  msg: {
                    redeem: {
                      amount,
                      denom:
                        token.name === "SCRT"
                          ? undefined
                          : token.withdrawals[0].from_denom,
                    },
                  },
                }),
              ],
              {
                gasLimit: 150_000,
                gasPriceInFeeDenom: 0.25,
                feeDenom: "uscrt",
                feeGranter: useFeegrant ? faucetAddress : "",
              }
            );

            if (tx.code === 0) {
              wrapInputRef.current.value = "";
              toast.update(toastId, {
                render: `Unwrapped ${token.name} successfully`,
                type: "success",
                isLoading: false,
                closeOnClick: true,
              });
              console.log(`Unwrapped successfully`);
            } else {
              toast.update(toastId, {
                render: `Unwrapping of ${token.name} failed: ${tx.rawLog}`,
                type: "error",
                isLoading: false,
                closeOnClick: true,
              });
              console.error(`Tx failed: ${tx.rawLog}`);
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
        Unwrap
      </Button>
      <Input
        disabled={token.address === "" || token.is_snip20}
        // TODO add input validation
        placeholder="Amount"
        inputProps={{
          style: {
            textAlign: "center",
            textOverflow: "ellipsis",
          },
        }}
        inputRef={wrapInputRef}
        autoComplete="off"
      />
      <Button
        disabled={token.address === "" || token.is_snip20}
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
          const toastId = toast.loading(
            `Wrapping ${token.name}`,
            {
              closeButton: true,
            }
          );
          try {
            const tx = await secretjs.tx.broadcast(
              [
                new MsgExecuteContract({
                  sender: secretAddress,
                  contractAddress: token.address,
                  codeHash: token.code_hash,
                  sentFunds: [
                    { denom: token.withdrawals[0].from_denom, amount },
                  ],
                  msg: { deposit: {} },
                }),
              ],
              {
                gasLimit: 150_000,
                gasPriceInFeeDenom: 0.25,
                feeDenom: "uscrt",
              }
            );

            if (tx.code === 0) {
              wrapInputRef.current.value = "";
              toast.update(toastId, {
                render: `Wrapped ${token.name} successfully`,
                type: "success",
                isLoading: false,
                closeOnClick: true,
              });
              console.log(`Wrapped successfully`);
            } else {
              toast.update(toastId, {
                render: `Wrapping of ${token.name} failed: ${tx.rawLog}`,
                type: "error",
                isLoading: false,
                closeOnClick: true,
              });
              console.error(`Tx failed: ${tx.rawLog}`);
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
        Wrap
      </Button>
    </div>
  );

  return (
    <>
      <div
        style={{
          display: "flex",
          placeItems: "center",
          gap: "0.8rem",
          padding: "0.4rem",
          borderRadius: 20,
        }}
      >
        <span style={{ flex: 1 }}></span>
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
            width: 150,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              placeItems: "flex-start",
            }}
          >
            <div
              style={{
                display: "flex",
                placeContent: "space-between",
                placeItems: "center",
                minWidth: "5.6em",
              }}
            >
              <span>{token.name}</span>
              <When condition={token.address && secretAddress}>
                <>
                  <Tooltip title={`IBC Deposit & Withdraw`} placement="top">
                    <Button
                      style={{
                        minWidth: 0,
                        padding: 0,
                        marginBottom: "0.2em",
                        color: "black",
                        opacity: 0.8,
                      }}
                      onClick={async () => setIsDepositWithdrawDialogOpen(true)}
                    >
                      <CompareArrowsIcon sx={{ height: "0.8em" }} />
                    </Button>
                  </Tooltip>
                  <DepositWithdrawDialog
                    token={token}
                    balances={balances}
                    secretAddress={secretAddress}
                    secretjs={secretjs}
                    isOpen={isDepositWithdrawDialogOpen}
                    setIsOpen={setIsDepositWithdrawDialogOpen}
                  />
                </>
              </When>
            </div>
            <span style={{ fontSize: "0.75rem" }}>{balanceIbcCoin}</span>
          </div>
        </div>
        <Breakpoint medium up>
          {inputRow}
        </Breakpoint>
        <div
          style={{
            display: "flex",
            width: 150,
            placeContent: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              placeItems: "flex-end",
            }}
          >
            <span>
              {!token.is_snip20 ? "s" : ""}
              {token.name}
            </span>
            <div
              style={{
                fontSize: "0.75rem",
                display: "flex",
                placeItems: "flex-start",
                gap: "0.2em",
              }}
            >
              <span>{balanceToken}</span>
              <When condition={token.address && secretAddress}>
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
              </When>
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
        <span style={{ flex: 1 }}></span>
      </div>
      <Breakpoint small down>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "10px 0 60px 0",
          }}
        >
          {inputRow}
        </div>
      </Breakpoint>
    </>
  );
}

const usdString = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

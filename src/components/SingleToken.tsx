import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
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
import { sleep, viewingKeyErrorString ,faucetAddress} from "../config/commons";
import { Token } from "config/config";
import { getKeplrViewingKey, setKeplrViewingKey } from "components/Keplr";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const usdString = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function SingleTokenNative({
  secretjs,
  secretAddress,
  token,
  balances,
  loadingCoinBalances,
  price,
}: {
  secretjs: SecretNetworkClient | null;
  secretAddress: string;
  loadingCoinBalances: boolean;
  token: Token;
  balances: Map<string, string>;
  price: number;
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
  let balanceCoin;
  let balanceToken;

  if (token.address) {
    if (loadingCoinBalances) {
      balanceCoin = (
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
      balanceCoin = (
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
      balanceCoin = (
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
    balanceCoin = (
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

  return (
    <>
    <div
      style={{
        display: "flex",
        placeItems: "center",
        gap: "0.8rem",
        borderRadius: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          width: 150,
          height: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            placeItems: "flex-start",
          }}
        >
          <span style={{ fontSize: "0.75rem" }}>{balanceCoin}</span>
        </div>
      </div>
      <span style={{ flex: 1 }}></span>
    </div>
  </>
);
}

export function SingleTokenWrapped({
  secretjs,
  secretAddress,
  token,
  balances,
  loadingCoinBalances,
  price,
}: {
  secretjs: SecretNetworkClient | null;
  secretAddress: string;
  loadingCoinBalances: boolean;
  token: Token;
  balances: Map<string, string>;
  price: number;
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
  let balanceCoin;
  let balanceToken;

  if (token.address) {
    if (loadingCoinBalances) {
      balanceCoin = (
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
      balanceCoin = (
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
      balanceCoin = (
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
    balanceCoin = (
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

  return (
    <>
      <div
        style={{
          display: "flex",
          placeItems: "center",
          gap: "0.8rem",
          borderRadius: 20,
        }}>
        <div
          style={{
            display: "flex",
            width: 150,
            height: 20,
            placeContent: "flex-start",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              placeItems: "flex-end",
            }}
          >
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
        <span style={{ flex: 1 }}></span>
      </div>
    </>
  );
}
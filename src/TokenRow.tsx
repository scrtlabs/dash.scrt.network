import {
  CircularProgress,
  Avatar,
  Button,
  Tooltip,
  Input,
} from "@mui/material";
import BigNumber from "bignumber.js";
import React, { useRef, useState, useEffect } from "react";
import { isMobile } from "react-device-detect";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import RefreshIcon from "@mui/icons-material/Refresh";
import { SigningCosmWasmClient } from "secretjs";
import { getKeplrViewingKey, setKeplrViewingKey } from "./KeplrStuff";
import { Token } from "./config";
import { viewingKeyErroString, sleep, gasToFee } from "./commons";
import DepositWithdrawDialog from "./DepositWithdrawDialog";
import { Else, If, Then, When } from "react-if";
import { Breakpoint } from "react-socks";

export default function TokenRow({
  secretjs,
  secretAddress,
  token,
  balances,
  loadingCoinBalances,
  price,
}: {
  secretjs: SigningCosmWasmClient | null;
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
    } else if (balances.get(denomOnSecret)) {
      balanceIbcCoin = (
        <div>
          <div
            style={{ cursor: "pointer" }}
            onClick={() => {
              wrapInputRef.current.value = new BigNumber(
                balances.get(denomOnSecret)!
              )
                .dividedBy(`1e${token.decimals}`)
                .toFixed();
            }}
          >
            {`Balance: ${new BigNumber(balances.get(denomOnSecret)!)
              .dividedBy(`1e${token.decimals}`)
              .toFormat()}`}
          </div>
          <div style={{ display: "flex", opacity: 0.7 }}>
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
    } else if (tokenBalance == viewingKeyErroString) {
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
              {`Balance: ${viewingKeyErroString}`}
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
    <div
      key={token.name}
      style={{
        display: "flex",
        placeItems: "center",
        gap: "0.8rem",
        padding: "0.4rem",
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
            <When condition={token.address}>
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
                  isOpen={isDepositWithdrawDialogOpen}
                  setIsOpen={setIsDepositWithdrawDialogOpen}
                />
              </>
            </When>
          </div>
          <span style={{ fontSize: "0.75rem" }}>{balanceIbcCoin}</span>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          placeItems: "center",
          gap: "0.3rem",
        }}
      >
        <Button
          disabled={token.address === ""}
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

            try {
              const { transactionHash } = await secretjs.execute(
                token.address,
                {
                  redeem: {
                    amount,
                    denom:
                      token.name === "SCRT"
                        ? undefined
                        : token.withdrawals[0].from_denom,
                  },
                },
                "",
                [],
                gasToFee(40_000),
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
          <Breakpoint medium up>
            Unwrap
          </Breakpoint>
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
                [{ denom: token.withdrawals[0].from_denom, amount }],
                gasToFee(40_000),
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
          <Breakpoint medium up>
            Wrap
          </Breakpoint>
        </Button>
      </div>
      <div
        style={{
          display: "flex",
          width: isMobile ? undefined : 150,
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
          <span>s{token.name}</span>
          <div
            style={{
              fontSize: "0.75rem",
              display: "flex",
              placeItems: "flex-start",
              gap: "0.2em",
            }}
          >
            <span>{balanceToken}</span>
            <When condition={token.address}>
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
    </div>
  );
}

const usdString = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

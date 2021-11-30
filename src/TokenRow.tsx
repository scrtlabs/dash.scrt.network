import {
  CircularProgress,
  Avatar,
  Button,
  Tooltip,
  Dialog,
  Input,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import BigNumber from "bignumber.js";
import React, { useRef, useState, useEffect } from "react";
import { isMobile } from "react-device-detect";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import RefreshIcon from "@mui/icons-material/Refresh";
import { SigningCosmWasmClient } from "secretjs";
import { getKeplrViewingKey, setKeplrViewingKey } from "./KeplrStuff";
import { Token } from "./config";
import { TabContext, TabPanel } from "@mui/lab";
import { viewingKeyErroString, sleep, getFeeFromGas } from "./commons";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";

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
  const [selectedTab, setSelectedTab] = useState<string>("deposit");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [loadingWrap, setLoadingWrap] = useState<boolean>(false);
  const [loadingUnwrap, setLoadingUnwrap] = useState<boolean>(false);
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

  const denomOnSecret = token.withdrawals[0]?.from_denom;
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
                    onClick={async () => setIsDialogOpen(true)}
                  >
                    <img src="/deposit.svg" style={{ height: "0.8em" }} />
                  </Button>
                </Tooltip>
                <Dialog
                  open={isDialogOpen}
                  fullWidth={true}
                  onClose={() => setIsDialogOpen(false)}
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
                      <Deposit
                        token={token}
                        secretAddress={secretAddress}
                        onSuccess={(txhash) => {
                          setIsDialogOpen(false);
                          console.log("success", txhash);
                        }}
                        onFailure={(error) => console.error(error)}
                      />
                    </TabPanel>
                    <TabPanel value={"withdraw"}>
                      <Withdraw
                        token={token}
                        secretAddress={secretAddress}
                        balances={balances}
                        onSuccess={(txhash) => {
                          setIsDialogOpen(false);
                          console.log("success", txhash);
                        }}
                        onFailure={(error) => console.error(error)}
                      />
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
                        : token.withdrawals[0].from_denom,
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
                [{ denom: token.withdrawals[0].from_denom, amount }],
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

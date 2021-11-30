import {
  CircularProgress,
  Avatar,
  Button,
  Typography,
  InputAdornment,
  Input,
  FormControl,
  InputLabel,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import BigNumber from "bignumber.js";
import React, { useRef, useState, useEffect } from "react";
import { SigningStargateClient } from "@cosmjs/stargate";
import { Token, chains } from "./config";
import CopyableAddress from "./CopyableAddress";
import { getFeeFromGas, sleep } from "./commons";

export default function Withdraw({
  token,
  secretAddress,
  balances,
  onSuccess,
  onFailure,
}: {
  token: Token;
  secretAddress: string;
  balances: Map<string, string>;
  onSuccess: (txhash: string) => any;
  onFailure: (error: any) => any;
}) {
  const [targetAddress, setTargetAddress] = useState<string>("");
  const [loadingTx, setLoading] = useState<boolean>(false);
  const [secretCosmJs, setSecretCosmJs] =
    useState<SigningStargateClient | null>(null);
  const inputRef = useRef<any>();
  const maxButtonRef = useRef<any>();

  const availableBalance = balances.get(token.withdrawals[0].from_denom) || "";

  useEffect(() => {
    (async () => {
      while (!window.keplr || !window.getOfflineSignerOnlyAmino) {
        await sleep(100);
      }

      // Find address on target chain
      const { chain_id: targetChainId } =
        chains[token.withdrawals[0].target_chain_name];
      await window.keplr.enable(targetChainId);
      const targetOfflineSigner =
        window.getOfflineSignerOnlyAmino(targetChainId);
      const targetFromAccounts = await targetOfflineSigner.getAccounts();
      setTargetAddress(targetFromAccounts[0].address);

      // Initialize cosmjs on Secret Network, because it has sendIbcTokens()
      const { chain_id, rpc, bech32_prefix } = chains["Secret Network"];
      await window.keplr.enable(chain_id);
      const secretOfflineSigner = window.getOfflineSignerOnlyAmino(chain_id);
      const cosmjs = await SigningStargateClient.connectWithSigner(
        rpc,
        secretOfflineSigner,
        { prefix: bech32_prefix }
      );
      setSecretCosmJs(cosmjs);
    })();
  }, []);

  return (
    <>
      <div style={{ padding: "1.5em" }}>
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
            <strong>{token.withdrawals[0].target_chain_name}</strong>
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
          <Typography sx={{ fontWeight: "bold" }}>From:</Typography>
          <CopyableAddress address={secretAddress} />
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
          <CopyableAddress address={targetAddress} />
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
          <Typography sx={{ fontSize: "0.8em", fontWeight: "bold" }}>
            Available Balance:
          </Typography>
          <Typography
            sx={{
              fontSize: "0.8em",
              opacity: 0.8,
              cursor: "pointer",
            }}
            onClick={() => {
              maxButtonRef.current.click();
            }}
          >
            {(() => {
              if (availableBalance === "") {
                return <CircularProgress size="0.6em" />;
              }

              const prettyBalance = new BigNumber(availableBalance)
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
            inputRef={inputRef}
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
                  ref={maxButtonRef}
                  style={{
                    padding: "0.1em 0.5em",
                    minWidth: 0,
                  }}
                  onClick={() => {
                    if (availableBalance === "") {
                      return;
                    }

                    const prettyBalance = new BigNumber(availableBalance)
                      .dividedBy(`1e${token.decimals}`)
                      .toFormat();

                    if (prettyBalance === "NaN") {
                      return;
                    }

                    inputRef.current.value = prettyBalance;
                  }}
                >
                  MAX
                </Button>
              </InputAdornment>
            }
          />
        </FormControl>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "0.4em",
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
          loading={loadingTx}
          onClick={async () => {
            if (!secretCosmJs) {
              console.error("No cosmjs");
              return;
            }

            if (!inputRef?.current?.value) {
              console.error("Empty withdraw");
              return;
            }

            const normalizedAmount = (inputRef.current.value as string).replace(
              /,/g,
              ""
            );

            if (!(Number(normalizedAmount) > 0)) {
              console.error(`${normalizedAmount} not bigger than 0`);
              return;
            }

            setLoading(true);

            const amount = new BigNumber(normalizedAmount)
              .multipliedBy(`1e${token.decimals}`)
              .toFixed(0, BigNumber.ROUND_DOWN);

            const { withdraw_channel_id, withdraw_gas } =
              chains[token.withdrawals[0].target_chain_name];
            try {
              const { transactionHash } = await secretCosmJs.sendIbcTokens(
                secretAddress,
                targetAddress,
                {
                  amount,
                  denom: token.withdrawals[0].from_denom,
                },
                "transfer",
                withdraw_channel_id,
                undefined,
                Math.floor(Date.now() / 1000) + 15 * 60, // 15 minute timeout
                getFeeFromGas(withdraw_gas)
              );
              inputRef.current.value = "";
              onSuccess(transactionHash);
            } catch (e) {
              onFailure(e);
            } finally {
              setLoading(false);
            }
          }}
        >
          Withdraw
        </LoadingButton>
      </div>
    </>
  );
}

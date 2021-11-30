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
import { Bech32Address } from "@keplr-wallet/cosmos";
import { SigningStargateClient } from "@cosmjs/stargate";
import { Token, chains } from "./config";
import CopyableAddress from "./CopyableAddress";
import { getFeeFromGas, sleep } from "./commons";
import { Keplr } from "@keplr-wallet/types";

export default function Deposit({
  token,
  secretAddress,
  onSuccess,
  onFailure,
}: {
  token: Token;
  secretAddress: string;
  onSuccess: (txhash: string) => any;
  onFailure: (error: any) => any;
}) {
  const [sourceAddress, setSourceAddress] = useState<string>("");
  const [availableBalance, setAvailableBalance] = useState<string>("");
  const [loadingTx, setLoading] = useState<boolean>(false);
  const [sourceCosmJs, setSourceCosmJs] =
    useState<SigningStargateClient | null>(null);
  const inputRef = useRef<any>();
  const maxButtonRef = useRef<any>();

  const fetchSourceBalance = async (sourceAddress: string) => {
    const url = `${
      chains[token.deposit[0].soure_chain_name].lcd
    }/bank/balances/${sourceAddress}`;
    try {
      const response = await fetch(url);
      const result: {
        height: string;
        result: Array<{ denom: string; amount: string }>;
      } = await response.json();

      const balance =
        result.result.find((c) => c.denom === token.deposit[0].from_denom)
          ?.amount || "0";

      setAvailableBalance(balance);
    } catch (e) {
      console.error(`Error while trying to query ${url}:`, e);
      setAvailableBalance("Error");
    }
  };

  useEffect(() => {
    if (!sourceAddress) {
      return;
    }

    fetchSourceBalance(sourceAddress);
    const interval = setInterval(() => fetchSourceBalance(sourceAddress), 5000);

    return () => clearInterval(interval);
  }, [sourceAddress]);

  useEffect(() => {
    (async () => {
      while (!window.keplr || !window.getOfflineSignerOnlyAmino) {
        await sleep(100);
      }

      if (["LUNA", "UST"].includes(token.name.toUpperCase())) {
        suggestTerraToKeplr(window.keplr);
      }
      // Initialize cosmjs on the target chain, because it has sendIbcTokens()
      const { chain_id, rpc, bech32_prefix } =
        chains[token.deposit[0].soure_chain_name];
      await window.keplr.enable(chain_id);
      const sourceOfflineSigner = window.getOfflineSignerOnlyAmino(chain_id);
      const depositFromAccounts = await sourceOfflineSigner.getAccounts();
      setSourceAddress(depositFromAccounts[0].address);
      const cosmjs = await SigningStargateClient.connectWithSigner(
        rpc,
        sourceOfflineSigner,
        { prefix: bech32_prefix }
      );
      setSourceCosmJs(cosmjs);
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
            Deposit <strong>{token.name}</strong> from{" "}
            <strong>{token.withdrawals[0].target_chain_name}</strong> to{" "}
            <strong>Secret Network</strong>
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
          <CopyableAddress address={sourceAddress} />
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
          <CopyableAddress address={secretAddress} />
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
          <InputLabel htmlFor="Amount to Deposit">Amount to Deposit</InputLabel>
          <Input
            autoFocus
            id="Amount to Deposit"
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
          loading={loadingTx}
          onClick={async () => {
            if (!sourceCosmJs) {
              console.error("No cosmjs");
              return;
            }

            if (!inputRef?.current?.value) {
              console.error("Empty deposit");
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

            const { deposit_channel_id, deposit_gas } =
              chains[token.deposit[0].soure_chain_name];
            try {
              const { transactionHash } = await sourceCosmJs.sendIbcTokens(
                sourceAddress,
                secretAddress,
                {
                  amount,
                  denom: token.deposit[0].from_denom,
                },
                "transfer",
                deposit_channel_id,
                undefined,
                Math.floor(Date.now() / 1000) + 15 * 60, // 15 minute timeout
                getFeeFromGas(deposit_gas)
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
          Deposit
        </LoadingButton>
      </div>
    </>
  );
}

function suggestTerraToKeplr(keplr: Keplr) {
  keplr.experimentalSuggestChain({
    rpc: "https://rpc-columbus.keplr.app",
    rest: "https://lcd-columbus.keplr.app",
    chainId: "columbus-5",
    chainName: "Terra",
    stakeCurrency: {
      coinDenom: "LUNA",
      coinMinimalDenom: "uluna",
      coinDecimals: 6,
      coinGeckoId: "terra-luna",
    },
    bip44: {
      coinType: 330,
    },
    bech32Config: Bech32Address.defaultBech32Config("terra"),
    currencies: [
      {
        coinDenom: "LUNA",
        coinMinimalDenom: "uluna",
        coinDecimals: 6,
        coinGeckoId: "terra-luna",
      },
      {
        coinDenom: "UST",
        coinMinimalDenom: "uusd",
        coinDecimals: 6,
        coinGeckoId: "terrausd",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "LUNA",
        coinMinimalDenom: "uluna",
        coinDecimals: 6,
        coinGeckoId: "terra-luna",
      },
      {
        coinDenom: "UST",
        coinMinimalDenom: "uusd",
        coinDecimals: 6,
        coinGeckoId: "terrausd",
      },
    ],
    gasPriceStep: {
      low: 0.015,
      average: 0.015,
      high: 0.015,
    },
    features: ["stargate", "ibc-transfer", "no-legacy-stdTx"],
  });
}

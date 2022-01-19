import {
  CircularProgress,
  Avatar,
  Button,
  Typography,
  InputAdornment,
  Input,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import BigNumber from "bignumber.js";
import React, { useRef, useState, useEffect } from "react";
import { SigningStargateClient } from "@cosmjs/stargate";
import { Token, chains } from "./config";
import CopyableAddress from "./CopyableAddress";
import { gasToFee, sleep, suggestTerraToKeplr } from "./commons";
import { If, Then, Else, When } from "react-if";

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
  const [selectedChainIndex, setSelectedChainIndex] = useState<number>(0);
  const inputRef = useRef<any>();
  const maxButtonRef = useRef<any>();

  const sourceChain = chains["Secret Network"];
  const targetChain =
    chains[token.withdrawals[selectedChainIndex].target_chain_name];

  const availableBalance =
    balances.get(token.withdrawals[selectedChainIndex].from_denom) || "";

  useEffect(() => {
    (async () => {
      while (!window.keplr || !window.getOfflineSignerOnlyAmino) {
        await sleep(100);
      }

      // Find address on target chain
      const { chain_id: targetChainId } =
        chains[token.withdrawals[selectedChainIndex].target_chain_name];
      if (token.withdrawals[selectedChainIndex].target_chain_name === "Terra") {
        await suggestTerraToKeplr(window.keplr);
      }
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
  }, [selectedChainIndex]);

  return (
    <>
      <div style={{ padding: "1.5em" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5em",
          }}
        >
          <Typography>
            Withdraw <strong>{token.name}</strong> from{" "}
            <strong>Secret Network</strong> to
          </Typography>
          <If condition={token.withdrawals.length === 1}>
            <Then>
              <strong>
                {" "}
                {token.withdrawals[selectedChainIndex].target_chain_name}
              </strong>
            </Then>
            <Else>
              <FormControl>
                <Select
                  value={selectedChainIndex}
                  onChange={(e) =>
                    setSelectedChainIndex(Number(e.target.value))
                  }
                >
                  {token.withdrawals.map((chain, index) => (
                    <MenuItem value={index} key={index}>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5em",
                          alignItems: "center",
                        }}
                      >
                        <Avatar
                          src={chains[chain.target_chain_name].chain_image}
                          sx={{
                            marginLeft: "0.3em",
                            width: "1em",
                            height: "1em",
                            boxShadow: "rgba(0, 0, 0, 0.15) 0px 6px 10px",
                          }}
                        />
                        <strong>{chain.target_chain_name}</strong>
                      </div>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Else>
          </If>
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
          <CopyableAddress
            address={secretAddress}
            explorerPrefix={sourceChain.explorer_account}
          />
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
          <CopyableAddress
            address={targetAddress}
            explorerPrefix={targetChain.explorer_account}
          />
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
            Available to Withdraw:
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
              chains[token.withdrawals[selectedChainIndex].target_chain_name];
            try {
              const { transactionHash } = await secretCosmJs.sendIbcTokens(
                secretAddress,
                targetAddress,
                {
                  amount,
                  denom: token.withdrawals[selectedChainIndex].from_denom,
                },
                "transfer",
                withdraw_channel_id,
                undefined,
                Math.floor(Date.now() / 1000) + 15 * 60, // 15 minute timeout
                gasToFee(withdraw_gas)
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

import { SigningStargateClient } from "@cosmjs/stargate";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Avatar,
  Button,
  CircularProgress,
  FormControl,
  Input,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { createTxIBCMsgTransfer } from "@tharsis/transactions";
import BigNumber from "bignumber.js";
import Long from "long";
import React, { useEffect, useRef, useState } from "react";
import { Else, If, Then } from "react-if";
import {
  gasToFee,
  sleep,
  suggestTerraClassicToKeplr,
  suggestTerraToKeplr,
} from "./commons";
import { chains, Token } from "./config";
import CopyableAddress from "./CopyableAddress";

import { fromBase64, toBase64 } from "secretjs";
import { TxRaw } from "secretjs/dist/protobuf_stuff/cosmos/tx/v1beta1/tx";

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
  const [selectedChainIndex, setSelectedChainIndex] = useState<number>(0);
  const [fetchBalanceInterval, setFetchBalanceInterval] = useState<any>(null);
  const inputRef = useRef<any>();
  const maxButtonRef = useRef<any>();

  const sourceChain =
    chains[token.deposits[selectedChainIndex].source_chain_name];
  const targetChain = chains["Secret Network"];

  const fetchSourceBalance = async (sourceAddress: string) => {
    const url = `${
      chains[token.deposits[selectedChainIndex].source_chain_name].lcd
    }/bank/balances/${sourceAddress}`;
    try {
      const response = await fetch(url);
      const result: {
        height: string;
        result: Array<{ denom: string; amount: string }>;
      } = await response.json();

      const balance =
        result.result.find(
          (c) => c.denom === token.deposits[selectedChainIndex].from_denom
        )?.amount || "0";

      setAvailableBalance(balance);
    } catch (e) {
      console.error(`Error while trying to query ${url}:`, e);
      setAvailableBalance("Error");
    }
  };

  useEffect(() => {
    setAvailableBalance("");

    if (!sourceAddress) {
      return;
    }

    if (fetchBalanceInterval) {
      clearInterval(fetchBalanceInterval);
    }

    fetchSourceBalance(sourceAddress);
    const interval = setInterval(
      () => fetchSourceBalance(sourceAddress),
      10_000
    );
    setFetchBalanceInterval(interval);

    return () => clearInterval(interval);
  }, [sourceAddress]);

  useEffect(() => {
    (async () => {
      while (!window.keplr || !window.getOfflineSignerOnlyAmino) {
        await sleep(100);
      }

      if (["LUNC", "UST"].includes(token.name.toUpperCase())) {
        await suggestTerraClassicToKeplr(window.keplr);
      } else if ("LUNA" === token.name.toUpperCase()) {
        await suggestTerraToKeplr(window.keplr);
      }
      // Initialize cosmjs on the target chain, because it has sendIbcTokens()
      const { chain_id, rpc, bech32_prefix } =
        chains[token.deposits[selectedChainIndex].source_chain_name];
      await window.keplr.enable(chain_id);
      const sourceOfflineSigner = window.getOfflineSignerOnlyAmino(chain_id);
      const depositFromAccounts = await sourceOfflineSigner.getAccounts();
      setSourceAddress(depositFromAccounts[0].address);
      const cosmjs = await SigningStargateClient.connectWithSigner(
        rpc,
        sourceOfflineSigner,
        { prefix: bech32_prefix, broadcastPollIntervalMs: 10_000 }
      );
      setSourceCosmJs(cosmjs);
    })();
  }, [selectedChainIndex]);

  return (
    <>
      <div style={{ padding: "1.5em" }}>
        <div
          style={{
            display: "flex",
            placeItems: "center",
            gap: token.deposits.length === 1 ? "0.3em" : "0.5em",
          }}
        >
          <Typography>
            Deposit <strong>{token.name}</strong> from
          </Typography>
          <If condition={token.deposits.length === 1}>
            <Then>
              <Typography>
                <strong>
                  {token.deposits[selectedChainIndex].source_chain_name}
                </strong>
              </Typography>
            </Then>
            <Else>
              <FormControl>
                <Select
                  value={selectedChainIndex}
                  onChange={(e) =>
                    setSelectedChainIndex(Number(e.target.value))
                  }
                >
                  {token.deposits.map((chain, index) => (
                    <MenuItem value={index} key={index}>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5em",
                          placeItems: "center",
                        }}
                      >
                        <Avatar
                          src={chains[chain.source_chain_name].chain_image}
                          sx={{
                            marginLeft: "0.3em",
                            width: "1em",
                            height: "1em",
                            boxShadow: "rgba(0, 0, 0, 0.15) 0px 6px 10px",
                          }}
                        />
                        <strong>{chain.source_chain_name}</strong>
                      </div>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Else>
          </If>
          <Typography>
            to <strong>Secret Network</strong>
          </Typography>
        </div>
        <br />
        <div
          style={{
            display: "flex",
            placeContent: "space-between",
            placeItems: "center",
            gap: "1em",
          }}
        >
          <Typography sx={{ fontWeight: "bold" }}>From:</Typography>
          <CopyableAddress
            address={sourceAddress}
            explorerPrefix={sourceChain.explorer_account}
          />
        </div>
        <div
          style={{
            display: "flex",
            placeContent: "space-between",
            placeItems: "center",
            gap: "1em",
          }}
        >
          <Typography sx={{ fontWeight: "bold" }}>To:</Typography>
          <CopyableAddress
            address={secretAddress}
            explorerPrefix={targetChain.explorer_account}
          />
        </div>
        <br />
        <div
          style={{
            display: "flex",
            placeItems: "center",
            gap: "0.3em",
            marginBottom: "0.8em",
          }}
        >
          <Typography sx={{ fontSize: "0.8em", fontWeight: "bold" }}>
            Available to Deposit:
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
          placeContent: "center",
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
              chains[token.deposits[selectedChainIndex].source_chain_name];

            try {
              let transactionHash: string = "";

              if (
                token.deposits[selectedChainIndex].source_chain_name !== "Evmos"
              ) {
                const txResponse = await sourceCosmJs.sendIbcTokens(
                  sourceAddress,
                  secretAddress,
                  {
                    amount,
                    denom: token.deposits[selectedChainIndex].from_denom,
                  },
                  "transfer",
                  deposit_channel_id,
                  undefined,
                  Math.floor(Date.now() / 1000) + 10 * 60, // 10 minute timeout
                  gasToFee(deposit_gas)
                );
                transactionHash = txResponse.transactionHash;
              } else {
                // Get Evmos account data
                // cosmjs doesn't know how to deal with the Evmos account format
                const {
                  account: { base_account },
                }: {
                  account: {
                    "@type": "/ethermint.types.v1.EthAccount";
                    base_account: {
                      address: string;
                      pub_key: string;
                      account_number: string;
                      sequence: string;
                    };
                    code_hash: string;
                  };
                } = await (
                  await fetch(
                    `${chains["Evmos"].lcd}/cosmos/auth/v1beta1/accounts/${sourceAddress}`
                  )
                ).json();

                const evmosProtoSigner = window.getOfflineSigner!(
                  chains["Evmos"].chain_id
                );
                const [{ pubkey }] = await evmosProtoSigner.getAccounts();

                // Get block height on Secret (for the IBC timeout)
                const {
                  block: {
                    header: { height },
                  },
                }: {
                  block: {
                    header: {
                      height: string;
                    };
                  };
                } = await (
                  await fetch(
                    `${targetChain.lcd}/cosmos/base/tendermint/v1beta1/blocks/latest`
                  )
                ).json();

                // Create IBC MsgTransder tx on Evmos
                const tx = createTxIBCMsgTransfer(
                  {
                    chainId: 9001,
                    cosmosChainId: chains["Evmos"].chain_id,
                  },
                  {
                    accountAddress: sourceAddress,
                    sequence: Number(base_account.sequence),
                    accountNumber: Number(base_account.account_number),
                    pubkey: toBase64(pubkey),
                  },
                  {
                    gas: String(deposit_gas),
                    amount: "0", // filled in by Keplr
                    denom: "aevmos", // filled in by Keplr
                  },
                  "",
                  {
                    sourcePort: "transfer",
                    sourceChannel: deposit_channel_id,
                    amount,
                    denom: token.deposits[selectedChainIndex].from_denom,
                    receiver: secretAddress,
                    revisionNumber: Number(
                      targetChain.chain_id.split("-")[1] // see https://github.com/mccallofthewild/sif-ui-clone/blob/875978d4cd55de45970e1fba66a96238883bcdae/app/src/business/services/IBCService/utils.ts#L9-L24
                    ),
                    revisionHeight: Number(height) + 100, // 100 blocks is about 10 minutes
                    timeoutTimestamp: "0",
                  }
                );

                // Sign the Evmos tx
                const sig = await window?.keplr?.signDirect(
                  chains["Evmos"].chain_id,
                  sourceAddress,
                  {
                    bodyBytes: tx.signDirect.body.serializeBinary(),
                    authInfoBytes: tx.signDirect.authInfo.serializeBinary(),
                    chainId: chains["Evmos"].chain_id,
                    accountNumber: new Long(
                      Number(base_account.account_number)
                    ),
                  },
                  // @ts-expect-error the types are not updated on Keplr side
                  { isEthereum: true }
                );

                // Broadcast the tx to Evmos
                const txRaw = TxRaw.fromPartial({
                  bodyBytes: sig!.signed.bodyBytes,
                  authInfoBytes: sig!.signed.authInfoBytes,
                  signatures: [fromBase64(sig!.signature.signature)],
                });
                const txBytes = TxRaw.encode(txRaw).finish();

                const txResponse = await sourceCosmJs.broadcastTx(txBytes);
                transactionHash = txResponse.transactionHash;
              }

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

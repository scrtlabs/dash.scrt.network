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
import { sha256 } from "@noble/hashes/sha256";
import { createTxIBCMsgTransfer } from "@tharsis/transactions";
import { cosmos } from "@tharsis/proto/dist/proto/cosmos/tx/v1beta1/tx";
import BigNumber from "bignumber.js";
import Long from "long";
import React, { useEffect, useRef, useState } from "react";
import { Else, If, Then } from "react-if";
import {
  gasToFee,
  sleep,
  suggestInjectiveToKeplr,
  suggestTerraClassicToKeplr,
  suggestTerraToKeplr,
} from "./commons";
import { chains, Token } from "./config";
import CopyableAddress from "./CopyableAddress";

import { fromBase64, toBase64, toHex } from "secretjs";
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
      } else if ("INJ" === token.name.toUpperCase()) {
        await suggestInjectiveToKeplr(window.keplr);
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
                !["Evmos", "Injective"].includes(
                  token.deposits[selectedChainIndex].source_chain_name
                )
              ) {
                // Regular cosmos chain (not ethermint signing)
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
                  Math.floor(Date.now() / 1000) + 10 * 60, // 10 minute timeout (sec)
                  gasToFee(deposit_gas)
                );
                transactionHash = txResponse.transactionHash;
              } else {
                // Handle IBC transfers from Ethermint chains like Evmos & Injective

                const sourceChain =
                  chains[token.deposits[selectedChainIndex].source_chain_name];

                // Get Evmos/Injective account_number & sequence
                const {
                  account: {
                    base_account: {
                      account_number: accountNumber,
                      sequence: accountSequence,
                    },
                  },
                }: {
                  account: {
                    base_account: {
                      account_number: string;
                      sequence: string;
                    };
                  };
                } = await (
                  await fetch(
                    `${sourceChain.lcd}/cosmos/auth/v1beta1/accounts/${sourceAddress}`
                  )
                ).json();

                // Get account pubkey
                // Can't get it from the chain because an account without txs won't have its pubkey listed on-chain
                const evmosProtoSigner = window.getOfflineSigner!(
                  sourceChain.chain_id
                );
                const [{ pubkey }] = await evmosProtoSigner.getAccounts();

                // Create IBC MsgTransfer tx
                const tx = createTxIBCMsgTransfer(
                  {
                    chainId: 9001, // Evmos EIP155, this is ignored in Injective
                    cosmosChainId: sourceChain.chain_id,
                  },
                  {
                    accountAddress: sourceAddress,
                    accountNumber: Number(accountNumber),
                    sequence: Number(accountSequence),
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
                    revisionNumber: 0,
                    revisionHeight: 0,
                    timeoutTimestamp: `${
                      Math.floor(Date.now() / 1000) + 10 * 60
                    }000000000`, // 10 minute timeout (ns)
                  }
                );

                if (sourceChain.chain_name === "Injective") {
                  const signer_info =
                    tx.signDirect.authInfo.signer_infos[0].toObject();
                  signer_info.public_key!.type_url =
                    "/injective.crypto.v1beta1.ethsecp256k1.PubKey";

                  tx.signDirect.authInfo.signer_infos[0] =
                    cosmos.tx.v1beta1.SignerInfo.fromObject(signer_info);
                }

                // Sign the tx
                const sig = await window?.keplr?.signDirect(
                  sourceChain.chain_id,
                  sourceAddress,
                  {
                    bodyBytes: tx.signDirect.body.serializeBinary(),
                    authInfoBytes: tx.signDirect.authInfo.serializeBinary(),
                    chainId: sourceChain.chain_id,
                    accountNumber: new Long(Number(accountNumber)),
                  },
                  // @ts-expect-error the types are not updated on the Keplr types package
                  { isEthereum: true }
                );

                // Encode the Evmos tx to a TxRaw protobuf binary
                const txRaw = TxRaw.fromPartial({
                  bodyBytes: sig!.signed.bodyBytes,
                  authInfoBytes: sig!.signed.authInfoBytes,
                  signatures: [fromBase64(sig!.signature.signature)],
                });
                const txBytes = TxRaw.encode(txRaw).finish();

                // cosmjs can broadcast to Ethermint but cannot handle the response

                // Broadcast the tx to Evmos
                sourceCosmJs.broadcastTx(txBytes);
                transactionHash = toHex(sha256(txBytes));
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

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
import BigNumber from "bignumber.js";
import React, { useEffect, useRef, useState } from "react";
import { Else, If, Then } from "react-if";
import { useCurrentBreakpointName } from "react-socks";
import { toast } from "react-toastify";
import { SecretNetworkClient, toBase64, toUtf8, Tx } from "secretjs";
import {
  sleep,
  suggestCrescentToKeplr,
  suggestInjectiveToKeplr,
  suggestKujiraToKeplr,
  suggestTerraToKeplr,
} from "config/commons";
import { chains, Token } from "config/config";
import CopyableAddress from "./CopyableAddress";

export default function Withdraw({
  token,
  secretjs,
  secretAddress,
  balances,
  onSuccess,
  onFailure,
}: {
  token: Token;
  secretjs: SecretNetworkClient | null;
  secretAddress: string;
  balances: Map<string, string>;
  onSuccess: (txhash: string) => any;
  onFailure: (error: any) => any;
}) {
  const breakpoint = useCurrentBreakpointName();
  const [targetAddress, setTargetAddress] = useState<string>("");
  const [loadingTx, setLoading] = useState<boolean>(false);
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
      } else if (
        token.withdrawals[selectedChainIndex].target_chain_name === "Injective"
      ) {
        await suggestInjectiveToKeplr(window.keplr);
      } else if (
        token.withdrawals[selectedChainIndex].target_chain_name === "Crescent"
      ) {
        await suggestCrescentToKeplr(window.keplr);
      } else if (
        token.withdrawals[selectedChainIndex].target_chain_name === "Kujira"
      ) {
        await suggestKujiraToKeplr(window.keplr);
      }

      await window.keplr.enable(targetChainId);
      window.keplr.defaultOptions = {
        sign: {
            preferNoSetFee: false,
            disableBalanceCheck: true,
        },
      } 
      const targetOfflineSigner =
        window.getOfflineSignerOnlyAmino(targetChainId);
      const targetFromAccounts = await targetOfflineSigner.getAccounts();
      setTargetAddress(targetFromAccounts[0].address);
    })();
  }, [selectedChainIndex]);

  return (
    <>
      <div style={{ padding: "1.5em" }}>
        <div
          style={{
            display: "flex",
            placeItems: "center",
            gap: "0.5em",
            flexDirection:
              breakpoint === "small" || breakpoint === "xsmall"
                ? "column"
                : "row",
          }}
        >
          <Typography>
            Withdraw <strong>{token.name}</strong> from{" "}
            <strong>Secret Network</strong> to
          </Typography>
          <If condition={token.withdrawals.length === 1}>
            <Then>
              <Typography sx={{ marginLeft: "-0.2em" }}>
                <strong>
                  {token.withdrawals[selectedChainIndex].target_chain_name}
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
                  {token.withdrawals.map((chain, index) => (
                    <MenuItem value={index} key={index}>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5em",
                          placeItems: "center",
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
            placeContent: "space-between",
            placeItems: "center",
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
            placeContent: "space-between",
            placeItems: "center",
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
            placeItems: "center",
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
            id="Amount to Withdraw"
            fullWidth
            type="text"
            autoComplete="off"
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
      <button
          className="w-full py-3 px-3 bg-emerald-500/50 rounded border border-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 transition-colors font-semibold"
          onClick={async () => {
            if (!secretjs) {
              console.error("No secretjs");
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

            let {
              withdraw_channel_id,
              withdraw_gas,
              lcd: lcdDstChain,
            } = chains[token.withdrawals[selectedChainIndex].target_chain_name];

            withdraw_channel_id =
              token.withdrawals[selectedChainIndex].channel_id ||
              withdraw_channel_id;
            withdraw_gas =
              token.withdrawals[selectedChainIndex].gas || withdraw_gas;

            const toastId = toast.loading(
              `Sending ${normalizedAmount} ${token.name} from Secret to ${token.withdrawals[selectedChainIndex].target_chain_name}`,
              {
                closeButton: true,
              }
            );

            try {
              onSuccess("");

              let tx: Tx;

              if (token.is_snip20) {
                tx = await secretjs.tx.compute.executeContract(
                  {
                    contractAddress: token.address,
                    codeHash: token.code_hash,
                    sender: secretAddress,
                    msg: {
                      send: {
                        recipient:
                          "secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4", // cw20-ics20
                        recipient_code_hash:
                          "f85b413b547b9460162958bafd51113ac266dac96a84c33b9150f68f045f2641",
                        amount,
                        msg: toBase64(
                          toUtf8(
                            JSON.stringify({
                              channel: withdraw_channel_id,
                              remote_address: targetAddress,
                              timeout: 600, // 10 minute timeout
                            })
                          )
                        ),
                      },
                    },
                  },
                  {
                    gasLimit: withdraw_gas,
                    gasPriceInFeeDenom: 0.1,
                    feeDenom: "uscrt",
                  }
                );
              } else {
                tx = await secretjs.tx.ibc.transfer(
                  {
                    sender: secretAddress,
                    receiver: targetAddress,
                    sourceChannel: withdraw_channel_id,
                    sourcePort: "transfer",
                    token: {
                      amount,
                      denom: token.withdrawals[selectedChainIndex].from_denom,
                    },
                    timeoutTimestampSec: String(
                      Math.floor(Date.now() / 1000) + 10 * 60
                    ), // 10 minute timeout
                  },
                  {
                    gasLimit: withdraw_gas,
                    gasPriceInFeeDenom: 0.1,
                    feeDenom: "uscrt",
                  }
                );
              }

              if (tx.code === 0) {
                toast.update(toastId, {
                  render: `Receiving ${normalizedAmount} ${token.name} from Secret on ${token.withdrawals[selectedChainIndex].target_chain_name}`,
                });

                const packetSrcChannel = tx.arrayLog?.find(
                  (x) =>
                    x.type === "send_packet" && x.key === "packet_src_channel"
                )?.value!;
                const packetDstChannel = tx.arrayLog?.find(
                  (x) =>
                    x.type === "send_packet" && x.key === "packet_dst_channel"
                )?.value!;
                const packetSequence = tx.arrayLog?.find(
                  (x) => x.type === "send_packet" && x.key === "packet_sequence"
                )?.value!;

                // console.log(packetSrcChannel, packetDstChannel, packetSequence);

                // Try finding the recv_packet every 15 seconds for 10 minutes
                let tries = 40;
                while (tries > 0) {
                  const {
                    tx_responses,
                  }: {
                    tx_responses?: Array<{ code: number; txhash: string }>;
                  } = await (
                    await fetch(
                      `${lcdDstChain}/cosmos/tx/v1beta1/txs?events=recv_packet.packet_dst_channel%3D%27${packetDstChannel}%27&events=recv_packet.packet_sequence%3D%27${packetSequence}%27`
                    )
                  ).json();

                  if (tx_responses) {
                    const recvTx = tx_responses.find((x) => x.code === 0);

                    if (recvTx) {
                      // console.log(`Original tx: ${tx.transactionHash}`);
                      // console.log(
                      //   `IBC recv_packet on other chain tx: ${recvTx.txhash}`
                      // );

                      toast.update(toastId, {
                        render: `Received ${normalizedAmount} ${token.name} from Secret on ${token.withdrawals[selectedChainIndex].target_chain_name}`,
                        type: "success",
                        isLoading: false,
                        closeOnClick: true,
                      });

                      break;
                    }
                  }

                  tries -= 1;
                  await sleep(15000);
                }

                if (tries === 0) {
                  toast.update(toastId, {
                    render: `Timed out while waiting to receive ${normalizedAmount} ${token.name} from Secret on ${token.withdrawals[selectedChainIndex].target_chain_name}`,
                    type: "warning",
                    isLoading: false,
                  });
                }

                // Try finding the ack every 15 seconds for 10 minutes
                // tries = 40;
                // while (tries > 0) {
                //   const txs = await secretjs.query.txsQuery(
                //     `acknowledge_packet.packet_sequence = '${packetSequence}' AND acknowledge_packet.packet_src_channel = '${packetSrcChannel}'`
                //   );

                //   const ackTx = txs.find((x) => x.code === 0);

                //   if (ackTx) {
                //     console.log(`Original tx: ${tx.transactionHash}`);
                //     console.log(`IBC ack tx: ${ackTx.transactionHash}`);
                //     break;
                //   }

                //   tries -= 1;
                //   await sleep(15000);
                // }
              } else {
                toast.update(toastId, {
                  render: `Failed sending ${normalizedAmount} ${token.name} from Secret to ${token.withdrawals[selectedChainIndex].target_chain_name}: ${tx.rawLog}`,
                  type: "error",
                  isLoading: false,
                });
                onFailure(tx.rawLog);
              }
            } catch (e) {
              onFailure(e);
              toast.update(toastId, {
                render: `Failed sending ${normalizedAmount} ${
                  token.name
                } from Secret to ${
                  token.withdrawals[selectedChainIndex].target_chain_name
                }: ${JSON.stringify(e)}`,
                type: "error",
                isLoading: false,
              });
            } finally {
              setLoading(false);
            }
          }}
        >
        {loadingTx ? <CircularProgress size="0.8em"/> : "Withdraw"}
        </button>
      </div>
    </>
  );
}

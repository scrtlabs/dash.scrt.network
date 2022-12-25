import { SigningStargateClient } from "@cosmjs/stargate";
import {
  CircularProgress,
  createTheme,
} from "@mui/material";
import Select, { StylesConfig } from 'react-select';
import { sha256 } from "@noble/hashes/sha256";
import { createTxIBCMsgTransfer } from "@tharsis/transactions";
import { cosmos } from "@tharsis/proto/dist/proto/cosmos/tx/v1beta1/tx";
import BigNumber from "bignumber.js";
import Long from "long";
import React, { useEffect, useRef, useState, useContext, Component} from "react";
import { KeplrContext, FeeGrantContext } from "General/Layouts/defaultLayout";
import {
  gasToFee,
  sleep,
  suggestCrescentToKeplr,
  suggestInjectiveToKeplr,
  suggestKujiraToKeplr,
  suggestTerraToKeplr,
  faucetAddress, 
  usdString
} from "General/Utils/commons";
import { chains, Token, tokens, snips } from "General/Utils/config";
import CopyableAddress from "Ibc/components/CopyableAddress";
import { fromBase64, toBase64, toHex } from "secretjs";
import { TxRaw } from "secretjs/dist/protobuf/cosmos/tx/v1beta1/tx";
import { useCurrentBreakpointName } from "react-socks";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CopyToClipboard from "react-copy-to-clipboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCircleInfo, faPaste, faRightLeft } from "@fortawesome/free-solid-svg-icons";
import { InsertEmoticon } from "@mui/icons-material";
import { red } from "@mui/material/colors";

export default function Deposit({

}: {

}) {
  const breakpoint = useCurrentBreakpointName();
  const [sourceAddress, setSourceAddress] = useState<string>("");
  const [availableBalance, setAvailableBalance] = useState<string>("");
  const [loadingTx, setLoading] = useState<boolean>(false);
  const [sourceCosmJs, setSourceCosmJs] = useState<SigningStargateClient | null>(null);
  const [fetchBalanceInterval, setFetchBalanceInterval] = useState<any>(null);
  const [amountToTransfer, setAmountToTransfer] = useState<string>("");
  const {secretjs, secretAddress} = useContext(KeplrContext);

  const {useFeegrant, setUseFeegrant} = useContext(FeeGrantContext);

  const queryParams = new URLSearchParams(window.location.search);
  const tokenByQueryParam = queryParams.get("token"); // "scrt", "akash", etc.
  const chainByQueryParam = queryParams.get("chain"); // "scrt", "akash", etc.
  const [selectedToken, setSelectedToken] = useState<Token>(tokens.filter(token => token.name === 'SCRT')[0]);
  const sourcePreselection = selectedToken.deposits.filter(deposit => deposit.source_chain_name.toLowerCase() === chainByQueryParam?.toLowerCase())[0] ? chainByQueryParam?.toLowerCase() : "osmosis";
  const [selectedSource, setSelectedSource] = useState<any>(selectedToken.deposits.filter(deposit => deposit.source_chain_name.toLowerCase() === sourcePreselection)[0]);

  const tokenPreselection = tokens.filter(token => token.name === tokenByQueryParam?.toUpperCase())[0] ? tokenByQueryParam?.toUpperCase() : "INJ";

  enum IbcMode {
    Deposit,
    Withdrawal
  }

  const [ibcMode, setIbcMode] = useState<IbcMode>(IbcMode.Deposit);

  function toggleIbcMode() {
    if (ibcMode === IbcMode.Deposit) {
      setIbcMode(IbcMode.Withdrawal);
    } else {
      setIbcMode(IbcMode.Deposit);
    }
  }

  function handleInputChange(e: any) {
    setAmountToTransfer(e.target.value);
  }

  const message = (ibcMode === IbcMode.Deposit) ?
  `Deposit your SCRT via IBC transfer from ${selectedSource.source_chain_name} to Secret Network` :
  `Withdraw your SCRT via IBC transfer from Secret Network to ${selectedSource.source_chain_name}`




  class ChainSelect extends Component {
    render() {
      return <>
        <Select options={tokens.filter(token => token.name === 'SCRT')[0].deposits} value={selectedSource} onChange={setSelectedSource} isSearchable={false}
                formatOptionLabel={option => (
                  <div className="flex items-center">
                    <img src={chains[option.source_chain_name].chain_image} className="w-6 h-6 mr-2 rounded-full" />
                    <span className="font-semibold text-sm">{option.source_chain_name}</span>
                  </div>
                )} className="react-select-container" classNamePrefix="react-select" />
      </>
    }
}

  // handles [25% | 50% | 75% | Max] Button-Group
  function setAmountByPercentage(percentage: number) {
    if (availableBalance) {
      let availableAmount = Number(availableBalance) * (10**(-selectedToken.decimals));
      let potentialInput = new BigNumber(availableAmount * (percentage * 0.01)).toFormat();
      if (Number(potentialInput) == 0) {
        setAmountToTransfer("");
      } else {
        setAmountToTransfer(potentialInput);
      }
    }
  }

  const updateCoinBalance = async () => {
    if (secretjs && secretAddress) {
      try {
        const {
          balance: { amount },
        } = await secretjs.query.bank.balance(
          {
            address: secretAddress,
            denom: selectedToken.withdrawals[0]?.from_denom,
          },
        );
        setAvailableBalance(amount)
      } catch (e) {
        console.error(`Error while trying to query ${selectedToken.name}:`, e);
      }
    }
  }





  const sourceChain =
    chains[selectedSource.source_chain_name];
  const targetChain = chains["Secret Network"];

  const fetchSourceBalance = async (sourceAddress: string) => {
    const url = `${
      chains[selectedSource.source_chain_name].lcd
    }/cosmos/bank/v1beta1/balances/${sourceAddress}`;
    try {
      const {
        balances,
      }: {
        balances: Array<{ denom: string; amount: string }>;
      } = await (await fetch(url)).json();

      const balance =
        balances.find(
          (c) => c.denom === selectedSource.from_denom
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
      updateCoinBalance();
      if ("LUNA" === selectedToken.name.toUpperCase()) {
        await suggestTerraToKeplr(window.keplr);
      } else if ("INJ" === selectedToken.name.toUpperCase()) {
        await suggestInjectiveToKeplr(window.keplr);
      } else if ("CRE" === selectedToken.name.toUpperCase()) {
        await suggestCrescentToKeplr(window.keplr);
      } else if ("KUJI" === selectedToken.name.toUpperCase()) {
        await suggestKujiraToKeplr(window.keplr);
      }

      // Initialize cosmjs on the source chain, because it has sendIbcTokens()
      const { chain_id, rpc, bech32_prefix } =
        chains[selectedSource.source_chain_name];
      await window.keplr.enable(chain_id);
      window.keplr.defaultOptions = {
        sign: {
            preferNoSetFee: false,
            disableBalanceCheck: true,
        }
      }

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
  }, [selectedSource]);

  
  const [isCopied, setIsCopied] = useState<boolean>(false); 

  const [supportedTokens, setSupportedTokens] = useState<Token[]>([]);

  useEffect(() => {
    setSupportedTokens(tokens.filter(token => token.deposits.find(token => token.source_chain_name == sourceChain.chain_name)!));
    setSupportedTokens(supportedTokens.concat(snips.filter(token => token.deposits.find(token => token.source_chain_name == sourceChain.chain_name)!)));
    setSelectedToken(tokens.filter(token => token.name === 'SCRT')[0]);
  }, [sourceChain]);


  console.log(snips);

  
  return (
    <>
      {/* [From|To] Picker */}
      <div className="flex mb-8">
        {/* *** From *** */}
        <div className="flex-initial w-1/3">
          {/* circle */}
          <div className="w-full relative rounded-full overflow-hidden border-2 border-blue-500" style={{paddingTop: '100%'}}>
            <div className="img-wrapper absolute top-1/2 left-0 right-0 -translate-y-1/2 text-center">
              <div className="w-1/2 inline-block">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/60 blur-md rounded-full overflow-hidden"></div>
                  <img src={ibcMode === IbcMode.Deposit ? chains[selectedSource.source_chain_name].chain_image : "scrt.svg"} className="w-full relative inline-block rounded-full overflow-hiden" />
                </div>
              </div>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 text-center text-sm font-bold text-white" style={{bottom: '10%'}}>From</div>
          </div>
          {/* Chain Picker */}
          <div className="-mt-3 relative z-10 w-full">
          {/* {value} */}
          {ibcMode === IbcMode.Deposit && (<ChainSelect/>)}
            {ibcMode === IbcMode.Withdrawal && (
              <div style={{paddingTop: ".9rem", paddingBottom: ".9rem"}} className="flex items-center w-full text-sm font-semibold select-none bg-zinc-700 rounded text-zinc-200 focus:bg-zinc-700 disabled:hover:bg-zinc-800 border border-zinc-500">
                <div className="flex-1 px-3">
                  <span>Secret Network</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <div className="relative" style={{paddingTop: '100%'}}>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <button onClick={toggleIbcMode} className="bg-zinc-900 px-3 py-2 text-zinc-400 transition-colors rounded-full hover:text-white disabled:hover:text-zinc-400" disabled={!secretAddress}>
                <FontAwesomeIcon icon={faRightLeft} />
              </button>
            </div>
          </div>
        </div>
        {/* *** To *** */}
        <div className="flex-initial w-1/3">
          <div className="w-full relative rounded-full overflow-hidden border-2 border-violet-500" style={{paddingTop: '100%'}}>
            <div className="img-wrapper absolute top-1/2 left-0 right-0 -translate-y-1/2 text-center">
              <div className="w-1/2 inline-block">
                <div className="relative">
                  <div className="absolute inset-0 bg-violet-500/60 blur-md rounded-full overflow-hidden"></div>
                  <img src={ibcMode === IbcMode.Withdrawal ? chains[selectedSource.source_chain_name].chain_image : "scrt.svg"} className="w-full relative inline-block rounded-full overflow-hiden" />
                </div>
              </div>
            </div>
            <div className="absolute left-0 right-0 text-center text-sm font-bold text-white" style={{bottom: '10%'}}>To</div>
          </div>
          {/* Chain Picker */}
          <div className="-mt-3 relative z-10 w-full">
            {ibcMode === IbcMode.Withdrawal && (<ChainSelect/>)}
            {ibcMode === IbcMode.Deposit && (
              <div style={{paddingTop: ".9rem", paddingBottom: ".9rem"}} className="flex items-center w-full text-sm font-semibold select-none bg-zinc-700 rounded text-zinc-200 focus:bg-zinc-700 disabled:hover:bg-zinc-800 border border-zinc-500">
                <div className="flex-1 px-3">
                  <span>Secret Network</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700 space-y-6">
        <div className="flex">
          <div className="font-bold mr-4 w-10">From:</div>
          <div className="flex-1 truncate">
            {ibcMode === IbcMode.Deposit && (
              <a href={`${sourceChain.explorer_account}${sourceAddress}`} target="_blank">{sourceAddress}</a>
            )}
            {ibcMode === IbcMode.Withdrawal && (
              <a href={`${targetChain.explorer_account}${secretAddress}`} target="_blank">{secretAddress}</a>
            )}
          </div>
          <div className="flex-initial ml-4">
            <CopyToClipboard
              text={ibcMode === IbcMode.Deposit ? sourceAddress : secretAddress}
              onCopy={() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 3000);
              }}
            >
              <button className="text-zinc-700 hover:text-white active:text-zinc-500 transition-colors">
                <FontAwesomeIcon icon={faPaste}/>
              </button>
            </CopyToClipboard>
          </div>
        </div>

        <div className="flex">
          <div className="flex-initial font-bold mr-4 w-10">To:</div>
          <div className="flex-1 truncate">
            {ibcMode === IbcMode.Withdrawal && (
                <a href={`${sourceChain.explorer_account}${sourceAddress}`} target="_blank">{sourceAddress}</a>
              )}
              {ibcMode === IbcMode.Deposit && (
                <a href={`${targetChain.explorer_account}${secretAddress}`} target="_blank">{secretAddress}</a>
              )}
          </div>
          <div className="flex-initial ml-4">
            <CopyToClipboard
              text={ibcMode === IbcMode.Withdrawal ? sourceAddress : secretAddress}
              onCopy={() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 3000);
              }}
            >
              <button className="text-zinc-700 hover:text-white active:text-zinc-500 transition-colors">
                <FontAwesomeIcon icon={faPaste}/>
              </button>
            </CopyToClipboard>
          </div>
        </div>
      </div>
      <div className="flex mt-8">
        <Select options={supportedTokens} value={selectedToken} onChange={setSelectedToken} formatOptionLabel={token => (
                <div className="flex items-center">
                  <img src={token.image} className="w-6 h-6 mr-2 rounded-full" />
                  <span className="font-bold text-sm">
                    {token.name}
                  </span>
                </div>
              )}  className="react-select-wrap-container" classNamePrefix="react-select-wrap"/>
        <input type="text" value={amountToTransfer} onChange={handleInputChange} className={"focus:z-10 block flex-1 min-w-0 w-full bg-zinc-900 text-white p-4 rounded-r-lg disabled:placeholder-zinc-700 transition-colors" + (false ? "  border border-red-500" : "")} name="fromValue" id="fromValue" placeholder="0" disabled={!secretAddress}/>
      </div>

      {/* Balance | [25%|50%|75%|Max] */}
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 mt-3 mb-8">
        <div className="flex-1 text-xs">
          <span className="font-bold">Available: </span>
          <button onClick={() => {setAmountByPercentage(100)}}>
            {(() => {
              if (availableBalance === "") {return <CircularProgress size="0.6em" />;}
              const prettyBalance = new BigNumber(availableBalance).dividedBy(`1e${selectedToken.decimals}`).toFormat();
              if (prettyBalance === "NaN") {return "Error";}
              return `${prettyBalance} ${selectedToken.name}`;
            })()}
          </button>
        </div>
        <div className="sm:flex-initial text-xs">
          <div className="inline-flex rounded-full text-xs font-bold">
            <button onClick={() => setAmountByPercentage(25)} className="bg-zinc-900 px-2 py-1 rounded-l-lg transition-colors hover:bg-zinc-700 focus:bg-zinc-500 cursor-pointer disabled:text-zinc-500 disabled:hover:bg-zinc-900 disabled:cursor-default" disabled={!secretAddress}>25%</button>
            <button onClick={() => setAmountByPercentage(50)} className="bg-zinc-900 px-2 py-1 border-l border-zinc-700 transition-colors hover:bg-zinc-700 focus:bg-zinc-500 cursor-pointer disabled:text-zinc-500 disabled:hover:bg-zinc-900 disabled:cursor-default" disabled={!secretAddress}>50%</button>
            <button onClick={() => setAmountByPercentage(75)} className="bg-zinc-900 px-2 py-1 border-l border-zinc-700 transition-colors hover:bg-zinc-700 focus:bg-zinc-500 cursor-pointer disabled:text-zinc-500 disabled:hover:bg-zinc-900 disabled:cursor-default" disabled={!secretAddress}>75%</button>
            <button onClick={() => setAmountByPercentage(100)} className="bg-zinc-900 px-2 py-1 rounded-r-lg border-l border-zinc-700 transition-colors hover:bg-zinc-700 focus:bg-zinc-500 cursor-pointer disabled:text-zinc-500 disabled:hover:bg-zinc-900 disabled:cursor-default" disabled={!secretAddress}>MAX</button>
          </div>
        </div>
      </div>


      <div className="bg-zinc-900 p-4 mt-8 rounded-lg select-none flex items-center mb-8">
        <FontAwesomeIcon icon={faCircleInfo} className="flex-initial mr-4" />
        <div className="flex-1">
          {message}
        </div>
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
            if (ibcMode == IbcMode.Deposit) {
              if (!sourceCosmJs) {
                console.error("No cosmjs");
                return;
              }

              if (!amountToTransfer) {
                console.error("Empty deposit");
                return;
              }

              const normalizedAmount = (amountToTransfer as string).replace(
                /,/g,
                ""
              );

              if (!(Number(normalizedAmount) > 0)) {
                console.error(`${normalizedAmount} not bigger than 0`);
                return;
              }

              setLoading(true);

              const amount = new BigNumber(normalizedAmount)
                .multipliedBy(`1e${selectedToken.decimals}`)
                .toFixed(0, BigNumber.ROUND_DOWN);

              let {
                deposit_channel_id,
                deposit_gas,
                lcd: lcdSrcChain,
              } = chains[selectedSource.source_chain_name];

              deposit_channel_id =
                selectedSource.channel_id || deposit_channel_id;
              deposit_gas = selectedSource.gas || deposit_gas;

              const toastId = toast.loading(
                `Sending ${normalizedAmount} ${selectedToken.name} from ${selectedSource.source_chain_name} to Secret`,
                {
                  closeButton: true,
                }
              );

              try {
                let transactionHash: string = "";

                if (
                  !["Evmos", "Injective"].includes(
                    selectedSource.source_chain_name
                  )
                ) {
                  // Regular cosmos chain (not ethermint signing)
                  const txResponse = await sourceCosmJs.sendIbcTokens(
                    sourceAddress,
                    secretAddress,
                    {
                      amount,
                      denom: selectedSource.from_denom,
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

                  const sourceChain = chains[selectedSource.source_chain_name];

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
                  } = await(
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
                      denom: selectedSource.from_denom,
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

                // Try finding the send_packet every 5 seconds for 1 minute
                let tries = 12;
                while (tries > 0) {
                  const {
                    tx_response: sendTx,
                  }: {
                    tx_response?: {
                      code: number;
                      txhash: string;
                      raw_log: string;
                      logs: Array<{
                        msg_index: number;
                        events: Array<{
                          type: string;
                          attributes: Array<{
                            key: string;
                            value: string;
                          }>;
                        }>;
                      }>;
                    };
                  } = await(
                    await fetch(
                      `${lcdSrcChain}/cosmos/tx/v1beta1/txs/${transactionHash.toUpperCase()}`
                    )
                  ).json();

                  if (sendTx) {
                    if (sendTx.code !== 0) {
                      toast.update(toastId, {
                        render: `Failed sending ${normalizedAmount} ${selectedToken.name} from ${selectedSource.source_chain_name} to Secret: ${sendTx.raw_log}`,
                        type: "error",
                        isLoading: false,
                      });
                      return;
                    } else {
                      // console.log(`Original tx: ${sendTx.txhash}`);

                      toast.update(toastId, {
                        render: `Receiving ${normalizedAmount} ${selectedToken.name} from ${selectedSource.source_chain_name} on Secret`,
                      });

                      const packetSrcChannel = sendTx.logs[0].events
                        .find((e) => e.type === "send_packet")
                        ?.attributes.find((a) => a.key === "packet_src_channel")
                        ?.value!;
                      const packetDstChannel = sendTx.logs[0].events
                        .find((e) => e.type === "send_packet")
                        ?.attributes.find((a) => a.key === "packet_dst_channel")
                        ?.value!;
                      const packetSequence = sendTx.logs[0].events
                        .find((e) => e.type === "send_packet")
                        ?.attributes.find((a) => a.key === "packet_sequence")
                        ?.value!;

                      // console.log(
                      //   packetSrcChannel,
                      //   packetDstChannel,
                      //   packetSequence
                      // );

                      // Try finding the recv_packet every 15 seconds for 10 minutes
                      let tries = 40;
                      while (tries > 0) {
                        const {
                          tx_responses,
                        }: {
                          tx_responses?: Array<{
                            code: number;
                            txhash: string;
                          }>;
                        } = await(
                          await fetch(
                            `${chains["Secret Network"].lcd}/cosmos/tx/v1beta1/txs?events=recv_packet.packet_dst_channel%3D%27${packetDstChannel}%27&events=recv_packet.packet_sequence%3D%27${packetSequence}%27`
                          )
                        ).json();

                        if (tx_responses) {
                          const recvTx = tx_responses.find((x) => x.code === 0);

                          if (recvTx) {
                            // console.log(`Original tx: ${sendTx.txhash}`);
                            // console.log(
                            //   `IBC recv_packet on other chain tx: ${recvTx.txhash}`
                            // );

                            toast.update(toastId, {
                              render: `Received ${normalizedAmount} ${selectedToken.name} from ${selectedSource.source_chain_name} on Secret`,
                              type: "success",
                              isLoading: false,
                              closeOnClick: true,
                            });

                            return;
                          }
                        }

                        tries -= 1;
                        await sleep(15000);
                      }

                      if (tries === 0) {
                        toast.update(toastId, {
                          render: `Timed out while waiting to receive ${normalizedAmount} ${selectedToken.name} from ${selectedSource.source_chain_name} on ${selectedToken.withdrawals[selectedChainIndex].target_chain_name}`,
                          type: "warning",
                          isLoading: false,
                        });
                      }

                      break;
                    }
                  }

                  tries -= 1;
                  await sleep(15000);
                }
              } catch (e) {
                toast.update(toastId, {
                  render: `Failed sending ${normalizedAmount} ${
                    selectedToken.name
                  } from ${
                    selectedSource.source_chain_name
                  } to Secret: ${JSON.stringify(e)}`,
                  type: "error",
                  isLoading: false,
                });
              } finally {
                setLoading(false);
              }
            }
            if (ibcMode == IbcMode.Withdrawal) {
              if (!secretjs) {
                console.error("No secretjs");
                return;
              }
  
              if (!amountToTransfer) {
                console.error("Empty withdraw");
                return;
              }
  
              const normalizedAmount = (amountToTransfer as string).replace(
                /,/g,
                ""
              );
  
              if (!(Number(normalizedAmount) > 0)) {
                console.error(`${normalizedAmount} not bigger than 0`);
                return;
              }
  
              setLoading(true);
  
              const amount = new BigNumber(normalizedAmount)
                .multipliedBy(`1e${selectedToken.decimals}`)
                .toFixed(0, BigNumber.ROUND_DOWN);

              let {
                withdraw_channel_id,
                withdraw_gas,
                lcd: lcdDstChain,
              } = chains[selectedSource.source_chain_name];
  
              withdraw_channel_id = selectedSource.channel_id || withdraw_channel_id;
              withdraw_gas = selectedSource.gas || withdraw_gas;
  
              const toastId = toast.loading(
                `Sending ${normalizedAmount} ${selectedToken.name} from Secret to ${selectedSource.source_chain_name}`,
                {
                  closeButton: true,
                }
              );
  
              try {
  
                let tx: Tx;
  
                if (selectedToken.is_snip20) {
                  tx = await secretjs.tx.compute.executeContract(
                    {
                      contract_address: selectedToken.address,
                      code_hash: selectedToken.code_hash,
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
                                remote_address: sourceAddress,
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
                      feeGranter: useFeegrant ? faucetAddress : "",
                    }
                  );
                } else {
                  // console.log(selectedToken.withdrawals.filter(withdraw => withdraw.target_chain_name === selectedSource.source_chain_name)[0].from_denom)
                  tx = await secretjs.tx.ibc.transfer(
                    {
                      sender: secretAddress,
                      receiver: sourceAddress,
                      source_channel: withdraw_channel_id,
                      source_port: "transfer",
                      token: {
                        amount,
                        denom: selectedToken.withdrawals.filter(withdraw => withdraw.target_chain_name === selectedSource.source_chain_name)[0].from_denom,
                      },
                      timeoutTimestampSec: String(
                        Math.floor(Date.now() / 1000) + 10 * 60
                      ), // 10 minute timeout
                    },
                    {
                      gasLimit: withdraw_gas,
                      gasPriceInFeeDenom: 0.1,
                      feeDenom: "uscrt",
                      feeGranter: useFeegrant ? faucetAddress : "",
                    }
                  );
                }
  
                if (tx.code === 0) {
                  toast.update(toastId, {
                    render: `Receiving ${normalizedAmount} ${selectedToken.name} from Secret on ${selectedSource.source_chain_name}`,
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
                          render: `Received ${normalizedAmount} ${selectedToken.name} from Secret on ${token.withdrawals[selectedChainIndex].target_chain_name}`,
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
                } else {
                  toast.update(toastId, {
                    render: `Failed sending ${normalizedAmount} ${selectedToken.name} from Secret to ${selectedSource.source_chain_name}: ${tx.rawLog}`,
                    type: "error",
                    isLoading: false,
                  });
                }
              } catch (e) {
                toast.update(toastId, {
                  render: `Failed sending ${normalizedAmount} ${
                    selectedToken.name
                  } from Secret to ${
                    selectedSource.source_chain_name
                  }: ${JSON.stringify(e)}`,
                  type: "error",
                  isLoading: false,
                });
              } finally {
                setLoading(false);
              }
            }
          }}
        >
          {loadingTx ? <CircularProgress size="0.8em"/> : "Execute Transfer"}
        </button>
      </div>
    </>
  );
}
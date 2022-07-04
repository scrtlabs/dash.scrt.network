import { SecretNetworkClient, MsgTransfer } from "secretjs";
import { BigNumber } from "bignumber.js";
import { Token, Chain } from "../../../types";
import { getTokenBalance } from "../../Helpers/data";
import React from "react";
import { notification } from "../../../commons";

export async function withdrawTx(
  secretjs: SecretNetworkClient | null,
  inputRef: React.MutableRefObject<any>,
  targetChain: Chain,
  addressIBC: string,
  secretAddress: string,
  currentToken: Token,
  selectedChainIndex: number,
  loadingWithdrawal: boolean,
  setLoadingWithdrawal: React.Dispatch<React.SetStateAction<boolean>>,
  setTokenBalance: React.Dispatch<React.SetStateAction<string>>,
  setLoadingTokenBalance: React.Dispatch<React.SetStateAction<boolean>>
) {
  if (!secretjs) {
    notification(`Error no ${currentToken.name} client found.`, "error");
    return;
  }
  if (loadingWithdrawal) {
    notification("Waiting for prior Tx to finish.", "error");
    return;
  }

  if (inputRef?.current?.value === "") {
    notification("Amount field is empty.", "error");
    return;
  }
  const normalizedAmount = (inputRef.current.value as string).replace(/,/g, "");
  if (!(Number(normalizedAmount) > 0)) {
    notification(`Amount ${normalizedAmount} not bigger than 0`, "error");
    return;
  }
  setLoadingWithdrawal(true);

  const amount = new BigNumber(normalizedAmount)
    .multipliedBy(`1e${currentToken.decimals}`)
    .toFixed(0, BigNumber.ROUND_DOWN);
  const { withdraw_channel_id, withdraw_gas } = targetChain;

  try {
    const tx = await secretjs.tx.broadcast(
      [
        new MsgTransfer({
          sender: secretAddress,
          receiver: addressIBC,
          sourceChannel: withdraw_channel_id,
          sourcePort: "transfer",
          token: {
            amount,
            denom: currentToken.withdrawals[selectedChainIndex].from_denom,
          },
          timeoutTimestampSec: String(Math.floor(Date.now() / 1000) + 10 * 60), // 15 minute timeout
        }),
      ],
      {
        gasLimit: 50_000,
        gasPriceInFeeDenom: 0.0125,
        feeDenom: "uscrt",
        memo: "",
      }
    );
    if (tx.code === 0) {
      inputRef.current.value = "";

      getTokenBalance(
        currentToken,
        secretAddress,
        setTokenBalance,
        setLoadingTokenBalance
      );
      notification(`Succesfully withdrew ${currentToken.name}`, "success");
      return;
    } else {
      inputRef.current.value = "";
      getTokenBalance(
        currentToken,
        secretAddress,
        setTokenBalance,
        setLoadingTokenBalance
      );
      notification(`Succesfully withdrew ${currentToken.name}`, "success");
      return;
    }
  } catch (err) {
    notification(`Error withdrawing ${currentToken.name}`, "error");
    return;
  } finally {
    setLoadingWithdrawal(false);
  }
}

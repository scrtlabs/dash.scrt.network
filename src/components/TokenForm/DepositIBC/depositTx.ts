import { SigningStargateClient } from "@cosmjs/stargate";
import { BigNumber } from "bignumber.js";
import { Token, Chain } from "../../../types";
import { gasToFee } from "../../../commons";
import { getIBCBalance } from "../../Helpers/data";
import React from "react";
import { notification } from "../../../commons";

export async function depositTx(
  cosmjs: SigningStargateClient | null,
  inputRef: React.MutableRefObject<any>,
  targetChain: Chain,
  addressIBC: string,
  secretAddress: string,
  currentToken: Token,
  selectedChainIndex: number,
  loadingDeposit: boolean,
  setLoadingDeposit: React.Dispatch<React.SetStateAction<boolean>>,
  setBalanceIBC: React.Dispatch<React.SetStateAction<string>>,
  setLoadingBalanceIBC: React.Dispatch<React.SetStateAction<boolean>>
) {
  if (!cosmjs) {
    notification(`Error no ${currentToken.name} client found.`, "error");
    return;
  }
  if (loadingDeposit) {
    notification("Waiting for prior Tx to finish.", "error");
    return;
  }

  if (inputRef?.current?.value === "") {
    notification("Amount field is empty.", "error");
    return;
  }

  const normalizedAmount = (inputRef.current.value as string).replace(/,/g, "");
  if (!(Number(normalizedAmount) > 0)) {
    notification(`${normalizedAmount} not bigger than 0`, "error");
    return;
  }
  setLoadingDeposit(true);

  const amount = new BigNumber(normalizedAmount)
    .multipliedBy(`1e${currentToken.decimals}`)
    .toFixed(0, BigNumber.ROUND_DOWN);

  const { deposit_channel_id, deposit_gas } = targetChain;

  try {
    const tx: any = await cosmjs.sendIbcTokens(
      addressIBC,
      secretAddress,
      {
        amount,
        denom: currentToken.deposits[selectedChainIndex].from_denom,
      },
      "transfer",
      deposit_channel_id,
      undefined,
      Math.floor(Date.now() / 1000) + 10 * 60, // 10 minute timeout
      gasToFee(deposit_gas)
    );

    if (tx.code === 0) {
      inputRef.current.value = "";
      notification(`Succesfully deposited ${currentToken.name}`, "success");
      return;
    } else {
      notification(
        ` Failed to execute deposit Tx for ${currentToken.name}`,
        "error"
      );
    }
  } catch (err) {
    notification(`Error depositing ${currentToken.name}`, "error");
    return;
  } finally {
    getIBCBalance(
      addressIBC,
      currentToken,
      selectedChainIndex,
      setBalanceIBC,
      setLoadingBalanceIBC
    );
    setLoadingDeposit(false);
  }
}

import { MsgExecuteContract, SecretNetworkClient } from "secretjs";
import { Token } from "../../../types";
import { BigNumber } from "bignumber.js";
import { notification } from "../../../commons";

interface wrappedProps {
  secretjs: SecretNetworkClient;
  secretAddress: string;
  currentToken: Token;
  wrapInputRef: React.MutableRefObject<any>;
  loadingWrap: boolean;
  loadingUnwrap: boolean;
  setLoadingWrap: React.Dispatch<React.SetStateAction<boolean>>;
  setLoadingUnwrap: React.Dispatch<React.SetStateAction<boolean>>;
}

export async function wrap({
  secretjs,
  secretAddress,
  currentToken,
  wrapInputRef,
  loadingWrap,
  loadingUnwrap,
  setLoadingWrap,
}: wrappedProps) {
  if (!secretjs) {
    notification(`Error no ${currentToken.name} client found.`, "error");
    return;
  }
  if (loadingWrap || loadingUnwrap) {
    notification("Waiting for prior Tx to finish.", "error");
    return;
  }
  if (
    wrapInputRef?.current?.value === "" ||
    wrapInputRef?.current?.value === "0"
  ) {
    notification("Amount field is empty or 0.", "error");
    return;
  }

  setLoadingWrap(true);
  const baseAmount = new BigNumber(wrapInputRef?.current?.value);

  if (baseAmount.isNaN() || baseAmount.isNegative()) {
    setLoadingWrap(false);
    notification("Error with entered amount.", "error");
    return;
  }
  const amount = baseAmount
    .multipliedBy(`1e${currentToken.decimals}`)
    .toFixed(0, BigNumber.ROUND_DOWN);
  try {
    const tx = await secretjs.tx.broadcast(
      [
        new MsgExecuteContract({
          sender: secretAddress,
          contractAddress: currentToken.address,
          codeHash: currentToken.code_hash,
          sentFunds: [
            { denom: currentToken.withdrawals[0].from_denom, amount },
          ],
          msg: { deposit: {} },
        }),
      ],
      {
        gasLimit: 40_000,
        gasPriceInFeeDenom: 0.0125,
        feeDenom: "uscrt",
      }
    );
    if (tx.code === 0) {
      wrapInputRef.current.value = "";
      notification(`Succesfully wrapped ${currentToken.name}`, "success");
      return;
    }
  } catch (err) {
    notification(`Error wrapping ${currentToken.name}`, "error");
  } finally {
    setLoadingWrap(false);
  }
}

export async function unwrap({
  secretjs,
  secretAddress,
  currentToken,
  wrapInputRef,
  loadingWrap,
  loadingUnwrap,
  setLoadingUnwrap,
}: wrappedProps) {
  if (!secretjs) {
    notification(`Error no ${currentToken.name} client found.`, "error");
    return;
  }
  if (loadingWrap || loadingUnwrap) {
    notification("Waiting for prior Tx to finish.", "error");
    return;
  }

  if (wrapInputRef?.current?.value === "") {
    notification("Amount field is empty.", "error");
    return;
  }

  setLoadingUnwrap(true);
  const baseAmount = new BigNumber(wrapInputRef?.current?.value);

  if (baseAmount.isNaN() || baseAmount.isNegative()) {
    setLoadingUnwrap(false);
    notification("Error with entered amount.", "error");
    return;
  }
  const amount = baseAmount
    .multipliedBy(`1e${currentToken.decimals}`)
    .toFixed(0, BigNumber.ROUND_DOWN);
  try {
    const tx = await secretjs.tx.broadcast(
      [
        new MsgExecuteContract({
          sender: secretAddress,
          contractAddress: currentToken.address,
          codeHash: currentToken.code_hash,
          sentFunds: [],
          msg: {
            redeem: {
              amount,
              denom:
                currentToken.name === "SCRT"
                  ? undefined
                  : currentToken.withdrawals[0].from_denom,
            },
          },
        }),
      ],
      {
        gasLimit: 40_000,
        gasPriceInFeeDenom: 0.0125,
        feeDenom: "uscrt",
      }
    );
    if (tx.code === 0) {
      wrapInputRef.current.value = "";

      notification(`Succesfully unwrapped ${currentToken.name}`, "success");
      return;
    }
  } catch (err) {
    notification(`Error unwrapping ${currentToken.name}`, "error");
  } finally {
    setLoadingUnwrap(false);
  }
}

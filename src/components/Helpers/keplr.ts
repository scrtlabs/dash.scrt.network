import { SecretNetworkClient } from "secretjs";
import React from "react";
import { ChainList } from "../../config";
import { notification } from "../../commons";

export async function setKeplrViewingKey(
  token: string,
  setViewKeyError: React.Dispatch<React.SetStateAction<string>>
) {
  if (!window.keplr) {
    notification("Error: Keplr not found.", "error");
    return;
  }
  try {
    await window.keplr.suggestToken(
      ChainList["Secret Network"].chain_id,
      token
    );
    setViewKeyError("");
  } catch (err) {
    notification("Error adding Viewing Key to Keplr.", "error");
    setViewKeyError("Click to Set Viewing Key");
  } finally {
    return;
  }
}

export async function getKeplrViewingKey(
  token: string
): Promise<string | null> {
  if (!window.keplr) {
    notification("Error: Keplr not found.", "error");
    return null;
  }

  try {
    return await window.keplr.getSecret20ViewingKey(
      ChainList["Secret Network"].chain_id,
      token
    );
  } catch (err) {
    notification(
      "Error retrieving Viewing Key from Keplr. Set Viewing Key.",
      "error"
    );
    return null;
  }
}

export async function setupKeplr(
  setSecretjs: React.Dispatch<React.SetStateAction<SecretNetworkClient | null>>,
  setSecretAddress: React.Dispatch<React.SetStateAction<string>>
) {
  if (
    !window.keplr ||
    !window.getEnigmaUtils ||
    !window.getOfflineSignerOnlyAmino
  ) {
    notification("Error: Keplr not found.", "error");
    return;
  }

  try {
    await window.keplr.enable(ChainList["Secret Network"].chain_id);
    const keplrOfflineSigner = window.getOfflineSignerOnlyAmino(
      ChainList["Secret Network"].chain_id
    );
    const accounts = await keplrOfflineSigner.getAccounts();
    const secretAddress = accounts[0].address;
    const secretjs = await SecretNetworkClient.create({
      grpcWebUrl: ChainList["Secret Network"].rpc,
      chainId: ChainList["Secret Network"].chain_id,
      wallet: keplrOfflineSigner,
      walletAddress: secretAddress,
      encryptionUtils: window.getEnigmaUtils(
        ChainList["Secret Network"].chain_id
      ),
    });
    setSecretAddress(secretAddress);
    setSecretjs(secretjs);
    return;
  } catch (err) {
    notification("Error connecting to Keplr.", "error");
    return;
  }
}

import { FileCopyOutlined } from "@mui/icons-material";
import Button from "@mui/material/Button";
import React, { useState, useEffect } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { BroadcastMode, SigningCosmWasmClient } from "secretjs";

import { chains } from "./config";

const SECRET_CHAIN_ID = chains["Secret Network"].chain_id;
const SECRET_LCD = chains["Secret Network"].lcd;

export function KeplrPanel({
  secretjs,
  setSecretjs,
  secretAddress,
  setSecretAddress,
}: {
  secretjs: SigningCosmWasmClient | null;
  setSecretjs: React.Dispatch<
    React.SetStateAction<SigningCosmWasmClient | null>
  >;
  secretAddress: string;
  setSecretAddress: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    setupKeplr(setSecretjs, setSecretAddress);
  }, []);

  const content = (
    <div style={{ display: "flex", alignItems: "center", borderRadius: 10 }}>
      <img src="/keplr.svg" style={{ width: "1.8rem", borderRadius: 10 }} />
      <span style={{ margin: "0 0.3rem" }}>
        {secretjs ? secretAddress : "Connect wallet"}
      </span>
    </div>
  );

  if (secretjs) {
    return (
      <CopyToClipboard
        text={secretAddress}
        onCopy={() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 3000);
        }}
      >
        <Button
          variant="contained"
          style={{
            background: "white",
            textTransform: "none",
            color: "black",
          }}
        >
          {content}{" "}
          <FileCopyOutlined
            fontSize="small"
            style={isCopied ? { fill: "green" } : undefined}
          />
        </Button>
      </CopyToClipboard>
    );
  } else {
    return (
      <Button
        variant="contained"
        style={{ background: "white", color: "black" }}
        onClick={() => setupKeplr(setSecretjs, setSecretAddress)}
      >
        {content}
      </Button>
    );
  }
}

async function setupKeplr(
  setSecretjs: React.Dispatch<
    React.SetStateAction<SigningCosmWasmClient | null>
  >,
  setSecretAddress: React.Dispatch<React.SetStateAction<string>>
) {
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  while (!window.keplr || !window.getEnigmaUtils || !window.getOfflineSigner) {
    await sleep(50);
  }

  await window.keplr.enable(SECRET_CHAIN_ID);

  const keplrOfflineSigner = window.getOfflineSigner(SECRET_CHAIN_ID);
  const accounts = await keplrOfflineSigner.getAccounts();

  const secretAddress = accounts[0].address;

  const secretjs = new SigningCosmWasmClient(
    SECRET_LCD,
    secretAddress,
    //@ts-ignore
    keplrOfflineSigner,
    window.getEnigmaUtils(SECRET_CHAIN_ID),
    undefined,
    BroadcastMode.Sync
  );

  setSecretAddress(secretAddress);
  setSecretjs(secretjs);
}

export async function setKeplrViewingKey(token: string) {
  if (!window.keplr) {
    console.error("Keplr not present");
    return;
  }

  await window.keplr.suggestToken(SECRET_CHAIN_ID, token);
}

export async function getKeplrViewingKey(
  token: string
): Promise<string | null> {
  if (!window.keplr) {
    console.error("Keplr not present");
    return null;
  }

  try {
    return await window.keplr.getSecret20ViewingKey(SECRET_CHAIN_ID, token);
  } catch (e) {
    return null;
  }
}

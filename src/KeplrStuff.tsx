import { FileCopyOutlined } from "@mui/icons-material";
import Button from "@mui/material/Button";
import React, { useState, useEffect } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { BroadcastMode, SigningCosmWasmClient } from "secretjs";

export function KeplrPanel({
  secretjs,
  setSecretjs,
  myAddress,
  setMyAddress,
}: {
  secretjs: SigningCosmWasmClient | null;
  setSecretjs: React.Dispatch<
    React.SetStateAction<SigningCosmWasmClient | null>
  >;
  myAddress: string | null;
  setMyAddress: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    setupKeplr(setSecretjs, setMyAddress);
  }, []);

  const content = (
    <div style={{ display: "flex", alignItems: "center", borderRadius: 10 }}>
      <img src="/keplr.svg" style={{ width: "1.8rem", borderRadius: 10 }} />
      <span style={{ margin: "0 0.3rem" }}>
        {secretjs ? myAddress : "Connect wallet"}
      </span>
    </div>
  );

  if (secretjs) {
    return (
      <CopyToClipboard
        text={myAddress as string}
        onCopy={() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 3000);
        }}
      >
        <Button
          variant="contained"
          style={{ background: "white", textTransform: "none" }}
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
        style={{ background: "white" }}
        onClick={() => setupKeplr(setSecretjs, setMyAddress)}
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
  setMyAddress: React.Dispatch<React.SetStateAction<string | null>>
) {
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  while (!window.keplr || !window.getEnigmaUtils || !window.getOfflineSigner) {
    await sleep(50);
  }

  await window.keplr.enable(import.meta.env.VITE_CHAIN_ID);

  const keplrOfflineSigner = window.getOfflineSigner(
    import.meta.env.VITE_CHAIN_ID
  );
  const accounts = await keplrOfflineSigner.getAccounts();

  const myAddress = accounts[0].address;

  const secretjs = new SigningCosmWasmClient(
    import.meta.env.VITE_LCD_URL,
    myAddress,
    //@ts-ignore
    keplrOfflineSigner,
    window.getEnigmaUtils(import.meta.env.VITE_CHAIN_ID),
    null,
    BroadcastMode.Sync
  );

  setMyAddress(myAddress as string);
  setSecretjs(secretjs);
}

export async function setKeplrViewingKeys(
  tokensToSet: Array<{ token: string; viewingKey: string }>
) {
  if (!window.keplr) {
    console.error("Keplr not present");
    return;
  }

  for (const { token, viewingKey } of tokensToSet) {
    await window.keplr.suggestToken(
      import.meta.env.VITE_CHAIN_ID,
      token,
      viewingKey
    );
    console.log(`Viewing key ${viewingKey} saved for token ${token} in Keplr`);
  }
}

export async function getKeplrViewingKey(
  token: string
): Promise<string | null> {
  if (!window.keplr) {
    console.error("Keplr not present");
    return null;
  }

  try {
    return await window.keplr.getSecret20ViewingKey(
      import.meta.env.VITE_CHAIN_ID,
      token
    );
  } catch (e) {
    return null;
  }
}

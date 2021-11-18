import { FileCopyOutlined } from "@mui/icons-material";
import Button from "@mui/material/Button";
import React, { useState, useEffect } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { BroadcastMode, SigningCosmWasmClient } from "secretjs";
import { Bech32Address } from "@keplr-wallet/cosmos";

import tokens from "./config.json";

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
  myAddress: Map<string, string>;
  setMyAddress: React.Dispatch<React.SetStateAction<Map<string, string>>>;
}) {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    setupKeplr(setSecretjs, setMyAddress);
  }, []);

  const content = (
    <div style={{ display: "flex", alignItems: "center", borderRadius: 10 }}>
      <img src="/keplr.svg" style={{ width: "1.8rem", borderRadius: 10 }} />
      <span style={{ margin: "0 0.3rem" }}>
        {secretjs ? myAddress.get("secret") : "Connect wallet"}
      </span>
    </div>
  );

  if (secretjs) {
    return (
      <CopyToClipboard
        text={myAddress.get("secret") as string}
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
  setMyAddress: React.Dispatch<React.SetStateAction<Map<string, string>>>
) {
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  while (!window.keplr || !window.getEnigmaUtils || !window.getOfflineSigner) {
    await sleep(50);
  }

  await window.keplr.enable(import.meta.env.VITE_SECRET_CHAIN_ID);

  const keplrOfflineSigner = window.getOfflineSigner(
    import.meta.env.VITE_SECRET_CHAIN_ID
  );
  const accounts = await keplrOfflineSigner.getAccounts();

  const secretAddress = accounts[0].address;

  const secretjs = new SigningCosmWasmClient(
    import.meta.env.VITE_SECRET_LCD_URL,
    secretAddress,
    //@ts-ignore
    keplrOfflineSigner,
    window.getEnigmaUtils(import.meta.env.VITE_SECRET_CHAIN_ID),
    null,
    BroadcastMode.Sync
  );

  const myAddress = new Map<string, string>();

  myAddress.set("secret", secretAddress);

  window.keplr.experimentalSuggestChain({
    rpc: "https://rpc-columbus.keplr.app",
    rest: "https://lcd-columbus.keplr.app",
    chainId: "columbus-5",
    chainName: "Terra",
    stakeCurrency: {
      coinDenom: "LUNA",
      coinMinimalDenom: "uluna",
      coinDecimals: 6,
      coinGeckoId: "terra-luna",
      coinImageUrl: window.location.origin + "/public/assets/tokens/luna.png",
    },
    bip44: {
      coinType: 330,
    },
    bech32Config: Bech32Address.defaultBech32Config("terra"),
    currencies: [
      {
        coinDenom: "LUNA",
        coinMinimalDenom: "uluna",
        coinDecimals: 6,
        coinGeckoId: "terra-luna",
        coinImageUrl: window.location.origin + "/public/assets/tokens/luna.png",
      },
      {
        coinDenom: "UST",
        coinMinimalDenom: "uusd",
        coinDecimals: 6,
        coinGeckoId: "terrausd",
        coinImageUrl: window.location.origin + "/public/assets/tokens/ust.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "LUNA",
        coinMinimalDenom: "uluna",
        coinDecimals: 6,
        coinGeckoId: "terra-luna",
        coinImageUrl: window.location.origin + "/public/assets/tokens/luna.png",
      },
      {
        coinDenom: "UST",
        coinMinimalDenom: "uusd",
        coinDecimals: 6,
        coinGeckoId: "terrausd",
        coinImageUrl: window.location.origin + "/public/assets/tokens/ust.png",
      },
    ],
    gasPriceStep: {
      low: 0.015,
      average: 0.015,
      high: 0.015,
    },
    features: ["stargate", "ibc-transfer", "no-legacy-stdTx"],
    // explorerUrlToTx: "https://finder.terra.money/columbus-5/tx/{txHash}",
  });

  for (const { prefix, chain_id } of tokens) {
    const chainAccounts = await window.getOfflineSigner(chain_id).getAccounts();

    myAddress.set(prefix, chainAccounts[0].address);
  }

  setMyAddress(myAddress);
  setSecretjs(secretjs);
}

export async function setKeplrViewingKeys(token: string) {
  if (!window.keplr) {
    console.error("Keplr not present");
    return;
  }

  await window.keplr.suggestToken(import.meta.env.VITE_SECRET_CHAIN_ID, token);
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
      import.meta.env.VITE_SECRET_CHAIN_ID,
      token
    );
  } catch (e) {
    return null;
  }
}

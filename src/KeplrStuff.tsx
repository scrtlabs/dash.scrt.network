import { FileCopyOutlined } from "@mui/icons-material";
import Button from "@mui/material/Button";
import React, { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { Else, If, Then } from "react-if";
import { Breakpoint } from "react-socks";
import { SecretNetworkClient } from "secretjs";
import { chains } from "./config";

const SECRET_CHAIN_ID = chains["Secret Network"].chain_id;
const SECRET_RPC = chains["Secret Network"].rpc;

export function KeplrPanel({
  secretjs,
  setSecretjs,
  secretAddress,
  setSecretAddress,
}: {
  secretjs: SecretNetworkClient | null;
  setSecretjs: React.Dispatch<React.SetStateAction<SecretNetworkClient | null>>;
  secretAddress: string;
  setSecretAddress: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // useEffect(() => {
  //   setupKeplr(setSecretjs, setSecretAddress);
  // }, []);

  const content = (
    <div style={{ display: "flex", placeItems: "center", borderRadius: 10 }}>
      <Breakpoint small down style={{ display: "flex" }}>
        <img src="/fina.webp" style={{ width: "1.8rem", borderRadius: 10 }} />
      </Breakpoint>
      <Breakpoint medium up style={{ display: "flex" }}>
        <img src="/keplr.svg" style={{ width: "1.8rem", borderRadius: 10 }} />
      </Breakpoint>
      <span style={{ margin: "0 0.3rem" }}>
        <If condition={secretAddress.length > 0}>
          <Then>
            <Breakpoint small down>{`${secretAddress.slice(
              0,
              10
            )}...${secretAddress.slice(-7)}`}</Breakpoint>
            <Breakpoint medium up>
              {secretAddress}
            </Breakpoint>
          </Then>
          <Else>Connect wallet</Else>
        </If>
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
        id="keplr-button"
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
  setSecretjs: React.Dispatch<React.SetStateAction<SecretNetworkClient | null>>,
  setSecretAddress: React.Dispatch<React.SetStateAction<string>>
) {
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  while (
    !window.keplr ||
    !window.getEnigmaUtils ||
    !window.getOfflineSignerOnlyAmino
  ) {
    await sleep(50);
  }

  await window.keplr.enable(SECRET_CHAIN_ID);
  window.keplr.defaultOptions = {
    sign: {
      preferNoSetFee: true,
      disableBalanceCheck: true,
    },
  };

  const keplrOfflineSigner = window.getOfflineSignerOnlyAmino(SECRET_CHAIN_ID);
  const accounts = await keplrOfflineSigner.getAccounts();

  const secretAddress = accounts[0].address;

  const secretjs = await SecretNetworkClient.create({
    grpcWebUrl: SECRET_RPC,
    chainId: SECRET_CHAIN_ID,
    wallet: keplrOfflineSigner,
    walletAddress: secretAddress,
    encryptionUtils: window.getEnigmaUtils(SECRET_CHAIN_ID),
  });

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

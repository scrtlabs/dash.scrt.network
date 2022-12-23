import React, { useEffect, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { Else, If, Then } from "react-if";
import { Breakpoint } from "react-socks";
import { SecretNetworkClient} from "secretjs";
import { chains } from "General/Utils/config";

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

  // Auto Setup Keplr
  useEffect(() => {
    setupKeplr(setSecretjs, setSecretAddress);
  }, []);

  const content = (
    <div className="flex items-center font-semibold border rounded border-neutral-700 bg-neutral-800 px-4 py-2 hover:bg-neutral-700 active:bg-neutral-600 transition-colors">
      <Breakpoint small down style={{ display: "flex" }}>
        <img src="/fina.webp" className="w-7 h-7 inline mr-2"/>
      </Breakpoint>
      <Breakpoint medium up style={{ display: "flex" }}>
        <If condition={secretAddress.length > 0}>
          <span className="relative w-2.5 mr-3">
            <span className="flex absolute h-2 w-2 top-2.5 left-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-1/2"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </span>
        </If>
        <img src="/keplr.svg" className="w-7 h-7 inline mr-2"/>
      </Breakpoint>
      <span>
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
          <Else>Connect Wallet</Else>
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
        <button className="w-full lg:w-auto">
          {content}{" "}
        </button>
      </CopyToClipboard>
    );
  } else {
    return (
      <button
        id="keplr-button"
        onClick={() => setupKeplr(setSecretjs, setSecretAddress)}
        className="w-full lg:w-auto"
      >
        {content}
      </button>
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

  const keplrOfflineSigner = window.getOfflineSignerOnlyAmino(SECRET_CHAIN_ID);
  const accounts = await keplrOfflineSigner.getAccounts();

  const secretAddress = accounts[0].address;

  const secretjs = await (SecretNetworkClient as any).create({
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

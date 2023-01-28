import React, { Component, useContext, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { Else, If, Then } from "react-if";
import { SecretNetworkClient } from "secretjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faWallet } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import GetWalletModal from "shared/components/GetWalletModal";
import { SECRET_LCD, SECRET_CHAIN_ID, SECRET_RPC } from "shared/utils/config";
import { SecretjsContext } from "./SecretjsContext";
import { FeeGrantContext } from "./FeeGrantContext";

export function KeplrPanel() {
  const { secretjs, setSecretjs, secretAddress, setSecretAddress } =
    useContext(SecretjsContext);
  const { feeGrantStatus, setFeeGrantStatus } = useContext(FeeGrantContext);

  const [isModalOpen, setIsModalOpen] = useState(false);

  async function connectWallet(setSecretjs, setSecretAddress) {
    if (!window.keplr) {
      setIsModalOpen(true);
      document.body.classList.add("overflow-hidden");
    } else {
      await setupKeplr(setSecretjs, setSecretAddress);
    }
  }

  const [isFeeGranted, setIsFeeGranted] = useState<boolean>(false);

  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);

  function disconnectWallet() {
    // reset secretjs and secretAddress
    setSecretAddress("");
    setSecretjs(null);

    // reset fee grant
    setIsFeeGranted(false);
    setFeeGrantStatus("Untouched");

    // Toast for success
    toast.success("Wallet disconnected!");
  }

  class KeplrMenu extends React.Component {
    render() {
      return (
        <>
          <div
            className='absolute pt-2 right-4 z-40'
            style={{ top: "3.35rem" }}
            onMouseEnter={() => setIsMenuVisible(true)}
            onMouseLeave={() => setIsMenuVisible(false)}
          >
            <div className='bg-white dark:bg-neutral-800 border text-xs border-neutral-200 dark:border-neutral-700 p-4 w-auto rounded-lg'>
              <CopyToClipboard
                text={secretAddress}
                onCopy={() => {
                  toast.success("Address copied to clipboard!");
                }}
              >
                <button className='px-2 py-1 mb-2 rounded-lg flex gap-2 items-center group bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-black transition-colors'>
                  <div>
                    {secretAddress.slice(0, 14) +
                      "..." +
                      secretAddress.slice(-14)}
                  </div>
                  <div className='block text-neutral-500 dark:text-neutral-500 transition-colors'>
                    <FontAwesomeIcon icon={faCopy} />
                  </div>
                </button>
              </CopyToClipboard>
              <div className='text-right'>
                <button
                  onClick={disconnectWallet}
                  className='font-semibold px-3 py-1.5 rounded-md text-red-400 bg-red-500/30 hover:bg-red-500/50 hover:text-red-300 transition-colors cursor-pointer'
                >
                  Disconnect Wallet
                </button>
                {/* block bg-cyan-500/30 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/50 w-full text-center transition-colors py-2.5 rounded-xl mt-4 font-semibold text-sm */}
              </div>
            </div>
          </div>
        </>
      );
    }
  }

  const content = (
    <>
      <div className='flex items-center font-semibold text-sm'>
        <div className='flex'>
          <If condition={secretAddress.length > 0}>
            <Then>
              <span className='relative w-2.5 mr-3'>
                <span className='flex absolute h-2 w-2 top-[0.175rem] left-0.5'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-1/2'></span>
                  <span className='relative inline-flex rounded-full h-2 w-2 bg-emerald-500'></span>
                </span>
              </span>
            </Then>
          </If>
          <FontAwesomeIcon icon={faWallet} className='mr-2' />
        </div>
        <span>
          <If condition={secretAddress.length > 0}>
            <Then>Connected</Then>
            <Else>Connect Wallet</Else>
          </If>
        </span>
      </div>
    </>
  );

  if (secretjs) {
    return (
      <>
        <If condition={isMenuVisible}>
          <div
            onMouseEnter={() => setIsMenuVisible(true)}
            onMouseLeave={() => setIsMenuVisible(false)}
          >
            <KeplrMenu />
          </div>
        </If>
        {/* <Tooltip title={secretAddress} placement="bottom-end"> */}
        <div
          className='w-full sm:w-auto rounded-lg px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700  select-none cursor-pointer'
          onMouseEnter={() => setIsMenuVisible(true)}
          onMouseLeave={() => setIsMenuVisible(false)}
        >
          {content}
        </div>
        {/* </Tooltip> */}
      </>
    );
  } else {
    return (
      <>
        <GetWalletModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            document.body.classList.remove("overflow-hidden");
          }}
        />
        <button
          id='keplr-button'
          onClick={() => connectWallet(setSecretjs, setSecretAddress)}
          className='w-full sm:w-auto rounded-lg px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 active:bg-neutral-500 dark:active:bg-neutral-600 transition-colors select-none'
        >
          {content}
        </button>
      </>
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
      preferNoSetFee: false,
      disableBalanceCheck: true,
    },
  };

  const keplrOfflineSigner = window.getOfflineSignerOnlyAmino(SECRET_CHAIN_ID);
  const accounts = await keplrOfflineSigner.getAccounts();

  const secretAddress = accounts[0].address;

  const secretjs = new SecretNetworkClient({
    url: SECRET_LCD,
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

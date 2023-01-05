import React, { Component, useEffect, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { Else, If, Then } from "react-if";
import { SecretNetworkClient} from "secretjs";
import { chains } from "General/Utils/config";
import Tooltip from "@mui/material/Tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCopy, faRotateRight, faX } from "@fortawesome/free-solid-svg-icons";
import { faucetURL } from "General/Utils/commons";
import { toast } from "react-toastify";
import GetWalletModal from "General/Components/GetWalletModal";



const SECRET_CHAIN_ID = chains["Secret Network"].chain_id;
const SECRET_LCD = chains["Secret Network"].lcd;
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


  const [isModalOpen, setIsModalOpen] = useState(false);

  async function connectWallet(setSecretjs, setSecretAddress) {
    if (!window.keplr) {
      setIsModalOpen(true);
      document.body.classList.add("overflow-hidden");
    } else {
      await setupKeplr(setSecretjs, setSecretAddress);
    }
  }

  // Auto Setup Keplr
  // useEffect(() => {
  //   setupKeplr(setSecretjs, setSecretAddress);
  // }, []);

  const [isFeeGranted, setIsFeeGranted] = useState<boolean>(false);

  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);

  function disconnectWallet() {
    // reset secretjs and secretAddress
    setSecretAddress("");
    setSecretjs(null);

    // reset fee grant
    setIsFeeGranted(false);
    setFeeGrantStatus(FeeGrantStatus.Untouched);

    // Toast for success
    toast.success("Wallet disconnected!");
  }

  enum FeeGrantStatus {
    Success,
    Fail,
    Untouched
  }
  const [feeGrantStatus, setFeeGrantStatus] = useState<FeeGrantStatus>(FeeGrantStatus.Untouched);

  async function grantButtonAction() {
    fetch(faucetURL, {
      method: "POST",
      body: JSON.stringify({ Address: secretAddress }),
      headers: { "Content-Type": "application/json" },
    })
      .then(async (result) => {
        const textBody = await result.text();
        console.log(textBody);
        if (result.ok == true) {
          setFeeGrantStatus(FeeGrantStatus.Success);
          toast.success(`Successfully sent new Fee Grant!`);
        } else if (
          textBody == "Existing Fee Grant did not expire\n"
        ) {
          setFeeGrantStatus(FeeGrantStatus.Success);
          toast.success(`Using existing fee grant!`);
        } else {
          setFeeGrantStatus(FeeGrantStatus.Fail);
          toast.error(`Fee Grant failed: ${result.status}`);
        }
        setIsFeeGranted(true);
      })
      .catch((error) => {
        toast.error(`Fee Grant failed with error: ${error}`);
      });
  }

  class FeeGrantButton extends Component {
    render() {
      return <>
        {/* <FeeGrant */}
        {secretAddress && (
          <>
            {/* Untouched */}
            <If condition={feeGrantStatus === FeeGrantStatus.Untouched}>
              <button onClick={grantButtonAction} className="font-semibold w-full p-1.5 rounded-md text-emerald-500 border border-emerald-500 hover:bg-emerald-600 hover:text-white transition-colors select-none">
                Request Fee Grant
              </button>
            </If>

            {/* Success */}
            <If condition={feeGrantStatus === FeeGrantStatus.Success}>
              <div className="font-semibold w-full text-center p-1.5 rounded-md text-emerald-500 border border-emerald-500 select-none">
                <FontAwesomeIcon icon={faCheck} className="mr-2 text-emerald-500"/>
                Fee Granted
              </div>
            </If>

            {/* Fail */}
            <If condition={feeGrantStatus === FeeGrantStatus.Fail}>
              <button onClick={grantButtonAction} className="font-semibold group w-full p-1.5 rounded-md border border-red-500 hover:text-white transition-colors select-none">
                <FontAwesomeIcon icon={faX} className="mr-2 text-red-500"/>
                Fee Grant failed
                <FontAwesomeIcon icon={faRotateRight} className="ml-2 text-neutral-500 group-hover:text-white transition-colors" />
              </button>
            </If>
          </>
        )}
      </>
    }
  }

class KeplrMenu extends Component {
  render() {
    return <>
        <div className="absolute pt-2 right-4 z-40" style={{top: "3.35rem"}} onMouseEnter={() => setIsMenuVisible(true)} onMouseLeave={() => setIsMenuVisible(false)}>
          <div className="bg-neutral-800 border text-xs border-neutral-500 p-4 w-auto rounded-lg">
            <CopyToClipboard text={secretAddress} onCopy={ () => {toast.success("Address copied to clipboard!")} }>
              <button className="flex gap-2 items-center group mb-2">
                <div>{secretAddress.slice(0, 14) + "..." + secretAddress.slice(-14)}</div>
                <div className="block text-neutral-500 group-hover:text-white transition-colors"><FontAwesomeIcon icon={faCopy}/></div>
              </button>
            </CopyToClipboard>
            {/* <div className="mb-4">
              <FeeGrantButton/>
            </div> */}
            <div className="text-right">
              <button onClick={disconnectWallet} className="font-semibold px-3 py-1.5 rounded-md border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer">Disconnect Wallet</button>
            </div>
          </div>
        </div>
    </>
  }
}

  const content = (
    <>
      <div className="flex items-center font-semibold text-sm">
        <div className="flex">
          <If condition={secretAddress.length > 0}>
            <span className="relative w-2.5 mr-3">
              <span className="flex absolute h-2 w-2 top-1.5 left-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-1/2"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </span>
          </If>
          <img src="/img/assets/fina.webp" className="w-5 h-5 mr-2 inline md:hidden"/>
          <img src="/img/assets/keplr.svg" className="w-5 h-5 mr-2 hidden md:inline"/>
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
    return (<>
    <If condition={isMenuVisible}>
      <div onMouseEnter={() => setIsMenuVisible(true)} onMouseLeave={() => setIsMenuVisible(false)}>
        <KeplrMenu/>
      </div>
    </If>
      {/* <Tooltip title={secretAddress} placement="bottom-end"> */}
        <div className="w-full sm:w-auto rounded px-4 py-2 border border-neutral-700 bg-neutral-800 select-none cursor-pointer" onMouseEnter={() => setIsMenuVisible(true)} onMouseLeave={() => setIsMenuVisible(false)}>
          {content}
        </div>
        {/* </Tooltip> */}
      </>);
  } else {
    return (
      <>
        <GetWalletModal open={isModalOpen} onClose={() => {setIsModalOpen(false); document.body.classList.remove("overflow-hidden")}}/>
        {/* <button id="keplr-button" onClick={() => setupKeplr(setSecretjs, setSecretAddress)} */}
        <button id="keplr-button" onClick={() => connectWallet(setSecretjs, setSecretAddress)}
          className="w-full sm:w-auto rounded px-4 py-2 border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 transition-colors select-none"
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

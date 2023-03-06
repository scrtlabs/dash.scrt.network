import { createContext, useContext, useState } from "react";
import { toast } from "react-toastify";
import { SecretNetworkClient } from "secretjs";
import { faucetURL } from "shared/utils/commons";
import { SECRET_CHAIN_ID, SECRET_LCD } from "shared/utils/config";
import GetWalletModal from "./GetWalletModal";

const SecretjsContext = createContext(null);

export type FeeGrantStatus = "Success" | "Fail" | "Untouched";

const SecretjsContextProvider = ({ children }: any) => {
  const [secretjs, setSecretjs] = useState<SecretNetworkClient | null>(null);
  const [secretAddress, setSecretAddress] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFeeGranted, setIsFeeGranted] = useState<boolean>(false);
  const [feeGrantStatus, setFeeGrantStatus] =
    useState<FeeGrantStatus>("Untouched");

  async function setupKeplr(
    setSecretjs: React.Dispatch<
      React.SetStateAction<SecretNetworkClient | null>
    >,
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

    const keplrOfflineSigner =
      window.getOfflineSignerOnlyAmino(SECRET_CHAIN_ID);
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

  async function connectWallet() {
    if (!window.keplr) {
      setIsModalOpen(true);
      document.body.classList.add("overflow-hidden");
    } else {
      await setupKeplr(setSecretjs, setSecretAddress);
      localStorage.setItem("keplrAutoConnect", "true");
    }
  }

  async function requestFeeGrant() {
    if (feeGrantStatus !== "Success") {
      fetch(faucetURL, {
        method: "POST",
        body: JSON.stringify({ Address: secretAddress }),
        headers: { "Content-Type": "application/json" },
      })
        .then(async (result) => {
          const textBody = await result.text();
          // console.log(textBody);
          if (result.ok == true) {
            setFeeGrantStatus("Success");
            toast.success(
              `Successfully sent new fee grant (0.1 SCRT) to address ${secretAddress}`
            );
          } else if (textBody == "Existing Fee Grant did not expire\n") {
            setFeeGrantStatus("Success");
            toast.success(
              `Your address ${secretAddress} already has an existing fee grant`
            );
          } else {
            setFeeGrantStatus("Fail");
            toast.error(
              `Fee Grant for address ${secretAddress} failed with status code: ${result.status}`
            );
          }
        })
        .catch((error) => {
          setFeeGrantStatus("Fail");
          toast.error(
            `Fee Grant for address ${secretAddress} failed with error: ${error}`
          );
        });
    }
  }

  function disconnectWallet() {
    // reset secretjs and secretAddress
    setSecretAddress("");
    setSecretjs(null);

    // reset fee grant
    setIsFeeGranted(false);
    setFeeGrantStatus("Untouched");

    // disable auto connect
    localStorage.setItem("keplrAutoConnect", "false");

    // Toast for success
    toast.success("Wallet disconnected!");
  }

  return (
    <SecretjsContext.Provider
      value={{
        secretjs,
        setSecretjs,
        secretAddress,
        setSecretAddress,
        connectWallet,
        disconnectWallet,
        isModalOpen,
        setIsModalOpen,
        feeGrantStatus,
        setFeeGrantStatus,
        requestFeeGrant,
      }}
    >
      <GetWalletModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          document.body.classList.remove("overflow-hidden");
        }}
      />
      {children}
    </SecretjsContext.Provider>
  );
};

async function setKeplrViewingKey(token: string) {
  if (!window.keplr) {
    console.error("Keplr not present");
    return;
  }

  await window.keplr.suggestToken(SECRET_CHAIN_ID, token);
}

async function getKeplrViewingKey(token: string): Promise<string | null> {
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

export {
  SecretjsContext,
  SecretjsContextProvider,
  setKeplrViewingKey,
  getKeplrViewingKey,
};

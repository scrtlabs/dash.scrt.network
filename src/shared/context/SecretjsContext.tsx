import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { SecretNetworkClient } from "secretjs";
import { faucetURL, sleep, viewingKeyErrorString } from "shared/utils/commons";
import { isMobile } from "react-device-detect";
import {
  SECRET_CHAIN_ID,
  SECRET_LCD,
  Token,
  tokens,
} from "shared/utils/config";
import GetWalletModal from "./GetWalletModal";
import ConnectWalletModal from "./ConnectWalletModal";
import { trackMixPanelEvent } from "shared/utils/commons";

export async function isViewingKeyAvailable(token: Token) {
  const key = await getWalletViewingKey(token.address);
  return key ? true : false;
}

const SecretjsContext = createContext(null);

export type FeeGrantStatus = "Success" | "Fail" | "Untouched";

const SecretjsContextProvider = ({ children }: any) => {
  const [secretjs, setSecretjs] = useState<SecretNetworkClient | null>(null);
  const [isGetWalletModalOpen, setIsGetWalletModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [feeGrantStatus, setFeeGrantStatus] =
    useState<FeeGrantStatus>("Untouched");
  const [preferedWalletApi, setPreferedWalletApi] = useState<string>("");

  useEffect(() => {
    function localStorageEventHandler() {
      const localStoragePreferedWalletApi =
        localStorage.getItem("preferedWalletApi");
      if (localStoragePreferedWalletApi) {
        setPreferedWalletApi(localStoragePreferedWalletApi);
      }
    }

    // call on startup
    localStorageEventHandler();

    // call on every change
    window.addEventListener("storage", localStorageEventHandler);

    // remove when the component unmounts
    return () =>
      window.removeEventListener("storage", localStorageEventHandler);
  }, [preferedWalletApi]);

  useEffect(() => {
    if (preferedWalletApi && !secretjs && !secretjs?.address) {
      connectWallet();
    }
  }, [secretjs, secretjs?.address, preferedWalletApi]);

  // Balances
  const [SCRTToken, setSCRTToken] = useState<Token>(
    tokens.find((token) => token.name == "SCRT")
  );
  const [SCRTBalance, setSCRTBalance] = useState<any>();
  const [sSCRTBalance, setSSCRTBalance] = useState<any>();

  const updateTokenBalance = async () => {
    if (!secretjs || !secretjs?.address) {
      return;
    }
    const key = await getWalletViewingKey(SCRTToken.address);
    if (!key) {
      setSSCRTBalance(viewingKeyErrorString);
      return;
    }

    try {
      const result: {
        viewing_key_error: any;
        balance: {
          amount: string;
        };
      } = await secretjs.query.compute.queryContract({
        contract_address: SCRTToken.address,
        code_hash: SCRTToken.code_hash,
        query: {
          balance: { address: secretjs?.address, key },
        },
      });
      if (result.viewing_key_error) {
        console.error(result.viewing_key_error.msg);
        setSSCRTBalance(viewingKeyErrorString);
        return;
      }

      setSSCRTBalance(result.balance.amount);
    } catch (e) {
      console.error(`Error getting balance for s${SCRTToken.name}`, e);

      setSSCRTBalance(viewingKeyErrorString);
    }
  };

  const fetchBalance = async () => {
    const {
      balance: { amount },
    } = await secretjs.query.bank.balance({
      address: secretjs?.address,
      denom: "uscrt",
    });
    setSCRTBalance(amount);
    if (amount == "0" && feeGrantStatus === "Untouched") {
      try {
        const response = await fetch(faucetURL, {
          method: "POST",
          body: JSON.stringify({ Address: secretjs?.address }),
          headers: { "Content-Type": "application/json" },
        });
        const result = await response;
        const textBody = await result.text();
        if (result.ok == true) {
          toast.success(
            `Your wallet does not have any SCRT to pay for transaction costs. Successfully sent new fee grant (0.1 SCRT) to address ${secretjs?.address}.`
          );
          setFeeGrantStatus("Success");
        } else if (textBody == "Existing Fee Grant did not expire\n") {
          toast.success(
            `Your wallet does not have any SCRT to pay for transaction costs. Your address ${secretjs?.address} however does already have an existing fee grant.`
          );
          setFeeGrantStatus("Success");
        } else {
          toast.error(
            `Fee Grant for address ${secretjs?.address} failed with status code: ${result.status}`
          );
          setFeeGrantStatus("Fail");
        }
      } catch (e) {
        toast.error(
          `Fee Grant for address ${secretjs?.address} failed with error: ${e}`
        );
        setFeeGrantStatus("Fail");
      }
    }
  };

  useEffect(() => {
    if (!secretjs || !secretjs?.address) {
      return;
    }
    fetchBalance();
    updateTokenBalance();
  }, [secretjs, secretjs?.address]);

  async function connectWallet() {
    if (!window.keplr && !(window as any).leap) {
      setIsGetWalletModalOpen(true);
      document.body.classList.add("overflow-hidden");
    } else if (window.keplr && (window as any).leap) {
      if (preferedWalletApi === "Keplr") {
        try {
          connectKeplr();
        } catch (e) {
          console.error("Could not connect to Keplr API...", e);
          setPreferedWalletApi("");
        }
      } else if (preferedWalletApi === "Leap") {
        try {
          connectLeap();
        } catch (e) {
          console.error("Could not connect to Leap API...", e);
          setPreferedWalletApi("");
        }
      } else {
        setIsConnectModalOpen(true);
        document.body.classList.add("overflow-hidden");
      }
    } else {
      if (window.keplr) {
        connectKeplr();
      } else if ((window as any).leap) {
        connectLeap();
      }
    }

    if (preferedWalletApi === "Keplr") {
      trackMixPanelEvent("User prefers Keplr API! (Keplr, Fina, Starshell...)");
    } else if (preferedWalletApi === "Leap") {
      trackMixPanelEvent("User prefers Leap API!");
    }
  }

  async function connectKeplr(preferedApiForLocalStorage: string = "Keplr") {
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

    (window as any).wallet = window.keplr;

    localStorage.setItem("preferedWalletApi", preferedApiForLocalStorage);
    window.dispatchEvent(new Event("storage"));

    setSecretjs(secretjs);
  }

  async function connectLeap() {
    //@ts-ignore
    if (!window.leap && isMobile) {
      // const urlSearchParams = new URLSearchParams();
      // urlSearchParams.append("network", chainId);
      // urlSearchParams.append("url", window.location.href);
      // window.open(`fina://wllet/dapps?${urlSearchParams.toString()}`, "_blank");
      // localStorage.setItem("preferedWalletApi", "Fina");
      // window.dispatchEvent(new Event("storage"));
    } else {
      //@ts-ignore
      while (
        !(window as any).leap ||
        !window.getEnigmaUtils ||
        !window.getOfflineSignerOnlyAmino
      ) {
        await sleep(50);
      }

      await (window as any).leap.enable(SECRET_CHAIN_ID);

      //@ts-ignore
      const wallet = window.leap.getOfflineSignerOnlyAmino(SECRET_CHAIN_ID);
      const [{ address: secretAddress }] = await wallet.getAccounts();

      const secretjs = new SecretNetworkClient({
        url: SECRET_LCD,
        chainId: SECRET_CHAIN_ID,
        wallet,
        walletAddress: secretAddress,
        //@ts-ignore
        encryptionUtils: window.leap.getEnigmaUtils(SECRET_CHAIN_ID),
      });

      (window as any).wallet = (window as any).leap;

      setSecretjs(secretjs);

      localStorage.setItem("preferedWalletApi", "Leap");
      window.dispatchEvent(new Event("storage"));

      (window as any).wallet = (window as any).leap;
    }
  }

  async function requestFeeGrant() {
    if (feeGrantStatus !== "Success") {
      fetch(faucetURL, {
        method: "POST",
        body: JSON.stringify({ Address: secretjs?.address }),
        headers: { "Content-Type": "application/json" },
      })
        .then(async (result) => {
          const textBody = await result.text();
          if (result.ok == true) {
            setFeeGrantStatus("Success");
            toast.success(
              `Successfully sent new fee grant (0.1 SCRT) to address ${secretjs?.address}`
            );
          } else if (textBody == "Existing Fee Grant did not expire\n") {
            setFeeGrantStatus("Success");
            toast.success(
              `Your address ${secretjs?.address} already has an existing fee grant`
            );
          } else {
            setFeeGrantStatus("Fail");
            toast.error(
              `Fee Grant for address ${secretjs?.address} failed with status code: ${result.status}`
            );
          }
        })
        .catch((error) => {
          setFeeGrantStatus("Fail");
          toast.error(
            `Fee Grant for address ${secretjs?.address} failed with error: ${error}`
          );
        });
    }
  }

  async function setViewingKey(token: Token) {
    await setWalletViewingKey(token.address);
    try {
      await sleep(1000); // sometimes query nodes lag
      await updateTokenBalance();
    } catch (e: any) {
      console.error(e);
    }
  }

  function disconnectWallet() {
    // reset secretjs and secretAddress
    setSecretjs(null);

    // reset wallet name
    setPreferedWalletApi("");
    localStorage.setItem("preferedWalletApi", "");

    // reset fee grant
    setFeeGrantStatus("Untouched");

    // disconnected => don't auto-connect again
    localStorage.setItem("keplrAutoConnect", "false");

    // Toast for success
    toast.success("Wallet disconnected!");
  }

  return (
    <SecretjsContext.Provider
      value={{
        secretjs,
        setSecretjs,
        connectWallet,
        disconnectWallet,
        isGetWalletModalOpen,
        setIsGetWalletModalOpen,
        isConnectModalOpen,
        setIsConnectModalOpen,
        preferedWalletApi,
        setPreferedWalletApi,
        feeGrantStatus,
        setFeeGrantStatus,
        requestFeeGrant,
        SCRTBalance,
        setSCRTBalance,
        sSCRTBalance,
        setSSCRTBalance,
        updateTokenBalance,
        SCRTToken,
        setSCRTToken,
        setViewingKey,
      }}
    >
      <GetWalletModal
        open={isGetWalletModalOpen}
        onClose={() => {
          trackMixPanelEvent("Closed Get Wallet Modal");
          setIsGetWalletModalOpen(false);
          document.body.classList.remove("overflow-hidden");
        }}
      />
      <ConnectWalletModal
        open={isConnectModalOpen}
        onClose={() => {
          trackMixPanelEvent("Closed Connect Wallet Modal");
          setIsConnectModalOpen(false);
          document.body.classList.remove("overflow-hidden");
        }}
      />
      {children}
    </SecretjsContext.Provider>
  );
};

async function setWalletViewingKey(token: string) {
  if (!window.keplr && !(window as any).leap) {
    console.error("Wallet not present");
    return;
  }
  await (window as any).wallet.suggestToken(SECRET_CHAIN_ID, token);
}

async function getWalletViewingKey(token: string): Promise<string | null> {
  if (!window.keplr && !(window as any).leap) {
    console.error("Wallet not present");
    return null;
  }
  try {
    return await (window as any).wallet.getSecret20ViewingKey(
      SECRET_CHAIN_ID,
      token
    );
  } catch (e: any) {
    console.log(e);
    return null;
  }
}

export {
  SecretjsContext,
  SecretjsContextProvider,
  setWalletViewingKey,
  getWalletViewingKey,
};

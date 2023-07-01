import { createContext, useContext, useEffect, useState } from "react";
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
import BalanceItem from "shared/components/BalanceItem";

export async function isViewingKeyAvailable(token: Token) {
  const key = await getWalletViewingKey(token.address);
  return key ? true : false;
}

const LOCALSTORAGE_KEY = "dashboard_wallet";

const SecretjsContext = createContext(null);

export type FeeGrantStatus = "Success" | "Fail" | "Untouched";

const SecretjsContextProvider = ({ children }: any) => {
  const [secretjs, setSecretjs] = useState<SecretNetworkClient | null>(null);
  const [secretAddress, setSecretAddress] = useState<string>("");
  const [isGetModalOpen, setIsGetModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [feeGrantStatus, setFeeGrantStatus] =
    useState<FeeGrantStatus>("Untouched");
  const [walletName, setWalletName] = useState<string>("");

  useEffect(() => {
    function localStorageEventHandler() {
      const walletName = localStorage.getItem(LOCALSTORAGE_KEY);
      if (walletName) {
        setWalletName(walletName);
      }
    }

    // call on startup
    localStorageEventHandler();

    // call on every change
    window.addEventListener("storage", localStorageEventHandler);

    // remove when the component unmounts
    return () =>
      window.removeEventListener("storage", localStorageEventHandler);
  }, [walletName]);

  useEffect(() => {
    if (walletName && !secretjs && !secretAddress) {
      connectWallet();
    }
  }, [secretjs, secretAddress, walletName]);

  // Balances
  const [SCRTToken, setSCRTToken] = useState<Token>(
    tokens.find((token) => token.name == "SCRT")
  );
  const [SCRTBalance, setSCRTBalance] = useState<any>();
  const [sSCRTBalance, setSSCRTBalance] = useState<any>();

  const updateTokenBalance = async () => {
    if (!secretjs || !secretAddress) {
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
          balance: { address: secretAddress, key },
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
      address: secretAddress,
      denom: "uscrt",
    });
    setSCRTBalance(amount);
    if (amount == "0" && feeGrantStatus === "Untouched") {
      try {
        const response = await fetch(faucetURL, {
          method: "POST",
          body: JSON.stringify({ Address: secretAddress }),
          headers: { "Content-Type": "application/json" },
        });
        const result = await response;
        const textBody = await result.text();
        if (result.ok == true) {
          toast.success(
            `Your wallet does not have any SCRT to pay for transaction costs. Successfully sent new fee grant (0.1 SCRT) to address ${secretAddress}.`
          );
          setFeeGrantStatus("Success");
        } else if (textBody == "Existing Fee Grant did not expire\n") {
          toast.success(
            `Your wallet does not have any SCRT to pay for transaction costs. Your address ${secretAddress} however does already have an existing fee grant.`
          );
          setFeeGrantStatus("Success");
        } else {
          toast.error(
            `Fee Grant for address ${secretAddress} failed with status code: ${result.status}`
          );
          setFeeGrantStatus("Fail");
        }
      } catch (e) {
        toast.error(
          `Fee Grant for address ${secretAddress} failed with error: ${e}`
        );
        setFeeGrantStatus("Fail");
      }
    }
  };

  useEffect(() => {
    if (!secretjs || !secretAddress) {
      return;
    }
    fetchBalance();
    updateTokenBalance();
  }, [secretjs, secretAddress]);

  async function connectWallet() {
    if (!window.keplr && !(window as any).leap) {
      setIsGetModalOpen(true);
      document.body.classList.add("overflow-hidden");
    } else {
      let connectWalletName;
      if (!walletName) {
        const storedWalletName = localStorage.getItem(LOCALSTORAGE_KEY);
        if (storedWalletName) {
          setWalletName(storedWalletName);
          connectWalletName = storedWalletName;
        } else {
          console.log(`Cannot find ${walletName} wallet`);
          setIsConnectModalOpen(true);
          document.body.classList.add("overflow-hidden");
        }
      } else {
        connectWalletName = walletName;
      }
      if (connectWalletName == "Keplr") {
        connectKeplr();
        (window as any).wallet = window.keplr;
      } else if (connectWalletName == "Leap") {
        connectLeap();
        (window as any).wallet = window.keplr;
      } else if (connectWalletName == "Fina") {
        connectFina();
        (window as any).wallet = window.keplr;
      } else if (connectWalletName == "StarShell") {
        connectStarShell();
        (window as any).wallet = window.keplr;
      }
    }
  }

  async function connectStarShell() {
    if (!window.keplr && isMobile) {
      // const urlSearchParams = new URLSearchParams();
      // urlSearchParams.append("network", chainId);
      // urlSearchParams.append("url", window.location.href);
      // window.open(`fina://wllet/dapps?${urlSearchParams.toString()}`, "_blank");
      // localStorage.setItem(LOCALSTORAGE_KEY, "Fina");
      // window.dispatchEvent(new Event("storage"));
    } else {
      connectKeplr("StarShell");
    }
  }

  async function connectKeplr(walletNameForLocalStorage: string = "Keplr") {
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

    localStorage.setItem(LOCALSTORAGE_KEY, walletNameForLocalStorage);
    window.dispatchEvent(new Event("storage"));

    setSecretAddress(secretAddress);
    setSecretjs(secretjs);
  }

  async function connectFina() {
    if (!window.keplr && isMobile) {
      const urlSearchParams = new URLSearchParams();
      urlSearchParams.append("network", SECRET_CHAIN_ID);
      urlSearchParams.append("url", window.location.href);

      window.open(`fina://wllet/dapps?${urlSearchParams.toString()}`, "_blank");

      localStorage.setItem(LOCALSTORAGE_KEY, "Fina");
      window.dispatchEvent(new Event("storage"));
    } else {
      connectKeplr("Fina");
    }
  }

  async function connectLeap() {
    //@ts-ignore
    if (!window.leap && isMobile) {
      // const urlSearchParams = new URLSearchParams();
      // urlSearchParams.append("network", chainId);
      // urlSearchParams.append("url", window.location.href);
      // window.open(`fina://wllet/dapps?${urlSearchParams.toString()}`, "_blank");
      // localStorage.setItem(LOCALSTORAGE_KEY, "Fina");
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

      setSecretAddress(secretAddress);
      setSecretjs(secretjs);

      localStorage.setItem(LOCALSTORAGE_KEY, "Leap");
      window.dispatchEvent(new Event("storage"));

      (window as any).wallet = (window as any).leap;
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

  const [loadingTokenBalance, setLoadingTokenBalance] = useState<boolean>(true);

  async function setViewingKey(token: Token) {
    await setWalletViewingKey(token.address);
    try {
      setLoadingTokenBalance(true);
      await sleep(1000); // sometimes query nodes lag
      await updateTokenBalance();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTokenBalance(false);
    }
  }

  function disconnectWallet() {
    // reset secretjs and secretAddress

    setSecretAddress("");
    setSecretjs(null);

    setWalletName("");
    localStorage.setItem(LOCALSTORAGE_KEY, "");

    // reset fee grant
    setFeeGrantStatus("Untouched");

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
        isGetModalOpen,
        setIsGetModalOpen,
        isConnectModalOpen,
        setIsConnectModalOpen,
        walletName,
        setWalletName,
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
        loadingTokenBalance,
        setLoadingTokenBalance,
        setViewingKey,
      }}
    >
      <GetWalletModal
        open={isGetModalOpen}
        onClose={() => {
          setIsGetModalOpen(false);
          document.body.classList.remove("overflow-hidden");
        }}
      />
      <ConnectWalletModal
        open={isConnectModalOpen}
        setWalletName={setWalletName}
        onClose={() => {
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
  } catch (e) {
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

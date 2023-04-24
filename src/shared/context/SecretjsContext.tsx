import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { SecretNetworkClient } from "secretjs";
import { faucetURL, sleep, viewingKeyErrorString } from "shared/utils/commons";
import {
  SECRET_CHAIN_ID,
  SECRET_LCD,
  Token,
  tokens,
} from "shared/utils/config";
import GetWalletModal from "./GetWalletModal";

export async function isViewingKeyAvailable(token: Token) {
  const key = await getKeplrViewingKey(token.address);
  return key ? true : false;
}

const SecretjsContext = createContext(null);

export type FeeGrantStatus = "Success" | "Fail" | "Untouched";

const SecretjsContextProvider = ({ children }: any) => {
  const [secretjs, setSecretjs] = useState<SecretNetworkClient | null>(null);
  const [secretAddress, setSecretAddress] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFeeGranted, setIsFeeGranted] = useState<boolean>(false);
  const [feeGrantStatus, setFeeGrantStatus] =
    useState<FeeGrantStatus>("Untouched");

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

    const key = await getKeplrViewingKey(SCRTToken.address);

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

  useEffect(() => {
    if (secretjs) {
      const fetchBalance = async () => {
        const {
          balance: { amount },
        } = await secretjs.query.bank.balance({
          address: secretAddress,
          denom: "uscrt",
        });
        setSCRTBalance(amount);
      };

      fetchBalance();
      updateTokenBalance();
    }
  }, [secretjs, secretAddress]);

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

  const [loadingTokenBalance, setLoadingTokenBalance] = useState<boolean>(true);

  async function setViewingKey(token: Token) {
    await setKeplrViewingKey(token.address);
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

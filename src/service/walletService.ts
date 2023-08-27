import { SecretNetworkClient } from "secretjs";
import { FeeGrantStatus } from "shared/types/FeeGrantStatus";
import { Nullable } from "shared/types/Nullable";
import { faucetURL, sleep, viewingKeyErrorString } from "shared/utils/commons";
import {
  SECRET_CHAIN_ID,
  SECRET_LCD,
  Token,
  tokens,
} from "shared/utils/config";
import { isMobile } from "react-device-detect";
import { scrtToken } from "shared/utils/tokens";
import { WalletAPIType } from "shared/types/WalletAPIType";

const connectKeplr = async () => {
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

  const walletAddress = accounts[0].address;

  const secretjs: SecretNetworkClient = new SecretNetworkClient({
    url: SECRET_LCD,
    chainId: SECRET_CHAIN_ID,
    wallet: keplrOfflineSigner,
    walletAddress,
    encryptionUtils: window.getEnigmaUtils(SECRET_CHAIN_ID),
  });

  (window as any).wallet = window.keplr;

  return { walletAddress, secretjs };
};

const connectLeap = async () => {
  if (!(window as any).leap && isMobile) {
    // const urlSearchParams = new URLSearchParams();
    // urlSearchParams.append("network", chainId);
    // urlSearchParams.append("url", window.location.href);
    // window.open(`fina://wllet/dapps?${urlSearchParams.toString()}`, "_blank");
    // localStorage.setItem("preferedWalletApi", "Fina");
    // window.dispatchEvent(new Event("storage"));
  } else {
    while (
      !(window as any).leap ||
      !window.getEnigmaUtils ||
      !window.getOfflineSignerOnlyAmino
    ) {
      await sleep(50);
    }

    await (window as any).leap.enable(SECRET_CHAIN_ID);

    const wallet = (window as any).leap.getOfflineSignerOnlyAmino(
      SECRET_CHAIN_ID
    );
    const [{ address: walletAddress }] = await wallet.getAccounts();

    const secretjs: SecretNetworkClient = new SecretNetworkClient({
      url: SECRET_LCD,
      chainId: SECRET_CHAIN_ID,
      wallet,
      walletAddress,
      encryptionUtils: (window as any).leap.getEnigmaUtils(SECRET_CHAIN_ID),
    });

    (window as any).wallet = (window as any).leap;

    return { walletAddress, secretjs };
  }
};

export const connectWalletService = async (
  walletAPIType: WalletAPIType = "keplr"
) => {
  let walletAddress: string;
  let secretjs: Nullable<SecretNetworkClient>;
  // TODO: choice between Keplr and Leap APIs
  if (walletAPIType === "keplr") {
    ({ walletAddress, secretjs } = await connectKeplr());
  } else {
    ({ walletAddress, secretjs } = await connectLeap());
  }

  return { walletAddress, secretjs };
};

export const requestFeeGrantService = async (
  feeGrantStatus: FeeGrantStatus,
  walletAddress: String
) => {
  let newFeeGrantStatus: FeeGrantStatus = feeGrantStatus;

  if (feeGrantStatus === "success") {
    console.debug(
      "User requested Fee Grant. Fee Grant has already been granted. Therefore doing nothing..."
    );
  } else {
    let result;
    try {
      result = await fetch(faucetURL, {
        method: "POST",
        body: JSON.stringify({ Address: walletAddress }),
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      // console.error(error);
      newFeeGrantStatus = "fail";
      // toast.error(
      //   `Fee Grant for address ${secretAddress} failed with error: ${error}`
      // );
    }

    if (result?.ok === true) {
      newFeeGrantStatus = "success";
      // toast.success(
      //   `Successfully sent new fee grant (0.1 SCRT) to address ${secretAddress}`
      // );
    } else if (
      (await result?.text()) === "Existing Fee Grant did not expire\n"
    ) {
      newFeeGrantStatus = "success";
      // toast.success(
      //   `Your address ${secretAddress} already has an existing fee grant`
      // );
    } else {
      newFeeGrantStatus = "fail";
      // toast.error(
      //   `Fee Grant for address ${secretAddress} failed with status code: ${result.status}`
      // );
    }
  }
  return newFeeGrantStatus;
};

export const setWalletViewingKey = async (token: string) => {
  if (!window.keplr && !(window as any).leap) {
    console.error("Wallet not present");
    return;
  }
  await (window as any).wallet.suggestToken(SECRET_CHAIN_ID, token);
};

export const getWalletViewingKey = async (
  token: string
): Promise<Nullable<string>> => {
  if (!window.keplr && !(window as any).leap) {
    console.error("Wallet not present");
    return null;
  }
  try {
    return await (window as any).wallet?.getSecret20ViewingKey(
      SECRET_CHAIN_ID,
      token
    );
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const isViewingKeyAvailable = async (token: Token) => {
  const key = await getWalletViewingKey(token.address);
  return key ? true : false;
};

export const getsScrtTokenBalance = async (
  isConnected: boolean,
  secretjs: any,
  walletAddress: string
): Promise<Nullable<string>> => {
  if (!isConnected) {
    return null;
  }

  let sScrtBalance: string;

  const key = await getWalletViewingKey(scrtToken.address);
  if (!key) {
    sScrtBalance = viewingKeyErrorString;
    return null;
  }

  interface IResult {
    viewing_key_error: any;
    balance: {
      amount: string;
    };
  }

  try {
    const result: IResult = await secretjs?.query?.compute?.queryContract({
      contract_address: scrtToken.address,
      code_hash: scrtToken.code_hash,
      query: {
        balance: { address: walletAddress, key },
      },
    });

    if (result.viewing_key_error) {
      console.error(result.viewing_key_error.msg);
      sScrtBalance = viewingKeyErrorString;
    } else {
      sScrtBalance = result.balance.amount;
    }
  } catch (error) {
    console.error(`Error getting balance for s${scrtToken.name}: `, error);
    sScrtBalance = viewingKeyErrorString;
  }

  return sScrtBalance;
};

export const getScrtTokenBalance = async (
  secretjs: any,
  walletAddress: string
) => {
  let ScrtBalance: string;

  try {
    const response = await secretjs.query.bank.balance({
      address: walletAddress,
      denom: "uscrt",
    });

    ScrtBalance = response.balance.amount;

    return ScrtBalance;
  } catch (error) {
    console.error(`Error getting balance for SCRT: `, error);
    return null;
  }
};

import { SecretNetworkClient } from "secretjs";
import { FeeGrantStatus } from "shared/types/FeeGrantStatus";
import { faucetURL } from "shared/utils/commons";
import { SECRET_CHAIN_ID, SECRET_LCD } from "shared/utils/config";

export const connectWalletService = async () => {
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

  const walletAddress: string = accounts[0].address;

  const secretjs: SecretNetworkClient = new SecretNetworkClient({
    url: SECRET_LCD,
    chainId: SECRET_CHAIN_ID,
    wallet: keplrOfflineSigner,
    walletAddress: walletAddress,
    encryptionUtils: window.getEnigmaUtils(SECRET_CHAIN_ID),
  });

  (window as any).wallet = window.keplr;

  return { walletAddress, secretjs };
};

export const requestFeeGrantService = async (
  feeGrantStatus: FeeGrantStatus,
  walletAddress: String
) => {
  let newFeeGrantStatus: FeeGrantStatus = feeGrantStatus;

  if (feeGrantStatus === "Success") {
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
      newFeeGrantStatus = "Fail";
      // toast.error(
      //   `Fee Grant for address ${secretAddress} failed with error: ${error}`
      // );
    }

    if (result?.ok == true) {
      newFeeGrantStatus = "Success";
      // toast.success(
      //   `Successfully sent new fee grant (0.1 SCRT) to address ${secretAddress}`
      // );
    } else if (
      (await result?.text()) === "Existing Fee Grant did not expire\n"
    ) {
      newFeeGrantStatus = "Success";
      // toast.success(
      //   `Your address ${secretAddress} already has an existing fee grant`
      // );
    } else {
      newFeeGrantStatus = "Fail";
      // toast.error(
      //   `Fee Grant for address ${secretAddress} failed with status code: ${result.status}`
      // );
    }
  }
  return newFeeGrantStatus;
};

import { SecretNetworkClient } from "secretjs";
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

import {
  connectWalletService,
  getScrtTokenBalance,
  getsScrtTokenBalance,
  requestFeeGrantService,
  setWalletViewingKey,
} from "service/walletService";
import { SecretNetworkClient } from "secretjs";
import { FeeGrantStatus } from "shared/types/FeeGrantStatus";
import { Nullable } from "shared/types/Nullable";
import { sleep } from "shared/utils/commons";
import { Token } from "shared/utils/config";
import { create } from "zustand";
import { WalletAPIType } from "shared/types/WalletAPIType";

interface SecretNetworkClientState {
  isConnected: boolean;
  walletAddress: Nullable<string>;
  setWalletAddress: (walletAddress: string) => void;
  secretNetworkClient: Nullable<SecretNetworkClient>;
  setSecretNetworkClient: (secretjs: Object) => void;
  connectWallet: (walletAPIType?: WalletAPIType) => void;
  disconnectWallet: () => void;
  feeGrantStatus: FeeGrantStatus;
  requestFeeGrant: () => void;
  scrtBalance: Nullable<string>;
  sScrtBalance: Nullable<string>;
  setsScrtBalance: () => void;
  setScrtBalance: () => void;
  isTokenBalanceLoading: boolean;
  setViewingKey: (token: Token) => void;
}

export const useSecretNetworkClientStore = create<SecretNetworkClientState>()(
  (set, get) => ({
    isConnected: false,
    walletAddress: null,
    setWalletAddress: (walletAddress: string) => set({ walletAddress }),
    secretNetworkClient: null,
    setSecretNetworkClient: (secretNetworkClient: any) =>
      set({ secretNetworkClient: secretNetworkClient }),
    connectWallet: async (walletAPIType?: WalletAPIType) => {
      const { setScrtBalance, setsScrtBalance } = get();
      const { walletAddress, secretjs: secretNetworkClient } =
        await connectWalletService(walletAPIType);
      set({
        walletAddress,
        secretNetworkClient: secretNetworkClient,
        isConnected: walletAddress !== null && secretNetworkClient !== null,
      });
      await setScrtBalance();
      await setsScrtBalance();
    },
    disconnectWallet: () =>
      set({
        walletAddress: null,
        secretNetworkClient: null,
        isConnected: false,
        scrtBalance: null,
        sScrtBalance: null,
      }),
    feeGrantStatus: "untouched",
    requestFeeGrant: async () => {
      const { feeGrantStatus, walletAddress } = get();
      const newFeeGrantStatus = await requestFeeGrantService(
        feeGrantStatus,
        walletAddress
      );
      set({ feeGrantStatus: newFeeGrantStatus });
    },
    scrtBalance: null,
    sScrtBalance: null,
    setsScrtBalance: async () => {
      const {
        isConnected,
        walletAddress,
        secretNetworkClient: secretNetworkClient,
      } = get();
      const sScrtBalance = await getsScrtTokenBalance(
        isConnected,
        secretNetworkClient,
        walletAddress
      );
      set({ sScrtBalance });
    },
    setScrtBalance: async () => {
      const { walletAddress, secretNetworkClient: secretNetworkClient } = get();
      const scrtBalance = await getScrtTokenBalance(
        secretNetworkClient,
        walletAddress
      );
      set({ scrtBalance });
    },
    isTokenBalanceLoading: false,
    setViewingKey: async (token: Token) => {
      const { setsScrtBalance } = get();
      await setWalletViewingKey(token.address);
      try {
        // setLoadingTokenBalance(true);
        await sleep(1000); // sometimes query nodes lag
        await setsScrtBalance();
      } catch (e) {
        console.error(e);
      } finally {
        // setLoadingTokenBalance(false);
      }
    },
  })
);

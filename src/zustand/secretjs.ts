import {
  connectWalletService,
  requestFeeGrantService,
} from "apps/service/walletService";
import { SecretNetworkClient } from "secretjs";
import { FeeGrantStatus, isFeeGrantStatus } from "shared/types/FeeGrantStatus";
import { Nullable } from "shared/types/Nullable";
import { create } from "zustand";

interface SecretjsState {
  isConnected: boolean;
  walletAddress: String;
  setWalletAddress: (walletAddress: String) => void;
  secretjs: Nullable<SecretNetworkClient>;
  setSecretjs: (secretjs: Object) => void;
  connectWallet: () => void;
  disconnectWallet: () => void;
  feeGrantStatus: FeeGrantStatus;
  requestFeeGrant: () => void;
  SCRTBalance: Nullable<any>; // TODO: replace any
  sSCRTBalance: Nullable<any>; // TODO: replace any
}

export const useSecretjsStore = create<SecretjsState>()((set, get) => ({
  isConnected: false,
  walletAddress: null,
  setWalletAddress: (walletAddress: String) => set({ walletAddress }),
  secretjs: null,
  setSecretjs: (secretjs: any) => set({ secretjs }),
  connectWallet: async () => {
    const { walletAddress, secretjs } = await connectWalletService();
    set({
      walletAddress,
      secretjs,
      isConnected: walletAddress !== null && secretjs !== null,
    });
  },
  disconnectWallet: () =>
    set({
      walletAddress: null,
      secretjs: null,
      isConnected: false,
    }),
  feeGrantStatus: "Untouched",
  requestFeeGrant: async () => {
    const { feeGrantStatus, walletAddress } = get();
    const newFeeGrantStatus = await requestFeeGrantService(
      feeGrantStatus,
      walletAddress
    );
    set({ feeGrantStatus: newFeeGrantStatus });
  },
  SCRTBalance: null,
  sSCRTBalance: null,
}));

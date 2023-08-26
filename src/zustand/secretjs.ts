import { connectWalletService } from "apps/service/walletService";
import { SecretNetworkClient } from "secretjs";
import { Nullable } from "shared/types/Nullable";
import { create } from "zustand";

interface SecretjsState {
  isConnected: boolean;
  setIsConnected: (isConnected: boolean) => void;
  walletAddress: String;
  setWalletAddress: (walletAddress: String) => void;
  secretjs: Nullable<SecretNetworkClient>;
  setSecretjs: (secretjs: Object) => void;
  connectWallet: () => void;
}

export const useSecretjsStore = create<SecretjsState>()((set) => ({
  isConnected: false,
  setIsConnected: (isConnected: boolean) => set({ isConnected }),
  walletAddress: null,
  setWalletAddress: (walletAddress: String) => set({ walletAddress }),
  secretjs: null,
  setSecretjs: (secretjs: any) => set({ secretjs }),
  connectWallet: async () => {
    const { walletAddress, secretjs } = await connectWalletService();
    set({ walletAddress, secretjs });
  },
}));

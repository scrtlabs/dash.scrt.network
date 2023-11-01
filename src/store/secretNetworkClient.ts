import { SecretNetworkClient } from 'secretjs'
import { FeeGrantStatus } from 'shared/types/FeeGrantStatus'
import { Nullable } from 'shared/types/Nullable'
import { allTokens, sleep } from 'shared/utils/commons'
import { Token } from 'shared/utils/config'
import { create } from 'zustand'
import { WalletAPIType } from 'shared/types/WalletAPIType'
import BigNumber from 'bignumber.js'
import { scrtToken } from 'shared/utils/tokens'
import { WalletService } from 'shared/services/wallet.service'

interface TokenBalances {
  balance: Nullable<BigNumber>
  secretBalance: Nullable<BigNumber>
}

interface SecretNetworkClientState {
  isInitialized: boolean
  init: () => void
  isConnected: boolean
  walletAddress: Nullable<string>
  setWalletAddress: (walletAddress: string) => void
  secretNetworkClient: Nullable<SecretNetworkClient>
  setSecretNetworkClient: (secretjs: Object) => void
  connectWallet: (walletAPIType?: WalletAPIType) => void
  disconnectWallet: () => void
  feeGrantStatus: FeeGrantStatus
  requestFeeGrant: () => void
  scrtBalance: Nullable<string>
  sScrtBalance: Nullable<string>
  setsScrtBalance: () => void
  setScrtBalance: () => void
  isTokenBalanceLoading: boolean
  setViewingKey: (token: Token) => void
  getBalance: (token: Token, secureSecret?: boolean) => Nullable<BigNumber>
  balanceMapping: Map<Token, TokenBalances>
}

export const useSecretNetworkClientStore = create<SecretNetworkClientState>()(
  (set, get) => ({
    isInitialized: false,
    init: () => {
      set({ isInitialized: true })
    },
    isConnected: false,
    walletAddress: null,
    setWalletAddress: (walletAddress: string) => set({ walletAddress }),
    secretNetworkClient: null,
    setSecretNetworkClient: (secretNetworkClient: any) =>
      set({ secretNetworkClient: secretNetworkClient }),
    connectWallet: async (walletAPIType?: WalletAPIType) => {
      const { setScrtBalance, setsScrtBalance } = get()
      const { walletAddress, secretjs: secretNetworkClient } =
        await WalletService.connectWalletService(walletAPIType)
      set({
        walletAddress,
        secretNetworkClient: secretNetworkClient,
        isConnected: walletAddress !== null && secretNetworkClient !== null
      })
      setScrtBalance()
      setsScrtBalance()
      WalletService.getBalancesForTokens(
        get().secretNetworkClient,
        get().secretNetworkClient?.address,
        allTokens
      )
    },
    disconnectWallet: () =>
      set({
        walletAddress: null,
        secretNetworkClient: null,
        isConnected: false,
        scrtBalance: null,
        sScrtBalance: null
      }),
    feeGrantStatus: 'untouched',
    requestFeeGrant: async () => {
      const { feeGrantStatus, walletAddress } = get()
      const newFeeGrantStatus = await WalletService.requestFeeGrantService(
        feeGrantStatus,
        walletAddress
      )
      set({ feeGrantStatus: newFeeGrantStatus })
    },
    scrtBalance: null,
    sScrtBalance: null,
    setsScrtBalance: async () => {
      const {
        isConnected,
        walletAddress,
        secretNetworkClient: secretNetworkClient
      } = get()
      const sScrtBalance = await WalletService.getsScrtTokenBalance(
        isConnected,
        secretNetworkClient,
        walletAddress
      )
      set({ sScrtBalance })
    },
    setScrtBalance: async () => {
      const { walletAddress, secretNetworkClient: secretNetworkClient } = get()
      const scrtBalance = await WalletService.getScrtTokenBalance(
        secretNetworkClient,
        walletAddress
      )
      set({ scrtBalance })
    },
    isTokenBalanceLoading: false,
    setViewingKey: async (token: Token) => {
      const { setsScrtBalance } = get()
      await WalletService.setWalletViewingKey(token.address)
      try {
        // setLoadingTokenBalance(true);
        await sleep(1000) // sometimes query nodes lag
        setsScrtBalance()
      } catch (e) {
        console.error(e)
      } finally {
        // setLoadingTokenBalance(false);
      }
    },
    balanceMapping: new Map<Token, TokenBalances>(),
    getBalance(token: Token, secretToken: boolean = false) {
      if (!get().isInitialized) {
        get().init()
      }

      const tokenBalances: TokenBalances = get().balanceMapping.get(token)

      if (!secretToken) {
        return tokenBalances.balance
      }

      if (secretToken) {
        return tokenBalances.secretBalance
      }

      return null
    }
  })
)

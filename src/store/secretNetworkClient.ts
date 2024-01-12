import { SecretNetworkClient } from 'secretjs'
import { FeeGrantStatus } from 'types/FeeGrantStatus'
import { Nullable } from 'types/Nullable'
import { allTokens, sleep } from 'utils/commons'
import { Chain, Token, chains, tokens } from 'utils/config'
import { create } from 'zustand'
import { WalletAPIType } from 'types/WalletAPIType'
import BigNumber from 'bignumber.js'
import { WalletService } from 'services/wallet.service'
import { IbcService } from 'services/ibc.service'

export interface TokenBalances {
  balance: Nullable<BigNumber>
  secretBalance?: Nullable<BigNumber | GetBalanceError>
}

export type GetBalanceError = 'viewingKeyError' | 'GenericFetchError'

interface SecretNetworkClientState {
  isInitialized: boolean
  init: () => void
  isConnected: boolean
  walletAddress: Nullable<string>
  setWalletAddress: (walletAddress: string) => void
  secretNetworkClient: Nullable<SecretNetworkClient>
  setSecretNetworkClient: (secretjs: Object) => void
  walletAPIType: Nullable<WalletAPIType>
  setWalletAPIType: (walletAPIType: WalletAPIType) => void
  connectWallet: (walletAPIType?: WalletAPIType) => void
  disconnectWallet: () => void
  feeGrantStatus: FeeGrantStatus
  requestFeeGrant: () => Promise<void>
  scrtBalance: Nullable<string>
  sScrtBalance: Nullable<string>
  setsScrtBalance: () => void
  setScrtBalance: () => void
  isTokenBalanceLoading: boolean
  setViewingKey: (token: Token) => void
  getBalance: (token: Token, secretToken?: boolean) => Nullable<BigNumber | GetBalanceError>
  balanceMapping: Map<Token, TokenBalances>
  setBalanceMapping: () => void
  ibcBalanceMapping: Map<Chain, Map<Token, TokenBalances>>
  setIbcBalanceMapping: (chain: Chain) => void
  getIbcBalance: (chain: Chain, token: Token) => Nullable<BigNumber | GetBalanceError>
  balanceRefreshIntervalId: any
  startBalanceRefresh: () => void
  stopBalanceRefresh: () => void
  isGetWalletModalOpen: boolean
  setIsGetWalletModalOpen: (isGetWalletModalOpen: boolean) => void
  isConnectWalletModalOpen: boolean
  setIsConnectWalletModalOpen: (isConnectWalletModalOpen: boolean) => void
}

export const useSecretNetworkClientStore = create<SecretNetworkClientState>()((set, get) => ({
  isInitialized: false,
  init: () => {
    const autoConnect = localStorage.getItem('autoConnect')
    if (autoConnect === 'keplr' || autoConnect === 'leap') {
      get().connectWallet(autoConnect as WalletAPIType)
    }
    set({ isInitialized: true })
  },
  isConnected: false,
  walletAddress: null,
  setWalletAddress: (walletAddress: string) => set({ walletAddress }),
  secretNetworkClient: null,
  setSecretNetworkClient: (secretNetworkClient: any) => set({ secretNetworkClient: secretNetworkClient }),
  walletAPIType: null,
  setWalletAPIType: (walletAPIType: WalletAPIType) => set({ walletAPIType }),
  connectWallet: async (walletAPIType?: WalletAPIType) => {
    const { setScrtBalance, setsScrtBalance, setBalanceMapping, startBalanceRefresh } = get()
    const { walletAddress, secretjs: secretNetworkClient } = await WalletService.connectWallet(walletAPIType)
    set({
      walletAPIType,
      walletAddress,
      secretNetworkClient,
      isConnected: !!(walletAddress && secretNetworkClient)
    })
    localStorage.setItem('autoConnect', walletAPIType)
    setScrtBalance()
    setsScrtBalance()
    setBalanceMapping()
    startBalanceRefresh()
  },
  disconnectWallet: () => {
    set({
      walletAddress: null,
      secretNetworkClient: null,
      isConnected: false,
      scrtBalance: null,
      sScrtBalance: null
    })
    const { stopBalanceRefresh } = get()
    stopBalanceRefresh()
    localStorage.setItem('autoConnect', 'false')
  },
  feeGrantStatus: 'untouched',
  requestFeeGrant: async () => {
    const { feeGrantStatus, walletAddress } = get()
    const result = await WalletService.requestFeeGrantService(feeGrantStatus, walletAddress)
    set({ feeGrantStatus: result })
  },
  scrtBalance: null,
  sScrtBalance: null,
  setsScrtBalance: async () => {
    const { isConnected, walletAddress, secretNetworkClient: secretNetworkClient } = get()
    const sScrtBalance = await WalletService.getsScrtTokenBalance(isConnected, secretNetworkClient, walletAddress)
    set({ sScrtBalance })
  },
  setScrtBalance: async () => {
    const { walletAddress, secretNetworkClient: secretNetworkClient } = get()
    const scrtBalance = await WalletService.getScrtTokenBalance(secretNetworkClient, walletAddress)
    set({ scrtBalance })
  },
  isTokenBalanceLoading: false,
  setViewingKey: async (token: Token) => {
    const { setBalanceMapping } = get()
    await WalletService.setWalletViewingKey(token.address)
    try {
      await sleep(1000) // sometimes query nodes lag
      setBalanceMapping()
    } catch (e) {
      console.error(e)
    }
  },
  balanceMapping: null,
  setBalanceMapping: async () => {
    const { walletAddress, secretNetworkClient: secretNetworkClient } = get()
    const balances = await WalletService.getBalancesForTokens({
      secretNetworkClient: secretNetworkClient,
      walletAddress: walletAddress,
      tokens: allTokens
    })
    set({ balanceMapping: balances })
  },
  getBalance(token: Token, secretToken: boolean = false) {
    if (!get().isInitialized) {
      get().init()
    }
    if (get().balanceMapping !== null) {
      const tokenBalances: TokenBalances = get().balanceMapping.get(token)
      if (!tokenBalances) {
        return null
      }
      if (!secretToken) {
        return tokenBalances.balance
      } else if (secretToken) {
        return tokenBalances.secretBalance
      }
    }
    return null
  },
  ibcBalanceMapping: null,
  setIbcBalanceMapping: async (chain: Chain) => {
    const supportedTokens = IbcService.getSupportedIbcTokensByChain(chain)
    const IbcBalances = await WalletService.fetchIbcChainBalances({ chain: chain, tokens: supportedTokens })
    const ibcBalanceMapping = new Map()
    set({ ibcBalanceMapping: ibcBalanceMapping.set(chain, IbcBalances) })
  },
  getIbcBalance(chain: Chain, token: Token) {
    if (!get().isInitialized) {
      get().init()
    }
    if (get().ibcBalanceMapping !== null) {
      if (get().ibcBalanceMapping.get(chain) !== undefined) {
        const tokenBalances: TokenBalances = get().ibcBalanceMapping.get(chain).get(token)
        if (tokenBalances) {
          return tokenBalances.balance
        }
      }
    }
    return null
  },
  balanceRefreshIntervalId: null,
  startBalanceRefresh: (intervalMs = 10000) => {
    const intervalId = setInterval(() => {
      set({
        balanceMapping: null,
        ibcBalanceMapping: null
      })
      const { setBalanceMapping } = get()
      setBalanceMapping()
    }, intervalMs)
    set({ balanceRefreshIntervalId: intervalId })
  },
  stopBalanceRefresh: () => {
    const { balanceRefreshIntervalId } = get()
    if (balanceRefreshIntervalId) {
      clearInterval(balanceRefreshIntervalId)
      set({ balanceRefreshIntervalId: null })
    }
  },
  isGetWalletModalOpen: false,
  setIsGetWalletModalOpen: (isGetWalletModalOpen: any) => set({ isGetWalletModalOpen: isGetWalletModalOpen }),
  isConnectWalletModalOpen: false,
  setIsConnectWalletModalOpen: (isConnectWalletModalOpen: any) =>
    set({ isConnectWalletModalOpen: isConnectWalletModalOpen })
}))

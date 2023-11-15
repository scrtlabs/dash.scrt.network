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
}

export const useSecretNetworkClientStore = create<SecretNetworkClientState>()((set, get) => ({
  isInitialized: false,
  init: () => {
    set({ isInitialized: true })
  },
  isConnected: false,
  walletAddress: null,
  setWalletAddress: (walletAddress: string) => set({ walletAddress }),
  secretNetworkClient: null,
  setSecretNetworkClient: (secretNetworkClient: any) => set({ secretNetworkClient: secretNetworkClient }),
  connectWallet: async (walletAPIType?: WalletAPIType) => {
    const { setScrtBalance, setsScrtBalance, setBalanceMapping, getBalance } = get()
    const { walletAddress, secretjs: secretNetworkClient } = await WalletService.connectWallet(
      walletAPIType,
      get().secretNetworkClient
    )
    set({
      walletAddress,
      secretNetworkClient,
      isConnected: !!(walletAddress && secretNetworkClient)
    })
    setScrtBalance()
    setsScrtBalance()
    setBalanceMapping()
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
      // setLoadingTokenBalance(true);
      await sleep(1000) // sometimes query nodes lag
      setBalanceMapping()
    } catch (e) {
      console.error(e)
    } finally {
      // setLoadingTokenBalance(false);
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
    console.log(get().ibcBalanceMapping)
    if (get().ibcBalanceMapping !== null) {
      if (get().ibcBalanceMapping.get(chain) !== undefined) {
        const tokenBalances: TokenBalances = get().ibcBalanceMapping.get(chain).get(token)
        if (tokenBalances) {
          console.log(Number(get().ibcBalanceMapping.get(chain).get(token).balance))
          return tokenBalances.balance
        }
      }
    }
    return null
  }
}))

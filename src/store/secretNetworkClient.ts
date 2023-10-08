import {
  connectWalletService,
  getScrtTokenBalance,
  getsScrtTokenBalance,
  requestFeeGrantService,
  setWalletViewingKey
} from 'service/walletService'
import { SecretNetworkClient } from 'secretjs'
import { FeeGrantStatus } from 'shared/types/FeeGrantStatus'
import { Nullable } from 'shared/types/Nullable'
import { sleep } from 'shared/utils/commons'
import { Token, tokens } from 'shared/utils/config'
import { create } from 'zustand'
import { WalletAPIType } from 'shared/types/WalletAPIType'
import BigNumber from 'bignumber.js'
import { PageRequest } from 'secretjs/dist/grpc_gateway/cosmos/base/query/v1beta1/pagination.pb'

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
    init: async () => {
      // tokens.forEach(async (token: Token) => {
      try {
        const res = await get().secretNetworkClient?.query.bank.allBalances({
          address: get().secretNetworkClient?.address,
          pagination: { countTotal: true } as PageRequest
        })
        // let newBalanceMapping = new Map<Token, TokenBalances>()
        // newBalanceMapping.set(token, {
        //   balance: new BigNumber(amount),
        //   secretBalance: null
        // })
        // set({ balanceMapping: newBalanceMapping })
        console.log('res: ', res)
        set({ isInitialized: true })
      } catch (e) {
        console.error(`Error while trying to query all token balances:`, e)
      }
      // })
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
        await connectWalletService(walletAPIType)
      set({
        walletAddress,
        secretNetworkClient: secretNetworkClient,
        isConnected: walletAddress !== null && secretNetworkClient !== null
      })
      setScrtBalance()
      setsScrtBalance()
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
      const newFeeGrantStatus = await requestFeeGrantService(
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
      const sScrtBalance = await getsScrtTokenBalance(
        isConnected,
        secretNetworkClient,
        walletAddress
      )
      set({ sScrtBalance })
    },
    setScrtBalance: async () => {
      const { walletAddress, secretNetworkClient: secretNetworkClient } = get()
      const scrtBalance = await getScrtTokenBalance(
        secretNetworkClient,
        walletAddress
      )
      set({ scrtBalance })
    },
    isTokenBalanceLoading: false,
    setViewingKey: async (token: Token) => {
      const { setsScrtBalance } = get()
      await setWalletViewingKey(token.address)
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
    getBalance(token: Token, secureSecret: boolean = false) {
      if (!get().isInitialized) {
        get().init()
      }

      return new BigNumber(0) // TODO: Fix

      const tokenBalaces: TokenBalances = get().balanceMapping.get(token)

      if (!secureSecret) {
        return tokenBalaces.balance
      }

      if (secureSecret) {
        return tokenBalaces.secretBalance
      }

      return null
    }
  })
)

import { Currency } from 'types/Currency'
import { Theme } from 'types/Theme'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserPreferencesState {
  theme: Theme
  debugMode: boolean
  currency: Currency
}

interface UserPreferencesActions {
  setTheme: (theme: UserPreferencesState['theme']) => void
  setDebugMode: (debugMode: boolean) => void
  setCurrency: (currency: UserPreferencesState['currency']) => void
}

type UserPreferencesStore = UserPreferencesState & UserPreferencesActions

export const useUserPreferencesStore = create<UserPreferencesStore>()(
  persist(
    (set, get) => ({
      // Default preferences
      theme: 'dark',
      debugMode: false,
      currency: 'USD',

      // Actions to update preferences
      setTheme: (theme: Theme) => set(() => ({ theme })),
      setDebugMode: (debugMode: boolean) => set(() => ({ debugMode })),
      setCurrency: (currency: Currency) => set(() => ({ currency }))
    }),
    {
      name: 'user-preferences',
      getStorage: () => localStorage
    }
  )
)

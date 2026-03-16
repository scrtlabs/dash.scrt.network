import type { Currency } from "types/Currency";
import type { Theme } from "types/Theme";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UserPreferencesState {
  theme: Theme;
  debugMode: boolean;
  currency: Currency;
}

interface UserPreferencesActions {
  setTheme: (theme: UserPreferencesState["theme"]) => void;
  setDebugMode: (debugMode: boolean) => void;
  setCurrency: (currency: UserPreferencesState["currency"]) => void;
}

type UserPreferencesStore = UserPreferencesState & UserPreferencesActions;

export const useUserPreferencesStore = create<UserPreferencesStore>()(
  persist(
    (set) => ({
      theme: "dark",
      debugMode: false,
      currency: "USD",
      setTheme: (theme: Theme) => set({ theme }),
      setDebugMode: (debugMode: boolean) => set({ debugMode }),
      setCurrency: (currency: Currency) => set({ currency }),
    }),
    {
      name: "user-preferences",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

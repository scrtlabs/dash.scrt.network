import { createContext, useEffect, useState } from 'react'
import { useUserPreferencesStore } from 'store/UserPreferences'
import { Nullable } from 'types/Nullable'
import { Theme } from 'types/Theme'

const ThemeContext = createContext(null)

const ThemeContextProvider = ({ children }: any) => {
  // the value that will be given to the context
  const { theme } = useUserPreferencesStore()

  function setThemeClassToBody(theme: Theme) {
    if (theme === 'light') {
      document.body.classList.remove('dark')
    } else if (theme === 'dark') {
      document.body.classList.add('dark')
    }
  }

  // always save option to localStorage
  useEffect(() => {
    if (theme !== null) {
      setThemeClassToBody(theme)
    }
  }, [theme])

  return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
}

export { ThemeContext, ThemeContextProvider }

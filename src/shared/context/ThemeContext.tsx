import { createContext, useEffect, useState } from "react";
import { Nullable } from "shared/types/Nullable";
import { Theme } from "shared/types/Theme";

const ThemeContext = createContext(null);

const ThemeContextProvider = ({ children }: any) => {
  // the value that will be given to the context
  const [theme, setTheme] = useState<Nullable<Theme>>(null);

  function setThemeClassToBody(theme: Theme) {
    if (theme === "light") {
      document.body.classList.remove("dark");
    } else if (theme === "dark") {
      document.body.classList.add("dark");
    }
  }

  useEffect(() => {
    // User System Preference
    // let userPrefersDarkTheme: boolean = window.matchMedia(
    //   "(prefers-color-scheme: dark)"
    // ).matches;
    // let userPrefersLightTheme: boolean = window.matchMedia(
    //   "(prefers-color-scheme: light)"
    // ).matches;

    // Local Storage
    let localStorageTheme: Theme = null;
    if (
      localStorage.getItem("theme") === "light" ||
      localStorage.getItem("theme") === "dark"
    ) {
      localStorageTheme = localStorage.getItem("theme") as Theme;
    }

    // Local Storage, then user system preference. Fallback: Dark Mode
    if (localStorageTheme) {
      setTheme(localStorageTheme);
      // } else if (userPrefersDarkTheme) {
      //   setTheme('dark');
      // } else if (userPrefersLightTheme) {
      //   setTheme('light');
    } else {
      // fallback
      setTheme("dark");
    }
  }, []);

  // always save option to localStorage
  useEffect(() => {
    if (theme !== null) {
      localStorage.setItem("theme", theme);
      setThemeClassToBody(theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeContextProvider };

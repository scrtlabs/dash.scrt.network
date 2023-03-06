import { faSun } from "@fortawesome/free-regular-svg-icons";
import { faMoon } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tooltip from "@mui/material/Tooltip";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

export function ThemeSwitch() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <>
      <Tooltip
        title={`Switch to ${theme === "dark" ? "Light Mode" : "Dark Mode"}`}
        placement="bottom"
        arrow
      >
        <button
          onClick={toggleTheme}
          className="text-black dark:text-white hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
        >
          {theme === "light" && (
            <>
              <FontAwesomeIcon icon={faSun} />
            </>
          )}
          {theme === "dark" && (
            <>
              <FontAwesomeIcon icon={faMoon} />
            </>
          )}
        </button>
      </Tooltip>
    </>
  );
}

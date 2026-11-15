import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "../helpers/themeMode";
import styles from "./GlobalThemeToggle.module.css";

/** Theme control available on every route, including auth and public pages. */
export function GlobalThemeToggle() {
  const { mode, switchToLightMode, switchToDarkMode } = useThemeMode();
  const isDark =
    mode === "dark" ||
    (mode === "auto" && document.documentElement.classList.contains("dark"));

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.button}
        onClick={isDark ? switchToLightMode : switchToDarkMode}
        aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
        title={`Switch to ${isDark ? "light" : "dark"} theme`}
        aria-pressed={isDark}
      >
        {isDark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
        <span>{isDark ? "Light mode" : "Dark mode"}</span>
      </button>
    </div>
  );
}

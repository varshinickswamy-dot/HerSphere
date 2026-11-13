"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "./Button";
import { useThemeMode } from "../helpers/themeMode";
import styles from "./ThemeModeSwitch.module.css";

export interface ThemeModeSwitchProps {
  className?: string;
}

/** A direct, touch-friendly light/dark toggle for the dashboard sidebar. */
export const ThemeModeSwitch = ({ className }: ThemeModeSwitchProps) => {
  const { mode, switchToLightMode, switchToDarkMode } = useThemeMode();
  const isDark =
    mode === "dark" ||
    (mode === "auto" &&
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"));

  const toggleTheme = () => {
    if (isDark) switchToLightMode();
    else switchToDarkMode();
  };

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <Button
        type="button"
        variant="ghost"
        size="icon-md"
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
        title={`Switch to ${isDark ? "light" : "dark"} theme`}
        aria-pressed={isDark}
        className={styles.themeButton}
      >
        {isDark ? <Moon className={styles.icon} /> : <Sun className={styles.icon} />}
      </Button>
    </div>
  );
};

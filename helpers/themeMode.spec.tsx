import { switchToDarkMode, switchToLightMode, switchToAutoMode, getCurrentThemeMode } from "./themeMode";

// Helper function to create a mutable MediaQueryList mock.
function createMediaQueryList(initialMatches: boolean, query = "(prefers-color-scheme: dark)") {
  let currentMatches = initialMatches;
  const mql: Partial<MediaQueryList> = {
    get matches() {
      return currentMatches;
    },
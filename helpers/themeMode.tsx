import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from "react";

   10	export type ThemeMode = "light" | "dark" | "auto";
   11	
   12	// Event mechanism to sync standalone functions with React Context
   13	type ThemeChangeListener = (mode: ThemeMode) => void;
   14	const listeners = new Set<ThemeChangeListener>();
   15	
   16	function notifyThemeChange() {
   17	  const mode = getCurrentThemeMode();
   18	  listeners.forEach((listener) => listener(mode));
   19	}
   20	
   21	function subscribeToThemeChange(listener: ThemeChangeListener) {
   22	  listeners.add(listener);
   23	  return () => {
   24	    listeners.delete(listener);
   25	  };
   26	}
   27	
   28	function updateTheme(darkPreferred: boolean): void {
   29	  document.body.classList.toggle("dark", darkPreferred);
   30	  document.body.classList.toggle("light", !darkPreferred);
   31	}
   32	
   33	let currentMediaQuery: MediaQueryList | null = null;
   34	
   35	/**
   36	 * Switch to dark mode by adding the "dark" class to document.body.
   37	 */
   38	export function switchToDarkMode(): void {
   39	  // Clear any auto mode listener if present.
   40	  if (currentMediaQuery) {
   41	    currentMediaQuery.onchange = null;
   42	    currentMediaQuery = null;
   43	  }
   44	  document.body.classList.add("dark");
   45	  document.body.classList.remove("light");
   46	  localStorage.setItem("hersphere-theme","dark");
   47	  notifyThemeChange();
   48	}
   49	
   50	/**
   51	 * Switch to light mode by removing the "dark" class from document.body.
   52	 */
   53	export function switchToLightMode(): void {
   54	  // Clear any auto mode listener if present.
   55	  if (currentMediaQuery) {
   56	    currentMediaQuery.onchange = null;
   57	    currentMediaQuery = null;
   58	  }
   59	  document.body.classList.remove("dark");
   60	  document.body.classList.add("light");
   61	  localStorage.setItem("hersphere-theme","light");
   62	  notifyThemeChange();
   63	}
   64	
   65	/**
   66	 * Switch to auto mode. This function immediately applies the user's color scheme preference
   67	 * and listens for system preference changes to update the theme automatically.
   68	 * It uses the onchange property instead of addEventListener to avoid TypeScript issues.
   69	 */
   70	export function switchToAutoMode(): void {
   71	  if (currentMediaQuery) {
   72	    currentMediaQuery.onchange = null;
   73	  }
   74	  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
   75	  localStorage.setItem("hersphere-theme", "auto");
   76	  mediaQuery.onchange = (e: MediaQueryListEvent) => {
   77	    updateTheme(e.matches);
   78	  };
   79	  currentMediaQuery = mediaQuery;
   80	  updateTheme(mediaQuery.matches);
   81	  notifyThemeChange();
   82	}
   83	
   84	/**
   85	 * Returns the current theme mode:
   86	 * - "auto" if auto mode is enabled,
   87	 * - "dark" if the document body has the "dark" class,
   88	 * - "light" otherwise.
   89	 */
   90	export function getCurrentThemeMode(): ThemeMode {
   91	  if (currentMediaQuery) {
   92	    return "auto";
   93	  }
   94	  return document.body.classList.contains("dark") ? "dark" : "light";
   95	}
   96	
   97	// -- React Context & Provider --
   98	
   99	interface ThemeModeContextValue {
  100	  mode: ThemeMode;
  101	  switchToDarkMode: () => void;
  102	  switchToLightMode: () => void;
  103	  switchToAutoMode: () => void;
  104	}
  105	
  106	const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);
  107	
  108	export function ThemeModeProvider({ children }: { children: ReactNode }) {
  109	  const [mode, setMode] = useState<ThemeMode>(() => {
  110	    if (typeof window === "undefined") return "dark";
  111	    const saved = localStorage.getItem("hersphere-theme");
  112	    if (saved === "light") return "light";
  113	    if (saved === "dark") return "dark";
  114	    if (saved === "auto") return "auto";
  115	    return "dark";
  116	  });
  117	
  118	  useEffect(() => {
  119	    if (mode === "dark") switchToDarkMode();
  120	    else if (mode === "light") switchToLightMode();
  121	    else if (mode === "auto") switchToAutoMode();
  122	    const unsubscribe = subscribeToThemeChange((newMode) => setMode(newMode));
  123	    return unsubscribe;
  124	  }, []);
  125	
  126	  const value = useMemo(
  127	    () => ({
  128	      mode,
  129	      switchToDarkMode,
  130	      switchToLightMode,
  131	      switchToAutoMode,
  132	    }),
  133	    [mode],
  134	  );
  135	
  136	  return (
  137	    <ThemeModeContext.Provider value={value}>
  138	      {children}
  139	    </ThemeModeContext.Provider>
  140	  );
  141	}
  142	
  143	export function useThemeMode(): ThemeModeContextValue {
  144	  const context = useContext(ThemeModeContext);
  145	  if (!context) {
  146	    throw new Error("useThemeMode must be used within a ThemeModeProvider");
  147	  }
  148	  return context;
  149	}
  150
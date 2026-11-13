import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeModeProvider } from "../helpers/themeMode";
import { TooltipProvider } from "./Tooltip";
import { SonnerToaster } from "./SonnerToaster";
import { ScrollToHashElement } from "./ScrollToHashElement";
import { AuthProvider } from "../helpers/useAuth";
import { FlootRealtimeProvider } from "./FlootRealtimeProvider";
import { NetworkStatus } from "./NetworkStatus";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60 * 1000 } },
});

export const GlobalContextProviders = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <FlootRealtimeProvider>
        <ThemeModeProvider>
          <ScrollToHashElement />
          <TooltipProvider>
            {children}
            <NetworkStatus />
            <SonnerToaster />
          </TooltipProvider>
        </ThemeModeProvider>
      </FlootRealtimeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

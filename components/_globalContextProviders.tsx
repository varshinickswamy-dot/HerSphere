import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeModeProvider } from "../helpers/themeMode";
import { TooltipProvider } from "./Tooltip";
import { SonnerToaster } from "./SonnerToaster";
import { ScrollToHashElement } from "./ScrollToHashElement";
import { AuthProvider } from "../helpers/useAuth";
import { FlootRealtimeProvider } from "./FlootRealtimeProvider";
import { NetworkStatus } from "./NetworkStatus";
   10	
   11	const queryClient = new QueryClient({
   12	  defaultOptions: { queries: { staleTime: 60 * 1000 } },
   13	});
   14	
   15	export const GlobalContextProviders = ({ children }: { children: ReactNode }) => (
   16	  <QueryClientProvider client={queryClient}>
   17	    <AuthProvider>
   18	      <FlootRealtimeProvider>
   19	        <ThemeModeProvider>
   20	          <ScrollToHashElement />
   21	          <TooltipProvider>
   22	            {children}
   23	            <NetworkStatus />
   24	            <SonnerToaster />
   25	          </TooltipProvider>
   26	        </ThemeModeProvider>
   27	      </FlootRealtimeProvider>
   28	    </AuthProvider>
   29	  </QueryClientProvider>
   30	);
   31
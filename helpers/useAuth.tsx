import React, {
  createContext,
  useContext,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSession } from "../endpoints/auth/session_GET.schema";
   10	import { postLogout } from "../endpoints/auth/logout_POST.schema";
   11	import { User } from "./User";
   12	
   13	// React Query key for auth session. Make sure to optimistically update user infos using this.
   14	export const AUTH_QUERY_KEY = ["auth", "session"] as const;
   15	
   16	// Do not use this state in login/register UI because it's irrelevant. Only use it in UI that requires authentication.
   17	// For pages that requires authentication only in parts of the UI (e.g. typical home page with a user avatar), the loading
   18	// state should not apply to the full page, only to the parts that require authentication.
   19	// Also, global context providers should not be blocked on auth states as it will block the whole page.
   20	type AuthState =
   21	  | {
   22	      // Make sure to display a nice loading state UI when loading authentication state
   23	      type: "loading";
   24	    }
   25	  | {
   26	      type: "authenticated";
   27	      user: User;
   28	    }
   29	  | {
   30	      // Make sure to redirect to login or show auth error UI
   31	      type: "unauthenticated";
   32	      errorMessage?: string;
   33	    };
   34	
   35	type AuthContextType = {
   36	  // Use this to display the correct UI based on auth state
   37	  authState: AuthState;
   38	  // Notify the auth provider that we have logged in
   39	  onLogin: (user: User) => void;
   40	  // Clear the auth state and perform the logout request
   41	  logout: () => Promise<void>;
   42	};
   43	
   44	const AuthContext = createContext<AuthContextType | undefined>(undefined);
   45	
   46	// Add this to components/_globalContextProviders but not any pageLayout files.
   47	// Make sure it's within the QueryClientProvider
   48	export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
   49	  children,
   50	}) => {
   51	  const queryClient = useQueryClient();
   52	
   53	  const { data, error, status, refetch } = useQuery({
   54	    queryKey: AUTH_QUERY_KEY,
   55	    queryFn: async () => {
   56	      const result = await getSession();
   57	      if ("error" in result) {
   58	        const sessionError = new Error(result.error);
   59	        // React Query can retain previous successful data after a failed background
   60	        // refetch. Mark an explicit 401-style response so stale identity is not kept.
   61	        if (/not authenticated/i.test(result.error)) {
   62	          sessionError.name = "UnauthenticatedSessionError";
   63	        }
   64	        throw sessionError;
   65	      }
   66	      return result.user;
   67	    },
   68	    retry: 1,
   69	    enabled: true,
   70	    // Revalidate the server cookie periodically so an expired/revoked session
   71	    // is reflected in the UI instead of leaving a stale authenticated screen.
   72	    staleTime: 30 * 1000,
   73	    refetchInterval: 5 * 60 * 1000,
   74	    refetchOnWindowFocus: true,
   75	    refetchOnReconnect: true,
   76	  });
   77	
   78	  const authState: AuthState =
   79	    error instanceof Error && error.name === "UnauthenticatedSessionError"
   80	      ? { type: "unauthenticated" }
   81	      : status === "pending"
   82	      ? { type: "loading" }
   83	      : status === "error"
   84	        ? {
   85	            type: "unauthenticated",
   86	            errorMessage:
   87	              error instanceof Error ? error.message : "Session check failed",
   88	          }
   89	        : data
   90	          ? { type: "authenticated", user: data }
   91	          : { type: "unauthenticated" };
   92	
   93	  const logout = useCallback(async () => {
   94	    // Optimistically update UI
   95	    queryClient.setQueryData(AUTH_QUERY_KEY, null);
   96	    // Make the actual API call
   97	    try {
   98	      await postLogout();
   99	    } finally {
  100	      // Never retain one user's cached private data after logout, even offline.
  101	      queryClient.clear();
  102	    }
  103	  }, [queryClient]);
  104	
  105	  // This should only be used for login. For user profile changes, create separate endpoints and react query hooks
  106	  // and update the data linked to AUTH_QUERY_KEY.
  107	  const onLogin = useCallback(
  108	    (user: User) => {
  109	      queryClient.setQueryData(AUTH_QUERY_KEY, user);
  110	    },
  111	    [queryClient]
  112	  );
  113	
  114	  return (
  115	    <AuthContext.Provider value={{ authState, logout, onLogin }}>
  116	      {children}
  117	    </AuthContext.Provider>
  118	  );
  119	};
  120	
  121	// Prefer using protectedRoutes instead of this hook unless the route doesn't need to be protected (e.g. login/register)
  122	export const useAuth = (): AuthContextType => {
  123	  const context = useContext(AuthContext);
  124	  if (context === undefined) {
  125	    throw new Error("useAuth must be used within a AuthProvider");
  126	  }
  127	  return context;
  128	};
  129
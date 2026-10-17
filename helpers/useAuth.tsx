import React, {
  createContext,
  useContext,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSession } from "../endpoints/auth/session_GET.schema";
import { postLogout } from "../endpoints/auth/logout_POST.schema";
import { User } from "./User";

// React Query key for auth session. Make sure to optimistically update user infos using this.
export const AUTH_QUERY_KEY = ["auth", "session"] as const;

// Do not use this state in login/register UI because it's irrelevant. Only use it in UI that requires authentication.
// For pages that requires authentication only in parts of the UI (e.g. typical home page with a user avatar), the loading
// state should not apply to the full page, only to the parts that require authentication.
// Also, global context providers should not be blocked on auth states as it will block the whole page.
type AuthState =
  | {
      // Make sure to display a nice loading state UI when loading authentication state
      type: "loading";
    }
  | {
      type: "authenticated";
      user: User;
    }
  | {
      // Make sure to redirect to login or show auth error UI
      type: "unauthenticated";
      errorMessage?: string;
    };

type AuthContextType = {
  // Use this to display the correct UI based on auth state
  authState: AuthState;
  // Notify the auth provider that we have logged in
  onLogin: (user: User) => void;
  // Clear the auth state and perform the logout request
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Add this to components/_globalContextProviders but not any pageLayout files.
// Make sure it's within the QueryClientProvider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();

  const { data, error, status, refetch } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      const result = await getSession();
      if ("error" in result) {
        const sessionError = new Error(result.error);
        // React Query can retain previous successful data after a failed background
        // refetch. Mark an explicit 401-style response so stale identity is not kept.
        if (/not authenticated/i.test(result.error)) {
          sessionError.name = "UnauthenticatedSessionError";
        }
        throw sessionError;
      }
      return result.user;
    },
    retry: 1,
    enabled: true,
    // Revalidate the server cookie periodically so an expired/revoked session
    // is reflected in the UI instead of leaving a stale authenticated screen.
    staleTime: 30 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const authState: AuthState =
    error instanceof Error && error.name === "UnauthenticatedSessionError"
      ? { type: "unauthenticated" }
      : status === "pending"
      ? { type: "loading" }
      : status === "error"
        ? {
            type: "unauthenticated",
            errorMessage:
              error instanceof Error ? error.message : "Session check failed",
          }
        : data
          ? { type: "authenticated", user: data }
          : { type: "unauthenticated" };

  const logout = useCallback(async () => {
    // Optimistically update UI
    queryClient.setQueryData(AUTH_QUERY_KEY, null);
    // Make the actual API call
    try {
      await postLogout();
    } finally {
      // Never retain one user's cached private data after logout, even offline.
      queryClient.clear();
    }
  }, [queryClient]);

  // This should only be used for login. For user profile changes, create separate endpoints and react query hooks
  // and update the data linked to AUTH_QUERY_KEY.
  const onLogin = useCallback(
    (user: User) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
    },
    [queryClient]
  );

  return (
    <AuthContext.Provider value={{ authState, logout, onLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

// Prefer using protectedRoutes instead of this hook unless the route doesn't need to be protected (e.g. login/register)
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};

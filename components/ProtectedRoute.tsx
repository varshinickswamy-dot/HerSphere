import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../helpers/useAuth";
import { User } from "../helpers/User";
import { AuthErrorPage } from "./AuthErrorPage";
import { ShieldOff } from "lucide-react";
import { AuthLoadingState } from "./AuthLoadingState";
import styles from "./ProtectedRoute.module.css";

   10	// Do not use this in pageLayout
   11	const MakeProtectedRoute: (roles: User["role"][]) => React.FC<{
   12	  children: React.ReactNode;
   13	}> =
   14	  (roles) =>
   15	  ({ children }) => {
   16	    const { authState } = useAuth();
   17	
   18	    // Show loading state while checking authentication
   19	    if (authState.type === "loading") {
   20	      return <AuthLoadingState title="Authenticating" />;
   21	    }
   22	
   23	    // Redirect to login if not authenticated
   24	    if (authState.type === "unauthenticated") {
   25	      return <Navigate to="/login" replace />;
   26	    }
   27	
   28	    if (!roles.includes(authState.user.role)) {
   29	      return (
   30	        <AuthErrorPage
   31	          title="Access Denied"
   32	          message={`Access denied. Your role (${authState.user.role}) lacks required permissions.`}
   33	          icon={<ShieldOff className={styles.accessDeniedIcon} size={64} />}
   34	        />
   35	      );
   36	    }
   37	
   38	    // Render children if authenticated
   39	    return <>{children}</>;
   40	  };
   41	
   42	// Create protected routes here, then import them in pageLayout
   43	export const AdminRoute = MakeProtectedRoute(["admin"]);
   44	export const UserRoute = MakeProtectedRoute(["user", "admin"]);
   45	// For private pages shared by students, recruiters, company accounts and admins.
   46	export const AuthenticatedRoute = MakeProtectedRoute(["user", "admin"]);
   47
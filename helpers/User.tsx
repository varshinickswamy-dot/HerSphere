// If you need to udpate this type, make sure to also update
// components/ProtectedRoute
// endpoints/auth/login_with_password_POST
// endpoints/auth/register_with_password_POST
// endpoints/auth/session_GET
// helpers/getServerUserSession
// together with this in one toolcall.

export interface User {
   10	  id: number;
   11	  email: string;
   12	  displayName: string;
   13	  avatarUrl: string | null;
   14	  // adjust this as necessary
   15	  role: "admin" | "user";
   16	}
   17
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

export default function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);
  const [adminChecking, setAdminChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminClaim = async () => {
      if (!user) {
        setIsAdmin(false);
        setAdminChecking(false);
        return;
      }

      try {
        const tokenResult = await user.getIdTokenResult(true);

        setIsAdmin(tokenResult.claims.admin === true);
      } catch (error) {
        console.error("Error checking admin claim:", error);
        setIsAdmin(false);
      } finally {
        setAdminChecking(false);
      }
    };

    if (!loading) {
      checkAdminClaim();
    }
  }, [user, loading]);

  if (loading || adminChecking) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/alms-calendar" replace />;
  }

  return children;
}

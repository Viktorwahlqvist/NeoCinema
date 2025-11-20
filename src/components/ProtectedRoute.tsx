import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

// Wait while AuthContext checks the session
  if (isLoading) {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "3rem" }}>
        Kontrollerar inloggning...
      </div>
    );
  }

  // If the user is not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the user is logged in → show the page
  return <>{children}</>;
}
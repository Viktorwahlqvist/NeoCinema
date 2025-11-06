import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  //  Vänta medan AuthContext kontrollerar sessionen
  if (isLoading) {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "3rem" }}>
        Kontrollerar inloggning...
      </div>
    );
  }

  // Om användaren inte är inloggad → skicka till login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Om användaren är inloggad → visa sidan
  return <>{children}</>;
}
import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div style={{ color: "white", textAlign: "center", marginTop: "3rem" }}>
      Kontrollerar inloggning...
    </div>;
  }

  // Om inte inloggad → login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Om inloggad men inte admin → 404
  if (user.role !== "admin") {
    return <Navigate to="/404" replace />;
  }

  // Admin → visa sidan
  return <>{children}</>;
}

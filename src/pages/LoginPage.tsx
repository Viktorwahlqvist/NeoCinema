import React, { FormEvent, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./PagesStyle/LoginPage.scss";
import { useAuth } from "../AuthContext"; 

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCheckingLogin, setIsCheckingLogin] = useState(true);

 
  const { login, user, isLoading: isAuthLoading } = useAuth();

 
  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    if (user) {
      console.log("Redan inloggad, skickar till /profile");
      navigate("/profile", { replace: true });
    } else {
      
      setIsCheckingLogin(false);
    }
  }, [user, isAuthLoading, navigate]); 

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Inloggning misslyckades");
      return;
    }

    
    const data = await res.json(); 
    login(data.user); // telling context that we're logged in

    console.log("login ok -> navigate to /profile");
    navigate("/profile", { replace: true });
  };

  
  if (isCheckingLogin || isAuthLoading) {
    return <p>Laddar...</p>;
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Logga in</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">
            E-post
            <input
              className="auth-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="auth-label">
            Lösenord
            <input
              className="auth-input"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={loading} className="auth-submit">
            {loading ? "Loggar in..." : "Logga in"}
          </button>
        </form>
        <p className="auth-foot">
          Inget konto? <Link to="/register">Registrera dig</Link>
        </p>
      </div>
    </div>
  );
}
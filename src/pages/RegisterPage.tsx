import React, { FormEvent, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./PagesStyle/LoginPage.scss";
import { useAuth } from "../AuthContext"; 

export default function RegisterPage() {
  const navigate = useNavigate();

  // new states for registration form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCheckingLogin, setIsCheckingLogin] = useState(true);

  // gets global auth state from context
  const { login, user, isLoading: isAuthLoading } = useAuth();

  //updated useEffect: Read from Context instead of fetch
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

    const res = await fetch("/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password }),
      credentials: "include",
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Registrering misslyckades");
      return;
    }

    const data = await res.json(); 
    login(data.user);
    
    console.log("Registrering ok -> navigate to /profile");
    navigate("/profile", { replace: true });
  };

  if (isCheckingLogin || isAuthLoading) {
    return <p className="auth-loading">Laddar...</p>;
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Registrera dig</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">
            Förnamn
            <input
              className="auth-input"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </label>

          <label className="auth-label">
            Efternamn
            <input
              className="auth-input"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </label>

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
          <br />
          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading} className="auth-submit">
            {loading ? "Registrerar..." : "Registrera dig"}
          </button>
        </form>
        <p className="auth-foot">
          Redan ett konto? <Link to="/login">Logga in</Link>
        </p>
      </div>
    </div>
  );
}
import React, { FormEvent, useState, useEffect } from "react"; 
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCheckingLogin, setIsCheckingLogin] = useState(true); 


  useEffect(() => {
    fetch("/api/users/me", { credentials: "include" })
      .then(res => {
        if (res.ok) {
          
          console.log("Redan inloggad, skickar till /profile");
          navigate("/profile", { replace: true });
        } else {
         
          setIsCheckingLogin(false);
        }
      })
      .catch(() => {
       
        setIsCheckingLogin(false);
      });
  }, [navigate]); // loads once


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
    console.log("login ok -> navigate to /profile");
    navigate("/profile", { replace: true });
  };

  if (isCheckingLogin) {
    return <p>Laddar...</p>;
  }

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 16 }}>
      <h2>Logga in</h2>
      <form onSubmit={handleSubmit}>
  
        <label>
          E-post
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <br />
        <label>
          Lösenord
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <br />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Loggar in..." : "Logga in"}
        </button>
      </form>
      <p>
        Inget konto? <Link to="/register">Registrera dig</Link>
      </p>
    </div>
  );
}
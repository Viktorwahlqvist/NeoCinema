import React, { FormEvent, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

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

  // check if already logged in
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
  }, [navigate]);


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
    
    console.log("Registrering ok -> navigate to /profile");
    navigate("/profile", { replace: true });
  };

  if (isCheckingLogin) {
    return <p>Laddar...</p>;
  }

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 16 }}>
      <h2>Registrera dig</h2> 
      <form onSubmit={handleSubmit}>

        
        <label>
          Förnamn
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </label>
        <br />
        <label>
          Efternamn
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </label>
        <br />
        
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
          {loading ? "Registrerar..." : "Registrera dig"} 
        </button>
      </form>
      <p>
        Redan ett konto? <Link to="/login">Logga in</Link> 
      </p>
    </div>
  );
}
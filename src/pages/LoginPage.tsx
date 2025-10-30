import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { user, login, register, loading } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState("");

  // ✅ Only redirect if user is logged in (no extra API calls)
  useEffect(() => {
    if (!loading && user) {
      navigate("/profile");
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegister) {
        await register(form);
      } else {
        await login(form.email, form.password);
      }
      navigate("/profile");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <p>Laddar...</p>;

  return (
    <div className="auth-page">
      <h2>{isRegister ? "Skapa konto" : "Logga in"}</h2>
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <>
            <input
              placeholder="Förnamn"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <input
              placeholder="Efternamn"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </>
        )}
        <input
          placeholder="E-post"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          placeholder="Lösenord"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">{isRegister ? "Registrera" : "Logga in"}</button>
      </form>

      <p style={{ marginTop: "1rem" }}>
        {isRegister ? "Har du redan ett konto?" : "Har du inget konto?"}{" "}
        <button onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Logga in" : "Skapa konto"}
        </button>
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
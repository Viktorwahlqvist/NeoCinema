import React, { 
  createContext, 
  useState, 
  useEffect, 
  useContext, 
  ReactNode 
} from "react";

// 1. Definiera typerna (samma User-typ som du redan har)
type User = { id: number; firstName: string; lastName: string; email: string };

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

// 2. Skapa Context med ett default-värde
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Skapa en "Provider"-komponent
// Denna komponent kommer att hämta användardata och dela ut den.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Viktig!

  // Körs en gång när appen laddas för att kolla om vi har en session
  useEffect(() => {
    fetch("/api/users/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setUser(data.user); // Inloggad!
      })
      .catch(() => {
        setUser(null); // Inte inloggad
      })
      .finally(() => {
        setIsLoading(false); // Sluta ladda, vi har ett svar
      });
  }, []);

  // Funktioner för att ändra state från andra komponenter
  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    // Vi litar på att komponenten som kallar 'logout'
    // också har anropat /api/users/logout
    setUser(null); 
  };

  const value = { user, isLoading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 4. Skapa en "custom hook" för att enkelt använda din context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";

type User = { id: number; firstName: string; lastName: string; email: string; role: 'admin' | 'user'; };

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

// create provider component which will wrap the app and provide the auth state
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); 

  // runs once on mount to check if user is logged in
  useEffect(() => {
    fetch("/api/users/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setUser(data.user); 
      })
      .catch(() => {
        setUser(null); 
      })
      .finally(() => {
        setIsLoading(false); 
      });
  }, []);

  // function to log in the user
  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    
    setUser(null);
  };
  const value = { user, isLoading, login, logout };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

// custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
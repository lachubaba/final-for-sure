import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("cashbook_token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem("cashbook_token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("cashbook_token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

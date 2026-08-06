import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

export interface AuthUser {
  id: number;
  email: string | null;
}

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const TOKEN_KEY = "auth_token";

function decodeJwtPayload(token: string): { sub: string; email: string | null } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function parseUserFromToken(token: string): AuthUser | null {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.sub) return null;
  return {
    id: parseInt(payload.sub, 10),
    email: payload.email || null,
  };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const isAuthenticated = !!user && !!token;

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      const u = parseUserFromToken(stored);
      if (u) {
        setToken(stored);
        setUser(u);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Login fehlgeschlagen");
      }

      const accessToken: string = data.access_token;
      const u = parseUserFromToken(accessToken);
      if (!u) {
        throw new Error("Ungültiges Token vom Server erhalten");
      }

      localStorage.setItem(TOKEN_KEY, accessToken);
      setToken(accessToken);
      setUser(u);
    },
    []
  );

  const register = useCallback(
    async (email: string, password: string): Promise<void> => {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Registrierung fehlgeschlagen");
      }

      const accessToken: string = data.access_token;
      const u = parseUserFromToken(accessToken);
      if (!u) {
        throw new Error("Ungültiges Token vom Server erhalten");
      }

      localStorage.setItem(TOKEN_KEY, accessToken);
      setToken(accessToken);
      setUser(u);
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

import { createContext, useContext, type ReactNode } from "react";

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

const stubLogin = async (
  _email: string,
  _password: string
): Promise<void> => {};

const stubRegister = async (
  _email: string,
  _password: string
): Promise<void> => {};

const stubLogout = (): void => {};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isAuthenticated: false,
  login: stubLogin,
  register: stubRegister,
  logout: stubLogout,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        user: null,
        token: null,
        isAuthenticated: false,
        login: stubLogin,
        register: stubRegister,
        logout: stubLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

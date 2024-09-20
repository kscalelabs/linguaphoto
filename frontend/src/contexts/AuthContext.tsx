// src/context/AuthContext.tsx
import { read_me } from "api/auth";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Response } from "types/auth";

interface AuthContextType {
  auth: Response | null;
  setAuth: React.Dispatch<React.SetStateAction<Response | null>>;
  signout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<Response | null>(null);
  const signout = () => {
    localStorage.removeItem("token");
    setAuth({});
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const fetch_data = async (token: string) => {
        try {
          const response = await read_me(token);
          setAuth(response);
        } catch {
          return;
        }
      };
      fetch_data(token);
    } else signout();
  }, []);
  useEffect(() => {
    if (auth?.token) {
      localStorage.setItem("token", auth.token);
    }
  }, [auth?.token]);
  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        signout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };

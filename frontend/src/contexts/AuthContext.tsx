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
  is_auth: boolean;
  auth: Response | null;
  setAuth: React.Dispatch<React.SetStateAction<Response | null>>;
  signout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<Response | null>(null);
  const [is_auth, setFlag] = useState<boolean>(false);
  const signout = () => {
    localStorage.removeItem("token");
    setAuth({});
    setFlag(false);
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const fetch_data = async (token: string) => {
        const response = await read_me(token);
        console.log(response);
        if (response) setAuth(response);
      };
      fetch_data(token);
    } else signout();
  }, []);
  useEffect(() => {
    if (auth?.token) {
      localStorage.setItem("token", auth.token);
      setFlag(true);
    }
  }, [auth]);
  return (
    <AuthContext.Provider
      value={{
        auth,
        is_auth,
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

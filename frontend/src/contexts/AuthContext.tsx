// src/context/AuthContext.tsx
import { read_me, read_me_business } from "api/auth";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { SignupResponse, SignupResponseBusiness } from "types/auth";

interface AuthContextType {
  auth: SignupResponse | null;
  auth_business: SignupResponseBusiness | null;
  auth_type: "user" | "business";
  setAuth: React.Dispatch<React.SetStateAction<SignupResponse | null>>;
  setAuthBusiness: React.Dispatch<
    React.SetStateAction<SignupResponseBusiness | null>
  >;
  setAuthType: React.Dispatch<React.SetStateAction<"user" | "business">>;
  signout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<SignupResponse | null>(null);
  const [auth_business, setAuthBusiness] =
    useState<SignupResponseBusiness | null>(null);
  const [auth_type, setAuthType] = useState<"user" | "business">("user");
  const signout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("type");
    setAuth({});
    setAuthBusiness({});
  };
  useEffect(() => {
    console.log("1");
    const token = localStorage.getItem("token");
    const auth_type = localStorage.getItem("type");
    if (token) {
      if (auth_type == "user") {
        const fetch_data = async (token: string) => {
          const response = await read_me(token);
          console.log(response);
          if (response) setAuth(response);
        };
        fetch_data(token);
      } else {
        const fetch_data = async (token: string) => {
          const response = await read_me_business(token);
          console.log(response);
          if (response) setAuthBusiness(response);
        };
        fetch_data(token);
      }
    } else signout();
  }, []);
  useEffect(() => {
    console.log("2");
    if (auth?.access_token) {
      localStorage.setItem("token", auth.access_token);
      localStorage.setItem("type", "user");
    }
  }, [auth]);
  useEffect(() => {
    console.log("3");
    if (auth_business?.access_token) {
      localStorage.setItem("token", auth_business.access_token);
      localStorage.setItem("type", "business");
    }
  }, [auth_business]);
  return (
    <AuthContext.Provider
      value={{
        auth,
        auth_business,
        auth_type,
        setAuth,
        setAuthBusiness,
        setAuthType,
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

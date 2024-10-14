// src/context/AuthContext.tsx
import { components, paths } from "gen/api";
import createClient, { Client } from "openapi-fetch";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface AuthContextType {
  auth: components["schemas"]["UserInfoResponseItem"] | undefined;
  setAuth: React.Dispatch<
    React.SetStateAction<
      components["schemas"]["UserInfoResponseItem"] | undefined
    >
  >;
  is_auth: boolean;
  setApiKeyId: React.Dispatch<React.SetStateAction<string | null>>;
  signout: () => void;
  apiKeyId: string | null;
  client: Client<paths>;
}

const getLocalStorageAuth = (): string | null => {
  return localStorage.getItem("token");
};

export const setLocalStorageAuth = (id: string) => {
  localStorage.setItem("token", id);
};

export const deleteLocalStorageAuth = () => {
  localStorage.removeItem("token");
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<
    components["schemas"]["UserInfoResponseItem"] | undefined
  >(undefined);
  const [is_auth, setIsAuth] = useState<boolean>(true);
  const [apiKeyId, setApiKeyId] = useState<string | null>(
    getLocalStorageAuth(),
  );
  const signout = () => {
    localStorage.removeItem("token");
    setAuth(undefined);
    setApiKeyId("");
    setIsAuth(false);
  };
  const client = useMemo(
    () =>
      createClient<paths>({
        baseUrl: process.env.REACT_APP_BACKEND_URL,
      }),
    [apiKeyId],
  );
  useEffect(() => {
    if (apiKeyId !== null) {
      setLocalStorageAuth(apiKeyId);
      client.use({
        async onRequest({ request }) {
          request.headers.set("Authorization", `Bearer ${apiKeyId}`);
          return request;
        },
        async onResponse({ response }) {
          return response;
        },
      });
    }
  }, [apiKeyId, client]);
  useEffect(() => {
    if (apiKeyId) {
      const fetch_data = async () => {
        const { data, error } = await client.GET("/me");
        if (error) {
          signout();
        } else {
          setIsAuth(true);
          setAuth(data);
          setApiKeyId(data.token);
        }
      };
      fetch_data();
    } else signout();
  }, [apiKeyId, client]);

  useEffect(() => {
    if (apiKeyId !== null) {
      client.use({
        async onRequest({ request }) {
          request.headers.set("Authorization", `Bearer ${apiKeyId}`);
          return request;
        },
        async onResponse({ response }) {
          return response;
        },
      });
    }
  }, [apiKeyId, client]);
  return (
    <AuthContext.Provider
      value={{
        auth,
        is_auth,
        setAuth,
        signout,
        client,
        apiKeyId,
        setApiKeyId,
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

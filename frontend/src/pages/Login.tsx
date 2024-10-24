import { useAuth } from "contexts/AuthContext";
import { useLoading } from "contexts/LoadingContext";
import { useAlertQueue } from "hooks/alerts";
import React, { useEffect, useState } from "react";
import { Google } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
const LoginPage: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setName] = useState("");
  const { startLoading, stopLoading } = useLoading();
  const { auth, is_auth, setAuth, client, setApiKeyId } = useAuth();
  const navigate = useNavigate();
  const { addAlert } = useAlertQueue();
  useEffect(() => {
    if (is_auth && auth?.is_auth) navigate("/collections");
  }, [is_auth, auth?.is_auth]);
  // Toggle between login and signup forms
  const handleSwitch = () => {
    setIsSignup(!isSignup);
  };
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Add your logic for login/signup here
    if (isSignup) {
      // You can call your API for sign-up
      startLoading();
      const { data, error } = await client.POST("/user/signup", {
        body: { username, email, password },
      });
      if (error?.detail) addAlert(error.detail.toString(), "error");
      else {
        if (data) {
          setAuth(data);
          setApiKeyId(data?.token);
          addAlert("Welcome! You have been successfully signed up!", "success");
        }
      }
      stopLoading();
    } else {
      // You can call your API for login
      startLoading();
      // const user = await signin({ email, password });
      const { data, error } = await client.POST("/user/signin", {
        body: { email, password },
      });
      if (error) addAlert(error.detail?.toString(), "error");
      else {
        setAuth(data);
        setApiKeyId(data?.token);
        addAlert("Welcome! You have been successfully signed in!", "success");
      }
      stopLoading();
    }
  };

  return (
    <div className="flex flex-wrap rounded-md h-full items-center justify-center bg-gray-3">
      <div className="border border-gray-600 rounded-lg shadow-md p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">
          {isSignup ? "Sign Up" : "Login"}
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {isSignup ? (
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                className="border p-2 w-full rounded"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          ) : (
            <></>
          )}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="border p-2 w-full rounded"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              className="border p-2 w-full rounded"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600"
          >
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        <div className="my-4 flex items-center">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-2 text-gray-600">OR</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        <button className="bg-gray-11 text-white p-2 rounded w-full hover:bg-gray-10 flex flex-wrap items-center justify-center">
          <Google className="mr-2" size={20} />
          {isSignup ? "Sign Up with Google" : "Login with Google"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <span
                onClick={handleSwitch}
                className="text-blue-500 hover:underline cursor-pointer"
              >
                Login here
              </span>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <span
                onClick={handleSwitch}
                className="text-blue-500 hover:underline cursor-pointer"
              >
                Create a new account
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

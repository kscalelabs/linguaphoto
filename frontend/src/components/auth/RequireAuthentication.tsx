import { useAuthentication } from "hooks/auth";
import React from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

const StaticBackground = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1,
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
        opacity: 0.5,
      }}
    />
  );
};

const RequireAuthentication = (props: Props) => {
  const { children } = props;
  const { isAuthenticated } = useAuthentication();

  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate("/");
  }

  return children;
};

export default RequireAuthentication;

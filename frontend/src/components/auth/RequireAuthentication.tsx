import { useAuthentication } from "hooks/auth";
import React from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

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

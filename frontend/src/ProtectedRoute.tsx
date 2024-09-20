import { useAuth } from "contexts/AuthContext";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface PrivateRouteProps {
  element: JSX.Element;
  requiredSubscription?: boolean; // Optional flag for subscription requirement
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  element,
  requiredSubscription = false,
}) => {
  const { auth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth)
      if (!auth?.is_auth) {
        // Redirect to login if not authenticated
        navigate("/login", { replace: true, state: { from: location } });
      } else if (requiredSubscription && !auth?.is_subscription) {
        // Redirect to subscription page if subscription is required and not active
        navigate("/subscription_type", { replace: true });
      }
  }, [auth, requiredSubscription, navigate, location]);

  if (!auth?.is_auth || (requiredSubscription && !auth?.is_subscription)) {
    // Render nothing while redirecting
    return null;
  }

  return element;
};

export default PrivateRoute;

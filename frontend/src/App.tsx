import Content from "components/HOC/Content";
import LoadingMask from "components/LoadingMask";
import Navbar from "components/nav/Navbar";
import NotFoundRedirect from "components/NotFoundRedirect";
import { AuthProvider } from "contexts/AuthContext";
import { LoadingProvider } from "contexts/LoadingContext";
import { SocketProvider } from "contexts/SocketContext";
import { AlertQueue, AlertQueueProvider } from "hooks/alerts";
import { ThemeProvider } from "hooks/theme";
import APIKeyPage from "pages/Apikey";
import CollectionPage from "pages/Collection";
import Collections from "pages/Collections";
import Home from "pages/Home";
import LoginPage from "pages/Login";
import NotFound from "pages/NotFound";
import SubscriptionTypePage from "pages/SubscriptioinType";
import SubscriptionCancelPage from "pages/Subscription";
import PrivateRoute from "PrivateRoute";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <LoadingProvider>
          <AuthProvider>
            <SocketProvider>
              <AlertQueueProvider>
                <AlertQueue>
                  <Content>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/404" element={<NotFound />} />
                      <Route
                        path="/collections"
                        element={
                          <PrivateRoute
                            element={<Collections />}
                            requiredSubscription={true} // Set true if subscription is required for this route
                          />
                        }
                      />
                      <Route
                        path="/collection"
                        element={
                          <PrivateRoute
                            element={<CollectionPage />}
                            requiredSubscription={true} // Set true if subscription is required for this route
                          />
                        }
                      />
                      <Route
                        path="/collection/new"
                        element={
                          <PrivateRoute
                            element={<CollectionPage />}
                            requiredSubscription={true} // Set true if subscription is required for this route
                          />
                        }
                      />
                      <Route
                        path="/collection/:id"
                        element={<CollectionPage />}
                      />
                      <Route
                        path="/subscription"
                        element={
                          <PrivateRoute
                            element={<SubscriptionCancelPage />}
                            requiredSubscription={true} // Set true if subscription is required for this route
                          />
                        }
                      />
                      <Route
                        path="/api-key"
                        element={
                          <PrivateRoute
                            element={<APIKeyPage />}
                            requiredSubscription={true} // Set true if subscription is required for this route
                          />
                        }
                      />
                      <Route path="/login" element={<LoginPage />} />
                      <Route
                        path="/subscription_type"
                        element={<SubscriptionTypePage />}
                      />
                      <Route path="*" element={<NotFoundRedirect />} />
                    </Routes>
                  </Content>
                  <Navbar />
                  {/* <TopNavbar /> */}
                </AlertQueue>
              </AlertQueueProvider>
            </SocketProvider>
          </AuthProvider>
          <LoadingMask />
        </LoadingProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;

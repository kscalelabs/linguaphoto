import "bootstrap/dist/css/bootstrap.min.css";
import LoadingMask from "components/LoadingMask";
import TopNavbar from "components/nav/TopNavbar";
import NotFoundRedirect from "components/NotFoundRedirect";
import { AuthProvider } from "contexts/AuthContext";
import { LoadingProvider } from "contexts/LoadingContext";
import { AlertQueue, AlertQueueProvider } from "hooks/alerts";
import { ThemeProvider } from "hooks/theme";
import CollectionPage from "pages/Collection";
import Collections from "pages/Collections";
import Home from "pages/Home";
import LoginPage from "pages/Login";
import NotFound from "pages/NotFound";
import SubscriptionTypePage from "pages/SubscriptioinType";
import SubscriptionCancelPage from "pages/Subscription";
import Test from "pages/Test";
import PrivateRoute from "ProtectedRoute";
import { Container } from "react-bootstrap";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <LoadingProvider>
          <AuthProvider>
            <AlertQueueProvider>
              <AlertQueue>
                <Container>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/test" element={<Test />} />
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
                      element={
                        <PrivateRoute
                          element={<CollectionPage />}
                          requiredSubscription={true} // Set true if subscription is required for this route
                        />
                      }
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
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                      path="/subscription_type"
                      element={<SubscriptionTypePage />}
                    />
                    <Route path="*" element={<NotFoundRedirect />} />
                  </Routes>
                </Container>
                <TopNavbar />
              </AlertQueue>
            </AlertQueueProvider>
          </AuthProvider>
          <LoadingMask />
        </LoadingProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;

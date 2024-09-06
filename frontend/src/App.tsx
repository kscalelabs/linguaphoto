import "bootstrap/dist/css/bootstrap.min.css";
import TopNavbar from "components/nav/TopNavbar";
import NotFoundRedirect from "components/NotFoundRedirect";
import { AlertQueue, AlertQueueProvider } from "hooks/alerts";
import { AuthenticationProvider, OneTimePasswordWrapper } from "hooks/auth";
import { ThemeProvider } from "hooks/theme";
import { LoadingProvider } from "contexts/LoadingContext";
import { AuthProvider } from "contexts/AuthContext";
import LoadingMask from "components/LoadingMask";
import CollectionPage from "pages/Collection";
import Collections from "pages/Collections";
import Home from "pages/Home";
import LoginPage from "pages/Login";
import NotFound from "pages/NotFound";
import Test from "pages/Test";
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
                    <Route path="/collections" element={<Collections />} />
                    <Route path="/collection" element={<CollectionPage />} />
                    <Route
                      path="/collection/new"
                      element={<CollectionPage />}
                    />
                    <Route
                      path="/collection/:id"
                      element={<CollectionPage />}
                    />
                    <Route path="/login" element={<LoginPage />} />
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

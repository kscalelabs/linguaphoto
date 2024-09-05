import "bootstrap/dist/css/bootstrap.min.css";
import TopNavbar from "components/nav/TopNavbar";
import NotFoundRedirect from "components/NotFoundRedirect";
import { AlertQueue, AlertQueueProvider } from "hooks/alerts";
import { AuthenticationProvider, OneTimePasswordWrapper } from "hooks/auth";
import { ThemeProvider } from "hooks/theme";
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
        <AuthenticationProvider>
          <AlertQueueProvider>
            <AlertQueue>
              <OneTimePasswordWrapper>
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
              </OneTimePasswordWrapper>
            </AlertQueue>
          </AlertQueueProvider>
        </AuthenticationProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ChatInterface from "./pages/ChatInterface";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Layout } from "./components/layout";
import ForgotPassword from "./pages/ForgotPassword";
import LoadingProgress from "./components/app/LoadingProgress";
import VerifyEmail from "./pages/verifyEmail";
import NProgressLoader from "./components/app/Progress";
import { AuthProvider, useAuth } from "./lib/auth/authContext";
import LandingPage from "./pages/Landing";
import { BlurFade } from "./components/ui/blurFade";

function App() {
  return (
    <Layout>
      <AuthProvider>
        <NProgressLoader />
        <AnimatedRoutes />
      </AuthProvider>
    </Layout>
  );
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <BlurFade inView key={location.pathname}>
      <AppRoutes />
    </BlurFade>
  );
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingProgress />;
  }

  return (
    <Routes>
      {isAuthenticated ? (
        <Route path="*" element={<Navigate to="/chat" replace />} />
      ) : (
        <>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </>
      )}

      <Route
        path="/chat"
        element={
          isAuthenticated ? <ChatInterface /> : <Navigate to="/" replace />
        }
      />

      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/chat" : "/"} />}
      />

      <Route path="/" element={<LandingPage />} />
    </Routes>
  );
}

export default App;

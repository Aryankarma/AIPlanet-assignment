import { Routes, Route, Navigate } from "react-router-dom";
import ChatInterface from "./pages/ChatInterface";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Layout } from "./components/layout";
import ForgotPassword from "./pages/ForgotPassword";
import LoadingProgress from "./components/app/LoadingProgress";
import VerifyEmail from "./pages/verifyEmail";
import NProgressLoader from "./components/app/Progress";
import { AuthProvider, useAuth } from "./lib/auth/authContext";

function App() {
  return (
    <Layout>
      <AuthProvider>
        <NProgressLoader />
        <AppRoutes />
      </AuthProvider>
    </Layout>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  console.log("isauth : ", isAuthenticated);

  return (
    <Routes>
      {/* Auth-related routes (should not be accessible when authenticated) */}
      {isAuthenticated ? (
        <Route path="*" element={<Navigate to="/chat" replace />} />
      ) : (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </>
      )}

    {/* Protected route (only accessible when authenticated) */}
      <Route
        path="/chat"
        element={
          isAuthenticated ? <ChatInterface /> : <Navigate to="/login" replace />
        }
      />

      {/* Catch-all route: redirect based on authentication status */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/chat" : "/login"} />}
      />
    </Routes>
  );
}


export default App;

import { Routes, Route, Navigate } from "react-router-dom";
import ChatInterface from "./pages/ChatInterface";
import Login from "./pages/Login";
import Register from './pages/Register'
import { Layout } from "./components/layout";
import ForgotPassword from './pages/ForgotPassword'
import LoadingProgress from "./components/app/LoadingProgress";
import VerifyEmail from "./pages/verifyEmail";
import NProgressLoader from "./components/app/Progress";

const isAuthenticated = () => {
  // Authentication Logic
  return true;
  return localStorage.getItem("authToken") !== null;
};

function App() {
  return (
    <Layout>
      {/* <LoadingProgress /> */}
      <NProgressLoader />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/chat"
          element={
            isAuthenticated() ? (
              <ChatInterface />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="*"
          element={<Navigate to={isAuthenticated() ? "/chat" : "/login"} />}
        />
      </Routes>
    </Layout>
  );
}

export default App;
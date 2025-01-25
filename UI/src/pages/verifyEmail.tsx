import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");
    if (token) {
      verifyEmail(token);
    } else {
      setVerificationStatus("error");
      const noTokenMessage = "No verification token found.";
      setMessage(noTokenMessage);
      toast({
        title: "Error",
        description: noTokenMessage,
      });
    }
  }, [toast, location]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await axios.post<{ message: string }>(
        "/api/verify-email",
        { token }
      );

      // Success handling
      setVerificationStatus("success");
      setMessage(response.data.message);
      toast({
        title: "Success",
        description: response.data.message,
      });

      // Navigate if needed
      navigate("/chat");
    } catch (error: any) {
      // Generic error handling
      setVerificationStatus("error");
      setMessage(error.response?.data?.detail || "Failed to verify email");
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to verify email",
      });
    }
  };

  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <motion.div
        className="p-8 rounded-lg shadow-md  border border-secondary"
        initial="hidden"
        animate="visible"
        variants={variants}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-4 text-2xl font-bold text-center">
          Email Verification
        </h1>
        {verificationStatus === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="mt-2">Verifying your email...</p>
          </div>
        )}
        {verificationStatus === "success" && (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <svg
                className="w-16 h-16 mx-auto text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
            <p className="mt-2">{message}</p>
          </div>
        )}
        {verificationStatus === "error" && (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <svg
                className="w-16 h-16 mx-auto text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.div>
            <p className="mt-2">{message}</p>
          </div>
        )}
        <Button
          className="mt-4 w-full"
          onClick={() => (window.location.href = "/")}
        >
          Return to Home
        </Button>
      </motion.div>
    </div>
  );
}

function AxiosError(arg0: any) {
  throw new Error("Function not implemented.");
}

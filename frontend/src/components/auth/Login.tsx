import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { loginWithEmail, loginWithGoogle } from './firebase';
import { Eye, EyeOff } from "lucide-react";
import logo from '../../logo.png';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { sendEmailVerification, getAuth, sendPasswordResetEmail } from "firebase/auth";
import { motion } from 'framer-motion';
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userCred = await loginWithEmail(formData.email, formData.password);
      const user = userCred.user;

      if (!user.emailVerified) {
        // Replace alert with toast notification
        toast.warning("Please verify your email before logging in", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        // Show resend verification option
        setShowResendVerification(true);
        return;
      }
      const role=await getUserRole();

      toast.success("Login successful!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
      });
      setTimeout(() => navigate('/v1'), 1000);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

const getUserRole = async () => {
  const user = auth.currentUser;
  if (!user) return "normal";  

  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const role = docSnap.data().role || "normal";
      localStorage.setItem("userRole", role);  
      return role;
    }
  } catch (error) {
    console.error("Error fetching role:", error);
    return "normal";  
  }
  
  return "normal";
};


  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      const role = await getUserRole();
      
      toast.success("Login successful!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
      });
      navigate('/v1');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleResendVerification = async () => {
    try {
      // Get current user
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        await sendEmailVerification(currentUser);
        toast.info("Verification email sent! Please check your inbox.", {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        // If no current user, we might need to sign in again
        // This is a simplified approach - in a real app you might want to 
        // handle this differently to avoid requiring password
        toast.error("Unable to send verification email. Please try logging in again.");
      }
    } catch (error: any) {
      toast.error("Failed to send verification email. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black flex items-center justify-center p-4">
      <ToastContainer />
      <div className="min-h-screen bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black flex items-center justify-center p-4">
        <div className="w-full max-w-[1200px] flex rounded-2xl overflow-hidden bg-black/40 backdrop-blur-lg">

          {/* Left Section */}
          <div className="flex-1 p-12 flex flex-col justify-center bg-black/20">
            <div className="flex items-center mb-8">
              <img src={logo} alt="Xen AI" className="w-8 h-8 mr-2 object-contain" />
              <span className="text-white text-xl">Xen AI</span>
            </div>
            <h2 className="text-4xl text-white font-semibold mb-4">Welcome Back!</h2>
            <p className="text-white/70 mb-8">Log in to your account to continue your development journey.</p>
          </div>

          {/* Right Section */}
          <div className="flex-1 bg-black/50 p-12">
            <h2 className="text-2xl text-white font-semibold mb-4">Login to Account</h2>
            <p className="text-white/70 mb-4">Enter your credentials to access your account.</p>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {/* Resend Verification Email */}
            {showResendVerification && (
              <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 mb-2">
                <p className="text-white/90 text-sm mb-1">
                </p>
                <button
                  onClick={handleResendVerification}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Resend verification email
                </button>
              </div>
            )}

            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 bg-black/20 text-white p-3 rounded-lg border border-white/10 hover:bg-purple-900/40 transition-colors w-full mb-4"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Google
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-white/70 bg-black/30">Or</span>
              </div>
            </div>

            {/* Email/Password Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-black/20 text-white p-3 rounded-lg border border-white/10 focus:outline-none focus:border-purple-500"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-black/20 text-white p-3 rounded-lg border border-white/10 focus:outline-none focus:border-purple-500 pr-12"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <motion.button
                type="submit"
                className="w-full bg-white text-black font-medium p-3 rounded-lg hover:bg-white/90 transition-colors flex justify-center items-center"
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                {loading ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  "Login"
                )}
              </motion.button>

            </form>

            <p className="text-white/70 text-center mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-white hover:text-purple-400">Sign up</Link>
            </p>

            <p className="text-white/70 text-center mt-6">
              Forgot Password?
              <Link to="/forgot-password" className="text-blue-400 hover:underline ml-1">
                Reset here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
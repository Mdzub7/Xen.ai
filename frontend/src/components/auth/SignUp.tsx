import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from "lucide-react";
import { signUpWithEmail } from '../auth/firebase';
import { loginWithGoogle } from './firebase';
import { motion } from 'framer-motion';
import { getAuth, sendEmailVerification } from "firebase/auth";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const SignUp: React.FC = () => {
  const navigate = useNavigate();

  // State for form data and password visibility
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
  
    try {
      const userCredential = await signUpWithEmail(formData.email, formData.password);
      const user = userCredential.user; // Ensure user exists
  
      if (user) {
        await sendEmailVerification(user);
              toast.success("Verification Email sent. Please Check your Inbox", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
              })
        setTimeout(()=>navigate('/login'),2000);
      } else {
        throw new Error("User registration failed");
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
            toast.success("Login successful!", {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
            })
      navigate('/v1');
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black flex items-center justify-center p-4">
      <div className="w-full max-w-[1200px] flex rounded-2xl overflow-hidden bg-black/40 backdrop-blur-lg">
        {/* Left Section */}
        <div className="flex-1 p-12 flex flex-col justify-center bg-black/20">
          <div className="flex items-center mb-8">
            <img src="/logo.png" alt="Xen AI" className="w-8 h-8 mr-2 object-contain" />
            <span className="text-white text-xl">Xen AI</span>
          </div>
          <h2 className="text-4xl text-white font-semibold mb-4">Get Started with Us</h2>
          <p className="text-white/70 mb-8">Complete these easy steps to register your account.</p>
        </div>

        {/* Right Section */}
        <div className="flex-1 bg-black/50 p-12">
          <h2 className="text-2xl text-white font-semibold mb-4">Sign Up Account</h2>
          <p className="text-white/70 mb-4">Enter your personal data to create your account.</p>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-2 bg-black/20 text-white p-3 rounded-lg border border-white/10 hover:bg-purple-900/40 transition-colors w-full mb-4"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Google
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-white/70 bg-black/30">Or</span>
            </div>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your Email"
              className="w-full bg-black/20 text-white p-3 rounded-lg border border-white/10 focus:outline-none focus:border-purple-500"
            />

            {/* Password Input with Toggle Visibility */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="w-full bg-black/20 text-white p-3 rounded-lg border border-white/10 focus:outline-none focus:border-purple-500 pr-12"
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

            <p className="text-white/70 text-sm">Must be at least 8 characters.</p>

            {/* Animated Submit Button */}
      <motion.button
        type="submit"
        className="w-full bg-white text-black font-medium p-3 rounded-lg hover:bg-white/90 transition-colors flex justify-center items-center"
        whileTap={{ scale: 0.95 }} // Slight scale effect when clicked
        disabled={isLoading}
      >
        {isLoading ? (
          <motion.div
            className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          "Sign Up"
        )}
      </motion.button>
    </form>

          {/* Login Redirect */}
          <p className="text-white/70 text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-white hover:text-purple-400">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

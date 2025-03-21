import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from "lucide-react";
import { signUpWithEmail } from '../auth/firebase';
import { loginWithGoogle } from './firebase';
import { motion } from 'framer-motion';
import { getAuth, sendEmailVerification } from "firebase/auth";
import type { User } from "firebase/auth";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase"

export const SignUp: React.FC = () => {
  const navigate = useNavigate();

  // State for form data and password visibility
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
  
    if (formData.password !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }
  
    try {
      // Signup the user
      const userCredential = await signUpWithEmail(formData.email, formData.password);
      const user = userCredential.user;
  
      if (user) {
        await storeUserInFirestore(user);
  
        // Send email verification
        await sendEmailVerification(user);
        toast.success("Verification Email sent. Please check your inbox", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
        });
  
        // Redirect to login after 3 seconds
        setTimeout(() => navigate('/login'), 3000);
      } else {
        toast.error("User registration failed");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  

  const storeUserInFirestore = async (user:User) => {
    if (!user) {
      console.error('user object is missing');
      return;
    }
    try{
    const userRef = doc(db, "users", user.uid);
  
    await setDoc(userRef, {
      email: user.email,
      role: "normal",  // Default role
      createdAt: new Date(),
    });
  }
  catch(error){
    console.log('error in storeUserInFirestone')
  }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black flex items-center justify-center p-4">
      <ToastContainer/>
      <div className="w-full max-w-[1200px] flex rounded-2xl overflow-hidden bg-black/40 backdrop-blur-lg">
        <div className="flex-1 p-12 flex flex-col justify-center bg-black/20">
          <div className="flex items-center mb-8">
            <img src="/logo.png" alt="Xen AI" className="w-8 h-8 mr-2 object-contain" />
            <span className="text-white text-xl">Xen AI</span>
          </div>
          <h2 className="text-4xl text-white font-semibold mb-4">Get Started with Us</h2>
          <p className="text-white/70 mb-8">Complete these easy steps to register your account.</p>
        </div>

        <div className="flex-1 bg-black/50 p-12">
          <h2 className="text-2xl text-white font-semibold mb-4">Sign Up Account</h2>
          <p className="text-white/70 mb-4">Enter your personal data to create your account.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your Email"
              className="w-full bg-black/20 text-white p-3 rounded-lg border border-white/10 focus:outline-none focus:border-purple-500"
            />

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
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleInputChange}
                placeholder="Re-Enter your Password"
                className="w-full bg-black/20 text-white p-3 rounded-lg border border-white/10 focus:outline-none focus:border-purple-500 pr-12"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <p className="text-white/70 text-sm">Must be at least 8 characters.</p>

            <motion.button
              type="submit"
              className="w-full bg-white text-black font-medium p-3 rounded-lg hover:bg-white/90 transition-colors flex justify-center items-center"
              whileTap={{ scale: 0.95 }}
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

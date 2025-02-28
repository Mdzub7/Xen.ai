import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEditorStore } from '../../store/editorStore';
import logo from '../../assets/logo.png';  // Add this import

export const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black flex items-center justify-center p-4">
      <div className="w-full max-w-[1200px] flex rounded-2xl overflow-hidden bg-black/40 backdrop-blur-lg">
        {/* Left Section */}
        <div className="flex-1 p-12 flex flex-col justify-center bg-black/20">
          <div className="flex items-center mb-8">
            <img 
              src="/logo.png"
              alt="Xen AI" 
              className="w-8 h-8 mr-2 object-contain"
            />
            <span className="text-white text-xl">Xen AI</span>
          </div>
          <h2 className="text-4xl text-white font-semibold mb-4">Get Started with Us</h2>
          <p className="text-white/70 mb-8">
            Complete these easy steps to register your account.
          </p>
          <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-lg border border-white/20">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-sm mr-3">
                  1
                </div>
                <span className="text-white">Sign up your account</span>
              </div>
            </div>
            <div className="bg-black/20 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm mr-3">
                  2
                </div>
                <span className="text-white/70">Set up your workspace</span>
              </div>
            </div>
            <div className="bg-black/20 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm mr-3">
                  3
                </div>
                <span className="text-white/70">Set up your profile</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex-1 bg-black/50 p-12">
          <h2 className="text-2xl text-white font-semibold mb-4">Sign Up Account</h2>
          <p className="text-white/70 mb-8">
            Enter your personal data to create your account.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button className="flex items-center justify-center gap-2 bg-black/20 text-white p-3 rounded-lg border border-white/10 hover:bg-purple-900/40 transition-colors">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Google
            </button>
            <button className="flex items-center justify-center gap-2 bg-black/20 text-white p-3 rounded-lg border border-white/10 hover:bg-purple-900/40 transition-colors">
              <img src="https://github.com/favicon.ico" alt="GitHub" className="w-5 h-5" />
              Github
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-white/70 bg-black/30">Or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="eg. John"
                className="bg-black/20 text-white p-3 rounded-lg border border-white/10 focus:outline-none focus:border-purple-500"
              />
              <input
                type="text"
                placeholder="eg. Francisco"
                className="bg-black/20 text-white p-3 rounded-lg border border-white/10 focus:outline-none focus:border-purple-500"
              />
            </div>
            <input
              type="email"
              placeholder="eg. johnfrans@gmail.com"
              className="w-full bg-black/20 text-white p-3 rounded-lg border border-white/10 focus:outline-none focus:border-purple-500"
            />
            <div className="relative">
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full bg-black/20 text-white p-3 rounded-lg border border-white/10 focus:outline-none focus:border-purple-500"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2">
                👁️
              </button>
            </div>
            <p className="text-white/70 text-sm">Must be at least 8 characters.</p>
            <button
              type="submit"
              className="w-full bg-white text-black font-medium p-3 rounded-lg hover:bg-white/90 transition-colors"
            >
              Sign Up
            </button>
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
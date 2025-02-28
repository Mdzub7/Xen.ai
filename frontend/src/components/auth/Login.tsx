import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEditorStore } from '../../store/editorStore';
import logo from '../../assets/logo.png';  // Add this import

export const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { login } = useEditorStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
    } catch (error) {
      console.error('Login failed:', error);
    }
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
          <h2 className="text-4xl text-white font-semibold mb-4">Welcome Back!</h2>
          <p className="text-white/70 mb-8">
            Log in to your account to continue your development journey.
          </p>
          <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-lg border border-white/20">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-sm mr-3">
                  1
                </div>
                <span className="text-white">Log in to your account</span>
              </div>
            </div>
            <div className="bg-black/20 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm mr-3">
                  2
                </div>
                <span className="text-white/70">Access your workspace</span>
              </div>
            </div>
            <div className="bg-black/20 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm mr-3">
                  3
                </div>
                <span className="text-white/70">Start coding</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex-1 bg-black/50 p-12">
          <h2 className="text-2xl text-white font-semibold mb-4">Login to Account</h2>
          <p className="text-white/70 mb-8">
            Enter your credentials to access your account.
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
            <input
              type="email"
              placeholder="eg. johnfrans@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-black/20 text-white p-3 rounded-lg border border-white/10 focus:outline-none focus:border-purple-500"
            />
            <div className="relative">
              <input
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-black/20 text-white p-3 rounded-lg border border-white/10 focus:outline-none focus:border-purple-500"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70">
                👁️
              </button>
            </div>
            <div className="flex justify-end">
              <button type="button" className="text-sm text-white/70 hover:text-purple-400">
                Forgot password?
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-white text-black font-medium p-3 rounded-lg hover:bg-white/90 transition-colors"
            >
              Login
            </button>
          </form>

          <p className="text-white/70 text-center mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-white hover:text-purple-400">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
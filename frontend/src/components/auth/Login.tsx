import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { loginWithEmail, loginWithGoogle } from './firebase';
import logo from '../../logo.png';
import { useNavigate } from 'react-router-dom';




export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginWithEmail(formData.email, formData.password);
      alert("Login successful!");
      navigate('/v1')
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      alert("Google login successful!");
      navigate('/v1')
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

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-2 bg-black/20 text-white p-3 rounded-lg border border-white/10 hover:bg-purple-900/40 transition-colors w-full mb-4"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Continue with Google
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
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-black/20 text-white p-3 rounded-lg border border-white/10 focus:outline-none focus:border-purple-500"
              required
            />
            <button
              type="submit"
              className="w-full bg-white text-black font-medium p-3 rounded-lg hover:bg-white/90 transition-colors"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-white/70 text-center mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-white hover:text-purple-400">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

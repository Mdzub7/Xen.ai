import { useState } from "react";
import { sendResetEmail,auth } from "./auth/firebase"; 
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async () => {
    if (!email) {
      setError("Please enter a valid email.");
      return;
    }
    
    try {
      await sendResetEmail(auth, email);
      setMessage("Password reset email sent. Check your inbox!");
      setError("");
    } catch (err: any) {
      setError("Failed to send reset email. Try again.");
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h2 className="text-2xl mb-4">Reset Your Password</h2>
      {message && <p className="text-green-400">{message}</p>}
      {error && <p className="text-red-400">{error}</p>}
      
      <input
        type="email"
        placeholder="Enter your email"
        className="p-2 border rounded text-blue w-80"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      
      <button 
        onClick={handleReset} 
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
      >
        Send Reset Link
      </button>

      <Link to="/login" className="mt-4 text-blue-400 hover:underline">
        Back to Login
      </Link>
    </div>
  );
};

export default ForgotPassword;

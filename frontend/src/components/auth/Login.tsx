import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginWithEmail, loginWithGoogle } from './firebase'; // Adjust path as needed
import { Eye, EyeOff, Code, Github, Loader2, ArrowLeft } from "lucide-react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { sendEmailVerification, getAuth, sendPasswordResetEmail } from "firebase/auth";
import { motion } from 'framer-motion';
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase"; // Adjust path as needed

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
                setLoading(false);
                return;
            }
            const role = await getUserRole();

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
            const authInstance = getAuth(); // Use getAuth()
            const currentUser = authInstance.currentUser;

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

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 },
        },
        exit: {
            opacity: 0,
            x: "-100vw",
            transition: { ease: "easeInOut" },
        },
    };

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-50">
            <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800/50">
                <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                    <Link to="/" className="flex items-center gap-2">
                        <motion.div
                            initial={{ rotate: -10 }}
                            animate={{ rotate: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Code className="h-6 w-6 text-violet-400" />
                        </motion.div>
                        <motion.span
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-500"
                        >
                            XenAI
                        </motion.span>
                    </Link>
                </div>
            </header>
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
                <ToastContainer />
                {/* Background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-[30%] -left-[10%] w-[50%] h-[70%] bg-violet-900/5 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-[30%] -right-[10%] w-[50%] h-[70%] bg-fuchsia-900/5 rounded-full blur-3xl"></div>

                    {/* Grid pattern */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMC41IiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDYwTDYwIDAiLz48L2c+PC9zdmc+')] opacity-10"></div>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-4 left-4 md:top-8 md:left-8 z-10"
                >
                    <Link
                        to="/"
                        className="flex items-center text-sm font-medium text-zinc-400 hover:text-violet-400 transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to home
                    </Link>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="w-full max-w-md relative z-10"
                >
                    <div className="flex flex-col items-center mb-8">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 mb-4"
                        >
                            <Code className="h-6 w-6 text-white" />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-white mb-2">Welcome Back!</h1>
                        <p className="text-sm text-zinc-400 text-center">Log in to your account to continue your development journey.</p>
                    </div>

                    <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-2xl shadow-violet-900/10 overflow-hidden">
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-zinc-300">
                                    Email
                                </label>
                                <motion.div whileFocus={{ scale: 1.01 }} className="relative">
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-md text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all duration-200"
                                        required
                                    />
                                </motion.div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium text-zinc-300">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-md text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent pr-12 transition-all duration-200"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-violet-400"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>


                            {error && <p className="text-red-500 mb-4">{error}</p>}

                            {/* Resend Verification Email */}
                            {showResendVerification && (
                                <div className="bg-blue-900/30 border border-blue-500/30 rounded-md p-3 mb-2">
                                    <p className="text-white/90 text-sm mb-1">
                                        Please verify your email before logging in.
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

                            <motion.button
                                type="submit"
                                className="w-full py-2 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium rounded-md shadow-lg shadow-violet-900/20 flex items-center justify-center transition-all duration-200 disabled:opacity-70"
                                whileTap={{ scale: 0.95 }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Logging in...
                                    </>
                                ) : (
                                    "Login"
                                )}
                            </motion.button>
                        </form>

                        <div className="p-6 border-t border-zinc-800 space-y-4">
                            <div className="text-sm text-center text-zinc-400">
                                Don't have an account?{" "}
                                <Link to="/signup" className="text-violet-400 hover:underline">
                                    Sign up
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-zinc-800" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-zinc-900 px-2 text-zinc-400">Or continue with</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleGoogleLogin}
                                    type="button"
                                    className="w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-medium rounded-md flex items-center justify-center gap-2 transition-all duration-200"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                        <path d="M1 1h22v22H1z" fill="none" />
                                    </svg>
                                    Google
                                </motion.button>
                            </div>
                        </div>
                    </div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="mt-8 text-center text-xs text-zinc-500"
                    >
                        By logging in, you agree to our{" "}
                        <Link to="/terms" className="text-violet-400 hover:underline">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link to="/privacy" className="text-violet-400 hover:underline">
                            Privacy Policy
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

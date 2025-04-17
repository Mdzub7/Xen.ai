import { Link } from "react-router-dom"
import { Code, ExternalLink, Github, Layers, Shield, Sparkles, Zap } from 'lucide-react'
import { motion } from "framer-motion"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-50">
      {/* Navigation */}
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
          <nav className="hidden md:flex gap-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Link to="/features" className="text-sm font-medium hover:text-violet-400 transition-colors duration-200">
                Features
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Link to="/pricing" className="text-sm font-medium hover:text-violet-400 transition-colors duration-200">
                Pricing
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Link to="/docs" className="text-sm font-medium hover:text-violet-400 transition-colors duration-200">
                Documentation
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Link to="/about" className="text-sm font-medium hover:text-violet-400 transition-colors duration-200">
                About
              </Link>
            </motion.div>
          </nav>
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Link to="/login">
                <button className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors duration-200">
                  Login
                </button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.7 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/signup">
                <button className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-md shadow-lg shadow-violet-900/30 transition-all duration-200">
                  Sign Up
                </button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.8 }}
              className="hidden md:block"
            >
              <Link to="/v1">
                <button className="px-4 py-2 text-sm font-medium border border-zinc-700 hover:border-violet-500 text-zinc-300 hover:text-violet-400 rounded-md transition-all duration-200">
                  Open Editor
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 overflow-hidden relative">
          {/* Background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-[30%] -left-[10%] w-[50%] h-[70%] bg-violet-900/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-[30%] -right-[10%] w-[50%] h-[70%] bg-fuchsia-900/10 rounded-full blur-3xl"></div>
            
            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMC41IiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDYwTDYwIDAiLz48L2c+PC9zdmc+')] opacity-10"></div>
          </div>

          <div className="container px-4 md:px-6 relative">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="flex flex-col justify-center space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 text-xs font-medium bg-violet-900/30 text-violet-400 rounded-full border border-violet-800/50">
                      AI-Powered
                    </span>
                    <span className="px-3 py-1 text-xs font-medium bg-fuchsia-900/30 text-fuchsia-400 rounded-full border border-fuchsia-800/50">
                      Beta
                    </span>
                  </div>
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-white">
                    <span className="block">Elevate Your Code with</span>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-500">
                      AI-Powered Reviews
                    </span>
                  </h1>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="max-w-[600px] text-zinc-400 md:text-xl"
                  >
                    Get instant, intelligent feedback on your code. Improve quality, catch bugs, and learn best
                    practices with our advanced AI engine.
                  </motion.p>
                </div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="flex flex-col gap-3 min-[400px]:flex-row"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link to="/signup">
                      <button className="w-full px-6 py-3 text-sm font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-md shadow-lg shadow-violet-900/30 transition-all duration-200 flex items-center justify-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Get Started Free
                      </button>
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link to="/v1">
                      <button className="w-full px-6 py-3 text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-md transition-all duration-200 flex items-center justify-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Try Demo
                      </button>
                    </Link>
                  </motion.div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="flex items-center gap-4 mt-6 text-sm text-zinc-500"
                >
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-white">JD</div>
                    <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-white">MK</div>
                    <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-white">AS</div>
                  </div>
                  <span>Trusted by 10,000+ developers</span>
                </motion.div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="mx-auto lg:mx-0 relative"
              >
                <div className="relative h-[400px] w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-2xl shadow-violet-900/10">
                  <div className="absolute top-0 left-0 right-0 h-8 bg-zinc-800/50 flex items-center px-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-600"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-600"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-600"></div>
                    </div>
                    <div className="mx-auto text-xs text-zinc-500">code-review.js</div>
                  </div>
                  <div className="p-6 pt-12 h-full flex flex-col">
                    <div className="flex-1 font-mono text-sm overflow-hidden">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      >
                        <pre className="text-zinc-400">
                          <span className="text-zinc-500">// Original code</span>
                          <br />
                          <span className="text-fuchsia-400">function</span> <span className="text-violet-400">calculateTotal</span><span className="text-zinc-300">(items) {`{`}</span>
                          <br />
                          <span className="text-zinc-300">  let total = 0;</span>
                          <br />
                          <span className="text-zinc-300">  </span>
                          <br />
                          <span className="text-zinc-300">  for (let i = 0; i {'<'} items.length; i++) {`{`}</span>
                          <br />
                          <span className="text-zinc-300">    total += items[i].price;</span>
                          <br />
                          <span className="text-zinc-300">  {`}`}</span>
                          <br />
                          <span className="text-zinc-300">  </span>
                          <br />
                          <span className="text-zinc-300">  return total;</span>
                          <br />
                          <span className="text-zinc-300">{`}`}</span>
                        </pre>
                      </motion.div>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                      className="mt-4 p-3 bg-gradient-to-r from-violet-900/20 to-fuchsia-900/20 rounded-lg border border-violet-800/30"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-violet-400" />
                        <span className="text-sm font-medium text-violet-400">AI Suggestion</span>
                      </div>
                      <p className="text-xs text-zinc-300 mb-2">
                        Consider using <code className="text-fuchsia-400 bg-fuchsia-900/20 px-1 rounded">reduce()</code> for better performance and readability:
                      </p>
                      <pre className="text-xs bg-zinc-800/50 p-2 rounded-md overflow-x-auto text-zinc-300">
                        <span className="text-fuchsia-400">function</span> <span className="text-violet-400">calculateTotal</span><span className="text-zinc-300">(items) {`{`}</span>
                        <br />
                        <span className="text-zinc-300">  return items.</span><span className="text-violet-400">reduce</span><span className="text-zinc-300">((total, item) = total + item.price, 0);</span>
                        <br />
                        <span className="text-zinc-300"> / </span>
                      </pre>
                    </motion.div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1 }}
                  className="absolute -bottom-6 -left-6 p-3 bg-zinc-800/90 backdrop-blur-sm rounded-lg border border-zinc-700/50 shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-400" />
                    <span className="text-xs font-medium text-green-400">Security Check Passed</span>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="absolute -top-6 -right-6 p-3 bg-zinc-800/90 backdrop-blur-sm rounded-lg border border-zinc-700/50 shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-400" />
                    <span className="text-xs font-medium text-amber-400">Performance +40%</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950"></div>
          <div className="container px-4 md:px-6 relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <div className="inline-block rounded-full bg-violet-900/20 px-3 py-1 text-sm text-violet-400 ring-1 ring-inset ring-violet-700/20 mb-4">
                Features
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                  Supercharge Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-500">Development</span>
                </h2>
                <p className="max-w-[900px] text-zinc-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our AI-powered code reviewer helps you write better code faster
                </p>
              </div>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="h-6 w-6 text-violet-400" />,
                  title: "Instant Feedback",
                  description: "Get real-time code analysis and suggestions as you type with our advanced AI engine",
                  delay: 0.2
                },
                {
                  icon: <Shield className="h-6 w-6 text-violet-400" />,
                  title: "Security Scanning",
                  description: "Identify vulnerabilities and security issues before they reach production",
                  delay: 0.4
                },
                {
                  icon: <Layers className="h-6 w-6 text-violet-400" />,
                  title: "Best Practices",
                  description: "Learn and apply industry best practices with contextual suggestions tailored to your code",
                  delay: 0.6
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: feature.delay }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="flex flex-col items-center space-y-4 rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 shadow-lg"
                >
                  <div className="rounded-full bg-violet-900/20 p-3 ring-1 ring-violet-700/20">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                  <p className="text-sm text-zinc-400 text-center">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="w-full py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950"></div>
          
          {/* Background elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(120,58,180,0.1)_0,rgba(29,27,38,0)_50%)]"></div>
          
          <div className="container px-4 md:px-6 relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
            >
              <div className="inline-block rounded-full bg-fuchsia-900/20 px-3 py-1 text-sm text-fuchsia-400 ring-1 ring-inset ring-fuchsia-700/20 mb-4">
                Workflow
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                  How It <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-500">Works</span>
                </h2>
                <p className="max-w-[900px] text-zinc-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Three simple steps to better code
                </p>
              </div>
            </motion.div>
            
            <div className="relative">
              {/* Connection line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 transform -translate-y-1/2 hidden md:block"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {[
                  {
                    number: "01",
                    title: "Sign Up",
                    description: "Create your account in seconds and get started right away",
                    delay: 0.2
                  },
                  {
                    number: "02",
                    title: "Open Editor",
                    description: "Paste your code or start writing in our intelligent editor",
                    delay: 0.4
                  },
                  {
                    number: "03",
                    title: "Get Reviews",
                    description: "Receive instant AI-powered feedback and suggestions",
                    delay: 0.6
                  }
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: step.delay }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center space-y-4 relative"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xl font-bold relative z-10"
                    >
                      {step.number}
                    </motion.div>
                    <h3 className="text-xl font-bold text-white">{step.title}</h3>
                    <p className="text-sm text-zinc-400 text-center max-w-xs">
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              viewport={{ once: true }}
              className="flex justify-center mt-16"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/signup">
                  <button className="px-8 py-3 text-sm font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-md shadow-lg shadow-violet-900/30 transition-all duration-200">
                    Start Reviewing Your Code
                  </button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950"></div>
          
          {/* Background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-violet-600/10 to-fuchsia-600/5 blur-3xl rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-violet-600/10 to-fuchsia-600/5 blur-3xl rounded-full"></div>
          </div>
          
          <div className="container px-4 md:px-6 relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-8 md:p-12 shadow-2xl shadow-violet-900/10 relative overflow-hidden"
            >
              {/* Glow effect */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-fuchsia-600 rounded-full opacity-20 blur-3xl"></div>
              
              <div className="relative">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-white">
                      Ready to improve your code?
                    </h2>
                    <p className="max-w-[600px] mx-auto text-zinc-400 md:text-xl/relaxed">
                      Join thousands of developers who write better code with XenAI
                    </p>
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="flex flex-col sm:flex-row gap-3 mt-4"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link to="/signup">
                        <button className="w-full px-8 py-3 text-sm font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-md shadow-lg shadow-violet-900/30 transition-all duration-200">
                          Sign Up Free
                        </button>
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link to="/pricing">
                        <button className="w-full px-8 py-3 text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-md transition-all duration-200">
                          View Pricing
                        </button>
                      </Link>
                    </motion.div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-2 mt-6"
                  >
                    <Github className="h-4 w-4 text-zinc-400" />
                    <span className="text-sm text-zinc-400">Also available on GitHub</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12 relative">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-2">
                <Code className="h-5 w-5 text-violet-400" />
                <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-500">
                  XenAI
                </span>
              </Link>
              <p className="text-sm text-zinc-400">
                AI-powered code reviews to help you write better code, faster.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-zinc-400 hover:text-violet-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                  </svg>
                </a>
                <a href="#" className="text-zinc-400 hover:text-violet-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                  </svg>
                </a>
                <a href="#" className="text-zinc-400 hover:text-violet-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/features" className="text-zinc-400 hover:text-violet-400 transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="text-zinc-400 hover:text-violet-400 transition-colors">Pricing</Link></li>
                <li><Link to="/integrations" className="text-zinc-400 hover:text-violet-400 transition-colors">Integrations</Link></li>
                <li><Link to="/changelog" className="text-zinc-400 hover:text-violet-400 transition-colors">Changelog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/docs" className="text-zinc-400 hover:text-violet-400 transition-colors">Documentation</Link></li>
                <li><Link to="/api" className="text-zinc-400 hover:text-violet-400 transition-colors">API</Link></li>
                <li><Link to="/guides" className="text-zinc-400 hover:text-violet-400 transition-colors">Guides</Link></li>
                <li><Link to="/blog" className="text-zinc-400 hover:text-violet-400 transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="text-zinc-400 hover:text-violet-400 transition-colors">About</Link></li>
                <li><Link to="/contact" className="text-zinc-400 hover:text-violet-400 transition-colors">Contact</Link></li>
                <li><Link to="/privacy" className="text-zinc-400 hover:text-violet-400 transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="text-zinc-400 hover:text-violet-400 transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-zinc-500">© 2025 XenAI. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link to="/privacy" className="text-xs text-zinc-500 hover:text-violet-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-xs text-zinc-500 hover:text-violet-400 transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-xs text-zinc-500 hover:text-violet-400 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}


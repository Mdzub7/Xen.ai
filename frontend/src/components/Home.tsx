import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black overflow-y-auto">
      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-[1200px] flex rounded-2xl overflow-hidden bg-black/40 backdrop-blur-lg">
          {/* Left Section */}
          <div className="flex-1 p-12 flex flex-col justify-center bg-black/20">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center mb-8"
            >
              <img 
                src="/logo.png"
                alt="Xen AI"
                className="w-32 h-32 object-contain hover:scale-105 transition-transform duration-300"
              />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-5xl text-white font-bold mb-6">Xen AI</h1>
              <p className="text-white/70 text-xl mb-8 leading-relaxed">
                Transform your coding experience with our next-generation AI-powered development environment. 
                Built for developers who demand excellence, Xen AI brings intelligence to every keystroke.
              </p>
            </motion.div>
            <div className="space-y-4">
              {[
                { number: 1, title: "AI-Powered Code Assistance", active: false },
                { number: 2, title: "Real-time Collaboration", active: false },
                { number: 3, title: "Smart Code Management", active: false }
              ].map((item) => (
                <motion.div
                  key={item.number}
                  className={`${item.active ? 'bg-white/10' : 'bg-black/20'} p-4 rounded-lg border border-white/10 hover:border-white/30 transition-all cursor-pointer`}
                  whileHover={{ scale: 1.02, x: 10 }}
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full ${item.active ? 'bg-white text-black' : 'bg-white/20 text-white'} flex items-center justify-center text-lg mr-3`}>
                      {item.number}
                    </div>
                    <span className={`${item.active ? 'text-white' : 'text-white/70'} text-lg`}>{item.title}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex-1 bg-black/50 p-12 flex flex-col justify-center">
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-3xl text-white font-semibold mb-8">Begin Your Journey</h2>
              <p className="text-white/70 mb-8 text-lg">
                Join thousands of developers who have already elevated their coding experience. 
                Start building smarter, faster, and more efficiently with Xen AI.
              </p>
              <div className="space-y-4">
                <Link 
                  to="/login"
                  className="block w-full bg-[#1E293B] text-white font-medium p-4 rounded-lg hover:bg-[#2D3748] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Login
                </Link>
                <Link 
                  to="/signup"
                  className="block w-full bg-[#0F172A] text-white font-medium p-4 rounded-lg border border-white/10 hover:bg-[#1E293B] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sign Up
                </Link>
                <Link 
                  to="/v1/"
                  className="block w-full bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white font-medium p-4 rounded-lg hover:from-[#1E293B] hover:to-[#2D3748] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Open Editor
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black"
      >
        <div className="w-full max-w-[1200px] p-12 space-y-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl text-white font-bold text-center mb-16"
          >
            Elevate Your Development Experience
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "AI-Powered Intelligence",
                description: "Advanced code suggestions and real-time error detection powered by cutting-edge AI models.",
                icon: "🤖",
                delay: 0.2
              },
              {
                title: "Smart Collaboration",
                description: "Work seamlessly with your team in real-time with built-in version control and sharing features.",
                icon: "👥",
                delay: 0.3
              },
              {
                title: "Lightning Fast Performance",
                description: "Optimized for speed and efficiency, ensuring smooth coding experience even with large projects.",
                icon: "⚡",
                delay: 0.4
              },
              {
                title: "Cross-Platform Support",
                description: "Code anywhere, anytime with full support for all major platforms and programming languages.",
                icon: "🌐",
                delay: 0.5
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: feature.delay }}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(0,0,0,0.6)' }}
                className="bg-black/40 rounded-xl p-8 border border-white/10 hover:border-white/30 transition-all backdrop-blur-sm"
              >
                <span className="text-4xl mb-4 block">{feature.icon}</span>
                <h3 className="text-2xl text-white font-semibold mb-4">{feature.title}</h3>
                <p className="text-white/70 text-lg leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Statistics Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-black via-[#0F1A2B] to-[#0A192F]"
      >
        <div className="w-full max-w-[1200px] p-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h2 className="text-4xl text-white font-bold">Trusted by Developers Worldwide</h2>
              <p className="text-white/70 text-xl leading-relaxed">
                Join thousands of developers who have already transformed their coding workflow with Xen AI.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { number: "10K+", label: "Active Users" },
                  { number: "50M+", label: "Lines of Code" },
                  { number: "100+", label: "Languages" },
                  { number: "24/7", label: "Support" }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-black/40 p-6 rounded-lg border border-white/10 hover:border-white/30 transition-all"
                  >
                    <div className="text-3xl text-white font-bold mb-2">{stat.number}</div>
                    <div className="text-white/70">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            {/* Statistics Section - Updated image size */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-full"
            >
              <div className="aspect-[16/10] rounded-2xl overflow-hidden border border-white/10">
                <img 
                  src="/editor-preview.png" 
                  alt="Xen AI Editor"
                  className="w-full h-full object-contain bg-black/40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-r from-[#0A192F] to-[#0F1A2B] rounded-full blur-2xl opacity-60" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Call to Action Section - Updated with logo */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#0A192F] to-black relative overflow-hidden"
      >
        <div className="absolute opacity-10 right-0 top-1/2 -translate-y-1/2">
          <img 
            src="/logo.png"
            alt="Xen AI Watermark"
            className="w-96 h-96 object-contain"
          />
        </div>
        <div className="w-full max-w-[1200px] text-center p-12 relative z-10">
          <h2 className="text-4xl text-white font-bold mb-8">Ready to Transform Your Development Experience?</h2>
          <p className="text-white/70 text-xl mb-12 max-w-2xl mx-auto">
            Join our community of innovative developers and experience the future of coding today. 
            Start your journey with Xen AI and elevate your development workflow.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-block"
          >
            <Link 
              to="/signup"
              className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white font-medium px-8 py-4 rounded-lg text-xl hover:from-[#1E293B] hover:to-[#2D3748] transition-all"
            >
              Get Started Now
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};
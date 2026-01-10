import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminLoginProps {
  onAuthenticated: () => void;
}

const ADMIN_PASSCODE = 'Ajdel2026';

const AdminLogin: React.FC<AdminLoginProps> = ({ onAuthenticated }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passcode === ADMIN_PASSCODE) {
      // Store authentication in session
      sessionStorage.setItem('ajdel_admin_auth', 'true');
      onAuthenticated();
    } else {
      setError('Invalid passcode');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setPasscode('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1f405f] via-[#0b253c] to-[#07192d] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-2xl mx-auto mb-4 overflow-hidden">
            <img 
              src="/images/BrandLogoGif.gif" 
              alt="AJDEL Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-[#F2BF97] text-2xl font-bold">AJDEL Admin</h1>
          <p className="text-white/40 text-sm mt-2">Enter passcode to continue</p>
        </div>

        {/* Login Form */}
        <motion.form
          onSubmit={handleSubmit}
          animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-white/60 text-sm mb-2 font-medium">
                Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError('');
                }}
                placeholder="Enter admin passcode"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#F2BF97]/50 focus:ring-2 focus:ring-[#F2BF97]/20 transition-all"
                autoFocus
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-400 text-sm"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="w-full py-3 bg-[#F2BF97] text-[#0b253c] font-bold rounded-xl hover:bg-[#ECDAD2] active:scale-[0.98] transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Access Dashboard
            </button>
          </div>
        </motion.form>

        {/* Back Link */}
        <div className="text-center mt-6">
          <a 
            href="/" 
            className="text-white/40 text-sm hover:text-white/60 transition-colors"
          >
            ← Back to Store
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;


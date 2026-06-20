import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background elements */}
      <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute bottom-[0%] -left-[10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[100px]" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative z-10 premium-shadow"
      >
        <div className="p-8 sm:p-10">
          <div className="flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary text-white p-2 rounded-xl group-hover:scale-105 transition-transform">
                <GraduationCap className="w-8 h-8" />
              </div>
            </Link>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-white mb-2">Reset Password</h2>
          
          {submitted ? (
            <div className="text-center">
              <p className="text-slate-400 mb-8">
                If an account exists for <span className="font-bold text-white">{email}</span>, we have sent a password reset link.
              </p>
              <Link to="/login">
                <Button className="w-full h-12 text-lg font-bold bg-secondary text-white hover:bg-slate-700 border-0">
                  Return to login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <p className="text-slate-400 text-center mb-8">Enter your email address and we'll send you a link to reset your password.</p>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      type="email" 
                      required 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 pl-10 pr-4 rounded-[var(--radius-sm)] border border-slate-700 bg-slate-800/50 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" 
                      placeholder="name@example.com"
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full h-12 text-lg font-bold bg-gradient-premium border-0 mt-2">
                  Send Reset Link <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </>
          )}

          <p className="mt-8 text-center text-sm text-slate-400">
            Remembered your password? <Link to="/login" className="font-bold text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

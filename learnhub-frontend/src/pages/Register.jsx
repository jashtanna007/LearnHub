import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    try {
      // register() in AuthContext calls register API then auto-logs in and returns userData
      const userData = await register(formData.name, formData.email, formData.password, formData.role);
      // Redirect based on role
      if (userData.role === 'instructor') {
        navigate('/instructor/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background elements */}
      <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute bottom-[0%] -left-[10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[100px]" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={shake ? { x: [-10, 10, -10, 10, 0] } : { opacity: 1, y: 0 }}
        transition={shake ? { duration: 0.4 } : { duration: 0.5 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative z-10 premium-shadow my-8"
      >
        <div className="p-8 sm:p-10">
          <div className="flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary text-white p-2 rounded-xl group-hover:scale-105 transition-transform">
                <GraduationCap className="w-8 h-8" />
              </div>
            </Link>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-white mb-2">Create an account</h2>
          <p className="text-slate-400 text-center mb-8">Join LearnHub to start your journey.</p>
          
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  name="name"
                  required 
                  value={formData.name} 
                  onChange={handleChange}
                  className="w-full h-12 pl-10 pr-4 rounded-lg border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" 
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="email" 
                  name="email"
                  required 
                  value={formData.email} 
                  onChange={handleChange}
                  className="w-full h-12 pl-10 pr-4 rounded-lg border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" 
                  placeholder="name@example.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  required 
                  value={formData.password} 
                  onChange={handleChange}
                  className="w-full h-12 pl-10 pr-12 rounded-lg border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" 
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-3">I want to</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`cursor-pointer border rounded-lg p-4 text-center transition-all ${
                  formData.role === 'student' ? 'border-primary bg-primary/10 text-white' : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-500'
                }`}>
                  <input type="radio" name="role" value="student" className="hidden" checked={formData.role === 'student'} onChange={handleChange} />
                  <span className="font-bold">Student</span>
                </label>
                <label className={`cursor-pointer border rounded-lg p-4 text-center transition-all ${
                  formData.role === 'instructor' ? 'border-primary bg-primary/10 text-white' : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-500'
                }`}>
                  <input type="radio" name="role" value="instructor" className="hidden" checked={formData.role === 'instructor'} onChange={handleChange} />
                  <span className="font-bold">Instructor</span>
                </label>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 text-lg font-bold bg-gradient-premium border-0 mt-4 active:scale-[0.98] transition-transform disabled:opacity-60"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : (
                <>Create Account <ArrowRight className="w-5 h-5 ml-2" /></>
              )}
            </Button>
          </form>

          <div className="mt-8 flex items-center">
            <div className="flex-1 border-t border-slate-700"></div>
            <span className="px-3 text-sm text-slate-500 font-medium">Or continue with</span>
            <div className="flex-1 border-t border-slate-700"></div>
          </div>

          <div className="mt-6">
            <button 
              type="button" 
              onClick={() => { setError('Google login coming soon. Please use email registration.'); setShake(true); setTimeout(() => setShake(false), 500); }} 
              className="w-full flex items-center justify-center gap-2 h-12 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 24c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 21.53 7.7 24 12 24z" /><path fill="#FBBC05" d="M5.84 15.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V8.07H2.18C1.43 9.55 1 11.22 1 13s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.36 14.97 0 12 0 7.7 0 3.99 2.47 2.18 6.07l3.66 2.84c.87-2.6 3.3-4.16 6.16-4.16z" /></svg> 
              Google
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-slate-400">
            Already have an account? <Link to="/login" className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

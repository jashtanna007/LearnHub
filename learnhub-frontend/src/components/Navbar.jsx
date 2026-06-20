import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, GraduationCap, Menu, X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Handle scroll for navbar shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle dark mode setup - check localStorage first
  useEffect(() => {
    const stored = localStorage.getItem('learnhub_dark_mode');
    if (stored === 'true' || (!stored && document.documentElement.classList.contains('dark'))) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('learnhub_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('learnhub_dark_mode', 'false');
    }
  };


  const isPlayer = location.pathname.includes('/learn');

  if (isPlayer) return null; // Player has its own specific top bar or no top bar.

  return (
    <>
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'glass shadow-sm py-3' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-4 lg:px-8 max-w-[1280px]">
          <div className="flex items-center justify-between">
            
            {/* Left: Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                LearnHub
              </span>
            </Link>



            {/* Right: Actions */}
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={toggleDarkMode}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-full transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {user ? (
                <div className="flex items-center gap-4">
                  <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
                  </button>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm overflow-hidden">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] overflow-hidden bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
                          style={{ zIndex: 9999 }}
                        >
                          <div className="p-4 border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
                            <p className="font-semibold text-sm text-[#111827] dark:text-[#F1F5F9] truncate">{user.name}</p>
                            <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] truncate">{user.email}</p>
                            <div className="mt-2 inline-block px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold uppercase tracking-wider">
                              {user.role}
                            </div>
                          </div>
                          <div className="p-2 flex flex-col gap-1 bg-white dark:bg-[#1E293B]">
                            <Link 
                              to={user.role === 'admin' ? '/admin/panel' : user.role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard'}
                              className="px-3 py-2 text-sm font-medium text-[#111827] dark:text-[#F1F5F9] hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                              onClick={() => setDropdownOpen(false)}
                            >
                              My Dashboard
                            </Link>
                            <Link 
                              to="/profile"
                              className="px-3 py-2 text-sm font-medium text-[#111827] dark:text-[#F1F5F9] hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                              onClick={() => setDropdownOpen(false)}
                            >
                              Profile Settings
                            </Link>
                            <div className="h-px bg-slate-200 dark:bg-slate-600 my-1"></div>
                            <button 
                              onClick={() => { logout(); setDropdownOpen(false); window.location.href = '/login'; }}
                              className="w-full text-left px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                            >
                              Log out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login">
                    <Button variant="ghost" className="font-semibold">Log in</Button>
                  </Link>
                  <Link to="/register">
                    <Button className="font-semibold bg-gradient-premium">Sign up</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button 
              className="md:hidden p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden fixed top-[72px] left-0 w-full bg-card border-b border-border shadow-lg z-40 overflow-hidden"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              <button 
                onClick={toggleDarkMode}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground bg-secondary/50 rounded-lg"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>

              {user ? (
                <>
                  <div className="h-px bg-border my-2"></div>
                  <div className="flex items-center gap-3 px-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground uppercase">{user.role}</p>
                    </div>
                  </div>
                  <Link 
                    to={user.role === 'admin' ? '/admin/panel' : user.role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard'}
                    className="px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/profile"
                    className="px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button 
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="text-left px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 mt-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center">Log in</Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-center bg-gradient-premium">Sign up</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

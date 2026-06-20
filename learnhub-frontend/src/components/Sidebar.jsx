import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, BookOpen, Award, User, LogOut, Shield, BarChart3 } from 'lucide-react';

export default function Sidebar({ activeSection, onSectionChange }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  // For student and instructor, some links trigger section changes
  // within the same dashboard (no navigation), others navigate to new pages.
  const studentLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, section: 'dashboard' },
    { name: 'My Courses', icon: BookOpen, section: 'courses' },
    { name: 'Certificates', icon: Award, section: 'certificates' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  const instructorLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, section: 'dashboard' },
    { name: 'My Courses', icon: BookOpen, section: 'courses' },
    { name: 'Analytics', icon: BarChart3, section: 'analytics' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  const adminLinks = [
    { name: 'Overview', icon: Shield, path: '/admin/panel' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  const navLinks = user.role === 'admin' ? adminLinks : user.role === 'instructor' ? instructorLinks : studentLinks;

  const handleClick = (link) => {
    if (link.path) {
      // Navigate to a different page
      navigate(link.path);
    } else if (link.section && onSectionChange) {
      // Switch section within the same dashboard page
      onSectionChange(link.section);
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-[260px] h-[calc(100vh-76px)] sticky top-[76px] border-r bg-[color:var(--card)] z-30 pt-8 pb-6 px-4" style={{ borderColor: 'var(--border)' }}>
      <nav className="flex-1 space-y-2">
        {navLinks.map((link) => {
          const isActive = link.path
            ? location.pathname === link.path
            : activeSection === link.section;
          const Icon = link.icon;
          
          return (
            <button
              key={link.name}
              onClick={() => handleClick(link)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden w-full text-left",
                isActive
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-[color:var(--text-muted)] hover:text-[color:var(--text)] hover:bg-[color:var(--secondary)]"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-indigo-600/10 dark:bg-indigo-400/10 rounded-lg"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={cn("w-5 h-5 relative z-10", isActive ? "text-indigo-600 dark:text-indigo-400" : "")} />
              <span className="relative z-10">{link.name}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-6" style={{ borderTop: '1px solid var(--border)' }}>
        <button 
          onClick={() => { logout(); window.location.href = '/login'; }}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </button>
      </div>
    </aside>
  );
}

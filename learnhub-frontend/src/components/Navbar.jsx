import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Moon, Sun, GraduationCap, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('learnhub_theme') === 'dark'
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('learnhub_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('learnhub_theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'student':
        return 'bg-secondary-fixed text-[#0f0069]';
      case 'instructor':
        return 'bg-[#dcfce7] text-[#166534]';
      case 'admin':
        return 'bg-[#fef3c7] text-[#92400e]';
      default:
        return 'bg-surface-container-high text-on-surface-variant';
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-outline-variant/50 bg-surface-container-lowest/80 backdrop-blur-md">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-on-primary" />
            </div>
            <span className="text-xl font-semibold text-primary font-[Geist]">
              LearnHub
            </span>
          </Link>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant"
              aria-label="Toggle dark mode"
              id="dark-mode-toggle"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {/* Role Badge */}
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  {user.role}
                </span>

                {/* Avatar + Name */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-semibold">
                    {getInitials(user.name)}
                  </div>
                  <span className="text-label-md text-on-surface">{user.name}</span>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="btn-secondary px-3 py-2 text-xs gap-1.5"
                  id="logout-button"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="btn-secondary px-4 py-2 text-sm no-underline"
                  id="nav-login-button"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary px-4 py-2 text-sm no-underline w-auto"
                  id="nav-register-button"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-outline-variant/50 py-4 animate-fade-in">
            {isAuthenticated && user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/30">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-semibold">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <p className="text-label-md text-on-surface">{user.name}</p>
                    <span
                      className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-secondary w-full justify-center"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  className="btn-secondary w-full justify-center no-underline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary justify-center no-underline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

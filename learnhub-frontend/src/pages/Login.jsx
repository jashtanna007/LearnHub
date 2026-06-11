import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(formData.email, formData.password);

      // Role-based redirect
      switch (user.role) {
        case 'student':
          navigate('/student/dashboard', { replace: true });
          break;
        case 'instructor':
          navigate('/instructor/dashboard', { replace: true });
          break;
        case 'admin':
          navigate('/admin/panel', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    } catch (err) {
      const message =
        err.response?.data?.error || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] auth-card relative overflow-hidden animate-fade-in">
        {/* Decorative blurred circle */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-fixed rounded-full opacity-20 blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-h2 text-primary mb-2">Welcome back</h1>
          <p className="text-body-md text-on-surface-variant">
            Please enter your details to sign in.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-error-container/30 border border-error/20 relative z-10">
            <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
            <p className="text-body-sm text-error">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10" id="login-form">
          <div>
            <label
              htmlFor="login-email"
              className="block text-label-sm text-on-surface mb-1.5"
            >
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              disabled={loading}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label
                htmlFor="login-password"
                className="block text-label-sm text-on-surface"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-label-sm text-secondary hover:text-secondary-hover transition-colors no-underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="form-input pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              id="login-submit"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-body-sm text-on-surface-variant mt-6 relative z-10">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-secondary hover:text-secondary-hover font-medium transition-colors no-underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

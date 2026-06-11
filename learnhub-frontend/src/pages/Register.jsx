import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Loader2, AlertCircle, Eye, EyeOff, GraduationCap, Award } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setLoading(true);

    try {
      const user = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role
      );

      // Role-based redirect
      switch (user.role) {
        case 'student':
          navigate('/student/dashboard', { replace: true });
          break;
        case 'instructor':
          navigate('/instructor/dashboard', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    } catch (err) {
      const message =
        err.response?.data?.error || 'Registration failed. Please try again.';
      setApiError(message);
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
          <h1 className="text-h2 text-primary mb-2">Create an account</h1>
          <p className="text-body-md text-on-surface-variant">
            Start your learning journey today.
          </p>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <div className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-error-container/30 border border-error/20 relative z-10">
            <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
            <p className="text-body-sm text-error">{apiError}</p>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10" id="register-form">
          {/* Role Selector */}
          <div className="mb-2">
            <p className="block text-label-sm text-on-surface mb-2">I am a...</p>
            <div className="flex gap-4 role-selector">
              <div className="flex-1 relative">
                <input
                  type="radio"
                  id="role-student"
                  name="role"
                  value="student"
                  checked={formData.role === 'student'}
                  onChange={() => handleRoleChange('student')}
                  className="sr-only"
                />
                <label
                  htmlFor="role-student"
                  className="flex flex-col items-center justify-center p-4 border border-outline-variant rounded-lg cursor-pointer transition-all hover:bg-surface-container-high text-on-surface-variant"
                >
                  <GraduationCap className="w-6 h-6 mb-1" />
                  <span className="text-label-md">Student</span>
                </label>
              </div>
              <div className="flex-1 relative">
                <input
                  type="radio"
                  id="role-instructor"
                  name="role"
                  value="instructor"
                  checked={formData.role === 'instructor'}
                  onChange={() => handleRoleChange('instructor')}
                  className="sr-only"
                />
                <label
                  htmlFor="role-instructor"
                  className="flex flex-col items-center justify-center p-4 border border-outline-variant rounded-lg cursor-pointer transition-all hover:bg-surface-container-high text-on-surface-variant"
                >
                  <Award className="w-6 h-6 mb-1" />
                  <span className="text-label-md">Instructor</span>
                </label>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="reg-name" className="block text-label-sm text-on-surface mb-1.5">
              Full Name
            </label>
            <input
              id="reg-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'border-error' : ''}`}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-xs text-error mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reg-email" className="block text-label-sm text-on-surface mb-1.5">
              Email
            </label>
            <input
              id="reg-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'border-error' : ''}`}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-xs text-error mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="block text-label-sm text-on-surface mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="reg-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input pr-10 ${errors.password ? 'border-error' : ''}`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-error mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="reg-confirm-password" className="block text-label-sm text-on-surface mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="reg-confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input pr-10 ${errors.confirmPassword ? 'border-error' : ''}`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-error mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              id="register-submit"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <UserPlus className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Terms */}
          <p className="text-center text-body-sm text-on-surface-variant">
            By registering, you agree to our{' '}
            <a href="#" className="text-primary hover:underline">
              Terms
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </form>

        {/* Footer */}
        <p className="text-center text-body-sm text-on-surface-variant mt-6 relative z-10">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-secondary hover:text-secondary-hover font-medium transition-colors no-underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Direct Supabase client for password reset (doesn't need backend)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://spwoaguavotsegflbtym.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwd29hZ3Vhdm90c2VnZmxidHltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTI3MTgsImV4cCI6MjA5NjU4ODcxOH0.ivBRm7-7gM0AhzvO1Oi3kYfafsDNzadOAC1b1zsyXjY'
);

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError('Failed to send reset email. Please try again.');
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] auth-card relative overflow-hidden animate-fade-in">
        {/* Decorative blurred circle */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-fixed rounded-full opacity-20 blur-2xl pointer-events-none" />

        {/* Back link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-body-sm text-on-surface-variant hover:text-on-surface transition-colors mb-6 relative z-10 no-underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="w-12 h-12 bg-secondary-fixed rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-[#0f0069]" />
          </div>
          <h1 className="text-h2 text-primary mb-2">Forgot password?</h1>
          <p className="text-body-md text-on-surface-variant">
            No worries, we'll send you reset instructions.
          </p>
        </div>

        {success ? (
          /* Success State */
          <div className="relative z-10 animate-fade-in">
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-success-light border border-success/20">
              <CheckCircle2 className="w-10 h-10 text-success" />
              <div className="text-center">
                <p className="text-label-md text-on-surface mb-1">Check your email</p>
                <p className="text-body-sm text-on-surface-variant">
                  We sent a password reset link to{' '}
                  <span className="font-medium text-on-surface">{email}</span>
                </p>
              </div>
            </div>

            <p className="text-center text-body-sm text-on-surface-variant mt-6">
              Didn't receive the email?{' '}
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                className="text-secondary hover:text-secondary-hover font-medium transition-colors bg-transparent border-none cursor-pointer"
              >
                Click to resend
              </button>
            </p>
          </div>
        ) : (
          /* Form */
          <>
            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-error-container/30 border border-error/20 relative z-10">
                <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
                <p className="text-body-sm text-error">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10" id="forgot-password-form">
              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-label-sm text-on-surface mb-1.5"
                >
                  Email
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="form-input"
                  disabled={loading}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  id="forgot-password-submit"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Reset password'
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Footer */}
        <p className="text-center text-body-sm text-on-surface-variant mt-6 relative z-10">
          Remember your password?{' '}
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

export default ForgotPassword;

import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="text-center animate-fade-in max-w-md">
        <div className="w-16 h-16 bg-error-container rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-8 h-8 text-error" />
        </div>
        <h1 className="text-h2 text-primary mb-3">Access Denied</h1>
        <p className="text-body-md text-on-surface-variant mb-8">
          You don't have permission to access this page. Please contact an administrator
          if you believe this is an error.
        </p>
        <Link
          to="/login"
          className="btn-primary inline-flex w-auto px-6 no-underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;

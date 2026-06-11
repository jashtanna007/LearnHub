import { useAuth } from '../../context/AuthContext';
import { BookOpen, Users, DollarSign, BarChart3 } from 'lucide-react';

const InstructorDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-fade-in">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-h2 text-primary mb-2">
            Welcome, {user?.name?.split(' ')[0] || 'Instructor'} 🎓
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Manage your courses and track student progress.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: BookOpen, label: 'Published Courses', value: '0', color: 'text-secondary' },
            { icon: Users, label: 'Total Students', value: '0', color: 'text-success' },
            { icon: DollarSign, label: 'Total Revenue', value: '$0', color: 'text-warning' },
            { icon: BarChart3, label: 'Avg. Rating', value: '—', color: 'text-error' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-6 rounded-lg bg-surface-container-lowest border border-outline-variant/50"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-semibold text-on-surface mb-1">{stat.value}</p>
              <p className="text-body-sm text-on-surface-variant">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Placeholder */}
        <div className="p-12 rounded-lg border-2 border-dashed border-outline-variant/50 text-center">
          <BookOpen className="w-12 h-12 text-on-surface-variant/50 mx-auto mb-4" />
          <h3 className="text-h3 text-on-surface-variant mb-2">No courses published</h3>
          <p className="text-body-md text-on-surface-variant/70">
            Course creation and management coming in Phase 2.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;

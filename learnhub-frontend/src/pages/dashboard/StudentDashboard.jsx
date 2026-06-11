import { useAuth } from '../../context/AuthContext';
import { BookOpen, TrendingUp, Clock, Flame } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-fade-in">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-h2 text-primary mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'} 👋
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Continue your learning journey.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: BookOpen, label: 'Enrolled Courses', value: '0', color: 'text-secondary' },
            { icon: TrendingUp, label: 'Completed', value: '0', color: 'text-success' },
            { icon: Clock, label: 'Hours Learned', value: '0', color: 'text-warning' },
            { icon: Flame, label: 'Day Streak', value: user?.streak_count || '0', color: 'text-error' },
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
          <h3 className="text-h3 text-on-surface-variant mb-2">No courses yet</h3>
          <p className="text-body-md text-on-surface-variant/70">
            Courses, quizzes, and enrollments coming in Phase 2.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

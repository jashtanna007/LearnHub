import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { PlayCircle, Flame, Clock, Award, BookOpen, ChevronRight, FileText, Calendar, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../../components/ui/skeleton';

const API = import.meta.env.VITE_API_URL;

export default function StudentDashboard() {
  const { token, user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [certLoading, setCertLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [streakCount, setStreakCount] = useState(user?.streak_count || 0);

  // Fetch enrollments
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await fetch(`${API}/api/enrollments/my`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setEnrollments(await res.json());
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };

    const fetchCerts = async () => {
      try {
        const res = await fetch(`${API}/api/certificates/my`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setCertificates(await res.json());
      } catch (err) { console.error(err); }
      finally { setCertLoading(false); }
    };

    const fetchStreak = async () => {
      try {
        const res = await fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) { const d = await res.json(); setStreakCount(d.streak_count || 0); }
      } catch(e) {}
    };

    fetchEnrollments();
    fetchCerts();
    fetchStreak();
  }, [token]);

  // Stats
  const completedCount = enrollments.filter(e => e.progress_percentage === 100).length;
  const totalHours = enrollments.reduce((sum, e) => {
    const mins = (e.progress_percentage || 0) * 0.6; // rough estimate
    return sum + Math.round(mins / 60 * enrollments.length);
  }, 0) || enrollments.length * 8;

  // Days remaining helper
  const getDaysRemaining = (expiry) => {
    if (!expiry) return null;
    const diff = new Date(expiry) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getDaysColor = (days) => {
    if (days === null || days > 30) return 'text-emerald-500';
    if (days > 7) return 'text-amber-500';
    return 'text-red-500';
  };

  const renderDashboard = () => (
    <>
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-premium flex items-center justify-center shadow-lg text-white font-bold text-3xl">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p className="mt-1 text-lg" style={{ color: 'var(--text-muted)' }}>Ready to continue your learning journey?</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 mb-12">
        {[
          { icon: BookOpen, label: "Enrolled Courses", value: enrollments.length, color: "text-blue-500", bg: "bg-blue-500/10" },
          { icon: Award, label: "Completed", value: completedCount, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { icon: Clock, label: "Hours Learned", value: totalHours, color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { icon: Flame, label: "Day Streak", value: streakCount, color: "text-amber-500", bg: "bg-amber-500/10" }
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="p-6 rounded-xl shadow-sm flex flex-col justify-between" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>{stat.value}</div>
              <div className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* My Courses */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>My Courses</h2>
          <Link to="/courses" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center text-sm">
            Explore more <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <Skeleton key={i} className="h-[320px] rounded-2xl" />)}
          </div>
        ) : enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment, i) => {
              const course = enrollment.course;
              if (!course) return null;
              const progressPct = enrollment.progress_percentage || 0;
              const daysLeft = getDaysRemaining(enrollment.expiry_date);
              const isExpired = daysLeft !== null && daysLeft <= 0;
              
              return (
                <motion.div key={enrollment.id}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                  className="rounded-xl overflow-hidden card-hover flex flex-col" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  
                  <div className="relative h-40 bg-slate-200 dark:bg-slate-800">
                    <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'} alt={course.title} className="w-full h-full object-cover" />
                    {/* Expiry badge */}
                    {daysLeft !== null && (
                      <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                        isExpired ? 'bg-red-500 text-white' : daysLeft <= 7 ? 'bg-red-100 dark:bg-red-900/50 text-red-600' : daysLeft <= 30 ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600'
                      }`}>
                        <Calendar className="w-3 h-3" />
                        {isExpired ? 'Expired' : `${daysLeft}d left`}
                      </div>
                    )}
                    {/* Play overlay */}
                    {!isExpired && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Link to={`/courses/${course.id}/learn`}>
                          <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                            <PlayCircle className="w-8 h-8 text-indigo-600 ml-1" />
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-lg line-clamp-2 mb-1" style={{ color: 'var(--text)' }}>{course.title}</h3>
                    <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{course.category}</p>
                    
                    <div className="mt-auto">
                      {/* Progress bar */}
                      <div className="flex justify-between text-sm mb-2 font-medium">
                        <span style={{ color: 'var(--text-muted)' }}>{progressPct}% Complete</span>
                      </div>
                      <div className="h-2 w-full rounded-full overflow-hidden mb-4" style={{ background: 'var(--secondary)' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 1, delay: 0.5 }}
                          className={`h-full rounded-full ${progressPct === 100 ? 'bg-emerald-500' : 'bg-gradient-premium'}`} />
                      </div>

                      {isExpired ? (
                        <button className="w-full py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800">
                          <AlertTriangle className="w-4 h-4" /> Extend Access
                        </button>
                      ) : progressPct === 100 ? (
                        <div className="w-full py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg text-sm font-bold text-center flex items-center justify-center gap-2">
                          <Award className="w-4 h-4" /> Course Completed!
                        </div>
                      ) : (
                        <Link to={`/courses/${course.id}/learn`}>
                          <button className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                            Continue Learning <ChevronRight className="w-4 h-4" />
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 rounded-xl text-center shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--secondary)' }}>
              <BookOpen className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>No courses yet</h3>
            <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Start your learning journey today!</p>
            <Link to="/courses">
              <button className="h-12 px-8 bg-gradient-premium text-white rounded-lg font-medium shadow-sm hover:opacity-90 transition-opacity">Browse Catalog</button>
            </Link>
          </div>
        )}
      </div>
    </>
  );

  const renderCourses = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>My Enrolled Courses</h2>
      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
      ) : enrollments.length > 0 ? (
        <div className="space-y-4">
          {enrollments.map((enrollment) => {
            const course = enrollment.course;
            if (!course) return null;
            const progressPct = enrollment.progress_percentage || 0;
            const daysLeft = getDaysRemaining(enrollment.expiry_date);
            return (
              <Link key={enrollment.id} to={`/courses/${course.id}/learn`} className="block">
                <div className="flex items-center gap-5 p-5 rounded-xl hover:-translate-y-0.5 transition-all duration-200" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-800">
                    <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate" style={{ color: 'var(--text)' }}>{course.title}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--secondary)' }}>
                        <div className={`h-full rounded-full transition-all ${progressPct === 100 ? 'bg-emerald-500' : 'bg-gradient-premium'}`} style={{ width: `${progressPct}%` }} />
                      </div>
                      <span className="text-sm font-medium shrink-0" style={{ color: 'var(--text-muted)' }}>{progressPct}%</span>
                    </div>
                  </div>
                  {daysLeft !== null && (
                    <span className={`text-xs font-medium shrink-0 ${getDaysColor(daysLeft)}`}>
                      {daysLeft <= 0 ? 'Expired' : `${daysLeft}d left`}
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="p-12 rounded-xl text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>No enrolled courses</h3>
          <p style={{ color: 'var(--text-muted)' }}>Browse our catalog to find your next course.</p>
          <Link to="/courses" className="inline-block mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">Browse Courses</Link>
        </div>
      )}
    </div>
  );

  const renderCertificates = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>My Certificates</h2>
      {certLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{[1,2].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
      ) : certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <motion.div key={cert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-xl relative overflow-hidden"
              style={{ background: 'var(--bg-card)', border: '2px solid transparent', borderImage: 'linear-gradient(135deg, #f59e0b, #d97706, #b45309) 1' }}>
              {/* Gold accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-transparent rounded-bl-full" />
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: 'var(--text)' }}>{cert.course_title}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Issued {new Date(cert.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-mono px-2 py-1 rounded" style={{ background: 'var(--secondary)', color: 'var(--text-muted)' }}>ID: {cert.certificate_uid?.slice(0, 8)}...</span>
              </div>

              <button className="w-full py-2.5 border rounded-lg text-sm font-bold transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2" style={{ borderColor: 'var(--border)' }}>
                <FileText className="w-4 h-4" /> Download Certificate
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-xl text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <Award className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>No certificates yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Complete a course to earn your first certificate!</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-1" style={{ background: 'var(--bg)' }}>
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 overflow-x-hidden p-6 lg:p-10 max-w-[1280px] mx-auto w-full">
        {activeSection === 'dashboard' && renderDashboard()}
        {activeSection === 'courses' && renderCourses()}
        {activeSection === 'certificates' && renderCertificates()}
      </div>
    </div>
  );
}

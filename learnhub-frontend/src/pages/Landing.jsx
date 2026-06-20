import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Award, Users, Star, GraduationCap, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { useAuth } from '../context/AuthContext';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Landing() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const getDashboardPath = () => {
    if (!user) return '/register';
    if (user.role === 'admin') return '/admin/panel';
    if (user.role === 'instructor') return '/instructor/dashboard';
    return '/student/dashboard';
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/courses`);
        if (res.ok) {
          const data = await res.json();
          setCourses(data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-32 pb-24 lg:pt-40 lg:pb-32">
        {/* Background Gradients & Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-indigo-600/30 blur-[120px]" />
          <div className="absolute bottom-[0%] -left-[10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[100px]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 max-w-[1280px] relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            
            <motion.div 
              className="flex-1 text-center lg:text-left"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-6">
                <span className="flex h-2 w-2 rounded-full bg-violet-400"></span>
                The new standard in online learning
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-[64px] font-extrabold tracking-tight leading-[1.1] mb-6">
                Learn Without{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                  Limits
                </span>
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0">
                Master in-demand skills with expert-led courses. Join thousands of learners achieving their goals and advancing their careers.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to={getDashboardPath()}>
                  <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg shadow-indigo-500/25 font-bold text-lg px-8">
                    {user ? 'Go to Dashboard' : 'Get Started for Free'} <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-white/30 hover:bg-white/10 text-white font-semibold">
                    Browse Courses
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div 
              className="flex-1 relative hidden md:block"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                <div className="absolute top-10 right-10 w-64 h-80 bg-slate-800 rounded-2xl border border-white/10 shadow-2xl p-4 transform rotate-6">
                  <div className="w-full h-32 bg-slate-700 rounded-lg mb-4"></div>
                  <div className="w-3/4 h-4 bg-slate-700 rounded mb-2"></div>
                  <div className="w-1/2 h-4 bg-slate-700 rounded"></div>
                </div>
                <div className="absolute bottom-10 left-10 w-72 h-40 bg-slate-800 rounded-2xl border border-white/10 shadow-2xl p-4 transform -rotate-3">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="w-24 h-4 bg-slate-700 rounded mb-2"></div>
                      <div className="w-16 h-3 bg-slate-600 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar — uses CSS variables for theming */}
      <section style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }} className="py-8 shadow-sm">
        <div className="container mx-auto px-4 max-w-[1280px]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10,000+", label: "Students", icon: Users },
              { value: "200+", label: "Courses", icon: BookOpen },
              { value: "4.8★", label: "Rating", icon: Star },
              { value: "95%", label: "Completion", icon: TrendingUp },
            ].map((stat, i) => (
              <div key={i} className="text-center px-4 relative">
                {i > 0 && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-12 hidden md:block" style={{ background: 'var(--border)' }} />
                )}
                <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>{stat.value}</div>
                <div className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-24" style={{ background: 'var(--bg)' }}>
        <div className="container mx-auto px-4 max-w-[1280px]">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>Featured Courses</h2>
              <p className="text-lg max-w-2xl" style={{ color: 'var(--text-muted)' }}>Start learning from the world's best institutions and top instructors.</p>
            </div>
            <Link to="/courses">
              <Button variant="outline" className="hidden md:flex" style={{ color: 'var(--text)', borderColor: 'var(--border)' }}>
                View all courses <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-[200px] w-full rounded-xl" />
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              ))
            ) : courses.length > 0 ? (
              courses.map((course, i) => (
                <motion.div 
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link to={`/courses/${course.id}`} className="group block h-full">
                    <div className="rounded-xl overflow-hidden card-hover h-full flex flex-col" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                      <div className="relative aspect-video overflow-hidden bg-slate-200 dark:bg-slate-800">
                        <img 
                          src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'} 
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider" style={{ color: 'var(--text)' }}>
                          {course.category || 'General'}
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="font-bold text-lg line-clamp-2 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" style={{ color: 'var(--text)' }}>
                          {course.title}
                        </h3>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                          by {course.instructor_name || 'Instructor'}
                        </p>
                        <div className="mt-auto pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
                          <div className="flex items-center text-amber-500">
                            <Star className="w-4 h-4 fill-current mr-1" />
                            <span className="font-bold" style={{ color: 'var(--text)' }}>{course.avg_rating > 0 ? course.avg_rating : 'New'}</span>
                            <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>({course.enrolled_count || 0})</span>
                          </div>
                          <div className="font-bold text-lg" style={{ color: 'var(--text)' }}>
                            ₹{course.price}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full p-12 rounded-xl text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>No courses available yet</h3>
                <p style={{ color: 'var(--text-muted)' }}>Check back soon — our instructors are preparing amazing content.</p>
              </div>
            )}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link to="/courses">
              <Button variant="outline" className="w-full" style={{ color: 'var(--text)', borderColor: 'var(--border)' }}>
                View all courses <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why LearnHub */}
      <section className="py-24" style={{ background: 'var(--secondary)' }}>
        <div className="container mx-auto px-4 max-w-[1280px]">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>Why choose LearnHub?</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>We provide the best tools and environment for your learning journey.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: "Expert Curated Content", desc: "Learn from industry leaders and experts who bring real-world experience." },
              { icon: GraduationCap, title: "Recognized Certificates", desc: "Earn certificates upon completion to showcase your new skills to employers." },
              { icon: Users, title: "Interactive Community", desc: "Join discussions, ask questions, and collaborate with peers worldwide." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 rounded-xl shadow-sm text-center"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="w-16 h-16 mx-auto bg-indigo-600/10 dark:bg-indigo-400/10 rounded-2xl flex items-center justify-center mb-6 transform -rotate-3">
                  <feature.icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text)' }}>{feature.title}</h3>
                <p className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 overflow-hidden" style={{ background: 'var(--bg)' }}>
        <div className="container mx-auto px-4 max-w-[1280px]">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center" style={{ color: 'var(--text)' }}>What our students say</h2>
          
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x hide-scrollbar">
            {[
              { name: "Sarah Jenkins", role: "Software Engineer", quote: "LearnHub completely transformed my career. The courses are structured perfectly for beginners and experts alike." },
              { name: "Michael Chang", role: "Data Analyst", quote: "The quality of instruction here is unmatched. The interactive video player and Q&A sections make learning so much easier." },
              { name: "Emily Rodriguez", role: "UX Designer", quote: "I was able to build a complete portfolio using the projects from these courses. Highly recommend!" },
              { name: "David Kim", role: "Product Manager", quote: "The best investment I've made in my professional development. The platform is beautiful and easy to use." }
            ].map((t, i) => (
              <div key={i} className="min-w-[300px] md:min-w-[400px] snap-center p-8 rounded-xl shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex text-amber-500 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-lg mb-6 leading-relaxed" style={{ color: 'var(--text)' }}>"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold" style={{ background: 'var(--secondary)', color: 'var(--text-muted)' }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold" style={{ color: 'var(--text)' }}>{t.name}</h4>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-indigo-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="container mx-auto px-4 max-w-[1280px] text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to start learning?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">Join thousands of students and transform your career today.</p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-slate-100 border-0 text-lg px-8 h-14 font-bold shadow-lg">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Star, Clock, Video, ChevronDown, ChevronUp, CheckCircle, User, Award, Globe, FileText, PlayCircle } from 'lucide-react';
import CheckoutModal from '../components/CheckoutModal';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSection, setActiveSection] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/courses/${id}`);
        if (!res.ok) throw new Error('Course not found');
        const data = await res.json();
        setCourse(data);
        
        const revRes = await fetch(`${import.meta.env.VITE_API_URL}/api/courses/${id}/reviews`);
        if (revRes.ok) {
          setReviews(await revRes.json());
        }

        if (user && user.role === 'student') {
          const enrRes = await fetch(`${import.meta.env.VITE_API_URL}/api/enrollments/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (enrRes.ok) {
            const enrData = await enrRes.json();
            const enrolled = enrData.some(e => e.course?.id === id);
            setIsEnrolled(enrolled);

            // Fetch progress if enrolled
            if (enrolled) {
              const progRes = await fetch(`${import.meta.env.VITE_API_URL}/api/courses/${id}/progress`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (progRes.ok) {
                const progData = await progRes.json();
                setProgressPct(progData.percentage || 0);
              }
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [id, user, token]);

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const handleEnrollClick = () => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'student') { alert('Only students can enroll.'); return; }
    setIsCheckoutOpen(true);
  };

  const handleEnrollSuccess = () => {
    setIsCheckoutOpen(false);
    setIsEnrolled(true);
    navigate(`/courses/${id}/learn`);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-76px)] bg-background py-12 px-4 container mx-auto">
        <Skeleton className="h-[400px] w-full rounded-2xl mb-8" />
        <div className="flex gap-8">
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="w-[380px] h-[500px] rounded-2xl shrink-0 hidden lg:block" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">Course not found</h2>
        <Link to="/courses"><Button variant="outline">Browse Catalog</Button></Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Hero Banner */}
      <div className="relative bg-slate-900 text-white overflow-hidden py-16 lg:py-24">
        {course.thumbnail_url && (
          <div 
            className="absolute inset-0 opacity-20 blur-2xl scale-110 object-cover" 
            style={{ backgroundImage: `url(${course.thumbnail_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent" />
        
        <div className="container mx-auto px-4 lg:px-8 max-w-[1280px] relative z-10 flex gap-12">
          <div className="flex-1 max-w-3xl">
            <div className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              {course.category}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-[1.15] mb-6">{course.title}</h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
              {course.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300">
              <div className="flex items-center text-amber-400 font-medium">
                <span className="text-lg mr-1">{course.avg_rating > 0 ? course.avg_rating : 'New'}</span>
                <Star className="w-5 h-5 fill-current" />
                <span className="text-slate-400 ml-2 underline underline-offset-2">({course.review_count || 0} reviews)</span>
              </div>
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2 text-slate-400" />
                {course.enrolled_count || 0} students enrolled
              </div>
              <div className="flex items-center">
                <Globe className="w-5 h-5 mr-2 text-slate-400" />
                English
              </div>
            </div>
            
            <div className="mt-8 flex items-center">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-lg text-white mr-4 border border-white/10">
                {course.instructor?.name?.charAt(0)}
              </div>
              <div>
                <p className="text-sm text-slate-400">Created by</p>
                <p className="font-bold text-white underline underline-offset-2">{course.instructor?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 lg:px-8 max-w-[1280px] mt-8">
        <div className="flex flex-col lg:flex-row gap-12 relative items-start">
          
          {/* Left Column */}
          <div className="flex-1 w-full">
            
            {/* Mobile Sticky Price (Visible only on mobile/tablet) */}
            <div className="lg:hidden bg-card p-6 rounded-2xl border border-border mb-8 shadow-sm">
              <div className="text-3xl font-bold text-foreground mb-4">₹{course.price}</div>
              <Button 
                onClick={isEnrolled ? () => navigate(`/courses/${id}/learn`) : handleEnrollClick}
                className="w-full h-12 text-lg bg-gradient-premium"
              >
                {isEnrolled ? 'Go to Course' : 'Enroll Now'}
              </Button>
            </div>

            {/* What you'll learn */}
            <div className="bg-card p-8 rounded-[var(--radius-md)] border border-border shadow-sm mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">What you'll learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex items-start text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-primary mr-3 shrink-0 mt-0.5" />
                    <span>Master the core concepts of this subject area and apply them in real-world scenarios.</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-border mb-8 sticky top-[76px] bg-background/80 backdrop-blur-md z-20">
              <div className="flex space-x-8">
                {['overview', 'curriculum', 'reviews'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-base font-bold capitalize transition-all relative ${
                      activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div layoutId="courseTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              
              {activeTab === 'overview' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-4">Course Description</h3>
                    <div className="text-muted-foreground leading-relaxed space-y-4">
                      <p>{course.description}</p>
                      <p>This comprehensive course is designed to take you from a beginner to an advanced level. Through practical examples and hands-on projects, you will learn exactly what you need to succeed.</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-4">Requirements</h3>
                    <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                      <li>No prior experience required.</li>
                      <li>A computer with internet access.</li>
                      <li>A desire to learn and practice.</li>
                    </ul>
                  </div>
                </motion.div>
              )}

              {activeTab === 'curriculum' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex justify-between items-end mb-6">
                    <h3 className="text-xl font-bold text-foreground">Course Content</h3>
                    <div className="text-sm text-muted-foreground font-medium">
                      {course.sections?.length || 0} sections • {course.total_lessons || 0} lessons • {formatDuration(course.total_duration_seconds || 0)} length
                    </div>
                  </div>
                  
                  <div className="border border-border rounded-[var(--radius-md)] overflow-hidden bg-card shadow-sm">
                    {course.sections?.map((section, idx) => (
                      <div key={section.id} className="border-b border-border last:border-0">
                        <button 
                          onClick={() => setActiveSection(activeSection === idx ? null : idx)}
                          className="w-full flex items-center justify-between p-5 bg-secondary/30 hover:bg-secondary/60 transition-colors"
                        >
                          <div className="flex items-center font-bold text-foreground text-left">
                            {activeSection === idx ? <ChevronUp className="w-5 h-5 mr-3 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 mr-3 text-muted-foreground" />}
                            {section.title}
                          </div>
                          <div className="text-sm text-muted-foreground font-medium hidden sm:block">
                            {section.topics?.length || 0} topics
                          </div>
                        </button>
                        
                        <AnimatePresence>
                          {activeSection === idx && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }} 
                              animate={{ height: 'auto', opacity: 1 }} 
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-5 bg-card">
                                {section.topics?.map(topic => (
                                  <div key={topic.id} className="mb-6 last:mb-0">
                                    <h4 className="font-bold text-foreground mb-3 pl-8 flex items-center gap-2">
                                      {topic.title}
                                    </h4>
                                    <div className="space-y-1 pl-8">
                                      {topic.lessons?.map(lesson => (
                                        <div key={lesson.id} className="flex justify-between items-center p-3 rounded-md hover:bg-secondary/50 transition-colors group cursor-pointer">
                                          <div className="flex items-center text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                            <PlayCircle className="w-4 h-4 mr-3" />
                                            {lesson.title}
                                          </div>
                                          <span className="text-xs text-muted-foreground">{formatDuration(lesson.duration_seconds)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* Review Form */}
                  {isEnrolled && progressPct === 100 && !reviewSubmitted && (
                    <div className="mb-8 p-6 bg-card border border-border rounded-[var(--radius-md)] shadow-sm">
                      <h3 className="font-bold text-lg mb-4 text-foreground">Write a Review</h3>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm font-medium text-muted-foreground mr-2">Your rating:</span>
                        {[1,2,3,4,5].map(star => (
                          <button key={star} onClick={() => setReviewRating(star)} className="p-0.5 transition-transform hover:scale-110">
                            <Star className={`w-7 h-7 ${star <= reviewRating ? 'text-amber-500 fill-current' : 'text-slate-300 dark:text-slate-600'}`} />
                          </button>
                        ))}
                      </div>
                      <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Share your experience with this course..." rows={4}
                        className="w-full p-3 rounded-lg border border-border bg-background text-foreground text-sm resize-none mb-4 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      <Button disabled={reviewRating === 0 || !reviewComment.trim() || reviewSubmitting}
                        onClick={async () => {
                          setReviewSubmitting(true);
                          try {
                            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/courses/${id}/reviews`, {
                              method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                              body: JSON.stringify({ rating: reviewRating, comment: reviewComment })
                            });
                            if (res.ok) {
                              const newReview = await res.json();
                              setReviews(prev => [{ ...newReview, student_name: user?.name || 'You' }, ...prev]);
                              setReviewSubmitted(true);
                            } else {
                              const err = await res.json();
                              alert(err.error || 'Failed to submit review');
                            }
                          } catch(e) { alert('Failed to submit review'); }
                          finally { setReviewSubmitting(false); }
                        }}
                        className="bg-gradient-premium">
                        {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                      </Button>
                    </div>
                  )}
                  {reviewSubmitted && (
                    <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-600 text-sm font-medium text-center">
                      ✅ Thank you for your review!
                    </div>
                  )}

                  <div className="flex items-center gap-6 mb-10 p-6 bg-card border border-border rounded-[var(--radius-md)] shadow-sm">
                    <div className="text-center shrink-0">
                      <div className="text-6xl font-bold text-foreground">{course.avg_rating || '0.0'}</div>
                      <div className="flex text-amber-500 justify-center my-2">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                      </div>
                      <div className="text-sm font-medium text-muted-foreground">Course Rating</div>
                    </div>
                    <div className="flex-1 hidden sm:block border-l border-border pl-6">
                      <p className="text-lg font-medium text-foreground mb-2">Student Feedback</p>
                      <p className="text-muted-foreground">Reviews are from verified students enrolled in this course.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews.length > 0 ? reviews.map(review => (
                      <div key={review.id} className="bg-card p-6 border border-border rounded-[var(--radius-md)] shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                            {(review.student_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-foreground">{review.student_name}</div>
                            <div className="flex text-amber-500 gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-muted'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">"{review.comment}"</p>
                      </div>
                    )) : (
                      <div className="col-span-full text-center py-12">
                        <p className="text-muted-foreground">No reviews yet for this course.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

            </div>
          </div>

          {/* Right Column: Sticky Sidebar (Desktop Only) */}
          <div className="hidden lg:block w-[380px] shrink-0">
            <div className="sticky top-24 bg-card border border-border rounded-2xl overflow-hidden premium-shadow">
              
              <div className="aspect-video relative bg-muted group">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Preview</div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-8 h-8 text-primary ml-1" />
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="text-4xl font-extrabold text-foreground mb-6">
                  ₹{course.price}
                </div>
                
                <Button 
                  size="lg"
                  onClick={isEnrolled ? () => navigate(`/courses/${id}/learn`) : handleEnrollClick}
                  className="w-full h-14 text-lg bg-gradient-premium mb-4"
                >
                  {isEnrolled ? 'Go to Course' : 'Enroll Now'}
                </Button>

                <p className="text-xs text-center text-muted-foreground mb-6 font-medium">
                  30-Day Money-Back Guarantee
                </p>

                <div className="space-y-4">
                  <h4 className="font-bold text-foreground">This course includes:</h4>
                  <ul className="space-y-3 text-sm font-medium text-muted-foreground">
                    <li className="flex items-center"><Video className="w-4 h-4 mr-3 text-primary" /> {formatDuration(course.total_duration_seconds)} on-demand video</li>
                    <li className="flex items-center"><FileText className="w-4 h-4 mr-3 text-primary" /> {course.total_lessons} lessons</li>
                    <li className="flex items-center"><Clock className="w-4 h-4 mr-3 text-primary" /> Full lifetime access</li>
                    <li className="flex items-center"><Award className="w-4 h-4 mr-3 text-primary" /> Certificate of completion</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        course={course} 
        onSuccess={handleEnrollSuccess} 
      />
    </div>
  );
}

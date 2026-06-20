import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import { BookOpen, Users, DollarSign, Plus, Edit, Trash2, X, Upload, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstructorDashboard() {
  const { token, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Form state
  const [newCourse, setNewCourse] = useState({ title: '', description: '', category: '', price: '', thumbnail_url: '' });

  useEffect(() => {
    fetchCourses();
  }, [token]);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/instructor/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCourses(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [toast, setToast] = useState('');

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/instructor/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newCourse)
      });
      if (res.ok) {
        setNewCourse({ title: '', description: '', category: '', price: '', thumbnail_url: '' });
        setIsCreateOpen(false);
        setToast('Course created successfully!');
        setTimeout(() => setToast(''), 3000);
        fetchCourses();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create course');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create course. Please try again.');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This cannot be undone.')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/instructor/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCourses(courses.filter(c => c.id !== courseId));
        setToast('Course deleted successfully!');
        setTimeout(() => setToast(''), 3000);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete course');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete course.');
    }
  };

  const totalRevenue = courses.reduce((sum, c) => sum + ((c.price || 0) * (c.enrolled_count || 0)), 0);
  const totalStudents = courses.reduce((sum, c) => sum + (c.enrolled_count || 0), 0);

  return (
    <div className="flex flex-1 bg-secondary/20">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <div className="flex-1 overflow-x-hidden p-6 lg:p-10 max-w-[1280px] mx-auto w-full">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Instructor Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-lg">Manage your courses and track your revenue.</p>
          </div>
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="px-6 py-3 bg-gradient-premium text-white font-bold rounded-[var(--radius-sm)] shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center shrink-0"
          >
            <Plus className="w-5 h-5 mr-2" /> Create Course
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: BookOpen, label: "Total Courses", value: courses.length, color: "text-blue-500", bg: "bg-blue-500/10" },
            { icon: Users, label: "Total Students", value: totalStudents, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { icon: DollarSign, label: "Est. Revenue", value: `₹${totalRevenue.toLocaleString()}`, color: "text-amber-500", bg: "bg-amber-500/10" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card p-6 rounded-[var(--radius-md)] border border-border shadow-sm flex items-center"
            >
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center mr-5`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Courses List */}
        <div className="bg-card rounded-[var(--radius-md)] border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-muted/30 flex justify-between items-center">
            <h2 className="text-lg font-bold text-foreground">Your Courses</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No courses created yet</h3>
              <p className="text-muted-foreground mb-6">Create your first course to start teaching on LearnHub.</p>
              <button 
                onClick={() => setIsCreateOpen(true)}
                className="px-6 py-2.5 bg-primary text-white rounded-[var(--radius-sm)] font-medium hover:bg-primary/90 transition-colors"
              >
                Create your first course
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/30 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Students</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {courses.map(c => (
                    <tr key={c.id} className="hover:bg-secondary/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 rounded bg-muted overflow-hidden shrink-0">
                            {c.thumbnail_url ? <img src={c.thumbnail_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-200 dark:bg-slate-800"></div>}
                          </div>
                          <div>
                            <div className="font-bold text-foreground line-clamp-1">{c.title}</div>
                            <div className="text-xs text-muted-foreground">{c.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">₹{c.price}</td>
                      <td className="px-6 py-4 font-medium text-foreground">{c.enrolled_count || 0}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500">
                          Published
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-primary/10 mr-2">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteCourse(c.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Create Course Drawer */}
      <AnimatePresence>
        {isCreateOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-card border-l border-border shadow-2xl z-50 flex flex-col"
            >
              <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/30">
                <h2 className="text-xl font-bold text-foreground">Create New Course</h2>
                <button onClick={() => setIsCreateOpen(false)} className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <form id="create-course-form" onSubmit={handleCreateCourse} className="space-y-6">
                  
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Course Title</label>
                    <input 
                      required type="text" 
                      value={newCourse.title} 
                      onChange={e => setNewCourse({...newCourse, title: e.target.value})} 
                      className="w-full h-12 px-4 rounded-[var(--radius-sm)] border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" 
                      placeholder="e.g. Advanced React Patterns"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Description</label>
                    <textarea 
                      required 
                      value={newCourse.description} 
                      onChange={e => setNewCourse({...newCourse, description: e.target.value})} 
                      className="w-full p-4 rounded-[var(--radius-sm)] border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none min-h-[120px] resize-none" 
                      placeholder="What will students learn?"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-2">Category</label>
                      <input 
                        required type="text" 
                        value={newCourse.category} 
                        onChange={e => setNewCourse({...newCourse, category: e.target.value})} 
                        className="w-full h-12 px-4 rounded-[var(--radius-sm)] border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" 
                        placeholder="e.g. Web Dev"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-2">Price (₹)</label>
                      <input 
                        required type="number" step="0.01" min="0"
                        value={newCourse.price} 
                        onChange={e => setNewCourse({...newCourse, price: e.target.value})} 
                        className="w-full h-12 px-4 rounded-[var(--radius-sm)] border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" 
                        placeholder="99.99"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Thumbnail URL</label>
                    <div className="relative">
                      <input 
                        type="url" 
                        value={newCourse.thumbnail_url} 
                        onChange={e => setNewCourse({...newCourse, thumbnail_url: e.target.value})} 
                        className="w-full h-12 pl-12 pr-4 rounded-[var(--radius-sm)] border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" 
                        placeholder="https://example.com/image.jpg"
                      />
                      <Upload className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>

                </form>

                {/* Mock Builder UI for visual effect */}
                <div className="mt-10 border-t border-border pt-8">
                  <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Course Builder Preview</h3>
                  <div className="border border-border rounded-[var(--radius-md)] bg-secondary/20 p-4">
                    <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-[var(--radius-sm)] shadow-sm mb-2 cursor-move">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold text-sm">Section 1: Introduction</span>
                    </div>
                    <div className="pl-8 space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-card border border-border border-dashed rounded-[var(--radius-sm)] text-muted-foreground">
                        <Plus className="w-4 h-4" /> Add Topic
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="p-6 border-t border-border bg-card flex gap-4">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="flex-1 py-3 font-bold rounded-[var(--radius-sm)] bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
                  Cancel
                </button>
                <button type="submit" form="create-course-form" className="flex-1 py-3 font-bold rounded-[var(--radius-sm)] bg-primary text-white shadow-md hover:bg-primary/90 transition-colors">
                  Create Course
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 right-6 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg font-bold text-sm z-[9999]"
          >
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

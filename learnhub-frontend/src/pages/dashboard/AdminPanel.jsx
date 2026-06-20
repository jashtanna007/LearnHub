import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import { Users, DollarSign, BookOpen, Trash2, Shield, User, TrendingUp, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminPanel() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // users, courses, payments, analytics
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, enrollments: 0, courses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const uRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (uRes.ok) setUsers(await uRes.json());
      
      const cRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (cRes.ok) setCourses(await cRes.json());

      const pRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/payments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (pRes.ok) setPayments(await pRes.json());

      const sRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (sRes.ok) {
        const sData = await sRes.json();
        setStats({
          revenue: sData.total_revenue || 0,
          enrollments: sData.total_enrollments || 0,
          courses: sData.total_courses || 0
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-1 bg-secondary/20">
      <Sidebar />
      
      <div className="flex-1 overflow-x-hidden p-6 lg:p-10 max-w-[1280px] mx-auto w-full">
        
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Admin Control Panel</h1>
          <p className="text-muted-foreground mt-1 text-lg">Platform overview and user management.</p>
        </div>

        {/* Custom Tab Navigation */}
        <div className="flex space-x-2 bg-card p-1 rounded-[var(--radius-sm)] border border-border inline-flex mb-8 shadow-sm">
          {['users', 'courses', 'payments', 'analytics'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-[calc(var(--radius-sm)-4px)] text-sm font-bold capitalize transition-all ${
                activeTab === tab ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-[var(--radius-md)] border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-border bg-muted/30 flex justify-between items-center">
              <h2 className="text-lg font-bold text-foreground">User Directory</h2>
              <div className="px-3 py-1 bg-primary/10 text-primary font-bold text-sm rounded-full">
                {users.length} Total
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/30 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-secondary/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                            {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full rounded-full object-cover" /> : u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-foreground">{u.name}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative inline-block w-40">
                          <select 
                            value={u.role}
                            onChange={(e) => handleChangeRole(u.id, e.target.value)}
                            className="w-full appearance-none bg-background border border-border rounded-[var(--radius-sm)] py-2 pl-3 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors cursor-pointer"
                          >
                            <option value="student">Student</option>
                            <option value="instructor">Instructor</option>
                            <option value="admin">Admin</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteUser(u.id)} 
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete User"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { icon: DollarSign, label: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { icon: Users, label: "Total Enrollments", value: stats.enrollments, color: "text-primary", bg: "bg-primary/10" },
                { icon: BookOpen, label: "Active Courses", value: stats.courses, color: "text-amber-500", bg: "bg-amber-500/10" }
              ].map((stat, i) => (
                <div key={i} className="bg-card p-6 rounded-[var(--radius-md)] border border-border shadow-sm flex items-center">
                  <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center mr-5`}>
                    <stat.icon className={`w-7 h-7 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart Placeholder */}
            <div className="bg-card rounded-[var(--radius-md)] border border-border shadow-sm p-6 h-96 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-foreground">Revenue Over Time</h3>
                <button className="flex items-center text-sm font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                  <TrendingUp className="w-4 h-4 mr-1.5" /> +24% this month
                </button>
              </div>
              <div className="flex-1 border-b border-l border-border/50 relative flex items-end justify-between px-4 pb-4">
                {[40, 70, 45, 90, 65, 100, 80].map((h, i) => (
                  <div key={i} className="w-[10%] bg-gradient-premium rounded-t-md opacity-80 hover:opacity-100 transition-opacity cursor-pointer relative group" style={{ height: `${h}%` }}>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      ${h * 120}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider mt-4 px-4">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'courses' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-[var(--radius-md)] border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-border bg-muted/30 flex justify-between items-center">
              <h2 className="text-lg font-bold text-foreground">Course Directory</h2>
              <div className="px-3 py-1 bg-primary/10 text-primary font-bold text-sm rounded-full">
                {courses.length} Total
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/30 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Instructor</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {courses.map(c => (
                    <tr key={c.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-foreground">{c.title}</div>
                        <div className="text-xs text-muted-foreground">{c.category}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-muted-foreground">{c.instructor_name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm font-bold text-foreground">₹{c.price}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${c.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          {c.status || 'draft'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'payments' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-[var(--radius-md)] border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-border bg-muted/30 flex justify-between items-center">
              <h2 className="text-lg font-bold text-foreground">Payment History</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/30 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Course ID</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map(p => (
                    <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{p.stripe_payment_intent_id?.slice(-8) || p.id?.slice(-8)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{p.user_id?.slice(-8) || 'User'}</td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{p.course_id?.slice(-8)}</td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-500">₹{p.amount}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}

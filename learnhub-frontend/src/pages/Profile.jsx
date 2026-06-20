import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, Flame, CreditCard, Edit2, Check, X, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(user);
  const [payments, setPayments] = useState([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar_url || '');
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profRes = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profRes.ok) {
          const profData = await profRes.json();
          setProfile(profData.user);
          setEditName(profData.user.name);
          setEditAvatar(profData.user.avatar_url || '');
        }

        const payRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/my`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (payRes.ok) {
          const payData = await payRes.json();
          setPayments(payData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [token]);

  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: editName, avatar_url: editAvatar })
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-76px)]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16 max-w-[1280px]">
      
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1 text-lg">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Col: Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-[var(--radius-md)] border border-border premium-shadow overflow-hidden"
        >
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-premium relative">
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 w-24 h-24 rounded-2xl bg-card p-1 shadow-lg">
              <div className="w-full h-full rounded-xl bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  profile?.name?.charAt(0).toUpperCase()
                )}
              </div>
            </div>
          </div>
          
          <div className="pt-16 pb-8 px-8 text-center md:text-left">
            {!isEditing ? (
              <div className="relative group inline-block w-full">
                <h2 className="text-2xl font-bold text-foreground mb-1">{profile?.name}</h2>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="absolute -right-8 top-1 opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-primary transition-all rounded-md hover:bg-secondary"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mb-6">
                  {profile?.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                  {profile?.role}
                </div>
              </div>
            ) : (
              <div className="space-y-4 mb-6 text-left">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Avatar URL</label>
                  <input 
                    type="text" 
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm font-medium"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-secondary text-foreground font-bold text-sm rounded-[var(--radius-sm)] hover:bg-secondary/80 transition-colors">Cancel</button>
                  <button onClick={handleSaveProfile} className="flex-1 py-2 bg-primary text-white font-bold text-sm rounded-[var(--radius-sm)] shadow-sm hover:bg-primary/90 transition-colors">Save</button>
                </div>
              </div>
            )}

            <div className="space-y-4 pt-6 border-t border-border">
              <div className="flex items-center text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mr-3">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-foreground">{profile?.email}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mr-3">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-foreground">Joined {new Date(profile?.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center mr-3">
                  <Flame className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-sm font-bold text-foreground">{profile?.streak_count || 0} Day Streak</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Col: Payments */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-8"
        >
          <div className="bg-card rounded-[var(--radius-md)] border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-border bg-muted/30 flex items-center">
              <CreditCard className="w-5 h-5 text-primary mr-3" />
              <h2 className="text-lg font-bold text-foreground">Billing & Purchase History</h2>
            </div>
            
            <div className="p-0">
              {payments.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">No purchases yet</h3>
                  <p className="text-muted-foreground">You haven't bought any courses on LearnHub yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-secondary/30 border-b border-border text-xs uppercase tracking-wider font-bold text-muted-foreground">
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Item</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {payments.map(payment => (
                        <tr key={payment.id} className="hover:bg-secondary/30 transition-colors text-sm">
                          <td className="px-6 py-4 font-medium text-muted-foreground">{new Date(payment.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4 font-bold text-foreground">{payment.courses?.title || 'Course Access'}</td>
                          <td className="px-6 py-4 font-bold text-foreground">₹{payment.amount}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-md ${
                              payment.status === 'succeeded' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-secondary text-muted-foreground'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

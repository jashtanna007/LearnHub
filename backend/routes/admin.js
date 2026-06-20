const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// All admin routes require 'admin' role
router.use(verifyToken, authorizeRoles('admin'));

// ─── GET /api/admin/users ───────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role, created_at, streak_count')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const enriched = await Promise.all((users || []).map(async (u) => {
      const { count } = await supabaseAdmin
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', u.id);
      return { ...u, enrollment_count: count || 0 };
    }));

    return res.status(200).json(enriched);
  } catch (err) {
    console.error('❌ GET admin users error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── PATCH /api/admin/users/:id/role ────────────────────────────────────────
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.status(200).json(user);
  } catch (err) {
    console.error('❌ PATCH admin user role error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── GET /api/admin/courses ─────────────────────────────────────────────────
router.get('/courses', async (req, res) => {
  try {
    const { data: courses, error } = await supabaseAdmin
      .from('courses')
      .select(`
        id, title, status, created_at, price,
        users ( name )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const enriched = await Promise.all((courses || []).map(async (c) => {
      const { count } = await supabaseAdmin
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', c.id);
      return { 
        ...c, 
        instructor_name: c.users?.name || 'Unknown', 
        enrollment_count: count || 0,
        users: undefined
      };
    }));

    return res.status(200).json(enriched);
  } catch (err) {
    console.error('❌ GET admin courses error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── PATCH /api/admin/courses/:id/status ────────────────────────────────────
router.patch('/courses/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['published', 'archived', 'draft'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.status(200).json(course);
  } catch (err) {
    console.error('❌ PATCH admin course status error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── GET /api/admin/payments ────────────────────────────────────────────────
router.get('/payments', async (req, res) => {
  try {
    const { data: payments, error } = await supabaseAdmin
      .from('payments')
      .select(`
        id, amount, status, created_at, stripe_payment_intent_id,
        users ( name ),
        courses ( title )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = (payments || []).map(p => ({
      id: p.id,
      amount: p.amount,
      status: p.status,
      created_at: p.created_at,
      stripe_payment_intent_id: p.stripe_payment_intent_id,
      student_name: p.users?.name || 'Unknown',
      course_name: p.courses?.title || 'Multiple/Project'
    }));

    return res.status(200).json(formatted);
  } catch (err) {
    console.error('❌ GET admin payments error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── GET /api/admin/analytics ───────────────────────────────────────────────
router.get('/analytics', async (req, res) => {
  try {
    // Total users
    const { count: total_users } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true });
    
    // Total courses
    const { count: total_courses } = await supabaseAdmin.from('courses').select('*', { count: 'exact', head: true }).eq('status', 'published');
    
    // Total enrollments
    const { count: total_enrollments } = await supabaseAdmin.from('enrollments').select('*', { count: 'exact', head: true });

    // Total revenue
    const { data: payments } = await supabaseAdmin.from('payments').select('amount').eq('status', 'succeeded');
    const total_revenue = (payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);

    // Completion rate
    const { count: allProgress } = await supabaseAdmin.from('progress').select('*', { count: 'exact', head: true });
    const { count: completedProgress } = await supabaseAdmin.from('progress').select('*', { count: 'exact', head: true }).eq('status', 'completed');
    const completion_rate = allProgress > 0 ? Math.round((completedProgress / allProgress) * 100) : 0;

    // Top courses (by enrollment)
    // Simulating aggregation
    const { data: enrData } = await supabaseAdmin.from('enrollments').select('course_id');
    const courseCounts = {};
    (enrData || []).forEach(e => {
      courseCounts[e.course_id] = (courseCounts[e.course_id] || 0) + 1;
    });
    
    const topCourseIds = Object.entries(courseCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);

    let top_courses = [];
    if (topCourseIds.length > 0) {
      const { data: topCourseData } = await supabaseAdmin
        .from('courses')
        .select('id, title')
        .in('id', topCourseIds);
      
      top_courses = topCourseData.map(c => ({
        id: c.id,
        title: c.title,
        enrollments: courseCounts[c.id]
      })).sort((a, b) => b.enrollments - a.enrollments);
    }

    return res.status(200).json({
      total_users: total_users || 0,
      total_courses: total_courses || 0,
      total_enrollments: total_enrollments || 0,
      total_revenue,
      completion_rate,
      top_courses
    });
  } catch (err) {
    console.error('❌ GET admin analytics error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;

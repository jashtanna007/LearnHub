const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// ─── GET /api/certificates/my ───────────────────────────────────────────────
router.get('/my', verifyToken, authorizeRoles('student'), async (req, res) => {
  try {
    const student_id = req.user.id;

    const { data: certificates, error } = await supabaseAdmin
      .from('certificates')
      .select(`
        id, certificate_uid, created_at,
        courses ( title )
      `)
      .eq('student_id', student_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = (certificates || []).map(c => ({
      id: c.id,
      certificate_uid: c.certificate_uid,
      created_at: c.created_at,
      course_title: c.courses?.title || 'Unknown Course'
    }));

    return res.status(200).json(formatted);
  } catch (err) {
    console.error('❌ GET certificates error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/certificates/generate/:course_id ─────────────────────────────
router.post('/generate/:course_id', verifyToken, authorizeRoles('student'), async (req, res) => {
  try {
    const { course_id } = req.params;
    const student_id = req.user.id;

    // 1. Check if already generated
    const { data: existing } = await supabaseAdmin
      .from('certificates')
      .select('*')
      .eq('student_id', student_id)
      .eq('course_id', course_id)
      .single();

    if (existing) {
      return res.status(409).json({ error: 'Certificate already exists for this course.' });
    }

    // 2. Check course progress = 100%
    const { data: sections } = await supabaseAdmin
      .from('sections')
      .select('topics(lessons(id))')
      .eq('course_id', course_id);

    let total_lessons = 0;
    const lessonIds = [];
    (sections || []).forEach(sec => {
      (sec.topics || []).forEach(top => {
        (top.lessons || []).forEach(les => {
          total_lessons++;
          lessonIds.push(les.id);
        });
      });
    });

    if (total_lessons === 0) {
      return res.status(400).json({ error: 'Course has no lessons.' });
    }

    const { count: completed_lessons } = await supabaseAdmin
      .from('progress')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', student_id)
      .in('lesson_id', lessonIds)
      .eq('status', 'completed');

    if (completed_lessons < total_lessons) {
      return res.status(403).json({ error: 'Course not 100% completed.' });
    }

    // Generate certificate
    const certificate_uid = crypto.randomUUID();

    const { data: cert, error } = await supabaseAdmin
      .from('certificates')
      .insert({
        student_id,
        course_id,
        certificate_uid
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Generate cert error:', error);
      return res.status(500).json({ error: 'Failed to generate certificate.' });
    }

    return res.status(201).json(cert);
  } catch (err) {
    console.error('❌ POST generate certificate error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;

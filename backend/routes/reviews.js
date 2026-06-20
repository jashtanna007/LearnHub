const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/courses/:id/reviews ───────────────────────────────────────────
router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: reviews, error } = await supabaseAdmin
      .from('reviews')
      .select(`
        id, rating, comment, created_at,
        users ( name )
      `)
      .eq('course_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ GET reviews error:', error);
      return res.status(500).json({ error: 'Failed to fetch reviews.' });
    }

    // Format response
    const formatted = (reviews || []).map(r => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      student_name: r.users?.name || 'Anonymous'
    }));

    return res.status(200).json(formatted);
  } catch (err) {
    console.error('❌ GET reviews error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/courses/:id/reviews ──────────────────────────────────────────
router.post('/:id/reviews', verifyToken, authorizeRoles('student'), async (req, res) => {
  try {
    const { id: course_id } = req.params;
    const { rating, comment } = req.body;
    const student_id = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Valid rating (1-5) is required.' });
    }

    // Verify enrollment
    const { data: enrollment } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('student_id', student_id)
      .eq('course_id', course_id)
      .single();

    if (!enrollment) {
      return res.status(403).json({ error: 'Must be enrolled to leave a review.' });
    }

    // Check if review exists
    const { data: existing } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('student_id', student_id)
      .eq('course_id', course_id)
      .single();

    if (existing) {
      return res.status(409).json({ error: 'You have already reviewed this course.' });
    }

    // Insert review
    const { data: review, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        course_id,
        student_id,
        rating,
        comment
      })
      .select()
      .single();

    if (error) {
      console.error('❌ POST review error:', error);
      return res.status(500).json({ error: 'Failed to post review.' });
    }

    return res.status(201).json(review);
  } catch (err) {
    console.error('❌ POST review error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;

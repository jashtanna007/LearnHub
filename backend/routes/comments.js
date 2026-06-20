const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/comments/:lesson_id ───────────────────────────────────────────
router.get('/:lesson_id', async (req, res) => {
  try {
    const { lesson_id } = req.params;

    // Fetch comments and nested replies
    const { data: comments, error } = await supabaseAdmin
      .from('comments')
      .select(`
        id, text, created_at,
        users ( name ),
        replies (
          id, text, created_at,
          users ( name )
        )
      `)
      .eq('lesson_id', lesson_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ GET comments error:', error);
      return res.status(500).json({ error: 'Failed to fetch comments.' });
    }

    // Format response
    const formatted = (comments || []).map(c => ({
      id: c.id,
      text: c.text,
      created_at: c.created_at,
      student_name: c.users?.name || 'Anonymous',
      replies: (c.replies || []).map(r => ({
        id: r.id,
        text: r.text,
        created_at: r.created_at,
        student_name: r.users?.name || 'Anonymous'
      })).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    }));

    return res.status(200).json(formatted);
  } catch (err) {
    console.error('❌ GET comments error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/comments ─────────────────────────────────────────────────────
router.post('/', verifyToken, authorizeRoles('student'), async (req, res) => {
  try {
    const { lesson_id, text } = req.body;
    const student_id = req.user.id;

    if (!lesson_id || !text) {
      return res.status(400).json({ error: 'lesson_id and text are required.' });
    }

    const { data: comment, error } = await supabaseAdmin
      .from('comments')
      .insert({
        lesson_id,
        student_id,
        text
      })
      .select()
      .single();

    if (error) throw error;

    // Fetch name
    const { data: user } = await supabaseAdmin.from('users').select('name').eq('id', student_id).single();

    return res.status(201).json({
      ...comment,
      student_name: user?.name || 'Anonymous',
      replies: []
    });
  } catch (err) {
    console.error('❌ POST comment error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/comments/:id/replies ─────────────────────────────────────────
router.post('/:id/replies', verifyToken, authorizeRoles('student'), async (req, res) => {
  try {
    const comment_id = req.params.id;
    const { text } = req.body;
    const student_id = req.user.id;

    if (!text) {
      return res.status(400).json({ error: 'text is required.' });
    }

    const { data: reply, error } = await supabaseAdmin
      .from('replies')
      .insert({
        comment_id,
        student_id,
        text
      })
      .select()
      .single();

    if (error) throw error;

    const { data: user } = await supabaseAdmin.from('users').select('name').eq('id', student_id).single();

    return res.status(201).json({
      ...reply,
      student_name: user?.name || 'Anonymous'
    });
  } catch (err) {
    console.error('❌ POST reply error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;

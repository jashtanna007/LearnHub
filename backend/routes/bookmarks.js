const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/bookmarks/:lesson_id ──────────────────────────────────────────
router.get('/:lesson_id', verifyToken, authorizeRoles('student'), async (req, res) => {
  try {
    const { lesson_id } = req.params;
    const student_id = req.user.id;

    const { data: bookmarks, error } = await supabaseAdmin
      .from('bookmarks')
      .select('*')
      .eq('lesson_id', lesson_id)
      .eq('student_id', student_id)
      .order('timestamp_seconds', { ascending: true });

    if (error) throw error;
    return res.status(200).json(bookmarks || []);
  } catch (err) {
    console.error('❌ GET bookmarks error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/bookmarks ────────────────────────────────────────────────────
router.post('/', verifyToken, authorizeRoles('student'), async (req, res) => {
  try {
    const { lesson_id, timestamp_seconds, label } = req.body;
    const student_id = req.user.id;

    if (!lesson_id || timestamp_seconds === undefined) {
      return res.status(400).json({ error: 'lesson_id and timestamp_seconds are required.' });
    }

    const { data: bookmark, error } = await supabaseAdmin
      .from('bookmarks')
      .insert({
        lesson_id,
        student_id,
        timestamp_seconds,
        label: label || 'Bookmark'
      })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json(bookmark);
  } catch (err) {
    console.error('❌ POST bookmark error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── DELETE /api/bookmarks/:id ──────────────────────────────────────────────
router.delete('/:id', verifyToken, authorizeRoles('student'), async (req, res) => {
  try {
    const { id } = req.params;
    const student_id = req.user.id;

    const { error } = await supabaseAdmin
      .from('bookmarks')
      .delete()
      .eq('id', id)
      .eq('student_id', student_id);

    if (error) throw error;
    return res.status(204).send();
  } catch (err) {
    console.error('❌ DELETE bookmark error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;

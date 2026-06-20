const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/notes/:lesson_id ──────────────────────────────────────────────
router.get('/:lesson_id', verifyToken, authorizeRoles('student'), async (req, res) => {
  try {
    const { lesson_id } = req.params;
    const student_id = req.user.id;

    const { data: notes, error } = await supabaseAdmin
      .from('notes')
      .select('*')
      .eq('lesson_id', lesson_id)
      .eq('student_id', student_id)
      .order('timestamp_seconds', { ascending: true });

    if (error) throw error;
    return res.status(200).json(notes || []);
  } catch (err) {
    console.error('❌ GET notes error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/notes ────────────────────────────────────────────────────────
router.post('/', verifyToken, authorizeRoles('student'), async (req, res) => {
  try {
    const { lesson_id, timestamp_seconds, note_text } = req.body;
    const student_id = req.user.id;

    if (!lesson_id || !note_text) {
      return res.status(400).json({ error: 'lesson_id and note_text are required.' });
    }

    const { data: note, error } = await supabaseAdmin
      .from('notes')
      .insert({
        lesson_id,
        student_id,
        timestamp_seconds: timestamp_seconds || 0,
        note_text
      })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json(note);
  } catch (err) {
    console.error('❌ POST note error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── PATCH /api/notes/:id ───────────────────────────────────────────────────
router.patch('/:id', verifyToken, authorizeRoles('student'), async (req, res) => {
  try {
    const { id } = req.params;
    const { note_text } = req.body;
    const student_id = req.user.id;

    if (!note_text) {
      return res.status(400).json({ error: 'note_text is required.' });
    }

    const { data: note, error } = await supabaseAdmin
      .from('notes')
      .update({ note_text })
      .eq('id', id)
      .eq('student_id', student_id)
      .select()
      .single();

    if (error) throw error;
    return res.status(200).json(note);
  } catch (err) {
    console.error('❌ PATCH note error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;

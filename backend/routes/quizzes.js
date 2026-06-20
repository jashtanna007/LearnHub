const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/quizzes/:id ───────────────────────────────────────────────────
router.get('/:id', verifyToken, authorizeRoles('student'), async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch quiz with questions and options (excluding is_correct)
    const { data: quiz, error } = await supabaseAdmin
      .from('quizzes')
      .select(`
        id, title, quiz_type, time_limit_minutes, min_pass_score,
        questions (
          id, text, type, sort_order,
          options ( id, text, sort_order )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    return res.status(200).json(quiz);
  } catch (err) {
    console.error('❌ GET quiz error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/quizzes/:id/attempt ──────────────────────────────────────────
router.post('/:id/attempt', verifyToken, authorizeRoles('student'), async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, time_taken_seconds } = req.body; // { answers: [{ question_id, option_id }] }
    const student_id = req.user.id;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers array is required.' });
    }

    // 1. Fetch quiz and correct answers
    const { data: quiz } = await supabaseAdmin
      .from('quizzes')
      .select('min_pass_score')
      .eq('id', id)
      .single();

    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });

    const { data: correctOptions } = await supabaseAdmin
      .from('options')
      .select('id, question_id')
      .eq('is_correct', true)
      .in('question_id', answers.map(a => a.question_id));

    // 2. Grade attempt
    let correct_answers = 0;
    const total_questions = answers.length; // Assuming they submitted all

    const correctMap = {};
    (correctOptions || []).forEach(opt => {
      correctMap[opt.question_id] = opt.id;
    });

    answers.forEach(ans => {
      if (correctMap[ans.question_id] === ans.option_id) {
        correct_answers++;
      }
    });

    const score = total_questions > 0 ? Math.round((correct_answers / total_questions) * 100) : 0;
    const passed = score >= (quiz.min_pass_score || 0);

    // 3. Insert attempt record
    const { data: attempt, error: attemptErr } = await supabaseAdmin
      .from('quiz_attempts')
      .insert({
        quiz_id: id,
        student_id,
        score,
        passed,
        time_taken_seconds: time_taken_seconds || 0
      })
      .select()
      .single();

    if (attemptErr) {
      console.error('❌ Insert quiz attempt error:', attemptErr);
      return res.status(500).json({ error: 'Failed to record attempt.' });
    }

    return res.status(200).json({
      score,
      passed,
      correct_answers,
      total_questions,
      time_taken: attempt.time_taken_seconds
    });
  } catch (err) {
    console.error('❌ POST quiz attempt error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;

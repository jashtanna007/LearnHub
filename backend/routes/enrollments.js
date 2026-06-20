const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// ─── GET /api/enrollments/my ────────────────────────────────────────────────
router.get('/my', verifyToken, authorizeRoles('student'), async (req, res) => {
  try {
    const student_id = req.user.id;

    // Fetch enrollments with nested course data
    const { data: enrollments, error } = await supabaseAdmin
      .from('enrollments')
      .select(`
        id, expiry_date,
        courses ( id, title, thumbnail_url, price, category )
      `)
      .eq('student_id', student_id);

    if (error) {
      console.error('❌ GET enrollments error:', error);
      return res.status(500).json({ error: 'Failed to fetch enrollments.' });
    }

    // Enrich with progress percentage
    const enriched = await Promise.all((enrollments || []).map(async (enr) => {
      const course = enr.courses;
      if (!course) return null;

      // 1. Get total lessons for course
      const { data: sections } = await supabaseAdmin
        .from('sections')
        .select('id, topics(id, lessons(id))')
        .eq('course_id', course.id);

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

      let percentage = 0;
      if (total_lessons > 0) {
        const { count } = await supabaseAdmin
          .from('progress')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', student_id)
          .in('lesson_id', lessonIds)
          .eq('status', 'completed');
        
        percentage = Math.round(((count || 0) / total_lessons) * 100);
      }

      return {
        id: enr.id,
        expiry_date: enr.expiry_date,
        course,
        progress_percentage: percentage
      };
    }));

    return res.status(200).json(enriched.filter(Boolean));
  } catch (err) {
    console.error('❌ GET /my enrollments error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/enrollments/:id/extend ───────────────────────────────────────
router.post('/:id/extend', verifyToken, authorizeRoles('student'), async (req, res) => {
  try {
    const { id: enrollment_id } = req.params;
    const { extension_type } = req.body; // '3mo' or '6mo'
    const student_id = req.user.id;

    if (!['3mo', '6mo'].includes(extension_type)) {
      return res.status(400).json({ error: 'Invalid extension type.' });
    }

    // Fetch enrollment and course price
    const { data: enrollment } = await supabaseAdmin
      .from('enrollments')
      .select('*, courses(price)')
      .eq('id', enrollment_id)
      .eq('student_id', student_id)
      .single();

    if (!enrollment || !enrollment.courses) {
      return res.status(404).json({ error: 'Enrollment not found.' });
    }

    const basePrice = enrollment.courses.price || 0;
    let multiplier = extension_type === '3mo' ? 0.15 : 0.20;
    const amount = Math.round(basePrice * multiplier * 100); // in cents for Stripe

    if (amount <= 0) {
      // Free extension
      const monthsToAdd = extension_type === '3mo' ? 3 : 6;
      const currentExpiry = new Date(enrollment.expiry_date);
      const newExpiry = currentExpiry > new Date() ? currentExpiry : new Date();
      newExpiry.setMonth(newExpiry.getMonth() + monthsToAdd);

      await supabaseAdmin
        .from('enrollments')
        .update({ expiry_date: newExpiry.toISOString() })
        .eq('id', enrollment_id);

      return res.status(200).json({ success: true, new_expiry_date: newExpiry.toISOString() });
    }

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'inr',
      metadata: {
        student_id,
        enrollment_id,
        extension_type
      }
    });

    return res.status(200).json({
      client_secret: paymentIntent.client_secret,
      amount: amount / 100
    });
  } catch (err) {
    console.error('❌ POST extend enrollment error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;

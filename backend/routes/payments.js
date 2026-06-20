const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// ─── POST /api/payments/create-intent ───────────────────────────────────────
router.post('/create-intent', verifyToken, authorizeRoles('student'), async (req, res) => {
  try {
    const { course_id, project_id, purchase_type } = req.body;
    const student_id = req.user.id;

    if (!purchase_type) {
      return res.status(400).json({ error: 'purchase_type is required.' });
    }

    let amount = 0;

    // Calculate price
    if (purchase_type === 'course_only') {
      const { data: course } = await supabaseAdmin.from('courses').select('price').eq('id', course_id).single();
      if (!course) return res.status(404).json({ error: 'Course not found.' });
      amount = course.price;
    } else if (purchase_type === 'project_only') {
      const { data: project } = await supabaseAdmin.from('projects').select('price').eq('id', project_id).single();
      if (!project) return res.status(404).json({ error: 'Project not found.' });
      amount = project.price;
    } else if (purchase_type === 'bundle') {
      const { data: bundle } = await supabaseAdmin.from('combo_packages').select('price').eq('course_id', course_id).eq('project_id', project_id).single();
      if (!bundle) return res.status(404).json({ error: 'Bundle not found.' });
      amount = bundle.price;
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount for payment intent.' });
    }

    // Stripe requires amount in smallest currency unit (paise for INR)
    const amountInSmallest = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallest,
      currency: 'inr',
      metadata: {
        student_id,
        course_id: course_id || null,
        project_id: project_id || null,
        purchase_type
      }
    });

    return res.status(200).json({
      client_secret: paymentIntent.client_secret,
      amount
    });
  } catch (err) {
    console.error('❌ POST create-intent error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/payments/confirm ─────────────────────────────────────────────
router.post('/confirm', verifyToken, authorizeRoles('student'), async (req, res) => {
  try {
    const { payment_intent_id, course_id, project_id, purchase_type } = req.body;
    const student_id = req.user.id;

    console.log('💳 Payment confirm received:', { payment_intent_id, course_id, student_id, purchase_type });

    if (!payment_intent_id) {
      return res.status(400).json({ error: 'payment_intent_id is required.' });
    }

    // 1. Verify payment with Stripe
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
      console.log('💳 Stripe verification:', { status: paymentIntent.status, amount: paymentIntent.amount });
    } catch (stripeErr) {
      console.error('❌ Stripe retrieve error:', stripeErr.message);
      return res.status(400).json({ error: `Stripe verification failed: ${stripeErr.message}` });
    }

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: `Payment not succeeded. Status: ${paymentIntent.status}` });
    }

    // 2. Record payment in DB — try with purchase_type first, fallback without
    const paymentRow = {
      student_id: student_id,
      course_id: course_id || null,
      amount: paymentIntent.amount / 100,
      status: 'succeeded',
      stripe_payment_intent_id: payment_intent_id
    };

    let payment = null;
    let payErr = null;

    // Try insert with purchase_type
    const res1 = await supabaseAdmin
      .from('payments')
      .insert({ ...paymentRow, purchase_type: purchase_type || 'course_only' })
      .select()
      .single();
    
    payment = res1.data;
    payErr = res1.error;

    // If purchase_type column doesn't exist, retry without it
    if (payErr && (payErr.message?.includes('purchase_type') || payErr.code === '42703')) {
      console.log('⚠️ purchase_type column not found, retrying without it...');
      const res2 = await supabaseAdmin
        .from('payments')
        .insert(paymentRow)
        .select()
        .single();
      payment = res2.data;
      payErr = res2.error;
    }

    // If duplicate (user clicked pay twice), fetch existing record
    if (payErr && (payErr.code === '23505' || payErr.message?.includes('duplicate') || payErr.message?.includes('unique'))) {
      console.log('⚠️ Duplicate payment, fetching existing record...');
      const { data: existingPay } = await supabaseAdmin
        .from('payments')
        .select('*')
        .eq('stripe_payment_intent_id', payment_intent_id)
        .maybeSingle();
      if (existingPay) {
        payment = existingPay;
        payErr = null;
      }
    }

    if (payErr) {
      console.error('❌ Payment insert/upsert error:', payErr);
      return res.status(500).json({ error: `Payment recording failed: ${payErr.message}` });
    }

    console.log('✅ Payment recorded:', payment?.id);

    // 3. Create enrollment
    let enrollment = null;
    if (!purchase_type || purchase_type === 'course_only' || purchase_type === 'bundle') {
      const expiry_date = new Date();
      expiry_date.setFullYear(expiry_date.getFullYear() + 1);

      // Check if already enrolled
      const { data: existingEnr } = await supabaseAdmin
        .from('enrollments')
        .select('id')
        .eq('student_id', student_id)
        .eq('course_id', course_id)
        .maybeSingle();

      if (existingEnr) {
        console.log('ℹ️ Already enrolled, skipping enrollment insert');
        enrollment = existingEnr;
      } else {
        const { data: enr, error: enrErr } = await supabaseAdmin
          .from('enrollments')
          .insert({
            student_id,
            course_id,
            expiry_date: expiry_date.toISOString()
          })
          .select()
          .single();

        if (enrErr) {
          console.error('❌ Enrollment insert error:', enrErr);
          // Payment succeeded but enrollment failed — still return success with warning
          return res.status(200).json({ 
            payment, 
            enrollment: null, 
            warning: `Payment recorded but enrollment failed: ${enrErr.message}` 
          });
        }
        enrollment = enr;
        console.log('✅ Enrollment created:', enrollment?.id);
      }
    }

    return res.status(200).json({ success: true, payment, enrollment });
  } catch (err) {
    console.error('❌ POST confirm payment error:', err);
    return res.status(500).json({ error: `Payment confirmation failed: ${err.message}` });
  }
});

module.exports = router;

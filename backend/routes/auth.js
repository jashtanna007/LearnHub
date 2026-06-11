const express = require('express');
const jwt = require('jsonwebtoken');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

const ALLOWED_ROLES = ['student', 'instructor'];

// ─── POST /api/auth/register ────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    console.log('📝 Register request received:', { name, email, role });

    // Validate required fields
    if (!name || !email || !password || !role) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ error: 'All fields are required: name, email, password, role.' });
    }

    // Validate role
    if (!ALLOWED_ROLES.includes(role)) {
      console.log('❌ Invalid role:', role);
      return res.status(400).json({ 
        error: `Invalid role. Must be one of: ${ALLOWED_ROLES.join(', ')}.` 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Create auth user in Supabase using admin API
    // This bypasses email confirmation and rate limits
    console.log('🔐 Creating Supabase auth user...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Mark email as confirmed immediately
    });

    if (authError) {
      console.error('❌ Supabase createUser error:', authError.message, authError);
      // Handle duplicate email
      if (authError.message.toLowerCase().includes('already registered') || 
          authError.message.toLowerCase().includes('already been registered') ||
          authError.message.toLowerCase().includes('already exists') ||
          authError.status === 422) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }
      // Handle rate limit
      if (authError.status === 429 || authError.code === 'over_email_send_rate_limit') {
        return res.status(429).json({ error: 'Too many signup attempts. Please wait a few minutes and try again.' });
      }
      // Handle invalid email
      if (authError.code === 'email_address_invalid') {
        return res.status(400).json({ error: 'This email address is not valid. Please use a real email.' });
      }
      return res.status(400).json({ error: `Registration failed: ${authError.message}` });
    }

    if (!authData.user) {
      console.error('❌ Supabase returned no user object');
      return res.status(400).json({ error: 'Registration failed. No user was created.' });
    }

    // Supabase returns a fake user with empty identities when email already exists
    // and email confirmation is enabled. Detect this edge case.
    if (authData.user.identities && authData.user.identities.length === 0) {
      console.log('⚠️ Supabase returned user with empty identities — email likely already exists');
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    console.log('✅ Supabase auth user created:', authData.user.id);

    // Insert user into public users table
    console.log('📦 Inserting into public.users table...');
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        name,
        email,
        role,
      });

    if (insertError) {
      console.error('❌ Users table insert error:', insertError.message, insertError);
      // Handle duplicate email in users table
      if (insertError.code === '23505') {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }
      // Clean up auth user if insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({ error: `Registration failed: ${insertError.message}` });
    }

    console.log('✅ Registration complete for:', email);

    return res.status(201).json({
      message: 'Registration successful.',
      user: {
        id: authData.user.id,
        name,
        email,
        role,
      },
    });
  } catch (error) {
    console.error('❌ Register error (uncaught):', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/auth/login ───────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔑 Login request received:', { email });

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('❌ Supabase login error:', authError.message);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!authData.user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    console.log('✅ Supabase auth successful for:', authData.user.id);

    // Fetch user row from users table to get role and streak_count
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError || !userData) {
      console.error('❌ Users table query error:', userError?.message);
      return res.status(404).json({ error: 'User profile not found.' });
    }

    // Sign JWT
    const token = jwt.sign(
      {
        id: userData.id,
        email: userData.email,
        role: userData.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful for:', email, '| role:', userData.role);

    return res.status(200).json({
      token,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        streak_count: userData.streak_count || 0,
      },
    });
  } catch (error) {
    console.error('❌ Login error (uncaught):', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── GET /api/auth/me ───────────────────────────────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
  try {
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        streak_count: userData.streak_count || 0,
        created_at: userData.created_at,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;

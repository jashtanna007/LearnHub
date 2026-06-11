const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables. Check .env file.');
}

// Public client — respects Row Level Security
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client — bypasses Row Level Security (use only on server)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

module.exports = { supabase, supabaseAdmin };

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { supabaseAdmin } = require('../config/supabase');

async function seedAdmin() {
  const ADMIN_EMAIL = 'admin@learnhub.com';
  const ADMIN_PASSWORD = 'Admin@12345';

  try {
    console.log('👑 Creating admin user...');

    // Check if admin already exists in public.users
    const { data: existingAdmin } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', ADMIN_EMAIL)
      .single();

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.id);
      return;
    }

    // Create in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });

    let userId;

    if (authError) {
      // User might exist in auth but not in public.users
      if (authError.message?.includes('already')) {
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const found = users.find(u => u.email === ADMIN_EMAIL);
        if (found) {
          userId = found.id;
          console.log('📌 Auth user exists, inserting into public.users...');
        } else {
          throw new Error('Cannot find existing auth user');
        }
      } else {
        throw authError;
      }
    } else {
      userId = authData.user.id;
    }

    // Insert into public.users with role 'admin'
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: userId,
        name: 'Admin',
        email: ADMIN_EMAIL,
        role: 'admin'
      });

    if (insertError) throw insertError;

    console.log('✅ Admin user created successfully!');
    console.log('   Email:', ADMIN_EMAIL);
    console.log('   Password:', ADMIN_PASSWORD);
    console.log('   Role: admin');
  } catch (error) {
    console.error('❌ Admin seed error:', error);
    process.exit(1);
  }
}

seedAdmin();

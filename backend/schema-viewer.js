require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const url = process.env.SUPABASE_URL; // wait, this is HTTP url. I don't have connection string.
}
run();

#!/usr/bin/env node
// apply-migrations.js — Applies pending migrations to the live Supabase cloud DB
// Uses the service role key (bypasses RLS) via the REST API

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://oieidnsppwooknzofzeq.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pZWlkbnNwcHdvb2tuem9memVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDk1NzgzMCwiZXhwIjoyMDk2NTMzODMwfQ._mWJxNhbBy7KegYi9ug2JhWMC91s3d79-3gzKf3r1sU';

const MIGRATION_FILE = path.join(__dirname, 'supabase', 'migrations', '013_cumulative_sprint_apply.sql');

const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');

const options = {
  hostname: 'oieidnsppwooknzofzeq.supabase.co',
  port: 443,
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'apikey': SERVICE_ROLE_KEY,
  }
};

// Supabase doesn't have exec_sql by default, so we use the pg REST endpoint
// Instead, use the Management API /pg endpoint
const managementOptions = {
  hostname: 'api.supabase.com',
  port: 443,
  path: '/v1/projects/oieidnsppwooknzofzeq/database/query',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  }
};

const body = JSON.stringify({ query: sql });

console.log('🔄 Applying migrations to Supabase...');
console.log(`   Project: oieidnsppwooknzofzeq`);
console.log(`   Migration: 013_cumulative_sprint_apply.sql`);
console.log('');

const req = https.request(managementOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Migrations applied successfully!');
      console.log('   Tables created: support_tickets, support_ticket_messages, notifications');
      console.log('   Columns added: hotels.config, users.department, users.shift, users.duty_status');
      console.log('   RLS policies applied for all tables.');
    } else {
      console.log(`⚠️  HTTP ${res.statusCode} response from Management API.`);
      console.log('   Response:', data.substring(0, 500));
      console.log('');
      console.log('ℹ️  The Management API query endpoint requires a personal access token,');
      console.log('   not the service role key. Please run the SQL manually in the Supabase Dashboard.');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
  console.log('');
  console.log('ℹ️  Apply the migration manually via the Supabase SQL Editor.');
});

req.write(body);
req.end();

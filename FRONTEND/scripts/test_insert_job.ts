import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://usugsrrznsybgwjypmvq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzdWdzcnJ6bnN5Ymd3anlwbXZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxOTc5NzMsImV4cCI6MjA4OTc3Mzk3M30.xnX8qEI0j3WLZ46KaaG_xcHjI_oZtg0oKH5lRuUoQSU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('--- TEST JOB INSERT ---');
  
  // 1. Get a recruiter ID
  const { data: rec } = await supabase.from('profiles').select('id').eq('role', 'recruiter').limit(1).single();
  if (!rec) {
    console.error('No recruiter found!');
    return;
  }
  console.log('Using Recruiter ID:', rec.id);

  // 2. Try insert
  const { data, error } = await supabase.from('jobs').insert([
    {
      recruiter_id: rec.id,
      title: 'TEST JOB ' + Date.now(),
      description: 'This is a test job description.',
      budget_min: 5000,
      budget_max: 10000,
      status: 'open',
      category: 'Web Dev',
      skills: ['React', 'TypeScript']
    }
  ]).select();

  if (error) {
    console.error('Insert Error:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Detail:', error.details);
  } else {
    console.log('Insert Success!', data);
  }
}

test();

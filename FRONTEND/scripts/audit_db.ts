import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://usugsrrznsybgwjypmvq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzdWdzcnJ6bnN5Ymd3anlwbXZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxOTc5NzMsImV4cCI6MjA4OTc3Mzk3M30.xnX8qEI0j3WLZ46KaaG_xcHjI_oZtg0oKH5lRuUoQSU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { count: jobs } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
  const { count: freelancers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'freelancer');
  const { count: recruiters } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'recruiter');
  const { data: milestones } = await supabase.from('milestones').select('amount, status');
  
  console.log('--- DB AUDIT ---');
  console.log('Jobs:', jobs);
  console.log('Freelancers:', freelancers);
  console.log('Recruiters:', recruiters);
  console.log('Milestone Statuses:', [...new Set(milestones?.map(m => m.status))]);
  console.log('Total Milestones:', milestones?.length);
}

check();

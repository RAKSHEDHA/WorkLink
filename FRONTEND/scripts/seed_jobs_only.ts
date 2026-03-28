import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://usugsrrznsybgwjypmvq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzdWdzcnJ6bnN5Ymd3anlwbXZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxOTc5NzMsImV4cCI6MjA4OTc3Mzk3M30.xnX8qEI0j3WLZ46KaaG_xcHjI_oZtg0oKH5lRuUoQSU';
const supabase = createClient(supabaseUrl, supabaseKey);

const TECH_SKILLS = ['React', 'Next.js', 'Typescript', 'Node.js', 'Python', 'Go', 'Rust', 'AWS', 'Docker', 'Figma'];
const CATEGORIES = ['Web Development', 'Mobile Apps', 'AI & Machine Learning', 'Design', 'Blockchain'];

async function seed() {
  console.log('🚀 SEEDING JOBS FOR EXISTING RECRUITERS...');

  // 1. Get 100 Recruiter IDs
  const { data: recruiters, error: rErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'recruiter')
    .limit(100);

  if (rErr || !recruiters || recruiters.length === 0) {
    console.error('Failed to fetch recruiters:', rErr?.message || 'None found');
    return;
  }

  const recIds = recruiters.map(r => r.id);
  console.log(`Found ${recIds.length} recruiters. Starting job flood...`);

  // 2. Generate 400 Jobs
  const jobs = [];
  for (let i = 0; i < 400; i++) {
    const skills = Array.from({ length: 5 }, () => TECH_SKILLS[Math.floor(Math.random() * TECH_SKILLS.length)]);
    jobs.push({
      recruiter_id: recIds[i % recIds.length],
      title: `${TECH_SKILLS[Math.floor(Math.random() * TECH_SKILLS.length)]} Expert Needed`,
      description: `We are scaling our team and need an expert in ${TECH_SKILLS[i % TECH_SKILLS.length]}. High impact role with competitive pay.`,
      category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
      skills: [...new Set(skills)],
      budget: Math.floor(Math.random() * 450000) + 10000,
      status: 'open'
    });
  }

  // 3. Batch Insert
  for (let i = 0; i < jobs.length; i += 20) {
    const batch = jobs.slice(i, i + 20);
    const { error } = await supabase.from('jobs').insert(batch);
    if (error) {
      console.error(`Batch ${i/20} failed:`, error.message);
    } else {
      console.log(`Batch ${i/20} live.`);
    }
  }

  console.log('✨ Job Flood Complete.');
}

seed();

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

const supabase = createClient(
  'https://usugsrrznsybgwjypmvq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzdWdzcnJ6bnN5Ymd3anlwbXZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxOTc5NzMsImV4cCI6MjA4OTc3Mzk3M30.xnX8qEI0j3WLZ46KaaG_xcHjI_oZtg0oKH5lRuUoQSU'
);

const TECH_SKILLS = [
  'React', 'Next.js', 'Typescript', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'Prisma', 'GraphQL',
  'Python', 'Django', 'FastAPI', 'PyTorch', 'TensorFlow', 'Docker', 'Kubernetes', 'AWS',
  'GCP', 'Azure', 'Figma', 'Adobe XD', 'Sketch', 'UI/UX Design', 'User Research', 'Solidity',
  'Rust', 'Go', 'Redis', 'Kafka', 'Elasticsearch', 'CI/CD', 'Terraform', 'Web3.js', 'Ethers.js'
];

const CATEGORIES = ['Web Development', 'Mobile Apps', 'AI & Machine Learning', 'Design & Creative', 'Blockchain', 'Cybersecurity', 'DevOps & Cloud'];

const FIRST_NAMES = ['Aarav', 'Vihaan', 'Aditya', 'Arjun', 'Sai', 'Ishaan', 'Rohan', 'Pranav', 'Laksh', 'Ananya', 'Diya', 'Ishani', 'Myra', 'Kyra', 'Saanvi', 'Zoya', 'Kavya', 'Riya'];
const LAST_NAMES = ['Sharma', 'Patel', 'Iyer', 'Gupta', 'Khan', 'Reddy', 'Singh', 'Verma', 'Kumar', 'Das', 'Joshi', 'Mehta'];

const COMPANIES = [
  'TechVision India', 'GlobalSoft Solutions', 'InnovateTech Labs', 'CodeCraft Systems', 'DataDriven Co', 
  'DesignFirst Agency', 'CloudNative Inc', 'AIStartup Hub', 'DevOps Pro', 'MobilePro Apps',
  'ScaleUp Digital', 'Nexus Flow', 'Quantum Systems', 'FutureProof AI', 'ByteEngine', 'BlueHorizon'
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function run() {
  console.log('🚀 WorkLink 1000-Row Marketplace Flood START...\n');

  // Diagnostic check
  console.log('🔍 Diagnostics: Checking table visibility...');
  const tablesToCheck = ['profiles', 'jobs', 'proposals', 'contracts', 'milestones', 'applicants'];
  for (const table of tablesToCheck) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (error) console.warn(`⚠️ Table '${table}' check failed:`, error.message);
    else console.log(`✅ Table '${table}' accessible.`);
  }

  // 1. Seed 400 Freelancers
  console.log('👤 Seeding 400 Freelancers...');
  const freelancers = [];
  for (let i = 0; i < 400; i++) {
    const skills = Array.from({ length: 12 }, () => getRandom(TECH_SKILLS));
    freelancers.push({
      id: randomUUID(),
      full_name: `${getRandom(FIRST_NAMES)} ${getRandom(LAST_NAMES)}`,
      role: 'freelancer',
      is_onboarded: true,
      skills: [...new Set(skills)],
      bio: `Expert ${getRandom(CATEGORIES)} developer with ${Math.floor(Math.random() * 8) + 2} years of experience. Specialist in ${getRandom(TECH_SKILLS)}.`,
      hourly_rate: Math.floor(Math.random() * 5000) + 800,
    });
  }
  const { error: fErr } = await supabase.from('profiles').upsert(freelancers, { onConflict: 'id' });
  if (fErr) throw new Error(`Freelancer seed failed: ${fErr.message}`);

  // 2. Seed 200 Recruiters
  console.log('🏢 Seeding 200 Recruiters...');
  const recruiters = [];
  for (let i = 0; i < 200; i++) {
    recruiters.push({
      id: randomUUID(),
      full_name: `${getRandom(FIRST_NAMES)} ${getRandom(LAST_NAMES)} (HR)`,
      role: 'recruiter',
      is_onboarded: true,
      bio: `Talent Acquisition Lead at ${getRandom(COMPANIES)}. Hiring for high-impact roles.`,
    });
  }
  const { error: rErr } = await supabase.from('profiles').upsert(recruiters, { onConflict: 'id' });
  if (rErr) throw new Error(`Recruiter seed failed: ${rErr.message}`);

  // 3. Seed 400 Jobs
  console.log('💼 Seeding 400 Jobs...');
  const jobs = [];
  const recIds = recruiters.map(r => r.id);
  for (let i = 0; i < 400; i++) {
    const cat = getRandom(CATEGORIES);
    const jobSkills = Array.from({ length: 5 }, () => getRandom(TECH_SKILLS));
    jobs.push({
      recruiter_id: getRandom(recIds),
      title: `${getRandom(['Senior', 'Lead', 'Expert', 'Principal'])} ${getRandom(TECH_SKILLS)} Developer`,
      description: `Join us to build next-gen ${cat} solutions. Requires mastery in ${getRandom(TECH_SKILLS)}. Competitive pay and elite team structure.`,
      category: cat,
      skills: [...new Set(jobSkills)],
      budget: Math.floor(Math.random() * 490000) + 10000,
      status: 'open',
    });
  }
  const { data: insertedJobs, error: jErr } = await supabase.from('jobs').insert(jobs).select('id', 'recruiter_id', 'budget');
  if (jErr) throw new Error(`Job seed failed: ${jErr.message}`);
  console.log(`✅ ${insertedJobs?.length || 0} jobs live.`);

  // 4. Seed Contracts & Milestones (Verification Data)
  console.log('💰 Seeding Contracts & Milestones for verification stats...');
  const flIds = freelancers.slice(0, 100).map(f => f.id);
  const contractsData = insertedJobs.slice(0, 200).map((job) => ({
    job_id: job.id,
    recruiter_id: job.recruiter_id,
    freelancer_id: getRandom(flIds),
    total_budget: job.budget,
    status: 'active'
  }));
  const { data: insertedContracts, error: cErr } = await supabase.from('contracts').insert(contractsData).select('id', 'total_budget');
  if (cErr) throw new Error(`Contract seed failed: ${cErr.message}`);
  
  const milestones = [];
  insertedContracts.forEach(contract => {
    const msCount = Math.floor(Math.random() * 2) + 1;
    for (let j = 0; j < msCount; j++) {
      milestones.push({
        contract_id: contract.id,
        title: `Project Milestone ${j + 1}`,
        amount: Math.floor(contract.total_budget / msCount),
        status: Math.random() > 0.4 ? 'released' : 'pending'
      });
    }
  });
  const { error: mErr } = await supabase.from('milestones').insert(milestones);
  if (mErr) throw new Error(`Milestone seed failed: ${mErr.message}`);

  console.log('\n📊 SEEDING COMPLETE: 1000+ dynamic rows live.');
  console.log('✨ Marketplace is now fully flooded and verified.\n');
}

run().catch(err => {
  console.error('\n❌ SEED ERROR:', err.message);
  process.exit(1);
});

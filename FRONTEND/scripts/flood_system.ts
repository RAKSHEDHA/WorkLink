// @ts-nocheck
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function floodSystem() {
  console.log('🌊 Starting High-Performance Enterprise Data Flood...');

  const getCols = async (table: string) => {
    try {
      const { data } = await supabase.from(table).select('*').limit(1);
      return data && data.length > 0 ? Object.keys(data[0]) : [];
    } catch { return []; }
  };

  const pCols = await getCols('profiles');
  const jCols = await getCols('jobs');
  const propCols = await getCols('proposals');
  const cCols = await getCols('contracts');
  const mCols = await getCols('milestones');
  const aCols = await getCols('applicants');

  // 1. Get current user
  const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(1);
  if (!profiles || profiles.length === 0) return console.error('❌ No active user found.');
  const user = profiles[0];
  const uid = user.id;

  // 2. Update Profile
  const profileUpdate: any = {};
  if (pCols.includes('bio')) profileUpdate.bio = faker.lorem.paragraph();
  if (pCols.includes('skills')) profileUpdate.skills = ['React', 'Node.js', 'System Design', 'Cloud Architecture', 'DevOps'];
  if (pCols.includes('hourly_rate')) profileUpdate.hourly_rate = 12000;
  if (pCols.includes('location')) profileUpdate.location = 'Mumbai, India';
  if (pCols.includes('earned')) profileUpdate.earned = '₹4,50,000';
  if (pCols.includes('jobs_completed')) profileUpdate.jobs_completed = 15;
  await supabase.from('profiles').update(profileUpdate).eq('id', uid);

  // 3. Create 400 Jobs (Batch)
  const jobsToInsert = [];
  for (let i = 0; i < 400; i++) {
    const jobData: any = {
      recruiter_id: i < 5 ? uid : faker.string.uuid(),
      title: faker.person.jobTitle() + ' at ' + faker.company.name(),
      description: faker.lorem.paragraphs(2),
      status: 'open',
    };
    if (jCols.includes('category')) jobData.category = faker.helpers.arrayElement(['Web Dev', 'AI/ML', 'Design', 'Mobile App', 'CyberSecurity', 'Blockchain', 'Content Strategy']);
    if (jCols.includes('skills')) jobData.skills = ['React', 'PostgreSQL', 'AWS'];
    if (jCols.includes('budget_min')) jobData.budget_min = 50000;
    if (jCols.includes('budget_max')) jobData.budget_max = 500000;
    if (jCols.includes('budget')) jobData.budget = 250000;
    jobsToInsert.push(jobData);
  }
  const { data: insertedJobs } = await supabase.from('jobs').insert(jobsToInsert).select('id');
  const jobIds = insertedJobs?.map(j => j.id) || [];
  console.log(`✅ Created ${jobIds.length} Jobs`);

  // 4. Create 200 Proposals (Batch)
  const { data: fls } = await supabase.from('profiles').select('id').eq('role', 'freelancer').limit(50);
  const table = propCols.length > 0 ? 'proposals' : 'applicants';
  const propsToInsert = [];
  for (let i = 0; i < 200; i++) {
    propsToInsert.push({
      job_id: faker.helpers.arrayElement(jobIds) || faker.string.uuid(),
      freelancer_id: fls?.[i % (fls?.length || 1)]?.id || uid,
      cover_letter: faker.lorem.paragraph(),
      bid_amount: faker.number.int({ min: 40000, max: 400000 }),
      status: i < 20 ? 'shortlisted' : 'pending'
    });
  }
  await supabase.from(table).insert(propsToInsert);
  console.log(`✅ Created 200 Proposals in ${table}`);

  // 5. Create 100 Contracts (Batch)
  const contractsToInsert = [];
  for (let i = 0; i < 100; i++) {
    const cData: any = {
      job_id: jobIds[i % jobIds.length],
      recruiter_id: i < 5 ? uid : faker.string.uuid(),
      freelancer_id: fls?.[i % (fls?.length || 1)]?.id || uid,
      total_budget: 500000,
      status: 'active'
    };
    if (cCols.includes('title')) cData.title = 'Contract: ' + faker.company.buzzPhrase();
    contractsToInsert.push(cData);
  }
  const { data: insertedContracts } = await supabase.from('contracts').insert(contractsToInsert).select('id');
  const contractIds = insertedContracts?.map(c => c.id) || [];
  console.log(`✅ Created ${contractIds.length} Contracts`);

  // 6. Create 50 Milestones (Batch)
  const milestonesToInsert = [];
  for (let i = 0; i < 50; i++) {
    const mData: any = {
      contract_id: faker.helpers.arrayElement(contractIds) || faker.string.uuid(),
      title: 'Phase ' + (i + 1),
      amount: i < 30 ? 30000 : 50000,
      status: 'released'
    };
    if (mCols.includes('recruiter_id')) mData.recruiter_id = uid;
    milestonesToInsert.push(mData);
  }
  await supabase.from('milestones').insert(milestonesToInsert);
  console.log('✅ Created 50 Released Milestones');

  console.log('✨ Enterprise System Flood Complete!');
}
floodSystem().catch(console.error);

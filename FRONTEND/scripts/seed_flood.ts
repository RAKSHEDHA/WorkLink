import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function batchInsert(table: string, data: any[], batchSize = 50) {
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const { error } = await supabase.from(table).upsert(batch);
    if (error) {
       console.error(`❌ Error in ${table} batch ${i / batchSize}:`, error.message);
       return false;
    }
    console.log(`✅ ${table} batch ${i / batchSize + 1} complete. (${batch.length} rows)`);
  }
  return true;
}

async function floodData() {
  console.log('🌊 Starting Batched Data Flood (1000 Rows)...');

  // 1. Seed 200 Recruiters
  const recruiters = Array.from({ length: 200 }).map(() => ({
    id: faker.string.uuid(),
    full_name: faker.person.fullName(),
    role: 'recruiter',
    is_onboarded: true,
    company_name: faker.company.name(),
    industry: faker.company.buzzAdjective(),
    bio: faker.company.catchPhrase(),
  }));
  if (!(await batchInsert('profiles', recruiters))) return;

  // 2. Seed 400 Freelancers
  const freelancers = Array.from({ length: 400 }).map(() => ({
    id: faker.string.uuid(),
    full_name: faker.person.fullName(),
    role: 'freelancer',
    is_onboarded: true,
    skills: faker.helpers.arrayElements(['React', 'Node.js', 'TypeScript', 'Python', 'AI/ML', 'Design', 'Marketing', 'DevOps'], { min: 3, max: 6 }),
    bio: faker.lorem.paragraph(),
    hourly_rate: faker.number.int({ min: 500, max: 15000 }),
  }));
  if (!(await batchInsert('profiles', freelancers))) return;

  // 3. Seed 400 Jobs
  const recruiterIds = recruiters.map(r => r.id);
  const jobs = Array.from({ length: 400 }).map(() => ({
    id: faker.string.uuid(),
    recruiter_id: faker.helpers.arrayElement(recruiterIds),
    title: faker.person.jobTitle() + ' Needed',
    description: faker.lorem.paragraphs(2),
    skills: faker.helpers.arrayElements(['React', 'Node.js', 'Python', 'AI'], 3),
    category: faker.helpers.arrayElement(['Development', 'Design', 'AI', 'Sales']),
    budget: faker.number.int({ min: 10000, max: 500000 }),
    status: 'open',
    created_at: faker.date.recent({ days: 30 }).toISOString(),
  }));
  if (!(await batchInsert('jobs', jobs))) return;

  // 4. Seed Contracts & Milestones (200 of each)
  const freelancerIds = freelancers.map(f => f.id);
  const jobIds = jobs.map(j => j.id);

  const contracts = Array.from({ length: 200 }).map((_, i) => ({
    id: faker.string.uuid(),
    job_id: jobIds[i],
    recruiter_id: faker.helpers.arrayElement(recruiterIds),
    freelancer_id: faker.helpers.arrayElement(freelancerIds),
    total_budget: faker.number.int({ min: 10000, max: 200000 }),
    status: 'active',
  }));
  if (!(await batchInsert('contracts', contracts))) return;

  const milestones = contracts.map(c => ({
    id: faker.string.uuid(),
    contract_id: c.id,
    title: 'Initial Phase Completion',
    amount: Math.floor(c.total_budget * 0.4),
    status: 'released',
    released_at: new Date().toISOString(),
  }));
  if (!(await batchInsert('milestones', milestones))) return;

  console.log('\n📊 BATCHED SEEDING COMPLETE: 1000+ Rows Synchronized.');
}

floodData();

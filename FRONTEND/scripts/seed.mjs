import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const TECH_SKILLS = ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'Go', 'Rust', 'AWS', 'Docker', 'Figma', 'Solidity', 'Kubernetes', 'Tailwind', 'Material UI', 'Django', 'FastAPI', 'PostgreSQL', 'Redis', 'GraphQL'];
const CATEGORIES = ['Web Development', 'Mobile Apps', 'AI & Machine Learning', 'UI/UX Design', 'Blockchain', 'Cybersecurity', 'Cloud Architecture', 'Data Science'];

const BATCH_SIZE = 50;

async function seed() {
  try {
    console.log('🚀 STARTING ULTIMATE 1000-ROW DATA FLOOD...');

    // 1. SEED 400 PROFILES
    console.log('👥 Generating 400 Profiles...');
    const profiles = [];
    const flIds: string[] = [];
    const recIds: string[] = [];

    for (let i = 0; i < 600; i++) {
      const id = faker.string.uuid();
      const role = i < 400 ? 'freelancer' : 'recruiter';
      if (role === 'freelancer') flIds.push(id); else recIds.push(id);

      profiles.push({
        id,
        full_name: faker.person.fullName(),
        role,
        is_onboarded: true,
        skills: role === 'freelancer' ? faker.helpers.arrayElements(TECH_SKILLS, { min: 3, max: 6 }) : [],
        bio: faker.lorem.paragraph(),
        company_name: role === 'recruiter' ? faker.company.name() : null,
        industry: role === 'recruiter' ? faker.helpers.arrayElement(CATEGORIES) : null,
        hourly_rate: role === 'freelancer' ? faker.number.int({ min: 20, max: 150 }) : null,
        avatar_url: `https://i.pravatar.cc/150?u=${id}`,
        header_url: `https://picsum.photos/seed/${id}/1200/400`,
        earned: role === 'freelancer' ? faker.number.int({ min: 0, max: 50000 }) : 0,
        jobs_completed: role === 'freelancer' ? faker.number.int({ min: 0, max: 25 }) : 0,
        rating: faker.number.float({ min: 4.0, max: 5.0, fractionDigits: 1 }),
        location: faker.location.city() + ', ' + faker.location.country()
      });
    }

    for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
      const batch = profiles.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from('profiles').upsert(batch);
      if (error) {
        console.error(`❌ Profile batch ${i / BATCH_SIZE} FAILED:`, error.message);
        throw new Error('Profile insertion failed');
      } else {
        console.log(`✅ Profile batch ${i / BATCH_SIZE} (${batch.length} rows) live.`);
      }
    }

    if (recIds.length === 0) throw new Error('No recruiters generated!');

    // 2. SEED 400 JOBS
    console.log('💼 Generating 400 Jobs...');
    const jobs = [];
    for (let i = 0; i < 400; i++) {
        const cat = faker.helpers.arrayElement(CATEGORIES);
        jobs.push({
          recruiter_id: faker.helpers.arrayElement(recIds),
          title: `${cat} ${faker.helpers.arrayElement(['Expert', 'Specialist', 'Architect', 'Developer'])}`,
          description: faker.lorem.paragraphs(2),
          category: cat,
          skills: faker.helpers.arrayElements(TECH_SKILLS, { min: 2, max: 4 }),
          budget_min: faker.number.int({ min: 1000, max: 5000 }),
          budget_max: faker.number.int({ min: 5001, max: 15000 }),
          status: 'open',
          created_at: faker.date.recent({ days: 30 }).toISOString()
        });
    }

    const jobIds: string[] = [];
    for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
      const batch = jobs.slice(i, i + BATCH_SIZE);
      const { data, error } = await supabase.from('jobs').insert(batch).select('id');
      if (error) {
        console.error(`❌ Job batch ${i / BATCH_SIZE} FAILED:`, error.message);
        throw new Error('Job insertion failed');
      } else if (data) {
        jobIds.push(...data.map(j => j.id));
        console.log(`✅ Job batch ${i / BATCH_SIZE} (${data.length} rows) live. Total Jobs: ${jobIds.length}`);
      }
    }

    if (jobIds.length === 0) throw new Error('No jobs inserted successfully!');

    // 3. SEED 200 CONTRACTS & MILESTONES
    console.log('📜 Generating 200 Contracts & Financial Data...');
    const contracts = [];
    for (let i = 0; i < 200; i++) {
        const jobId = faker.helpers.arrayElement(jobIds);
        const recruiterId = faker.helpers.arrayElement(recIds);
        const freelancerId = faker.helpers.arrayElement(flIds);
        const budget = faker.number.int({ min: 2000, max: 20000 });
        
        contracts.push({
          job_id: jobId,
          recruiter_id: recruiterId,
          freelancer_id: freelancerId,
          total_budget: budget,
          status: faker.helpers.arrayElement(['active', 'completed']),
          created_at: faker.date.recent({ days: 60 }).toISOString()
        });
    }

    for (let i = 0; i < contracts.length; i += BATCH_SIZE) {
      const batch = contracts.slice(i, i + BATCH_SIZE);
      const { data, error } = await supabase.from('contracts').insert(batch).select('id, total_budget');
      if (error) {
        console.error(`❌ Contract batch ${i / BATCH_SIZE} FAILED:`, error.message);
        // Don't throw here, just skip milestones for this batch
      } else if (data) {
        console.log(`✅ Contract batch ${i / BATCH_SIZE} live.`);
        
        // Seed 2 milestones per contract
        const milestones = [];
        for (const contract of data) {
          const m1_amount = Math.floor(contract.total_budget / 2);
          const m2_amount = contract.total_budget - m1_amount;
          
          milestones.push({
            contract_id: contract.id,
            title: 'Initial Research & Draft',
            amount: m1_amount,
            status: 'released',
            released_at: faker.date.recent({ days: 10 }).toISOString()
          });
          milestones.push({
            contract_id: contract.id,
            title: 'Final Implementation',
            amount: m2_amount,
            status: faker.helpers.arrayElement(['pending', 'released']),
            released_at: faker.date.recent({ days: 2 }).toISOString()
          });
        }
        const { error: mError } = await supabase.from('milestones').insert(milestones);
        if (mError) console.error('Milestone insertion error:', mError.message);
      }
    }

    console.log('✨ ULTIMATE 1000-ROW DATA FLOOD COMPLETE!');
  } catch (err: any) {
    console.error('❌ FATAL ERROR:', err.message);
    process.exit(1);
  }
}

seed();

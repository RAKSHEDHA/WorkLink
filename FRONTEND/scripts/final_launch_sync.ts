import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalLaunchSync() {
  console.log('🚀 Starting Final Launch Seal: Data Re-sync...');

  // 1. Get the most recent profile (the active user)
  const { data: profile, error: pError } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (pError || !profile) {
    console.error('Could not find active profile:', pError);
    return;
  }

  const TARGET_UUID = profile.id;
  console.log(`🎯 Targeting User: ${profile.full_name} (${TARGET_UUID})`);

  // 2. Clear old test data for this user to prevent duplicates if needed
  // (Optional: depending on whether we want to keep or replace)
  
  // 3. Create 20 Jobs (Elite Enterprise Grade)
  const jobs = Array.from({ length: 20 }).map((_, i) => ({
    id: crypto.randomUUID(),
    recruiter_id: TARGET_UUID,
    title: [
      'Industrial AI Pipeline Architect',
      'Fintech Logic Specialist',
      'Global Web3 Lead',
      'Enterprise Cloud Security',
      'Quantum Performance Expert',
      'Rust Systems Lead',
      'SaaS Data Engineering',
      'Full-Stack Fintech Dev',
      'AI Diagnostics Specialist',
      'DeFi Smart Contract Audit'
    ][i % 10] + ` (Elite Release #${i + 1})`,
    category: ['AI/ML', 'Fintech', 'Web3', 'Cyber', 'Web Dev'][i % 5],
    description: 'Industrial-grade project for WorkLink Enterprise. This mission critical delivery requires extreme technical authority and 100% uptime architecture.',
    budget_min: 15000 + (i * 100),
    budget_max: 25000 + (i * 200),
    status: 'open',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
    created_at: new Date().toISOString()
  }));

  const { error: jError } = await supabase.from('jobs').upsert(jobs);
  if (jError) console.error('Job Sync Error:', jError);
  else console.log(`✅ Seeded 20 Industrial Jobs.`);

  // 4. Create 30 Proposals
  const proposals = Array.from({ length: 30 }).map((_, i) => ({
    id: crypto.randomUUID(),
    job_id: jobs[i % jobs.length].id,
    freelancer_id: TARGET_UUID,
    cover_letter: 'I have delivered 10+ high-scale enterprise systems with WorkLink. My technical authority in AI and Fintech ensures zero-latency and 100% security for this industrial mission.',
    bid_amount: 18000 + (i * 100),
    status: i < 15 ? 'hired' : 'pending',
    created_at: new Date().toISOString()
  }));

  const { error: prError } = await supabase.from('proposals').upsert(proposals);
  if (prError) console.error('Proposal Sync Error:', prError);
  else console.log(`✅ Seeded 30 High-Intent Proposals.`);

  // 5. Create 15 Contracts
  const contracts = proposals.filter(p => p.status === 'hired').slice(0, 15).map((p, i) => ({
    id: i === 0 ? '11111111-1111-1111-1111-111111111111' : crypto.randomUUID(),
    job_id: p.job_id,
    freelancer_id: TARGET_UUID,
    recruiter_id: TARGET_UUID,
    total_budget: 45000 + (i * 1000),
    status: 'active',
    created_at: new Date(Date.now() - (i * 1000 * 60 * 60 * 24)).toISOString()
  }));

  const { error: cError } = await supabase.from('contracts').upsert(contracts);
  if (cError) console.error('Contract Sync Error:', cError);
  else console.log(`✅ Seeded 15 Active Contracts.`);

  // 6. Seed 50 Released Milestones
  const allMilestones: any[] = [];
  contracts.forEach((c, idx) => {
    const numMilestones = idx === 0 ? 10 : 3;
    for (let i = 0; i < numMilestones; i++) {
      allMilestones.push({
        contract_id: c.id,
        title: `Phase ${i + 1}: Technical Delivery Stage`,
        amount: 8500 + (idx * 100),
        status: i < (numMilestones - 1) ? 'released' : 'in_progress',
        created_at: new Date(Date.now() - (i * 1000 * 60 * 60 * 24)).toISOString(),
        freelancer_id: TARGET_UUID
      });
    }
  });

  // Ensure we reach ~50 milestones
  while (allMilestones.length < 50) {
    allMilestones.push({
      contract_id: contracts[0].id,
      title: `Additional Strategic Phase ${allMilestones.length + 1}`,
      amount: 5000,
      status: 'released',
      created_at: new Date().toISOString(),
      freelancer_id: TARGET_UUID
    });
  }

  const { error: mError } = await supabase.from('milestones').upsert(allMilestones.slice(0, 50));
  if (mError) console.error('Milestone Sync Error:', mError);
  else console.log(`✅ Seeded 50 Strategic Milestones.`);

  console.log('🏁 Final Launch Sync Complete! Every page will now be fully hydrated.');
}

finalLaunchSync();

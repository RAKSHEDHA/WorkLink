import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function globalRecovery() {
    // Fetch the most recent profile to target
    const { data: latestProfiles } = await supabase.from('profiles').select('id, full_name').order('created_at', { ascending: false }).limit(1);
    
    if (!latestProfiles || latestProfiles.length === 0) {
        console.error('No profiles found in database to sync.');
        return;
    }

    const TARGET_UUID = latestProfiles[0].id;
    console.log(`🚀 GLOBAL RECOVERY START: Sealing Data for User: ${latestProfiles[0].full_name} (${TARGET_UUID})`);

  try {
    // 1. JOBS
    console.log('--- Seeding Jobs (Valid UUIDs) ---');
    const jobs = Array.from({ length: 20 }).map((_, i) => ({
        id: `00000000-0000-0000-0000-${(i + 1).toString().padStart(12, '0')}`,
        recruiter_id: TARGET_UUID,
        title: `Elite Project ${i + 1}: ${['AI Agent Architecture', 'Cloud Infrastructure Hardening', 'Web3 Protocol Design'][i % 3]}`,
        category: i % 2 === 0 ? 'Web Dev' : 'AI/ML',
        description: 'High-intent mission critical project.',
        budget_min: 50000 + (i * 10000),
        budget_max: 90000 + (i * 10000),
        status: 'open',
        created_at: new Date().toISOString()
    }));
    await supabase.from('jobs').upsert(jobs);

    // 2. PROPOSALS
    console.log('--- Seeding Proposals (Valid UUIDs) ---');
    const proposals = Array.from({ length: 20 }).map((_, i) => ({
        id: `aaaaaaaa-aaaa-aaaa-aaaa-${(i + 1).toString().padStart(12, '0')}`,
        job_id: jobs[i % 20].id,
        freelancer_id: TARGET_UUID,
        cover_letter: 'I am the perfect candidate for this enterprise role.',
        bid_amount: 45000 + (i * 5000),
        status: 'pending',
        created_at: new Date().toISOString()
    }));
    await supabase.from('proposals').upsert(proposals);

    // 3. CONTRACTS (c1 mapping to 11111111...)
    console.log('--- Seeding Contracts (Valid UUIDs) ---');
    const contracts = Array.from({ length: 20 }).map((_, i) => ({
        id: i === 0 ? '11111111-1111-1111-1111-111111111111' : `cccccccc-cccc-cccc-cccc-${(i + 1).toString().padStart(12, '0')}`,
        job_id: jobs[i % 20].id,
        recruiter_id: TARGET_UUID,
        freelancer_id: TARGET_UUID,
        total_budget: 850000,
        status: 'active',
        created_at: new Date().toISOString()
    }));
    await supabase.from('contracts').upsert(contracts);

    // 4. MESSAGES & TASKS & MEETINGS & MILESTONES
    for (let i = 0; i < 20; i++) {
        const contractId = contracts[i].id;
        
        console.log(`--- Syncing children for Contract: ${contractId} ---`);

        // 10 Messages per contract
        const msgs = Array.from({ length: 10 }).map((_, mi) => ({
            contract_id: contractId,
            sender_id: mi % 2 === 0 ? TARGET_UUID : '00000000-0000-0000-0000-000000000000', // Use a valid UUID for system
            receiver_id: TARGET_UUID,
            content: `Elite Sync message #${mi + 1}: Ensuring 100% data density.`,
            created_at: new Date(Date.now() - (10 - mi) * 60000).toISOString()
        }));
        await supabase.from('messages').insert(msgs);

        // 3 Tasks per contract
        const tasks = [
            { workroom_id: contractId, title: 'Security Perimeter Hardening', status: 'done', assignee: 'Principal Engineer' },
            { workroom_id: contractId, title: 'Database Optimization Sprint', status: 'in_progress', assignee: 'Database Lead' },
            { workroom_id: contractId, title: 'Final Production Deployment', status: 'todo', assignee: 'DevOps Lead' },
        ];
        await supabase.from('tasks').insert(tasks);

        // 1 Meeting per contract
        await supabase.from('meetings').insert([{
            contract_id: contractId,
            title: 'Project Kickoff & Security Sync',
            link: 'https://meet.google.com/abc-def-ghi',
            scheduled_for: new Date(Date.now() + 3600000).toISOString(),
            created_by: TARGET_UUID
        }]);

        // 3 Milestones per contract
        const milestones = [
          { contract_id: contractId, title: 'Phase 1: Architecture Blueprint', amount: 150000, status: 'released', date: '2024-03-20' },
          { contract_id: contractId, title: 'Phase 2: Core Implementation', amount: 300000, status: 'released', date: '2024-03-25' },
          { contract_id: contractId, title: 'Phase 3: Final Polishing', amount: 400000, status: 'in_progress', date: '2024-04-05' },
        ];
        await supabase.from('milestones').insert(milestones);
    }

    console.log('\n✨ GLOBAL RECOVERY COMPLETE. c1 is now ALIVE and OWNED.');
  } catch (err) {
    console.error('Fatal recovery error:', err);
  }
}

globalRecovery();

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const targetUid = 'a0edcebe-7f95-9202-2aaf-7181df326e4f';

async function floodSaturated() {
  console.log('🌊 Starting Total Data Saturation Flow...');

  try {
    // 1. Create 100 Baseline Jobs
    console.log('📡 Inserting Jobs...');
    const jobsToInsert = [];
    for (let i = 0; i < 100; i++) {
      jobsToInsert.push({
        recruiter_id: i < 10 ? targetUid : faker.string.uuid(),
        title: faker.person.jobTitle() + ' for ' + faker.company.name(),
        description: faker.lorem.paragraphs(2),
        status: 'open',
        category: faker.helpers.arrayElement(['Web Dev', 'AI/ML', 'Design', 'Mobile App', 'CyberSecurity', 'Blockchain', 'Content Strategy']),
        budget: faker.number.int({ min: 50000, max: 500000 }),
        skills: ['React', 'Node.js', 'PostgreSQL']
      });
    }
    const { data: jobs, error: jErr } = await supabase.from('jobs').insert(jobsToInsert).select('id');
    if (jErr) {
      console.error('❌ Job insert error:', jErr.message);
      return;
    }
    const jobIds = jobs?.map(j => j.id) || [];
    console.log(`✅ Created ${jobIds.length} Jobs (10 owned by you)`);

    // 2. Create 50 Proposals (15 owned by you)
    console.log('📡 Inserting Proposals...');
    const propsToInsert = [];
    for (let i = 0; i < 50; i++) {
      propsToInsert.push({
        job_id: faker.helpers.arrayElement(jobIds),
        freelancer_id: i < 15 ? targetUid : faker.string.uuid(),
        cover_letter: faker.lorem.paragraph(),
        bid_amount: faker.number.int({ min: 40000, max: 400000 }),
        status: i < 15 ? 'shortlisted' : 'pending'
      });
    }
    const { error: pErr } = await supabase.from('proposals').insert(propsToInsert);
    if (pErr) console.error('❌ Proposal insert error:', pErr.message);
    else console.log('✅ Created 50 Proposals (15 submitted by you)');

    // 3. Create 12 Contracts (All owned by you as Recruiter/Freelancer)
    console.log('📡 Inserting Contracts...');
    const contractsToInsert = [];
    for (let i = 0; i < 12; i++) {
      contractsToInsert.push({
        job_id: jobIds[i % jobIds.length],
        recruiter_id: targetUid,
        freelancer_id: targetUid,
        total_budget: 500000,
        status: 'active'
      });
    }
    const { data: contracts, error: cErr } = await supabase.from('contracts').insert(contractsToInsert).select('id');
    if (cErr) {
      console.error('❌ Contract insert error:', cErr.message);
    } else {
      const contractIds = contracts?.map(c => c.id) || [];
      console.log(`✅ Created ${contractIds.length} Contracts (All linked to you)`);

      // 4. Create 25 Released Milestones (Avg 45,000)
      console.log('📡 Inserting Milestones...');
      const milestonesToInsert = [];
      for (let i = 0; i < 25; i++) {
        milestonesToInsert.push({
          contract_id: contractIds[i % contractIds.length],
          title: 'Milestone ' + (i + 1),
          amount: 45000,
          status: 'released'
        });
      }
      const { error: mErr } = await supabase.from('milestones').insert(milestonesToInsert);
      if (mErr) console.error('❌ Milestone insert error:', mErr.message);
      else console.log('✅ Created 25 Released Milestones (Total: ₹11,25,000)');
    }
  } catch (err) {
    console.error('💥 Critical Exception:', err);
  }

  console.log('✨ Data Saturation Complete!');
}

floodSaturated().catch(console.error);

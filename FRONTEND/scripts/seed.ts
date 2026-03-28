import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

const supabaseUrl = 'https://usugsrrznsybgwjypmvq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzdWdzcnJ6bnN5Ymd3anlwbXZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxOTc5NzMsImV4cCI6MjA4OTc3Mzk3M30.xnX8qEI0j3WLZ46KaaG_xcHjI_oZtg0oKH5lRuUoQSU';
const supabase = createClient(supabaseUrl, supabaseKey);

const TECH_SKILLS = ['React', 'Next.js', 'Typescript', 'Node.js', 'Python', 'Go', 'Rust', 'AWS', 'Docker', 'Figma', 'Solidity', 'Kubernetes', 'Tailwind', 'Material UI', 'Django', 'FastAPI'];
const NAMES = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Riley', 'Quinn', 'Skyler', 'Avery', 'Parker'];
const SURNAMES = ['Rivera', 'Chen', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];

async function seed() {
  try {
    console.log('🚀 TOTAL SYSTEM ACTIVATION: 1000-ROW DATA FLOOD STARTING...');

    // 1. GENERATE 400 FREELANCERS & 200 RECRUITERS
    console.log('👤 Generating 600 Profiles...');
    const profiles = [];
    const flIds: string[] = [];
    const recIds: string[] = [];

    for (let i = 0; i < 600; i++) {
        const id = crypto.randomUUID();
        const isFreelancer = i < 400;
        const name = `${NAMES[Math.floor(Math.random() * NAMES.length)]} ${SURNAMES[Math.floor(Math.random() * SURNAMES.length)]}`;
        
        profiles.push({
            id,
            full_name: name,
            role: isFreelancer ? 'freelancer' : 'recruiter',
            is_onboarded: true,
            bio: `Expert in ${TECH_SKILLS[i % TECH_SKILLS.length]} with ${Math.floor(Math.random() * 10) + 1} years of experience.`,
            skills: isFreelancer ? [TECH_SKILLS[i % TECH_SKILLS.length], TECH_SKILLS[(i+1) % TECH_SKILLS.length]] : []
        });

        if (isFreelancer) flIds.push(id);
        else recIds.push(id);
    }

    for (let i = 0; i < profiles.length; i += 100) {
        const { error } = await supabase.from('profiles').upsert(profiles.slice(i, i + 100));
        if (error) console.error('Profile upsert error:', error.message);
        else console.log(`Profile batch ${i/100 + 1} live.`);
    }

    // 2. SEED 400 JOBS
    console.log('💼 Seeding 400 Jobs...');
    const jobs = [];
    for (let i = 0; i < 400; i++) {
        jobs.push({
          id: crypto.randomUUID(),
          recruiter_id: recIds[i % recIds.length],
          title: `${TECH_SKILLS[Math.floor(Math.random() * TECH_SKILLS.length)]} ${['Architect', 'Developer', 'Lead', 'Specialist'][i % 4]} Needed`,
          description: `Looking for a top-tier ${TECH_SKILLS[i % TECH_SKILLS.length]} professional to join our enterprise project. Must handle complex arrays and deployments.`,
          category: i % 2 === 0 ? 'Web Development' : 'Mobile Apps',
          budget_min: Math.floor(Math.random() * 3000) + 1000,
          budget_max: Math.floor(Math.random() * 7000) + 4000,
          status: 'open'
        });
    }

    const jobIds: string[] = [];
    for (let i = 0; i < jobs.length; i += 50) {
      const { data, error } = await supabase.from('jobs').insert(jobs.slice(i, i + 50)).select('id');
      if (error) console.error(`Job batch error:`, error.message);
      else if (data) {
          data.forEach(j => jobIds.push(j.id));
          console.log(`Job batch ${i/50 + 1} live.`);
      }
    }

    // 3. SEED 600 PROPOSALS
    console.log('📝 Seeding 600 Proposals...');
    const proposals = [];
    for (let i = 0; i < 600; i++) {
      const jobId = jobIds[i % jobIds.length];
      proposals.push({
        id: crypto.randomUUID(),
        job_id: jobId,
        freelancer_id: flIds[i % flIds.length],
        cover_letter: "I am extremely qualified for this role. I have extensive experience in the required stack.",
        bid_amount: Math.floor(Math.random() * 5000) + 2000,
        status: i % 5 === 0 ? 'accepted' : 'pending'
      });
    }
    
    for (let i = 0; i < proposals.length; i += 100) {
      const { error } = await supabase.from('proposals').insert(proposals.slice(i, i + 100));
      if (error) console.error('Proposal batch error:', error.message);
      else console.log(`Proposal batch ${i/100 + 1} live.`);
    }

    // 4. SEED 100 CONTRACTS & MILESTONES
    console.log('🤝 Seeding 100 Contracts & 300 Milestones...');
    const contracts = [];
    const acceptedProposals = proposals.filter(p => p.status === 'accepted').slice(0, 100);
    
    for (const prop of acceptedProposals) {
      const contractId = crypto.randomUUID();
      const recruiterId = jobs.find(j => j.id === prop.job_id)?.recruiter_id;
      
      contracts.push({
        id: contractId,
        job_id: prop.job_id,
        recruiter_id: recruiterId,
        freelancer_id: prop.freelancer_id,
        total_budget: prop.bid_amount,
        status: 'active'
      });
    }

    const { error: cError } = await supabase.from('contracts').insert(contracts);
    if (cError) console.error('Contract seeding error:', cError.message);
    else {
        console.log('Contracts live. Seeding milestones...');
        const milestones = [];
        for (const contract of contracts) {
            for (let m = 1; m <= 3; m++) {
                milestones.push({
                    contract_id: contract.id,
                    title: `Milestone ${m}: ${m === 1 ? 'Architecture' : m === 2 ? 'Implementation' : 'Testing'}`,
                    amount: Math.floor(Number(contract.total_budget) / 3),
                    status: m === 1 ? 'released' : 'in_progress',
                    date: new Date(Date.now() + m * 86400000 * 7).toISOString()
                });
            }
        }
        const { error: mError } = await supabase.from('milestones').insert(milestones);
        if (mError) console.error('Milestone seeding error:', mError.message);
        else console.log('300 Milestones live.');
    }

    // 5. SEED MESSAGES
    console.log('💬 Seeding 500 Messages...');
    const messages = [];
    for (let i = 0; i < 500; i++) {
        const sender = profiles[Math.floor(Math.random() * profiles.length)].id;
        const receiver = profiles[Math.floor(Math.random() * profiles.length)].id;
        if (sender !== receiver) {
            messages.push({
                sender_id: sender,
                receiver_id: receiver,
                content: `Hey, let's discuss the progress on milestone ${Math.floor(Math.random() * 3) + 1}.`,
                created_at: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString()
            });
        }
    }
    const { error: msgErr } = await supabase.from('messages').insert(messages);
    if (msgErr) console.error('Message seeding error:', msgErr.message);
    else console.log('500 Messages live.');

    console.log('✨ 1000+ ROW SYSTEM ACTIVATION COMPLETE!');
  } catch (err: any) {
    console.error('❌ SEED FATAL ERROR:', err.message);
    process.exit(1);
  }
}

seed();

/**
 * attach_identity_saturated.ts
 * Re-assigns existing data to the identified Dev Admin user.
 * UUID: a0edcebe-7f95-9202-2aaf-7181df326e4f
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const targetUid = 'a0edcebe-7f95-9202-2aaf-7181df326e4f';

async function hijack() {
  console.log(`🏴‍☠️ Starting Data Hijack for: ${targetUid}...`);

  try {
    // 1. Hijack Proposals (15)
    console.log('🔍 Fetching proposals...');
    const { data: props, error: pErr } = await supabase.from('proposals').select('id').limit(15);
    if (pErr) console.error('❌ Proposal fetch error:', pErr.message);
    if (props && props.length > 0) {
      const { error: upErr } = await supabase.from('proposals').update({ freelancer_id: targetUid }).in('id', props.map(p => p.id));
      if (upErr) console.error('❌ Proposal update error:', upErr.message);
      else console.log(`✅ Hijacked ${props.length} Proposals`);
    } else {
      console.log('⚠️ No proposals found to hijack.');
    }

    // 2. Hijack Jobs (10)
    console.log('🔍 Fetching jobs...');
    const { data: jobs, error: jErr } = await supabase.from('jobs').select('id').limit(10);
    if (jErr) console.error('❌ Job fetch error:', jErr.message);
    if (jobs && jobs.length > 0) {
      const { error: ujErr } = await supabase.from('jobs').update({ recruiter_id: targetUid }).in('id', jobs.map(j => j.id));
      if (ujErr) console.error('❌ Job update error:', ujErr.message);
      else console.log(`✅ Hijacked ${jobs.length} Jobs`);
    } else {
      console.log('⚠️ No jobs found to hijack.');
    }

    // 3. Hijack Contracts (12)
    console.log('🔍 Fetching contracts...');
    const { data: contracts, error: cErr } = await supabase.from('contracts').select('id').limit(12);
    if (cErr) console.error('❌ Contract fetch error:', cErr.message);
    if (contracts && contracts.length > 0) {
      const { error: ucErr } = await supabase.from('contracts').update({ 
        recruiter_id: targetUid,
        freelancer_id: targetUid 
      }).in('id', contracts.map(c => c.id));
      if (ucErr) console.error('❌ Contract update error:', ucErr.message);
      else console.log(`✅ Hijacked ${contracts.length} Contracts`);
    } else {
      console.log('⚠️ No contracts found to hijack.');
    }

    // 4. Update Milestones (25)
    console.log('🔍 Fetching milestones...');
    const { data: milestones, error: mErr } = await supabase.from('milestones').select('id').limit(25);
    if (mErr) console.error('❌ Milestone fetch error:', mErr.message);
    if (milestones && milestones.length > 0) {
      const { error: umErr } = await supabase.from('milestones').update({ 
        status: 'released',
        amount: 45000
      }).in('id', milestones.map(m => m.id));
      if (umErr) console.error('❌ Milestone update error:', umErr.message);
      else console.log(`✅ Liberated ${milestones.length} Milestones (₹11.25L total value)`);
    } else {
      console.log('⚠️ No milestones found to hijack.');
    }
  } catch (err: any) {
    console.error('💥 Critical script error:', err.message);
  }

  console.log('✨ Data Hijack Complete.');
}

hijack().catch(console.error);

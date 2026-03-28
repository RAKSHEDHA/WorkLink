import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function finalSync() {
  console.log('🔄 Starting Final Identity Sync...');

  // 1. Get current user
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .order('created_at', { ascending: false })
    .limit(1);

  if (!profiles || profiles.length === 0) {
    console.error('❌ No active user found.');
    return;
  }

  const uid = profiles[0].id;
  console.log(`👤 Syncing data to: ${profiles[0].full_name} (${uid})`);

  // 2. Attach 5 Jobs
  const { data: jobs } = await supabase.from('jobs').select('id').limit(5);
  if (jobs) {
    await supabase.from('jobs').update({ recruiter_id: uid }).in('id', jobs.map(j => j.id));
    console.log('✅ Attached 5 jobs.');
  }

  // 3. Attach 5 Contracts
  const { data: contracts } = await supabase.from('contracts').select('id').limit(5);
  if (contracts) {
    await supabase.from('contracts').update({ recruiter_id: uid, freelancer_id: uid }).in('id', contracts.map(c => c.id));
    console.log('✅ Attached 5 contracts.');
  }

  console.log('✨ Final Sync Complete.');
}

finalSync();

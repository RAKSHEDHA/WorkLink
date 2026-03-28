import { supabase } from './supabase';

/**
 * First-time data sync: attaches existing jobs/contracts to a new user's profile
 * so they see content immediately on their dashboard.
 *
 * This runs ONCE — it checks a localStorage flag to avoid re-running.
 */
export async function syncFirstTimeData(userId: string, role: 'freelancer' | 'recruiter') {
  const syncKey = `worklink_synced_${userId}`;
  if (localStorage.getItem(syncKey)) return; // Already synced

  try {
    if (role === 'recruiter') {
      // Attach 5 unassigned jobs to this recruiter
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id')
        .is('recruiter_id', null)
        .limit(5);

      if (jobs && jobs.length > 0) {
        await supabase
          .from('jobs')
          .update({ recruiter_id: userId })
          .in('id', jobs.map(j => j.id));
      }

      // Attach 5 unassigned contracts
      const { data: contracts } = await supabase
        .from('contracts')
        .select('id')
        .is('recruiter_id', null)
        .limit(5);

      if (contracts && contracts.length > 0) {
        await supabase
          .from('contracts')
          .update({ recruiter_id: userId })
          .in('id', contracts.map(c => c.id));
      }
    } else {
      // Freelancer: attach some contracts
      const { data: contracts } = await supabase
        .from('contracts')
        .select('id')
        .is('freelancer_id', null)
        .limit(5);

      if (contracts && contracts.length > 0) {
        await supabase
          .from('contracts')
          .update({ freelancer_id: userId })
          .in('id', contracts.map(c => c.id));
      }
    }

    localStorage.setItem(syncKey, 'true');
    console.log('✅ First-time data sync complete for', role);
  } catch (err) {
    console.error('Data sync error:', err);
  }
}

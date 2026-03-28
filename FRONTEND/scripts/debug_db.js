import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('🔍 Checking Database Status (ESM)...');
  
  const tables = ['profiles', 'jobs', 'proposals', 'contracts', 'milestones'];
  
  for (const table of tables) {
    try {
      const { data, count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table.padEnd(10)}: Error ${error.message}`);
      } else {
        console.log(`✅ ${table.padEnd(10)}: ${count} rows found.`);
      }
    } catch (err) {
      console.log(`❌ ${table.padEnd(10)}: Exception ${err.message}`);
    }
  }
}

check();

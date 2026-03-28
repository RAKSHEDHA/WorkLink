import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://usugsrrznsybgwjypmvq.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzdWdzcnJ6bnN5Ymd3anlwbXZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxOTc5NzMsImV4cCI6MjA4OTc3Mzk3M30.xnX8qEI0j3WLZ46KaaG_xcHjI_oZtg0oKH5lRuUoQSU');

async function test() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  console.log("Profiles Error:", error);
}
test();

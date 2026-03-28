import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://usugsrrznsybgwjypmvq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzdWdzcnJ6bnN5Ymd3anlwbXZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxOTc5NzMsImV4cCI6MjA4OTc3Mzk3M30.xnX8qEI0j3WLZ46KaaG_xcHjI_oZtg0oKH5lRuUoQSU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('jobs').insert({
    recruiter_id: "some_firebase_uid_like_123456",
    title: "Test Job",
    description: "test test",
    budget: "$40/hr",
    status: "open",
  });
  console.log("Error:", error);
  console.log("Data:", data);
}
test();

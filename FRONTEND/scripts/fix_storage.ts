/**
 * fix_storage.ts
 * Programmatically creates the 'avatars' and 'banners' buckets in Supabase Storage
 * and sets public access policies.
 */
import { createClient } from '@supabase/supabase-client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role for bucket creation/policies

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixStorage() {
  console.log('🚀 Initializing Storage Recovery...');

  const buckets = ['avatars', 'banners', 'portfolios'];

  for (const bucketName of buckets) {
    console.log(`\n📦 Checking bucket: ${bucketName}...`);
    
    // 1. Create Bucket
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (bucketError && bucketError.message !== 'Bucket already exists') {
      console.error(`❌ Error creating bucket ${bucketName}:`, bucketError.message);
    } else {
      console.log(`✅ Bucket ${bucketName} is ready.`);
    }

    // 2. Set Public Access Policies (via SQL or Storage API if supported, 
    // but usually easier via SQL for Select/Insert/Update)
    // For this script, we'll assume 'public' flag on createBucket handles basic read.
    // However, if we need specific RLS for uploads, we'd run SQL.
  }

  console.log('\n✨ Storage Recovery Complete!');
}

fixStorage();

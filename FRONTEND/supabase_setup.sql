-- Drop existing tables to ensure a clean slate if permitted, or just create if not exists
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('freelancer', 'recruiter')) NOT NULL,
  is_onboarded BOOLEAN DEFAULT false,
  skills TEXT[],
  bio TEXT,
  hourly_rate NUMERIC,
  avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  skills TEXT[],
  category TEXT,
  payment_type TEXT DEFAULT 'hourly',
  budget NUMERIC NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) NOT NULL,
  freelancer_id UUID REFERENCES profiles(id) NOT NULL,
  cover_letter TEXT NOT NULL,
  bid_amount NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('pending', 'interviewing', 'shortlisted', 'hired', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) NOT NULL,
  recruiter_id UUID REFERENCES profiles(id) NOT NULL,
  freelancer_id UUID REFERENCES profiles(id) NOT NULL,
  total_budget NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id) NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('pending', 'submitted', 'released')) DEFAULT 'pending',
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- We disable RLS entirely for the scope of this rapid prototype. In production, policies go here.
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE applicants DISABLE ROW LEVEL SECURITY;
ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE milestones DISABLE ROW LEVEL SECURITY;

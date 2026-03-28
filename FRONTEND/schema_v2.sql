-- WorkLink Complete Schema v2
-- Run this in your Supabase SQL Editor to complete the missing tables

-- Profiles table (adding missing columns)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 4.8;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Remote';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS earned TEXT DEFAULT '₹0';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS jobs_completed INTEGER DEFAULT 0;

-- Jobs table (already exists, adding missing columns if not present)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS skills TEXT[];
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS budget_min NUMERIC;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS budget_max NUMERIC;

-- Proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) NOT NULL,
  freelancer_id TEXT NOT NULL,
  cover_letter TEXT,
  bid_amount NUMERIC,
  status TEXT CHECK (status IN ('pending', 'shortlisted', 'interviewing', 'hired', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id),
  recruiter_id TEXT NOT NULL,
  freelancer_id TEXT NOT NULL,
  total_budget NUMERIC,
  status TEXT CHECK (status IN ('active','paused','completed','cancelled')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id),
  title TEXT NOT NULL,
  amount NUMERIC,
  status TEXT CHECK (status IN ('pending','in_progress','submitted','completed')) DEFAULT 'pending',
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  content TEXT NOT NULL,
  contract_id UUID REFERENCES contracts(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tasks table (Cluster 5)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workroom_id TEXT NOT NULL,
  title TEXT NOT NULL,
  assignee TEXT,
  due_date TIMESTAMPTZ,
  status TEXT CHECK (status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Disable RLS on all
ALTER TABLE proposals DISABLE ROW LEVEL SECURITY;
ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE milestones DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

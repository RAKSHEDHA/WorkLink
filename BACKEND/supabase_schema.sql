-- profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('freelancer', 'recruiter')) NOT NULL,
  is_onboarded BOOLEAN DEFAULT false,
  skills TEXT[],
  bio TEXT
);

-- jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget NUMERIC NOT NULL,
  meet_link TEXT,
  schedule_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- proposals table
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) NOT NULL,
  freelancer_id UUID REFERENCES profiles(id) NOT NULL,
  cover_letter TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES jobs(id) NOT NULL, -- assuming job refers to a project
  title TEXT NOT NULL,
  assigned_to UUID REFERENCES profiles(id),
  status TEXT CHECK (status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo',
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  receiver_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Setting up Row Level Security (RLS) is recommended in production, 
-- but given the prompt constraints, these are the schema baseline tables.

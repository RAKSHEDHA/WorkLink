-- WorkLink Schema v4 - Meetings
-- Run this in your Supabase SQL Editor to fix the "Failed to save meeting" error

CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Realtime for meetings
ALTER PUBLICATION supabase_realtime ADD TABLE meetings;

-- Disable RLS for rapid development
ALTER TABLE meetings DISABLE ROW LEVEL SECURITY;

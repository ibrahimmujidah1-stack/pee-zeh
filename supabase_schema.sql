-- ==========================================================
-- p-zeh: Supabase Realtime Database Schema
-- Run this in your Supabase Project -> SQL Editor
-- ==========================================================

-- 1. Create the sprays table
CREATE TABLE IF NOT EXISTS public.sprays (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    guest_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USDC',
    shoutout TEXT,
    tx_hash TEXT,
    tier TEXT DEFAULT 'custom',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the events table (optional metadata storage)
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    celebrant_name TEXT NOT NULL,
    celebrant_photo TEXT,
    host_wallet TEXT NOT NULL,
    currency TEXT DEFAULT 'USDC',
    target_amount NUMERIC DEFAULT 10000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create indexes for blazing-fast queries
CREATE INDEX IF NOT EXISTS idx_sprays_event_id ON public.sprays (event_id);
CREATE INDEX IF NOT EXISTS idx_sprays_created_at ON public.sprays (created_at DESC);

-- 4. Enable Row Level Security (RLS) & Public Access Policies
ALTER TABLE public.sprays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Allow public read access to sprays
CREATE POLICY "Public sprays are viewable by everyone" 
ON public.sprays FOR SELECT USING (true);

-- Allow public insert of sprays
CREATE POLICY "Anyone can spray on the dance floor" 
ON public.sprays FOR INSERT WITH CHECK (true);

-- Allow public read access to events
CREATE POLICY "Public events are viewable by everyone" 
ON public.events FOR SELECT USING (true);

-- 5. Enable Realtime Replication for instant TV wall updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.sprays;

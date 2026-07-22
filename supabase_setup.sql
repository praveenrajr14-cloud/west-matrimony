-- JUST MATRIMONY DATABASE SETUP SQL
-- Run this script in the Supabase SQL Editor to set up your database tables,
-- mock profiles, and storage uploader policy configuration.

-- =========================================================================
-- 1. DATABASE TABLES SCHEMA
-- =========================================================================

-- A. Profiles table (Matrimonial profiles browsable by all registered users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY, -- e.g. 'WM-10294'
    name TEXT NOT NULL,
    gender TEXT NOT NULL,
    age INTEGER NOT NULL,
    height TEXT NOT NULL,
    religion TEXT NOT NULL,
    caste TEXT NOT NULL,
    mothertongue TEXT NOT NULL,
    education TEXT NOT NULL,
    college TEXT NOT NULL,
    occupation TEXT NOT NULL,
    employer TEXT NOT NULL,
    income TEXT NOT NULL,
    location TEXT NOT NULL,
    star TEXT DEFAULT 'None', -- Star / Nakshatram (specifically for Hindu profiles)
    image TEXT NOT NULL, -- Storage URL or local asset path
    phone TEXT, -- Contact phone number for profile
    about TEXT NOT NULL,
    family_values TEXT NOT NULL,
    family_type TEXT NOT NULL,
    father TEXT NOT NULL,
    mother TEXT NOT NULL,
    brothers INTEGER DEFAULT 0,
    sisters INTEGER DEFAULT 0,
    diet TEXT NOT NULL,
    lifestyle TEXT DEFAULT 'No / No',
    pref_age_min INTEGER DEFAULT 20,
    pref_age_max INTEGER DEFAULT 45,
    pref_height TEXT DEFAULT '5 ft 5 in',
    pref_religion TEXT DEFAULT 'all',
    pref_occupation TEXT DEFAULT 'all',
    pref_location TEXT DEFAULT 'all',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable real-time updates for profiles
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- B. User profile info table (Extends Supabase auth.users for client profile records)
CREATE TABLE IF NOT EXISTS public.users_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    gender TEXT NOT NULL,
    age INTEGER NOT NULL,
    height TEXT NOT NULL,
    religion TEXT NOT NULL,
    caste TEXT NOT NULL,
    mothertongue TEXT NOT NULL,
    education TEXT NOT NULL,
    occupation TEXT NOT NULL,
    income TEXT NOT NULL,
    location TEXT NOT NULL,
    about TEXT NOT NULL,
    star TEXT DEFAULT 'None',
    image TEXT DEFAULT '',
    pref_age_min INTEGER DEFAULT 20,
    pref_age_max INTEGER DEFAULT 45,
    pref_religion TEXT DEFAULT 'all',
    pref_location TEXT DEFAULT 'all',
    is_admin BOOLEAN DEFAULT FALSE,
    last_session_id TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- C. Shortlisted profiles table
CREATE TABLE IF NOT EXISTS public.shortlists (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, profile_id)
);

-- D. Message conversations table
CREATE TABLE IF NOT EXISTS public.messages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sender_id TEXT NOT NULL,   -- Can be User UUID or Profile ID
    receiver_id TEXT NOT NULL, -- Can be User UUID or Profile ID
    text TEXT NOT NULL,
    time TEXT NOT NULL,        -- Format: '10:30 PM'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable real-time updates for messages (Crucial for realtime live chats!)
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- =========================================================================
-- 3. STORAGE INTEGRATION FOR PHOTOS
-- =========================================================================

-- Create storage bucket for profile pictures if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Security Policies (Allows public read, allows insert/upload for testing)
-- 1. Read access
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-images');

-- 2. Upload access
CREATE POLICY "Public Insert Access" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'profile-images');

-- =========================================================================
-- 4. ENABLE REALTIME SYNC FOR LIVE CHAT
-- =========================================================================

-- Enable Postgres Realtime publications on messages table
BEGIN;
  -- Remove the table from realtime if it exists
  DROP PUBLICATION IF EXISTS supabase_realtime;
  
  -- Create publication
  CREATE PUBLICATION supabase_realtime FOR TABLE public.messages, public.profiles, public.users_profiles;
COMMIT;

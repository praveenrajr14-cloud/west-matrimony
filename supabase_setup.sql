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
-- 2. INSERT INITIAL MOCK DATA
-- =========================================================================

INSERT INTO public.profiles (
    id, name, gender, age, height, religion, caste, mothertongue, 
    education, college, occupation, employer, income, location, 
    image, about, family_values, family_type, father, mother, 
    brothers, sisters, diet, lifestyle, pref_age_min, pref_age_max, 
    pref_height, pref_religion, pref_occupation, pref_location
) VALUES 
(
    'WM-10294', 'Sophia Ann Abraham', 'female', 25, '5 ft 4 in (162 cm)', 'Christian', 'Syrian Orthodox', 'Malayalam',
    'B.Tech in Computer Science', 'College of Engineering Trivandrum (CET)', 'Software Engineer', 'TCS Kochi', '₹12 - 15 Lakhs', 'Kochi',
    'assets/images/profile_female_1.png', 'A cheerful, career-oriented individual who balances traditional values with a modern outlook. She loves listening to music, traveling, and exploring new cuisines on weekends.',
    'Moderate', 'Nuclear Family', 'Retired Government Officer', 'High School Teacher',
    1, 0, 'Non-Vegetarian', 'No / No', 26, 30, '5 ft 7 in', 'Christian', 'IT Professional or Doctor', 'Kochi, Bangalore'
),
(
    'WM-28190', 'Rahul Sharma', 'male', 29, '5 ft 10 in (178 cm)', 'Hindu', 'Brahmin', 'Hindi',
    'MBA in Business Analytics', 'IIM Bangalore', 'Software Engineer', 'Microsoft Bangalore', '₹24+ Lakhs', 'Bangalore',
    'assets/images/profile_male_1.png', 'A simple, down-to-earth person who believes in mutual respect and clear communication. I enjoy working on fintech trends, reading historical fiction, and trekking in the Western Ghats.',
    'Traditional', 'Joint Family', 'Business Owner', 'Homemaker',
    0, 1, 'Vegetarian', 'No / No', 23, 28, '5 ft 2 in', 'Hindu', 'Graduate Professional', 'Bangalore, Kochi'
),
(
    'WM-40192', 'Priya Iyer', 'female', 26, '5 ft 2 in (157 cm)', 'Hindu', 'Tamil Brahmin', 'Tamil',
    'B.Des in Product Design', 'NID Ahmedabad', 'UI/UX Designer', 'Freelancer / Startup Consultant', '₹15 - 18 Lakhs', 'Chennai',
    'assets/images/profile_female_2.png', 'A creative mind who loves visual arts, classical music, and visiting heritage spots. Looking for a partner who is passionate about their work and values art and culture.',
    'Liberal', 'Nuclear Family', 'Senior Advocate', 'Carnatic Vocalist',
    1, 0, 'Vegetarian', 'Occasional / No', 26, 32, '5 ft 6 in', 'Hindu', 'Creative or Tech Professional', 'Chennai, Bangalore, Kochi'
),
(
    'WM-89102', 'Ahaan Patel', 'male', 28, '5 ft 8 in (173 cm)', 'Hindu', 'Patel', 'Hindi',
    'M.Com & Chartered Accountant', 'HR College Mumbai', 'Banker', 'HDFC Bank Mumbai', '₹18 - 22 Lakhs', 'Mumbai',
    'assets/images/profile_male_2.png', 'An ambitious banker who balances a busy professional life with hobbies like squash, culinary experimentation, and volunteering. Looking for a partner who is independent and family-focused.',
    'Moderate', 'Nuclear Family', 'Chartered Accountant', 'Interior Designer',
    0, 0, 'Non-Vegetarian', 'No / No', 24, 28, '5 ft 3 in', 'Hindu', 'Finance, Banking or IT Analyst', 'Mumbai, Bangalore'
)
ON CONFLICT (id) DO NOTHING;

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

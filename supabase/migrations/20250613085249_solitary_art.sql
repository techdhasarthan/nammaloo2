-- =====================================================
-- COMPLETE DATABASE SCHEMA FOR ANONYMOUS TOILET APP
-- =====================================================

-- =====================================================
-- 1. CREATE USER_PROFILES TABLE (STANDALONE)
-- =====================================================

-- Create user_profiles table without auth dependency
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  full_name text,
  avatar_url text,
  bio text,
  preferences jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS and create public policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can create profiles" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can delete profiles" ON user_profiles;

-- Create public access policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can create profiles"
  ON user_profiles FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can update profiles"
  ON user_profiles FOR UPDATE TO public USING (true);

CREATE POLICY "Anyone can delete profiles"
  ON user_profiles FOR DELETE TO public USING (true);

-- =====================================================
-- 2. CREATE REVIEWS TABLE
-- =====================================================

-- Drop existing reviews table if it exists
DROP TABLE IF EXISTS reviews CASCADE;

-- Create reviews table with correct structure
CREATE TABLE reviews (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  toilet_id text NOT NULL,
  user_id uuid, -- References user_profiles.id
  review_text text,
  rating bigint CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE reviews ADD CONSTRAINT reviews_toilet_id_fkey 
FOREIGN KEY (toilet_id) REFERENCES kakoos(uuid) ON DELETE CASCADE;

ALTER TABLE reviews ADD CONSTRAINT reviews_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- Enable RLS and create public policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can create reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can update reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can delete reviews" ON reviews;

-- Create public access policies
CREATE POLICY "Anyone can read reviews"
  ON reviews FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can create reviews"
  ON reviews FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can update reviews"
  ON reviews FOR UPDATE TO public USING (true);

CREATE POLICY "Anyone can delete reviews"
  ON reviews FOR DELETE TO public USING (true);

-- =====================================================
-- 3. CREATE REPORTS TABLE
-- =====================================================

-- Drop existing reports table if it exists
DROP TABLE IF EXISTS reports CASCADE;

-- Create reports table with correct structure
CREATE TABLE reports (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  toilet_id text NOT NULL,
  user_id uuid, -- References user_profiles.id
  issue_text text,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE reports ADD CONSTRAINT reports_toilet_id_fkey 
FOREIGN KEY (toilet_id) REFERENCES kakoos(uuid) ON DELETE CASCADE;

ALTER TABLE reports ADD CONSTRAINT reports_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- Enable RLS and create public policies
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read reports" ON reports;
DROP POLICY IF EXISTS "Anyone can create reports" ON reports;
DROP POLICY IF EXISTS "Anyone can update reports" ON reports;
DROP POLICY IF EXISTS "Anyone can delete reports" ON reports;

-- Create public access policies
CREATE POLICY "Anyone can read reports"
  ON reports FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can create reports"
  ON reports FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can update reports"
  ON reports FOR UPDATE TO public USING (true);

CREATE POLICY "Anyone can delete reports"
  ON reports FOR DELETE TO public USING (true);

-- =====================================================
-- 4. CREATE SAVED_TOILETS TABLE
-- =====================================================

-- Drop existing saved_toilets table if it exists
DROP TABLE IF EXISTS saved_toilets CASCADE;

-- Create saved_toilets table
CREATE TABLE saved_toilets (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL,
  toilet_id text NOT NULL,
  notes text,
  saved_at timestamptz DEFAULT now(),
  UNIQUE(user_id, toilet_id)
);

-- Add foreign key constraints
ALTER TABLE saved_toilets ADD CONSTRAINT saved_toilets_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE saved_toilets ADD CONSTRAINT saved_toilets_toilet_id_fkey 
FOREIGN KEY (toilet_id) REFERENCES kakoos(uuid) ON DELETE CASCADE;

-- Enable RLS and create public policies
ALTER TABLE saved_toilets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read saved toilets" ON saved_toilets;
DROP POLICY IF EXISTS "Anyone can create saved toilets" ON saved_toilets;
DROP POLICY IF EXISTS "Anyone can update saved toilets" ON saved_toilets;
DROP POLICY IF EXISTS "Anyone can delete saved toilets" ON saved_toilets;

-- Create public access policies
CREATE POLICY "Anyone can read saved toilets"
  ON saved_toilets FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can create saved toilets"
  ON saved_toilets FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can update saved toilets"
  ON saved_toilets FOR UPDATE TO public USING (true);

CREATE POLICY "Anyone can delete saved toilets"
  ON saved_toilets FOR DELETE TO public USING (true);

-- =====================================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_toilet_id ON reviews(toilet_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Reports indexes
CREATE INDEX IF NOT EXISTS idx_reports_toilet_id ON reports(toilet_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- Saved toilets indexes
CREATE INDEX IF NOT EXISTS idx_saved_toilets_user_id ON saved_toilets(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_toilets_toilet_id ON saved_toilets(toilet_id);
CREATE INDEX IF NOT EXISTS idx_saved_toilets_saved_at ON saved_toilets(saved_at DESC);

-- =====================================================
-- 6. ENSURE KAKOOS TABLE IS ACCESSIBLE
-- =====================================================

-- Disable RLS on kakoos for public read access
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kakoos') THEN
    ALTER TABLE kakoos DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Kakoos table RLS disabled for public access';
  ELSE
    RAISE NOTICE 'Kakoos table does not exist - please ensure toilet data is imported';
  END IF;
END $$;

-- =====================================================
-- 7. ADD SAMPLE ANONYMOUS USER PROFILES
-- =====================================================

-- Insert sample anonymous user profiles for testing
INSERT INTO user_profiles (id, full_name, avatar_url, bio) VALUES 
('00000000-0000-0000-0000-000000000001', 'Anonymous User 1', null, 'Anonymous reviewer'),
('00000000-0000-0000-0000-000000000002', 'Anonymous User 2', null, 'Anonymous reviewer'),
('00000000-0000-0000-0000-000000000003', 'Anonymous User 3', null, 'Anonymous reviewer'),
('00000000-0000-0000-0000-000000000004', 'Anonymous User 4', null, 'Anonymous reviewer'),
('00000000-0000-0000-0000-000000000005', 'Anonymous User 5', null, 'Anonymous reviewer')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 8. ADD SAMPLE REVIEWS (ONLY IF TOILETS EXIST)
-- =====================================================

-- Add sample reviews only if toilets exist in kakoos table
DO $$
DECLARE
  toilet_count INTEGER;
  sample_toilet_ids TEXT[];
BEGIN
  -- Check if kakoos table exists and has data
  SELECT COUNT(*) INTO toilet_count FROM kakoos LIMIT 1;
  
  IF toilet_count > 0 THEN
    -- Get some sample toilet IDs
    SELECT ARRAY(SELECT uuid FROM kakoos LIMIT 5) INTO sample_toilet_ids;
    
    -- Insert sample reviews if we have toilet IDs
    IF array_length(sample_toilet_ids, 1) > 0 THEN
      INSERT INTO reviews (toilet_id, user_id, review_text, rating) VALUES 
      (sample_toilet_ids[1], '00000000-0000-0000-0000-000000000001', 'Very clean and well-maintained facility. Highly recommended!', 5),
      (sample_toilet_ids[1], '00000000-0000-0000-0000-000000000002', 'Good location and accessibility features.', 4),
      (sample_toilet_ids[2], '00000000-0000-0000-0000-000000000003', 'Nice location, clean restrooms.', 4),
      (sample_toilet_ids[3], '00000000-0000-0000-0000-000000000001', 'Busy location but facilities are adequate.', 3),
      (sample_toilet_ids[4], '00000000-0000-0000-0000-000000000004', 'Excellent quality restroom with great amenities.', 5)
      ON CONFLICT DO NOTHING;
      
      RAISE NOTICE 'Sample reviews added for existing toilets';
    ELSE
      RAISE NOTICE 'No toilet IDs found for sample reviews';
    END IF;
  ELSE
    RAISE NOTICE 'No toilets found in kakoos table - skipping sample reviews';
  END IF;
END $$;

-- =====================================================
-- 9. FINAL VERIFICATION AND SUMMARY
-- =====================================================

DO $$
DECLARE
  user_profiles_count INTEGER;
  reviews_count INTEGER;
  reports_count INTEGER;
  saved_toilets_count INTEGER;
  kakoos_count INTEGER;
BEGIN
  -- Count records in each table
  SELECT COUNT(*) INTO user_profiles_count FROM user_profiles;
  SELECT COUNT(*) INTO reviews_count FROM reviews;
  SELECT COUNT(*) INTO reports_count FROM reports;
  SELECT COUNT(*) INTO saved_toilets_count FROM saved_toilets;
  
  -- Check kakoos table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kakoos') THEN
    SELECT COUNT(*) INTO kakoos_count FROM kakoos;
  ELSE
    kakoos_count := 0;
  END IF;
  
  -- Verify foreign key relationships exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'reviews' AND constraint_name = 'reviews_user_id_fkey'
  ) THEN
    RAISE EXCEPTION 'reviews -> user_profiles foreign key missing!';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'reviews' AND constraint_name = 'reviews_toilet_id_fkey'
  ) THEN
    RAISE EXCEPTION 'reviews -> kakoos foreign key missing!';
  END IF;
  
  -- Success summary
  RAISE NOTICE '=== DATABASE SCHEMA SETUP COMPLETE ===';
  RAISE NOTICE 'User profiles: % records', user_profiles_count;
  RAISE NOTICE 'Reviews: % records', reviews_count;
  RAISE NOTICE 'Reports: % records', reports_count;
  RAISE NOTICE 'Saved toilets: % records', saved_toilets_count;
  RAISE NOTICE 'Kakoos (toilets): % records', kakoos_count;
  RAISE NOTICE 'All tables created with anonymous access enabled';
  RAISE NOTICE 'Foreign key relationships verified';
  RAISE NOTICE 'Performance indexes created';
  
  IF kakoos_count = 0 THEN
    RAISE NOTICE 'WARNING: No toilet data found - please import kakoos data';
  END IF;
END $$;
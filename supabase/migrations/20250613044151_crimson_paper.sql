/*
  # Fix user creation and authentication issues

  1. Schema Updates
    - Ensure proper foreign key relationships
    - Fix user creation trigger
    - Add proper indexes for performance

  2. User Management
    - Fix user creation process
    - Ensure auth integration works properly
    - Add proper error handling

  3. Security
    - Update RLS policies
    - Ensure proper access controls
*/

-- First, let's make sure the users table has the right structure
DO $$
BEGIN
  -- Add auth_user_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE users ADD COLUMN auth_user_id uuid;
  END IF;
  
  -- Add foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'users' AND constraint_name = 'users_auth_user_id_fkey'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_auth_user_id_fkey 
    FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  
  -- Add unique constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'users' AND constraint_name = 'users_auth_user_id_key'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_auth_user_id_key UNIQUE (auth_user_id);
  END IF;
END $$;

-- Update the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into user_profiles table
  INSERT INTO user_profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name',
      NEW.email
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url', 
      NEW.raw_user_meta_data->>'picture'
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name',
      NEW.email
    ),
    avatar_url = COALESCE(
      NEW.raw_user_meta_data->>'avatar_url', 
      NEW.raw_user_meta_data->>'picture'
    ),
    updated_at = now();
  
  -- Also insert into the legacy users table for compatibility
  INSERT INTO users (auth_user_id, name, email, created_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name',
      NEW.email
    ),
    NEW.email,
    now()
  )
  ON CONFLICT (auth_user_id) DO UPDATE SET
    name = COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name',
      NEW.email
    ),
    email = NEW.email;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_saved_toilets_auth_user_id ON saved_toilets(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_auth_user_id ON reviews(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_auth_user_id ON reports(auth_user_id);

-- Ensure all foreign key relationships exist for other tables
DO $$
BEGIN
  -- saved_toilets auth integration
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'saved_toilets' AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE saved_toilets ADD COLUMN auth_user_id uuid;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'saved_toilets' AND constraint_name = 'saved_toilets_auth_user_id_fkey'
  ) THEN
    ALTER TABLE saved_toilets ADD CONSTRAINT saved_toilets_auth_user_id_fkey 
    FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  
  -- reviews auth integration
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE reviews ADD COLUMN auth_user_id uuid;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'reviews' AND constraint_name = 'reviews_auth_user_id_fkey'
  ) THEN
    ALTER TABLE reviews ADD CONSTRAINT reviews_auth_user_id_fkey 
    FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  
  -- reports auth integration
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE reports ADD COLUMN auth_user_id uuid;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'reports' AND constraint_name = 'reports_auth_user_id_fkey'
  ) THEN
    ALTER TABLE reports ADD CONSTRAINT reports_auth_user_id_fkey 
    FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add review_images column to reviews table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'review_images'
  ) THEN
    ALTER TABLE reviews ADD COLUMN review_images text;
  END IF;
END $$;

-- Update RLS policies to ensure they work correctly
DROP POLICY IF EXISTS "Users can read own saved toilets" ON saved_toilets;
DROP POLICY IF EXISTS "Users can create own saved toilets" ON saved_toilets;
DROP POLICY IF EXISTS "Users can update own saved toilets" ON saved_toilets;
DROP POLICY IF EXISTS "Users can delete own saved toilets" ON saved_toilets;

CREATE POLICY "Users can read own saved toilets"
  ON saved_toilets
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Users can create own saved toilets"
  ON saved_toilets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can update own saved toilets"
  ON saved_toilets
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Users can delete own saved toilets"
  ON saved_toilets
  FOR DELETE
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Update reviews policies
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;

CREATE POLICY "Authenticated users can create reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can update own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Update reports policies
DROP POLICY IF EXISTS "Authenticated users can create reports" ON reports;
DROP POLICY IF EXISTS "Users can update own reports" ON reports;
DROP POLICY IF EXISTS "Users can delete own reports" ON reports;

CREATE POLICY "Authenticated users can create reports"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can update own reports"
  ON reports
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Users can delete own reports"
  ON reports
  FOR DELETE
  TO authenticated
  USING (auth_user_id = auth.uid());
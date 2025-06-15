/*
  # Fix user creation and authentication integration

  1. Schema Updates
    - Create users table if it doesn't exist
    - Ensure proper foreign key relationships with auth.users
    - Fix user creation process
    - Add proper indexes for performance

  2. User Management
    - Fix user creation process
    - Ensure auth integration works properly
    - Add proper error handling

  3. Security
    - Update RLS policies
    - Ensure proper access controls
*/

-- First, create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at timestamptz DEFAULT now(),
  name text,
  email text,
  phone varchar,
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create user_profiles table if it doesn't exist (should already exist from previous migration)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  full_name text,
  avatar_url text,
  bio text,
  preferences jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create or replace the handle_new_user function
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

-- Add auth_user_id columns to existing tables if they don't exist
DO $$
BEGIN
  -- saved_toilets auth integration
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'saved_toilets') THEN
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
  END IF;
  
  -- reviews auth integration
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews') THEN
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
  END IF;
  
  -- reports auth integration
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports') THEN
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
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);

-- Only create indexes if tables exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'saved_toilets') THEN
    CREATE INDEX IF NOT EXISTS idx_saved_toilets_auth_user_id ON saved_toilets(auth_user_id);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews') THEN
    CREATE INDEX IF NOT EXISTS idx_reviews_auth_user_id ON reviews(auth_user_id);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports') THEN
    CREATE INDEX IF NOT EXISTS idx_reports_auth_user_id ON reports(auth_user_id);
  END IF;
END $$;

-- Set up RLS policies for users table
DROP POLICY IF EXISTS "Authenticated users can read users" ON users;
DROP POLICY IF EXISTS "Users can create own user record" ON users;
DROP POLICY IF EXISTS "Users can update own user record" ON users;

CREATE POLICY "Authenticated users can read users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own user record"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can update own user record"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Set up RLS policies for user_profiles table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Update RLS policies for other tables only if they exist
DO $$
BEGIN
  -- saved_toilets policies
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'saved_toilets') THEN
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
  END IF;

  -- reviews policies
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews') THEN
    DROP POLICY IF EXISTS "Anyone can read reviews" ON reviews;
    DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
    DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
    DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;

    CREATE POLICY "Anyone can read reviews"
      ON reviews
      FOR SELECT
      TO public
      USING (true);

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

    CREATE POLICY "Users can delete own reviews"
      ON reviews
      FOR DELETE
      TO authenticated
      USING (auth_user_id = auth.uid());
  END IF;

  -- reports policies
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports') THEN
    DROP POLICY IF EXISTS "Anyone can read reports" ON reports;
    DROP POLICY IF EXISTS "Authenticated users can create reports" ON reports;
    DROP POLICY IF EXISTS "Users can update own reports" ON reports;
    DROP POLICY IF EXISTS "Users can delete own reports" ON reports;

    CREATE POLICY "Anyone can read reports"
      ON reports
      FOR SELECT
      TO public
      USING (true);

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
  END IF;
END $$;
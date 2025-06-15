/*
  # Add automatic toilet rating and review count updates

  1. Functions
    - `update_toilet_stats()` - Updates review count and average rating for a toilet
    - `handle_review_changes()` - Trigger function for review insert/update/delete

  2. Triggers
    - Automatically update toilet stats when reviews are added, updated, or deleted

  3. Indexes
    - Add rating index to kakoos table for better performance
*/

-- =====================================================
-- 1. CREATE FUNCTION TO UPDATE TOILET STATISTICS
-- =====================================================

CREATE OR REPLACE FUNCTION update_toilet_stats(toilet_uuid TEXT)
RETURNS void AS $$
DECLARE
  review_count INTEGER;
  avg_rating NUMERIC;
BEGIN
  -- Calculate review count and average rating
  SELECT 
    COUNT(*),
    ROUND(AVG(rating), 1)
  INTO review_count, avg_rating
  FROM reviews 
  WHERE toilet_id = toilet_uuid AND rating IS NOT NULL;
  
  -- Update the kakoos table
  UPDATE kakoos 
  SET 
    reviews = review_count,
    rating = avg_rating
  WHERE uuid = toilet_uuid;
  
  RAISE NOTICE 'Updated toilet % stats: % reviews, % rating', toilet_uuid, review_count, avg_rating;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. CREATE TRIGGER FUNCTION FOR REVIEW CHANGES
-- =====================================================

CREATE OR REPLACE FUNCTION handle_review_changes()
RETURNS trigger AS $$
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update stats for the toilet
    PERFORM update_toilet_stats(NEW.toilet_id);
    RETURN NEW;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    -- Update stats for the toilet
    PERFORM update_toilet_stats(OLD.toilet_id);
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. CREATE TRIGGERS ON REVIEWS TABLE
-- =====================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_toilet_stats_on_review_insert ON reviews;
DROP TRIGGER IF EXISTS trigger_update_toilet_stats_on_review_update ON reviews;
DROP TRIGGER IF EXISTS trigger_update_toilet_stats_on_review_delete ON reviews;

-- Create triggers for all review operations
CREATE TRIGGER trigger_update_toilet_stats_on_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION handle_review_changes();

CREATE TRIGGER trigger_update_toilet_stats_on_review_update
  AFTER UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION handle_review_changes();

CREATE TRIGGER trigger_update_toilet_stats_on_review_delete
  AFTER DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION handle_review_changes();

-- =====================================================
-- 4. ADD INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Add index on kakoos rating for better sorting performance
CREATE INDEX IF NOT EXISTS idx_kakoos_rating ON kakoos(rating DESC);
CREATE INDEX IF NOT EXISTS idx_kakoos_reviews ON kakoos(reviews DESC);

-- =====================================================
-- 5. RECALCULATE EXISTING TOILET STATISTICS
-- =====================================================

-- Update all existing toilet statistics based on current reviews
DO $$
DECLARE
  toilet_record RECORD;
  updated_count INTEGER := 0;
BEGIN
  RAISE NOTICE 'Recalculating toilet statistics from existing reviews...';
  
  -- Loop through all toilets and update their stats
  FOR toilet_record IN 
    SELECT DISTINCT toilet_id FROM reviews
    UNION
    SELECT uuid FROM kakoos WHERE uuid NOT IN (SELECT DISTINCT toilet_id FROM reviews)
  LOOP
    PERFORM update_toilet_stats(toilet_record.toilet_id);
    updated_count := updated_count + 1;
  END LOOP;
  
  RAISE NOTICE 'Updated statistics for % toilets', updated_count;
END $$;

-- =====================================================
-- 6. VERIFICATION
-- =====================================================

DO $$
DECLARE
  total_toilets INTEGER;
  toilets_with_reviews INTEGER;
  total_reviews INTEGER;
BEGIN
  -- Get counts for verification
  SELECT COUNT(*) INTO total_toilets FROM kakoos;
  SELECT COUNT(*) INTO toilets_with_reviews FROM kakoos WHERE reviews > 0;
  SELECT COUNT(*) INTO total_reviews FROM reviews;
  
  RAISE NOTICE '=== TOILET RATING SYSTEM SETUP COMPLETE ===';
  RAISE NOTICE 'Total toilets: %', total_toilets;
  RAISE NOTICE 'Toilets with reviews: %', toilets_with_reviews;
  RAISE NOTICE 'Total reviews: %', total_reviews;
  RAISE NOTICE 'Automatic rating updates enabled via triggers';
  
  -- Verify triggers exist
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'trigger_update_toilet_stats_on_review_insert'
  ) THEN
    RAISE NOTICE 'Review triggers successfully created';
  ELSE
    RAISE WARNING 'Review triggers may not have been created properly';
  END IF;
END $$;
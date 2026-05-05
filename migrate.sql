-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id VARCHAR UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Add missing columns to modules table
ALTER TABLE modules ADD COLUMN IF NOT EXISTS favorite_count INTEGER NOT NULL DEFAULT 0;

-- Create favorites table if it doesn't exist
CREATE TABLE IF NOT EXISTS favorites (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id VARCHAR NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id VARCHAR NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  from_user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_module_id ON favorites(module_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
-- Add new columns to modules table
ALTER TABLE modules ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'openai';
ALTER TABLE modules ADD COLUMN IF NOT EXISTS model TEXT NOT NULL DEFAULT 'gpt-4o-mini';
ALTER TABLE modules ADD COLUMN IF NOT EXISTS recommended_model TEXT;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS conversation_starters JSONB;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS capabilities JSONB;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS knowledge JSONB;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS actions JSONB;

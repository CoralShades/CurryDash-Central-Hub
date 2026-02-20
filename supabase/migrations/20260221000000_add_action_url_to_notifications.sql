-- Add action_url column to notifications table (was missing from initial schema)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url TEXT;

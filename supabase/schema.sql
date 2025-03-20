-- User Progress Table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  total_messages INT NOT NULL DEFAULT 0,
  correct_sentences INT NOT NULL DEFAULT 0,
  vocabulary_learned INT NOT NULL DEFAULT 0,
  last_practiced TIMESTAMP WITH TIME ZONE,
  streak INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  experience INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Vocabulary Table
CREATE TABLE IF NOT EXISTS vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  word TEXT NOT NULL,
  translation TEXT NOT NULL,
  example TEXT,
  mastered BOOLEAN DEFAULT FALSE,
  last_reviewed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, word)
);

-- User Messages Table
CREATE TABLE IF NOT EXISTS user_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  translation TEXT,
  correction JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS user_progress_user_id_idx ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS vocabulary_user_id_idx ON vocabulary(user_id);
CREATE INDEX IF NOT EXISTS user_messages_user_id_idx ON user_messages(user_id);
CREATE INDEX IF NOT EXISTS user_messages_created_at_idx ON user_messages(created_at);

-- Row Level Security Policies
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_messages ENABLE ROW LEVEL SECURITY;

-- Policy for user_progress table
CREATE POLICY user_progress_policy ON user_progress
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Policy for vocabulary table
CREATE POLICY vocabulary_policy ON vocabulary
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Policy for user_messages table
CREATE POLICY user_messages_policy ON user_messages
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id); 
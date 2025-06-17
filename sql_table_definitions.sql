-- SQL Table Definitions

-- Players Table
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Levels Table
CREATE TABLE IF NOT EXISTS levels (
  id TEXT PRIMARY KEY, -- e.g., YouTube video ID or custom unique ID like "cosmic-cyclone"
  rank INTEGER, -- e.g., 1 for hardest, null or specific value for unranked/legacy
  name VARCHAR(255) NOT NULL,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Completions Table
CREATE TABLE IF NOT EXISTS completions (
  id SERIAL PRIMARY KEY,
  level_id TEXT REFERENCES levels(id) ON DELETE CASCADE,
  player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
  completion_url TEXT,
  completion_date DATE, -- Format: YYYY-MM-DD
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(level_id, player_id) -- Ensures a player can complete a specific level only once
);

-- Challenges Table
CREATE TABLE IF NOT EXISTS challenges (
  id TEXT PRIMARY KEY, -- e.g., "cotm-yyyy-mm" or a unique descriptive name
  name VARCHAR(255) NOT NULL,
  month VARCHAR(50), -- e.g., "January 2024"
  description TEXT,
  video_url TEXT, -- Optional, could be for a showcase video of the challenge itself
  creator_name VARCHAR(255), -- Name of the person who set the challenge
  difficulty_rating VARCHAR(50), -- e.g., "Hard", "Insane"
  is_current BOOLEAN DEFAULT FALSE, -- To mark the current challenge of the month
  status VARCHAR(50) DEFAULT 'active', -- e.g., "active", "archived", "upcoming"
  victor_names TEXT[] DEFAULT ARRAY[]::TEXT[], -- Array of player names who completed the challenge
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Version Changelogs Table
CREATE TABLE IF NOT EXISTS version_changelogs (
  id SERIAL PRIMARY KEY,
  version VARCHAR(50) UNIQUE NOT NULL, -- e.g., "1.0.0", "1.0.1-beta"
  date DATE NOT NULL, -- Format: YYYY-MM-DD
  description_items TEXT[] DEFAULT ARRAY[]::TEXT[], -- Array of strings describing changes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  -- No updated_at here as versions are typically immutable once released.
  -- If edits are allowed, updated_at should be added.
);

-- List Changelogs Table
CREATE TABLE IF NOT EXISTS list_changelogs (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL, -- Format: YYYY-MM-DD
  description_items TEXT[] DEFAULT ARRAY[]::TEXT[], -- Array of strings describing list changes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  -- No updated_at here, assuming entries are records of changes at a point in time.
);

-- Indexes for frequently queried columns (optional but recommended for performance)
CREATE INDEX IF NOT EXISTS idx_levels_rank ON levels(rank);
CREATE INDEX IF NOT EXISTS idx_completions_level_id ON completions(level_id);
CREATE INDEX IF NOT EXISTS idx_completions_player_id ON completions(player_id);
CREATE INDEX IF NOT EXISTS idx_challenges_is_current ON challenges(is_current);
CREATE INDEX IF NOT EXISTS idx_challenges_month ON challenges(month);
CREATE INDEX IF NOT EXISTS idx_version_changelogs_date ON version_changelogs(date);
CREATE INDEX IF NOT EXISTS idx_list_changelogs_date ON list_changelogs(date);

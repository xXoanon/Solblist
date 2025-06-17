// src/models/level.model.js
const db = require('./db.js');

// Level schema (for reference)
// id: TEXT PRIMARY KEY (e.g., YouTube video ID or custom unique ID)
// rank: INTEGER (e.g., 1 for hardest, null or 0 for unranked/legacy)
// name: VARCHAR(255) NOT NULL
// video_url: TEXT
// created_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
// updated_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

const Level = {};

Level.create = async ({ id, rank, name, video_url }) => {
  const query = `
    INSERT INTO levels (id, rank, name, video_url)
    VALUES ($1, $2, $3, $4)
    RETURNING id, rank, name, video_url, created_at, updated_at;
  `;
  try {
    const { rows } = await db.query(query, [id, rank, name, video_url]);
    return rows[0];
  } catch (err) {
    console.error('Error creating level:', err.stack);
    throw err;
  }
};

Level.findById = async (id) => {
  const query = `
    SELECT id, rank, name, video_url, created_at, updated_at
    FROM levels
    WHERE id = $1;
  `;
  try {
    const { rows } = await db.query(query, [id]);
    return rows[0];
  } catch (err) {
    console.error(`Error finding level by id ${id}:`, err.stack);
    throw err;
  }
};

Level.getAll = async () => {
  const query = `
    SELECT id, rank, name, video_url, created_at, updated_at
    FROM levels
    ORDER BY rank ASC, name ASC;
  `;
  try {
    const { rows } = await db.query(query);
    return rows;
  } catch (err) {
    console.error('Error getting all levels:', err.stack);
    throw err;
  }
};

const Completion = require('./completion.model.js'); // Import Completion model

// Placeholder for getting victors of a level - to be implemented with Completion model
Level.getVictors = async (levelId) => {
  try {
    // Leverages the join already present in Completion.findByLevelId
    const completions = await Completion.findByLevelId(levelId);
    // We only need player information for "victors"
    return completions.map(comp => ({
      player_id: comp.player_id,
      player_name: comp.player_name,
      completion_url: comp.completion_url,
      completion_date: comp.completion_date,
      // Include completion_id if useful for further operations
      completion_id: comp.id
    }));
  } catch (err) {
    console.error(`Error getting victors for level ${levelId}:`, err.stack);
    throw err;
  }
};

module.exports = Level;

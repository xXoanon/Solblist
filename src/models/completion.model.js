// src/models/completion.model.js
const db = require('./db.js');

// Completion schema (for reference)
// id: SERIAL PRIMARY KEY
// level_id: TEXT REFERENCES levels(id) ON DELETE CASCADE
// player_id: INTEGER REFERENCES players(id) ON DELETE CASCADE
// completion_url: TEXT
// completion_date: DATE (YYYY-MM-DD)
// created_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
// updated_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

const Completion = {};

Completion.create = async ({ level_id, player_id, completion_url, completion_date }) => {
  const query = `
    INSERT INTO completions (level_id, player_id, completion_url, completion_date)
    VALUES ($1, $2, $3, $4)
    RETURNING id, level_id, player_id, completion_url, completion_date, created_at, updated_at;
  `;
  try {
    // Ensure completion_date is in 'YYYY-MM-DD' format or null
    const formattedDate = completion_date ? new Date(completion_date).toISOString().split('T')[0] : null;
    const { rows } = await db.query(query, [level_id, player_id, completion_url, formattedDate]);
    return rows[0];
  } catch (err) {
    console.error('Error creating completion:', err.stack);
    throw err;
  }
};

Completion.findByLevelId = async (levelId) => {
  const query = `
    SELECT c.id, c.level_id, c.player_id, p.name as player_name, c.completion_url, c.completion_date, c.created_at
    FROM completions c
    JOIN players p ON c.player_id = p.id
    WHERE c.level_id = $1
    ORDER BY c.completion_date ASC, p.name ASC;
  `;
  try {
    const { rows } = await db.query(query, [levelId]);
    return rows;
  } catch (err) {
    console.error(`Error finding completions by level_id ${levelId}:`, err.stack);
    throw err;
  }
};

Completion.findByPlayerId = async (playerId) => {
  const query = `
    SELECT c.id, c.level_id, l.name as level_name, l.rank as level_rank, c.player_id, c.completion_url, c.completion_date, c.created_at
    FROM completions c
    JOIN levels l ON c.level_id = l.id
    WHERE c.player_id = $1
    ORDER BY l.rank ASC, c.completion_date ASC;
  `;
  try {
    const { rows } = await db.query(query, [playerId]);
    return rows;
  } catch (err) {
    console.error(`Error finding completions by player_id ${playerId}:`, err.stack);
    throw err;
  }
};

// Add a method to find a specific completion (e.g., for duplicates or updates)
Completion.findByPlayerAndLevel = async (playerId, levelId) => {
    const query = `
      SELECT id, level_id, player_id, completion_url, completion_date, created_at
      FROM completions
      WHERE player_id = $1 AND level_id = $2;
    `;
    try {
      const { rows } = await db.query(query, [playerId, levelId]);
      return rows[0]; // Return the first one if multiple somehow exist
    } catch (err) {
      console.error(`Error finding completion by player_id ${playerId} and level_id ${levelId}:`, err.stack);
      throw err;
    }
};


module.exports = Completion;

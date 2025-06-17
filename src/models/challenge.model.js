// src/models/challenge.model.js
const db = require('./db.js');

// Challenge schema (for reference)
// id: TEXT PRIMARY KEY (e.g., "cotm-yyyy-mm" or a unique name)
// name: VARCHAR(255) NOT NULL
// month: VARCHAR(50) (e.g., "January 2024")
// description: TEXT
// video_url: TEXT (optional, could be for a showcase video of the challenge)
// creator_name: VARCHAR(255) (name of the person who set the challenge)
// difficulty_rating: VARCHAR(50) (e.g., "Hard", "Insane")
// is_current: BOOLEAN DEFAULT FALSE (to mark the current challenge of the month)
// status: VARCHAR(50) (e.g., "active", "archived", "upcoming")
// victor_names: TEXT[] (array of player names who completed the challenge)
// created_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
// updated_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

const Challenge = {};

Challenge.create = async (challengeData) => {
  const {
    id, name, month, description, video_url,
    creator_name, difficulty_rating, is_current = false, status = 'active',
    victor_names = [] // Default to empty array
  } = challengeData;

  const query = `
    INSERT INTO challenges (
      id, name, month, description, video_url, creator_name,
      difficulty_rating, is_current, status, victor_names
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;
  try {
    const { rows } = await db.query(query, [
      id, name, month, description, video_url, creator_name,
      difficulty_rating, is_current, status, victor_names
    ]);
    return rows[0];
  } catch (err) {
    console.error('Error creating challenge:', err.stack);
    throw err;
  }
};

Challenge.findById = async (id) => {
  const query = 'SELECT * FROM challenges WHERE id = $1;';
  try {
    const { rows } = await db.query(query, [id]);
    return rows[0];
  } catch (err) {
    console.error(`Error finding challenge by id ${id}:`, err.stack);
    throw err;
  }
};

Challenge.getAll = async () => {
  // Order by is_current first, then by month (needs proper date sorting if month is text)
  // For simplicity, assuming month string allows reasonable lexical sort or it's handled by client
  const query = 'SELECT * FROM challenges ORDER BY is_current DESC, month DESC, name ASC;';
  try {
    const { rows } = await db.query(query);
    return rows;
  } catch (err) {
    console.error('Error getting all challenges:', err.stack);
    throw err;
  }
};

Challenge.updateById = async (id, updates) => {
  // Dynamically build the update query based on provided fields
  const fields = [];
  const values = [];
  let fieldIndex = 1;

  // List of allowed fields to update
  const allowedFields = [
    'name', 'month', 'description', 'video_url', 'creator_name',
    'difficulty_rating', 'is_current', 'status', 'victor_names'
  ];

  allowedFields.forEach(key => {
    if (updates[key] !== undefined) {
      fields.push(`${key} = $${fieldIndex++}`);
      values.push(updates[key]);
    }
  });

  if (fields.length === 0) {
    return Challenge.findById(id); // No fields to update, return current record
  }

  values.push(id); // For WHERE id = $N

  const query = `
    UPDATE challenges
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${fieldIndex}
    RETURNING *;
  `;
  try {
    const { rows } = await db.query(query, values);
    return rows[0];
  } catch (err) {
    console.error(`Error updating challenge by id ${id}:`, err.stack);
    throw err;
  }
};

Challenge.deleteById = async (id) => {
  const query = 'DELETE FROM challenges WHERE id = $1 RETURNING *;';
  try {
    const { rows } = await db.query(query, [id]);
    return rows[0]; // Returns the deleted record
  } catch (err) {
    console.error(`Error deleting challenge by id ${id}:`, err.stack);
    throw err;
  }
};

// Method to set a challenge as the current one
// This might involve unsetting other current challenges
Challenge.setCurrent = async (id) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        // Unset any other challenge that is currently marked as current
        await client.query("UPDATE challenges SET is_current = false WHERE is_current = true AND id != $1;", [id]);
        // Set the specified challenge as current
        const { rows } = await client.query("UPDATE challenges SET is_current = true, status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *;", [id]);
        await client.query('COMMIT');
        return rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Error setting challenge ${id} as current:`, err.stack);
        throw err;
    } finally {
        client.release();
    }
};

// Method to add a victor to a challenge (if victor_names is an array of names)
Challenge.addVictorName = async (id, victorName) => {
    const query = `
        UPDATE challenges
        SET victor_names = array_append(victor_names, $1), updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND NOT ($1 = ANY(victor_names)) -- Avoid duplicate names
        RETURNING *;
    `;
    try {
        const { rows } = await db.query(query, [victorName, id]);
        if (rows.length === 0) {
            // If no rows returned, either challenge not found or victor already exists
            const challenge = await Challenge.findById(id);
            if (!challenge) throw new Error(`Challenge with ID ${id} not found.`);
            if (challenge.victor_names.includes(victorName)) {
                 // console.log(`Victor ${victorName} already exists for challenge ${id}.`);
                 return challenge; // Return the challenge as is
            }
        }
        return rows[0];
    } catch (err) {
        console.error(`Error adding victor name ${victorName} to challenge ${id}:`, err.stack);
        throw err;
    }
};


module.exports = Challenge;

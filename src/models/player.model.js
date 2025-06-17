// src/models/player.model.js
const db = require('./db.js');

// Player schema (for reference - actual schema is in the database)
// id: SERIAL PRIMARY KEY
// name: VARCHAR(255) UNIQUE NOT NULL
// created_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
// updated_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

const Player = {};

Player.create = async (name) => {
  const query = `
    INSERT INTO players (name)
    VALUES ($1)
    RETURNING id, name, created_at, updated_at;
  `;
  try {
    const { rows } = await db.query(query, [name]);
    return rows[0];
  } catch (err) {
    console.error('Error creating player:', err.stack);
    throw err;
  }
};

Player.findById = async (id) => {
  const query = `
    SELECT id, name, created_at, updated_at
    FROM players
    WHERE id = $1;
  `;
  try {
    const { rows } = await db.query(query, [id]);
    return rows[0];
  } catch (err) {
    console.error(`Error finding player by id ${id}:`, err.stack);
    throw err;
  }
};

Player.findByName = async (name) => {
  const query = `
    SELECT id, name, created_at, updated_at
    FROM players
    WHERE name = $1;
  `;
  try {
    const { rows } = await db.query(query, [name]);
    return rows[0];
  } catch (err) {
    console.error(`Error finding player by name ${name}:`, err.stack);
    throw err;
  }
};

Player.getAll = async () => {
  const query = `
    SELECT id, name, created_at, updated_at
    FROM players
    ORDER BY name ASC;
  `;
  try {
    const { rows } = await db.query(query);
    return rows;
  } catch (err)
    {
    console.error('Error getting all players:', err.stack);
    throw err;
  }
};

// It's also good practice to have an update and delete method,
// but they are not requested in the subtask.
// Player.updateById = async (id, name) => { ... };
// Player.deleteById = async (id) => { ... };

module.exports = Player;

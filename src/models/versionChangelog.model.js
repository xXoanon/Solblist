// src/models/versionChangelog.model.js
const db = require('./db.js');

// VersionChangelog schema (for reference)
// id: SERIAL PRIMARY KEY
// version: VARCHAR(50) UNIQUE NOT NULL (e.g., "1.0.0", "1.0.1-beta")
// date: DATE NOT NULL (YYYY-MM-DD)
// description_items: TEXT[] (Array of strings describing changes)
// created_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

const VersionChangelog = {};

VersionChangelog.create = async ({ version, date, description_items }) => {
  const query = `
    INSERT INTO version_changelogs (version, date, description_items)
    VALUES ($1, $2, $3)
    RETURNING id, version, date, description_items, created_at;
  `;
  try {
    const formattedDate = new Date(date).toISOString().split('T')[0];
    const { rows } = await db.query(query, [version, formattedDate, description_items]);
    return rows[0];
  } catch (err) {
    console.error('Error creating version changelog:', err.stack);
    throw err;
  }
};

VersionChangelog.findByVersion = async (version) => {
  const query = 'SELECT * FROM version_changelogs WHERE version = $1;';
  try {
    const { rows } = await db.query(query, [version]);
    return rows[0];
  } catch (err) {
    console.error(`Error finding version changelog by version ${version}:`, err.stack);
    throw err;
  }
};

VersionChangelog.getAll = async () => {
  // Order by date descending (newest first), then by version string for tie-breaking
  const query = 'SELECT * FROM version_changelogs ORDER BY date DESC, version DESC;';
  try {
    const { rows } = await db.query(query);
    return rows;
  } catch (err) {
    console.error('Error getting all version changelogs:', err.stack);
    throw err;
  }
};

VersionChangelog.updateByVersion = async (version, updates) => {
  const { date, description_items } = updates;
  if (!date && !description_items) {
    return VersionChangelog.findByVersion(version); // No updatable fields provided
  }

  const fields = [];
  const values = [];
  let fieldIndex = 1;

  if (date) {
    fields.push(`date = $${fieldIndex++}`);
    values.push(new Date(date).toISOString().split('T')[0]);
  }
  if (description_items) {
    fields.push(`description_items = $${fieldIndex++}`);
    values.push(description_items);
  }

  values.push(version); // For WHERE version = $N

  const query = `
    UPDATE version_changelogs
    SET ${fields.join(', ')}
    WHERE version = $${fieldIndex}
    RETURNING *;
  `;
  try {
    const { rows } = await db.query(query, values);
    return rows[0];
  } catch (err) {
    console.error(`Error updating version changelog ${version}:`, err.stack);
    throw err;
  }
};

VersionChangelog.deleteByVersion = async (version) => {
  const query = 'DELETE FROM version_changelogs WHERE version = $1 RETURNING *;';
  try {
    const { rows } = await db.query(query, [version]);
    return rows[0];
  } catch (err) {
    console.error(`Error deleting version changelog ${version}:`, err.stack);
    throw err;
  }
};

module.exports = VersionChangelog;

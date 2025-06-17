// src/models/listChangelog.model.js
const db = require('./db.js');

// ListChangelog schema (for reference)
// id: SERIAL PRIMARY KEY
// date: DATE NOT NULL (YYYY-MM-DD)
// description_items: TEXT[] (Array of strings describing list changes, e.g., "Level X moved up", "Player Y achieved Z")
// created_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

const ListChangelog = {};

ListChangelog.create = async ({ date, description_items }) => {
  const query = `
    INSERT INTO list_changelogs (date, description_items)
    VALUES ($1, $2)
    RETURNING id, date, description_items, created_at;
  `;
  try {
    const formattedDate = new Date(date).toISOString().split('T')[0];
    const { rows } = await db.query(query, [formattedDate, description_items]);
    return rows[0];
  } catch (err) {
    console.error('Error creating list changelog:', err.stack);
    throw err;
  }
};

ListChangelog.findById = async (id) => {
  const query = 'SELECT * FROM list_changelogs WHERE id = $1;';
  try {
    const { rows } = await db.query(query, [id]);
    return rows[0];
  } catch (err) {
    console.error(`Error finding list changelog by id ${id}:`, err.stack);
    throw err;
  }
};

ListChangelog.getAll = async () => {
  const query = 'SELECT * FROM list_changelogs ORDER BY date DESC, id DESC;'; // Newest first
  try {
    const { rows } = await db.query(query);
    return rows;
  } catch (err) {
    console.error('Error getting all list changelogs:', err.stack);
    throw err;
  }
};

ListChangelog.updateById = async (id, updates) => {
  const { date, description_items } = updates;
  if (!date && !description_items) {
    return ListChangelog.findById(id); // No updatable fields
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

  values.push(id); // For WHERE id = $N

  const query = `
    UPDATE list_changelogs
    SET ${fields.join(', ')}
    WHERE id = $${fieldIndex}
    RETURNING *;
  `;
  try {
    const { rows } = await db.query(query, values);
    return rows[0];
  } catch (err) {
    console.error(`Error updating list changelog ${id}:`, err.stack);
    throw err;
  }
};

ListChangelog.deleteById = async (id) => {
  const query = 'DELETE FROM list_changelogs WHERE id = $1 RETURNING *;';
  try {
    const { rows } = await db.query(query, [id]);
    return rows[0];
  } catch (err) {
    console.error(`Error deleting list changelog ${id}:`, err.stack);
    throw err;
  }
};

module.exports = ListChangelog;

// scripts/migrateData.js
const fs = require('fs');
const path = require('path');
const db = require('../src/models/db.js'); // Adjust path as necessary
const Player = require('../src/models/player.model.js');
const Level = require('../src/models/level.model.js');
const Completion = require('../src/models/completion.model.js');

const dataJsonPath = path.join(__dirname, '..', 'data.json');

async function migrateData() {
  let data;
  try {
    const jsonData = fs.readFileSync(dataJsonPath, 'utf-8');
    data = JSON.parse(jsonData);
    console.log('Successfully read data.json.');
  } catch (err) {
    console.error('Error reading or parsing data.json:', err);
    return;
  }

  // Database tables should be created beforehand (e.g., via a separate migration script or manually)
  // Example table creation SQL (for reference, not executed here):
  /*
  CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS levels (
    id TEXT PRIMARY KEY, -- Using text as some IDs might be like "cosmic-cyclone" or video IDs
    rank INTEGER,
    name VARCHAR(255) NOT NULL,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS completions (
    id SERIAL PRIMARY KEY,
    level_id TEXT REFERENCES levels(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    completion_url TEXT,
    completion_date DATE, -- YYYY-MM-DD
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(level_id, player_id) -- Ensures a player can complete a level only once
  );
  */

  const client = await db.pool.connect(); // Get a client from the pool for multiple operations
  console.log('Connected to database for migration.');

  try {
    await client.query('BEGIN'); // Start transaction

    // 1. Process Players
    // Create a set of all player names from the data to avoid duplicates
    const playerNamesInData = new Set();
    data.forEach(level => {
      level.victors.forEach(victor => {
        playerNamesInData.add(victor.name.trim());
      });
    });

    const playerMap = new Map(); // To store name -> id mapping for created/found players

    for (const playerName of playerNamesInData) {
      if (!playerName) continue; // Skip if player name is empty

      let player = await Player.findByName(playerName); // Check if player exists
      if (!player) {
        console.log(`Player "${playerName}" not found, creating...`);
        player = await Player.create(playerName);
        console.log(`Created player: ${player.name} (ID: ${player.id})`);
      } else {
        // console.log(`Player "${playerName}" already exists (ID: ${player.id}).`);
      }
      playerMap.set(playerName, player.id);
    }
    console.log('Players processed.');

    // 2. Process Levels
    for (const levelData of data) {
      const { levelId, rank, name, videoUrl } = levelData;
      if (!levelId || !name) {
        console.warn(`Skipping level due to missing ID or name: ${JSON.stringify(levelData)}`);
        continue;
      }

      let level = await Level.findById(levelId);
      if (!level) {
        console.log(`Level "${name}" (ID: ${levelId}) not found, creating...`);
        level = await Level.create({
          id: levelId,
          rank: parseInt(rank, 10) || null, // Ensure rank is integer or null
          name: name.trim(),
          video_url: videoUrl ? videoUrl.trim() : null
        });
        console.log(`Created level: ${level.name} (ID: ${level.id})`);
      } else {
        // console.log(`Level "${name}" (ID: ${level.id}) already exists.`);
        // Optional: Update existing level data if needed
        // level = await Level.updateById(levelId, { rank, name, video_url });
      }

      // 3. Process Completions for this level
      for (const victorData of levelData.victors) {
        const playerName = victorData.name.trim();
        const playerId = playerMap.get(playerName);

        if (!playerId) {
          console.warn(`Could not find player ID for victor "${playerName}" on level "${level.name}". Skipping completion.`);
          continue;
        }

        // Check if completion already exists
        let completion = await Completion.findByPlayerAndLevel(playerId, level.id);
        if (!completion) {
          console.log(`Adding completion for player "${playerName}" (ID: ${playerId}) on level "${level.name}" (ID: ${level.id})`);
          await Completion.create({
            level_id: level.id,
            player_id: playerId,
            completion_url: victorData.completionUrl ? victorData.completionUrl.trim() : null,
            completion_date: victorData.completionDate ? victorData.completionDate.trim() : null // Ensure YYYY-MM-DD
          });
        } else {
          // console.log(`Completion for player "${playerName}" on level "${level.name}" already exists.`);
        }
      }
    }
    console.log('Levels and completions processed.');

    await client.query('COMMIT'); // Commit transaction
    console.log('Data migration completed successfully!');

  } catch (err) {
    await client.query('ROLLBACK'); // Rollback transaction on error
    console.error('Error during data migration, transaction rolled back:', err);
  } finally {
    client.release(); // Release client back to pool
    console.log('Database client released.');
    // It's important to end the pool when the script is done, or it will hang.
    // However, if this script is run via `npm run migrate`, Node might exit automatically.
    // For standalone execution, you might need: await db.pool.end();
  }
}

// Execute the migration
migrateData().catch(err => {
  console.error("Unhandled error in migration script:", err);
  process.exit(1);
});

// To run this script: node scripts/migrateData.js
// Ensure your database is running and accessible with the credentials in db.config.js
// Also ensure that the tables (players, levels, completions) are created in your database.
// This script does NOT create tables.
// It's also good practice to make this script idempotent, meaning running it multiple
// times doesn't create duplicate data or cause errors. The checks for existing
// players, levels, and completions aim to achieve this.
// The `UNIQUE(level_id, player_id)` constraint on the completions table is crucial.

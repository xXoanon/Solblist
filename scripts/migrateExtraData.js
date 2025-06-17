// scripts/migrateExtraData.js
const fs = require('fs');
const path = require('path');
const db = require('../src/models/db.js'); // Adjust path as necessary
const Challenge = require('../src/models/challenge.model.js');
const VersionChangelog = require('../src/models/versionChangelog.model.js');
const ListChangelog = require('../src/models/listChangelog.model.js');

const challengeJsonPath = path.join(__dirname, '..', 'challenge.json');
const changelogJsonPath = path.join(__dirname, '..', 'changelog.json');

async function migrateChallenges() {
  let challengeData;
  try {
    const jsonData = fs.readFileSync(challengeJsonPath, 'utf-8');
    challengeData = JSON.parse(jsonData);
    console.log('Successfully read challenge.json.');
  } catch (err) {
    console.error('Error reading or parsing challenge.json:', err);
    return false;
  }

  // currentChallenge and archive
  const challengesToProcess = [];
  if (challengeData.currentChallenge) {
    challengesToProcess.push({ ...challengeData.currentChallenge, is_current: true, status: 'active' });
  }
  if (challengeData.archive && Array.isArray(challengeData.archive)) {
    challengeData.archive.forEach(c => challengesToProcess.push({ ...c, is_current: false, status: 'archived' }));
  }

  for (const chal of challengesToProcess) {
    // Generate an ID if not present, e.g., from month and name
    const generatedId = chal.id || `${chal.month.toLowerCase().replace(/\s+/g, '-')}-${chal.levelName.toLowerCase().replace(/\s+/g, '-')}`;

    const existing = await Challenge.findById(generatedId);
    if (!existing) {
      console.log(`Creating challenge: ${chal.levelName} for ${chal.month}`);
      await Challenge.create({
        id: generatedId,
        name: chal.levelName,
        month: chal.month,
        description: chal.description,
        video_url: chal.videoUrl, // Assuming schema uses video_url from previous steps
        creator_name: chal.creator,
        difficulty_rating: chal.difficulty,
        is_current: chal.is_current || false,
        status: chal.status || 'archived',
        victor_names: chal.victors || [] // Assuming 'victors' is an array of names in JSON
      });
    } else {
      // console.log(`Challenge ${chal.levelName} for ${chal.month} already exists. Skipping.`);
    }
  }
  console.log('Challenge data migration finished.');
  return true;
}

async function migrateChangelogs() {
  let changelogJsonData;
  try {
    const jsonData = fs.readFileSync(changelogJsonPath, 'utf-8');
    changelogJsonData = JSON.parse(jsonData);
    console.log('Successfully read changelog.json.');
  } catch (err) {
    console.error('Error reading or parsing changelog.json:', err);
    return false;
  }

  // versionChanges
  if (changelogJsonData.versionChanges && Array.isArray(changelogJsonData.versionChanges)) {
    for (const vc of changelogJsonData.versionChanges) {
      const existing = await VersionChangelog.findByVersion(vc.version);
      if (!existing) {
        console.log(`Creating version changelog for version ${vc.version}`);
        await VersionChangelog.create({
          version: vc.version,
          date: vc.date, // Assuming YYYY-MM-DD
          description_items: vc.changes || []
        });
      } else {
        // console.log(`Version changelog for ${vc.version} already exists. Skipping.`);
      }
    }
  }

  // listChanges
  if (changelogJsonData.listChanges && Array.isArray(changelogJsonData.listChanges)) {
    // List changes might not have a unique key like version, so we might insert them
    // if they don't exactly match an existing one based on date and content.
    // For simplicity, this script will create them if no identical entry (date + description) is found.
    // A more robust approach might involve more complex duplicate checking or just inserting all.
    // The current ListChangelog model doesn't have a findByDateAndDescription method.
    // We'll rely on manual checking or assume new entries are always fresh for now.
    // This simple migration will create entries if they don't exist by simple find (which won't work well for list changes).
    // A better approach for list changes might be to clear and re-insert if exact matching is hard.
    // For now, we'll just add them. The DB schema should ideally prevent exact duplicates if needed.

    // Fetch all existing list changes to do a basic in-memory check to avoid exact duplicates
    const existingListChangelogs = await ListChangelog.getAll();
    const existingEntriesMap = new Set(existingListChangelogs.map(e => `${e.date}_${JSON.stringify(e.description_items)}`));


    for (const lc of changelogJsonData.listChanges) {
        const entryKey = `${new Date(lc.date).toISOString().split('T')[0]}_${JSON.stringify(lc.changes || [])}`;
        if (!existingEntriesMap.has(entryKey)) {
            console.log(`Creating list changelog for date ${lc.date}`);
            await ListChangelog.create({
              date: lc.date, // Assuming YYYY-MM-DD
              description_items: lc.changes || []
            });
            existingEntriesMap.add(entryKey); // Add to set after creation
        } else {
            // console.log(`List changelog for ${lc.date} with identical items already exists. Skipping.`);
        }
    }
  }
  console.log('Changelog data migration finished.');
  return true;
}

async function main() {
  const client = await db.pool.connect();
  console.log('Connected to database for extra data migration.');
  try {
    await client.query('BEGIN');

    console.log('Starting challenge migration...');
    await migrateChallenges();

    console.log('Starting changelog migration...');
    await migrateChangelogs();

    await client.query('COMMIT');
    console.log('Extra data migration completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during extra data migration, transaction rolled back:', err);
  } finally {
    client.release();
    console.log('Database client released.');
    // await db.pool.end(); // Consider if script should close pool
  }
}

main().catch(err => {
  console.error("Unhandled error in extra migration script:", err);
  process.exit(1);
});

// To run: node scripts/migrateExtraData.js
// Assumes tables: challenges, version_changelogs, list_changelogs exist.
// Table schemas (for reference):
/*
CREATE TABLE IF NOT EXISTS challenges (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    month VARCHAR(50),
    description TEXT,
    video_url TEXT,
    creator_name VARCHAR(255),
    difficulty_rating VARCHAR(50),
    is_current BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active',
    victor_names TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS version_changelogs (
    id SERIAL PRIMARY KEY,
    version VARCHAR(50) UNIQUE NOT NULL,
    date DATE NOT NULL,
    description_items TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS list_changelogs (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    description_items TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
*/

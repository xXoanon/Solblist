// src/controllers/level.controller.js
const Level = require('../models/level.model.js');
const Completion = require('../models/completion.model.js');
const Player = require('../models/player.model.js'); // Needed for adding victors

// Create a new level
exports.createLevel = async (req, res) => {
  const { id, rank, name, video_url } = req.body;
  if (!id || !name) {
    return res.status(400).send({ message: 'Level ID and name cannot be empty!' });
  }
  // Rank can be null for non-ranked levels, video_url is optional

  try {
    const existingLevel = await Level.findById(id);
    if (existingLevel) {
      return res.status(409).send({ message: `Level with ID ${id} already exists.`});
    }
    const level = await Level.create({ id, rank, name, video_url });
    res.status(201).send(level);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while creating the Level.'
    });
  }
};

// Get all levels
exports.getAllLevels = async (req, res) => {
  try {
    const levels = await Level.getAll();
    res.send(levels);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while retrieving levels.'
    });
  }
};

// Get a single level by ID
exports.getLevelById = async (req, res) => {
  const id = req.params.id;
  try {
    const level = await Level.findById(id);
    if (level) {
      res.send(level);
    } else {
      res.status(404).send({ message: `Level with ID ${id} not found.` });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving Level with ID ${id}: ${err.message}`
    });
  }
};

// Get all victors for a specific level
exports.getLevelVictors = async (req, res) => {
  const levelId = req.params.id;
  try {
    const level = await Level.findById(levelId);
    if (!level) {
      return res.status(404).send({ message: `Level with ID ${levelId} not found.` });
    }
    const victors = await Level.getVictors(levelId);
    res.send(victors);
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving victors for Level with ID ${levelId}: ${err.message}`
    });
  }
};

// Add a victor to a specific level
exports.addLevelVictor = async (req, res) => {
  const levelId = req.params.id;
  const { player_id, player_name, completion_url, completion_date } = req.body;

  if (!player_id && !player_name) {
    return res.status(400).send({ message: 'Either player_id or player_name must be provided.' });
  }
  if (!completion_url) {
    // Completion URL might be optional depending on requirements, adjust if necessary
    // return res.status(400).send({ message: 'Completion URL cannot be empty.' });
  }

  try {
    const level = await Level.findById(levelId);
    if (!level) {
      return res.status(404).send({ message: `Level with ID ${levelId} not found.` });
    }

    let actualPlayerId = player_id;
    if (!actualPlayerId && player_name) {
      // Find player by name, or create if not exists (optional, based on requirements)
      let player = await Player.findByName(player_name);
      if (!player) {
        // If player creation on-the-fly is desired:
        // player = await Player.create(player_name);
        // If not, then it's an error:
        return res.status(404).send({ message: `Player with name "${player_name}" not found. Please create player first or provide player_id.` });
      }
      actualPlayerId = player.id;
    } else if (player_id) {
        // Verify player_id exists
        const player = await Player.findById(player_id);
        if (!player) {
            return res.status(404).send({ message: `Player with ID ${player_id} not found.` });
        }
    }


    // Check if this completion already exists
    const existingCompletion = await Completion.findByPlayerAndLevel(actualPlayerId, levelId);
    if (existingCompletion) {
      return res.status(409).send({ message: 'This player has already completed this level.' });
    }

    const newCompletion = await Completion.create({
      level_id: levelId,
      player_id: actualPlayerId,
      completion_url,
      completion_date
    });

    res.status(201).send(newCompletion);
  } catch (err) {
    res.status(500).send({
      message: `Error adding victor to Level with ID ${levelId}: ${err.message}`
    });
  }
};

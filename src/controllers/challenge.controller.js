// src/controllers/challenge.controller.js
const Challenge = require('../models/challenge.model.js');

// Create a new challenge
exports.createChallenge = async (req, res) => {
  const {
    id, name, month, description, video_url,
    creator_name, difficulty_rating, is_current, status, victor_names
  } = req.body;

  if (!id || !name || !month) {
    return res.status(400).send({ message: 'Challenge ID, name, and month are required.' });
  }

  try {
    const existingChallenge = await Challenge.findById(id);
    if (existingChallenge) {
        return res.status(409).send({ message: `Challenge with ID ${id} already exists.` });
    }
    const challenge = await Challenge.create({
      id, name, month, description, video_url,
      creator_name, difficulty_rating, is_current, status, victor_names
    });
    res.status(201).send(challenge);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while creating the Challenge.'
    });
  }
};

// Get all challenges
exports.getAllChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.getAll();
    res.send(challenges);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while retrieving challenges.'
    });
  }
};

// Get a single challenge by ID
exports.getChallengeById = async (req, res) => {
  const { id } = req.params;
  try {
    const challenge = await Challenge.findById(id);
    if (challenge) {
      res.send(challenge);
    } else {
      res.status(404).send({ message: `Challenge with ID ${id} not found.` });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving Challenge with ID ${id}: ${err.message}`
    });
  }
};

// Update a challenge by ID
exports.updateChallenge = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedChallenge = await Challenge.updateById(id, req.body);
    if (updatedChallenge) {
      res.send(updatedChallenge);
    } else {
      res.status(404).send({ message: `Challenge with ID ${id} not found or no changes made.` });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error updating Challenge with ID ${id}: ${err.message}`
    });
  }
};

// Delete a challenge by ID
exports.deleteChallenge = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedChallenge = await Challenge.deleteById(id);
    if (deletedChallenge) {
      res.send({ message: "Challenge deleted successfully!", data: deletedChallenge });
    } else {
      res.status(404).send({ message: `Challenge with ID ${id} not found.` });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error deleting Challenge with ID ${id}: ${err.message}`
    });
  }
};

// Set a challenge as the current one
exports.setCurrentChallenge = async (req, res) => {
    const { id } = req.params;
    try {
        const challenge = await Challenge.setCurrent(id);
        if (challenge) {
            res.send(challenge);
        } else {
            res.status(404).send({ message: `Challenge with ID ${id} not found.` });
        }
    } catch (err) {
        res.status(500).send({
            message: `Error setting current challenge with ID ${id}: ${err.message}`
        });
    }
};

// Add a victor (by name) to a challenge
exports.addChallengeVictorName = async (req, res) => {
    const { id } = req.params; // Challenge ID
    const { victor_name } = req.body;

    if (!victor_name) {
        return res.status(400).send({ message: 'Victor name cannot be empty.' });
    }

    try {
        const challenge = await Challenge.addVictorName(id, victor_name.trim());
        if (challenge) {
            res.send(challenge);
        } else {
            // This case should ideally be handled within the model if challenge not found
            res.status(404).send({ message: `Challenge with ID ${id} not found or victor already exists.` });
        }
    } catch (err) {
        // Model might throw error if challenge not found.
        if (err.message.includes("not found")) {
             return res.status(404).send({ message: err.message });
        }
        res.status(500).send({
            message: `Error adding victor to challenge ID ${id}: ${err.message}`
        });
    }
};

// src/controllers/player.controller.js
const Player = require('../models/player.model.js');

// Create a new player
exports.createPlayer = async (req, res) => {
  if (!req.body.name) {
    return res.status(400).send({ message: 'Player name cannot be empty!' });
  }

  try {
    const existingPlayer = await Player.findByName(req.body.name);
    if (existingPlayer) {
      return res.status(409).send({ message: 'Player with this name already exists.' });
    }
    const player = await Player.create(req.body.name);
    res.status(201).send(player);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while creating the Player.'
    });
  }
};

// Get all completions for a specific player
const Completion = require('../models/completion.model.js'); // Needs Completion model

exports.getPlayerCompletions = async (req, res) => {
  const playerId = parseInt(req.params.id);
  if (isNaN(playerId)) {
    return res.status(400).send({ message: 'Invalid Player ID format.' });
  }

  try {
    // First, check if the player exists
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).send({ message: `Player with ID ${playerId} not found.` });
    }

    const completions = await Completion.findByPlayerId(playerId);
    res.send(completions);
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving completions for Player with ID ${playerId}: ${err.message}`
    });
  }
};

// Get all players
exports.getAllPlayers = async (req, res) => {
  try {
    const players = await Player.getAll();
    res.send(players);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while retrieving players.'
    });
  }
};

// Get a single player by ID
exports.getPlayerById = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).send({ message: 'Invalid Player ID format.' });
  }

  try {
    const player = await Player.findById(id);
    if (player) {
      res.send(player);
    } else {
      res.status(404).send({ message: `Player with ID ${id} not found.` });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving Player with ID ${id}: ${err.message}`
    });
  }
};

// Get a single player by name
exports.getPlayerByName = async (req, res) => {
  const name = req.params.name;
  if (!name || name.trim() === '') {
      return res.status(400).send({ message: 'Player name parameter cannot be empty.' });
  }

  try {
    const player = await Player.findByName(name);
    if (player) {
      res.send(player);
    } else {
      res.status(404).send({ message: `Player with name "${name}" not found.` });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving Player with name "${name}": ${err.message}`
    });
  }
};

// src/api/player.routes.js
const express = require('express');
const router = express.Router();
const playerController = require('../controllers/player.controller.js');

// Create a new Player
router.post('/', playerController.createPlayer);

// Retrieve all Players
router.get('/', playerController.getAllPlayers);

// Retrieve a single Player by ID
router.get('/:id', playerController.getPlayerById);

// Retrieve a single Player by name
router.get('/name/:name', playerController.getPlayerByName);

// Retrieve all completions for a specific Player
router.get('/:id/completions', playerController.getPlayerCompletions);

module.exports = router;

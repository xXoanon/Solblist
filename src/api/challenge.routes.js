// src/api/challenge.routes.js
const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challenge.controller.js');

// Create a new Challenge
router.post('/', challengeController.createChallenge);

// Retrieve all Challenges
router.get('/', challengeController.getAllChallenges);

// Retrieve a single Challenge by ID
router.get('/:id', challengeController.getChallengeById);

// Update a Challenge by ID
router.put('/:id', challengeController.updateChallenge);

// Delete a Challenge by ID
router.delete('/:id', challengeController.deleteChallenge);

// Set a Challenge as current
router.patch('/:id/set-current', challengeController.setCurrentChallenge); // Using PATCH for partial update like setting current

// Add a victor name to a Challenge
router.post('/:id/victors', challengeController.addChallengeVictorName);

module.exports = router;

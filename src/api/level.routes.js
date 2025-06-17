// src/api/level.routes.js
const express = require('express');
const router = express.Router();
const levelController = require('../controllers/level.controller.js');

// Create a new Level
router.post('/', levelController.createLevel);

// Retrieve all Levels
router.get('/', levelController.getAllLevels);

// Retrieve a single Level by ID
router.get('/:id', levelController.getLevelById);

// Retrieve all victors for a specific Level
router.get('/:id/victors', levelController.getLevelVictors);

// Add a victor to a specific Level
router.post('/:id/victors', levelController.addLevelVictor);

module.exports = router;

// src/api/changelog.routes.js
const express = require('express');
const router = express.Router();
const changelogController = require('../controllers/changelog.controller.js');

// --- Version Changelog Routes ---
// Create a new version changelog entry
router.post('/versions', changelogController.createVersionEntry);

// Retrieve all version changelog entries
router.get('/versions', changelogController.getAllVersionEntries);

// Retrieve a single version changelog entry by version string
router.get('/versions/:version', changelogController.getVersionEntry);

// --- List Changelog Routes ---
// Create a new list changelog entry
router.post('/list', changelogController.createListEntry);

// Retrieve all list changelog entries
router.get('/list', changelogController.getAllListEntries);

// Retrieve a single list changelog entry by ID
router.get('/list/:id', changelogController.getListEntry);

// --- Combined Endpoint ---
// Retrieve all version and list changelogs (should be last for GET to avoid conflict)
router.get('/', changelogController.getAllChangelogs);

module.exports = router;

// src/controllers/changelog.controller.js
const VersionChangelog = require('../models/versionChangelog.model.js');
const ListChangelog = require('../models/listChangelog.model.js');

// --- Version Changelog Controllers ---

exports.createVersionEntry = async (req, res) => {
  const { version, date, description_items } = req.body;
  if (!version || !date || !description_items || !Array.isArray(description_items) || description_items.length === 0) {
    return res.status(400).send({ message: 'Version, date, and a non-empty array of description items are required.' });
  }
  try {
    const existing = await VersionChangelog.findByVersion(version);
    if (existing) {
        return res.status(409).send({ message: `Version changelog for version ${version} already exists.`});
    }
    const entry = await VersionChangelog.create({ version, date, description_items });
    res.status(201).send(entry);
  } catch (err) {
    res.status(500).send({ message: err.message || 'Error creating version changelog entry.' });
  }
};

exports.getAllVersionEntries = async (req, res) => {
  try {
    const entries = await VersionChangelog.getAll();
    res.send(entries);
  } catch (err) {
    res.status(500).send({ message: err.message || 'Error retrieving version changelogs.' });
  }
};

exports.getVersionEntry = async (req, res) => {
  const { version } = req.params;
  try {
    const entry = await VersionChangelog.findByVersion(version);
    if (entry) {
      res.send(entry);
    } else {
      res.status(404).send({ message: `Version changelog for version ${version} not found.` });
    }
  } catch (err) {
    res.status(500).send({ message: err.message || `Error retrieving version ${version} changelog.` });
  }
};

// --- List Changelog Controllers ---

exports.createListEntry = async (req, res) => {
  const { date, description_items } = req.body;
   if (!date || !description_items || !Array.isArray(description_items) || description_items.length === 0) {
    return res.status(400).send({ message: 'Date and a non-empty array of description items are required.' });
  }
  try {
    // Note: Unlike version, list entries might have same date. Uniqueness by ID.
    const entry = await ListChangelog.create({ date, description_items });
    res.status(201).send(entry);
  } catch (err) {
    res.status(500).send({ message: err.message || 'Error creating list changelog entry.' });
  }
};

exports.getAllListEntries = async (req, res) => {
  try {
    const entries = await ListChangelog.getAll();
    res.send(entries);
  } catch (err) {
    res.status(500).send({ message: err.message || 'Error retrieving list changelogs.' });
  }
};

exports.getListEntry = async (req, res) => {
  const id = parseInt(req.params.id);
   if (isNaN(id)) {
    return res.status(400).send({ message: 'Invalid List Changelog ID format.' });
  }
  try {
    const entry = await ListChangelog.findById(id);
    if (entry) {
      res.send(entry);
    } else {
      res.status(404).send({ message: `List changelog with ID ${id} not found.` });
    }
  } catch (err) {
    res.status(500).send({ message: err.message || `Error retrieving list changelog ID ${id}.` });
  }
};

// Combined endpoint for convenience
exports.getAllChangelogs = async (req, res) => {
    try {
        const versionChanges = await VersionChangelog.getAll();
        const listChanges = await ListChangelog.getAll();
        res.send({
            versionChanges,
            listChanges
        });
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error retrieving all changelogs.' });
    }
};

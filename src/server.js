const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON bodies

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// API routes
const playerRoutes = require('./api/player.routes.js'); // Import player routes
app.use('/api/players', playerRoutes); // Mount player routes under /api/players

const levelRoutes = require('./api/level.routes.js'); // Import level routes
app.use('/api/levels', levelRoutes); // Mount level routes under /api/levels

const challengeRoutes = require('./api/challenge.routes.js'); // Import challenge routes
app.use('/api/challenges', challengeRoutes); // Mount challenge routes

const changelogRoutes = require('./api/changelog.routes.js'); // Import changelog routes
app.use('/api/changelogs', changelogRoutes); // Mount changelog routes

// General /api health check or version endpoint (optional)
app.get('/api', (req, res) => {
  res.json({ message: "Welcome to the Solblist API!" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app; // For potential testing or extension

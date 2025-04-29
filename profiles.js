// profiles.js
console.log("Profiles script loaded.");

document.addEventListener('DOMContentLoaded', async () => {
    const rankingsContainer = document.getElementById('player-rankings-container'); // Corrected ID
    const statsContainer = document.getElementById('list-stats-container'); // Corrected ID (assuming this is the intended ID in profiles.html)

    // Ensure containers exist on this page before proceeding
    if (rankingsContainer && statsContainer) {
        try {
            // Wait for the data to be loaded from common.js
            await loadSolblistData();
            // Ensure calculateListPoints is also available
            if (typeof calculateListPoints !== 'undefined') {
                populateRankingsAndStats(rankingsContainer, statsContainer);
            } else {
                throw new Error('calculateListPoints function not found.');
            }
        } catch (error) {
            const errorMsg = `<p class="error-message">Error loading profile data: ${error.message}. Is common.js included and data.json accessible?</p>`;
            rankingsContainer.innerHTML = errorMsg;
            statsContainer.innerHTML = ''; // Clear stats on error
            console.error('Error initializing profiles page:', error);
        }
    } else {
        console.warn('Could not find rankings or stats container on profiles.html');
        if(rankingsContainer) rankingsContainer.innerHTML = '<p class="error-message">Error: Page structure is incorrect (missing stats container?).</p>';
        if(statsContainer) statsContainer.innerHTML = '<p class="error-message">Error: Page structure is incorrect (missing rankings container?).</p>';
    }
});

// --- Functions for profiles.html --- 
function populateRankingsAndStats(rankingsContainer, statsContainer) {
    rankingsContainer.innerHTML = ''; // Clear loading message
    statsContainer.innerHTML = ''; // Clear loading message

    // Ensure solblistData and calculateListPoints are available (from common.js)
    if (typeof solblistData === 'undefined' || typeof calculateListPoints === 'undefined') {
        rankingsContainer.innerHTML = '<p class="error-message">Error: Required data or functions not loaded.</p>';
        statsContainer.innerHTML = '';
        console.error('solblistData or calculateListPoints not found in populateRankingsAndStats.');
        return;
    }

    // 1. Calculate Player Points
    const playerPoints = {};
    solblistData.forEach(level => {
        const points = calculateListPoints(level.rank);
        level.victors.forEach(victor => {
            if (!playerPoints[victor.name]) {
                playerPoints[victor.name] = { points: 0, levels: [] };
            }
            playerPoints[victor.name].points += points;
            playerPoints[victor.name].levels.push({ rank: level.rank, name: level.name, points: points });
        });
    });

    // 2. Sort Players by Points
    const sortedPlayers = Object.entries(playerPoints)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.points - a.points);

    // 3. Populate Rankings Table
    const rankingsList = document.createElement('ol');
    rankingsList.className = 'player-rankings-list';
    sortedPlayers.forEach((player, index) => {
        const rankItem = document.createElement('li');
        rankItem.innerHTML = `
            <span class="ranking-position">${index + 1}.</span>
            <a href="profile.html?player=${encodeURIComponent(player.name)}" class="player-name-link">${player.name}</a>
            <span class="player-points">${player.points.toFixed(2)} pts</span>
        `;
        rankingsList.appendChild(rankItem);
    });
    rankingsContainer.appendChild(rankingsList);

    // 4. Calculate and Populate List Stats
    const totalLevels = solblistData.length;
    const totalPossiblePoints = solblistData.reduce((sum, level) => sum + calculateListPoints(level.rank), 0);
    const rankedPlayersCount = sortedPlayers.length;
    const hardestLevel = solblistData.find(l => l.rank === 1);
    const easiestLevel = solblistData.find(l => l.rank === totalLevels);
    const averagePointsPerLevel = totalPossiblePoints / totalLevels;

    statsContainer.innerHTML = `
        <h4>Quick Stats</h4>
        <ul>
            <li>Total Levels: <strong>${totalLevels}</strong></li>
            <li>Total Possible Points: <strong>${totalPossiblePoints.toFixed(2)}</strong></li>
            <li>Ranked Players: <strong>${rankedPlayersCount}</strong></li>
            <li>Hardest Level: <strong>#${hardestLevel.rank} ${hardestLevel.name} (${calculateListPoints(hardestLevel.rank).toFixed(2)} pts)</strong></li>
            <li>Easiest Level: <strong>#${easiestLevel.rank} ${easiestLevel.name} (${calculateListPoints(easiestLevel.rank).toFixed(2)} pts)</strong></li>
            <li>Average Points/Level: <strong>${averagePointsPerLevel.toFixed(2)} pts</strong></li>
        </ul>
    `;
}
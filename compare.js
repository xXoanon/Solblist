document.addEventListener('DOMContentLoaded', async () => {
    const player1Select = document.getElementById('player1-select');
    const player2Select = document.getElementById('player2-select');
    const comparisonResultsDiv = document.getElementById('comparison-results');
    let listData = [];
    let uniquePlayers = []; // Store unique player names

    // Fetch data using common function
    try {
        // loadSolblistData now likely returns the list data directly or within an object
        const loadedData = await loadSolblistData();
        // Adjust based on the actual structure returned by loadSolblistData
        // Assuming it returns an object { listData: [...] }
        // If it returns the array directly, use: listData = loadedData;
        listData = loadedData.listData || loadedData; // Handle both cases

        if (!Array.isArray(listData)) {
            throw new Error("Fetched list data is not an array.");
        }

        // Extract unique player names from listData
        const playerNames = new Set();
        listData.forEach(level => {
            level.victors.forEach(victor => {
                playerNames.add(victor.name);
            });
        });
        uniquePlayers = [...playerNames].sort((a, b) => a.localeCompare(b));

        populatePlayerDropdowns();
    } catch (error) {
        console.error("Error fetching or processing data for comparison:", error);
        comparisonResultsDiv.innerHTML = '<p class="error-message">Error loading player data. Please try refreshing the page.</p>';
        return; // Stop execution if data fetch fails
    }

    // Populate player dropdowns using unique player names
    function populatePlayerDropdowns() {
        uniquePlayers.forEach(playerName => {
            const option1 = document.createElement('option');
            option1.value = playerName;
            option1.textContent = playerName;
            player1Select.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = playerName;
            option2.textContent = playerName;
            player2Select.appendChild(option2.cloneNode(true)); // Clone for the second dropdown
        });

        // Add event listeners after populating
        player1Select.addEventListener('change', triggerComparison);
        player2Select.addEventListener('change', triggerComparison);
    }

    // Trigger comparison when both dropdowns have a selection
    function triggerComparison() {
        const player1Name = player1Select.value;
        const player2Name = player2Select.value;

        if (player1Name && player2Name) {
            if (player1Name === player2Name) {
                comparisonResultsDiv.innerHTML = '<p class="info-message">Please select two different players to compare.</p>';
            } else {
                displayComparison(player1Name, player2Name);
            }
        } else {
            comparisonResultsDiv.innerHTML = '<p>Select two players to compare.</p>';
        }
    }

    // Calculate points for a player by name using listData
    function calculatePlayerPoints(playerName) {
        let totalPoints = 0;
        listData.forEach((level) => {
            const victor = level.victors.find(v => v.name === playerName);
            if (victor) {
                // Assuming listData is sorted by rank, use level.rank
                totalPoints += calculateListPoints(level.rank); // Use common point calculation
            }
        });
        return totalPoints;
    }

    // Helper to get all completions for a player
    function getPlayerCompletions(playerName) {
        const completions = [];
        listData.forEach(level => {
            const victor = level.victors.find(v => v.name === playerName);
            if (victor) {
                completions.push({ level: level.name, rank: level.rank, url: victor.completionUrl });
            }
        });
        return completions.sort((a, b) => a.rank - b.rank); // Sort by rank
    }

    // Display comparison results
    function displayComparison(player1Name, player2Name) {
        // Calculate points using the updated function
        const player1Points = calculatePlayerPoints(player1Name);
        const player2Points = calculatePlayerPoints(player2Name);

        // Get completions using the helper function
        const player1CompletionsList = getPlayerCompletions(player1Name);
        const player2CompletionsList = getPlayerCompletions(player2Name);

        const player1LevelNames = new Set(player1CompletionsList.map(c => c.level));
        const player2LevelNames = new Set(player2CompletionsList.map(c => c.level));

        // Find common completions (names only)
        const commonCompletions = [...player1LevelNames].filter(levelName => player2LevelNames.has(levelName));

        // Build HTML output
        let html = `
            <div class="comparison-grid">
                <div class="comparison-header">Stat</div>
                <div class="comparison-header player-name">${player1Name}</div>
                <div class="comparison-header player-name">${player2Name}</div>

                <div class="comparison-label">Points</div>
                <div class="comparison-value">${player1Points.toFixed(2)}</div>
                <div class="comparison-value">${player2Points.toFixed(2)}</div>

                <div class="comparison-label">Total Completions</div>
                <div class="comparison-value">${player1LevelNames.size}</div>
                <div class="comparison-value">${player2LevelNames.size}</div>

                <!-- Common Completions Section -->
                <div class="comparison-label common-completions-label">Common Completions (${commonCompletions.length})</div>
                <div class="comparison-value common-list" colspan="2">
                    ${commonCompletions.length > 0 ? `<ul>${commonCompletions.map(level => `<li>${level}</li>`).join('')}</ul>` : 'None'}
                </div>

                <!-- Add more comparison stats as needed -->

            </div>
        `;

        comparisonResultsDiv.innerHTML = html;
    }

    // Initial message
    comparisonResultsDiv.innerHTML = '<p>Select two players to compare.</p>';
});
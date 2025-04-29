// profile.js
console.log("Profile script loaded.");

document.addEventListener('DOMContentLoaded', async () => {
    const singleProfileContainer = document.getElementById('single-profile-view');
    const contentContainer = document.getElementById('single-profile-content');

    // Ensure containers exist on this page before proceeding
    if (singleProfileContainer && contentContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const playerName = urlParams.get('player');

        if (playerName) {
            try {
                // Wait for the data to be loaded from common.js
                await loadSolblistData();
                // Ensure calculateListPoints is available
                if (typeof calculateListPoints !== 'undefined') {
                    loadSingleProfile(playerName, contentContainer);
                } else {
                    throw new Error('calculateListPoints function not found.');
                }
            } catch (error) {
                contentContainer.innerHTML = `<p class="error-message">Error loading profile data: ${error.message}. Is common.js included and data.json accessible?</p>`;
                console.error('Error initializing profile page:', error);
            }
        } else {
            contentContainer.innerHTML = '<p class="error-message">Error: Player name not specified in URL.</p>';
        }
    } else {
        console.warn('Could not find required containers on profile.html');
        if(contentContainer) contentContainer.innerHTML = '<p class="error-message">Error: Page structure is incorrect.</p>';
    }
});

// --- Function for profile.html --- 
function loadSingleProfile(playerName, contentContainer) {
    // Data loading and function availability are now checked in the DOMContentLoaded listener
    if (!contentContainer) {
        console.error('Error: contentContainer is missing in loadSingleProfile.');
        // Optionally display an error in a default location or just return
        return;
    }

    // 1. Find all completions by this player
    const playerCompletions = [];
    let totalPoints = 0;
    const totalLevels = solblistData.length; // Get total number of levels

    solblistData.forEach(level => {
        const victorData = level.victors.find(v => v.name === playerName);
        if (victorData) {
            const points = calculateListPoints(level.rank);
            playerCompletions.push({ 
                rank: level.rank, 
                name: level.name, 
                points: points, 
                completionUrl: victorData.completionUrl,
                completionDate: victorData.completionDate // Added completion date
            });
            totalPoints += points;
        }
    });

    if (playerCompletions.length === 0) {
        contentContainer.innerHTML = `<p class="error-message">Player '${playerName}' not found or has no completions on the list.</p>`;
        document.title = `Profile Not Found - The Solblist`;
        return;
    }

    // Calculate progress percentage
    const progressPercentage = totalLevels > 0 ? (playerCompletions.length / totalLevels) * 100 : 0;

    // Update page title
    document.title = `${playerName}'s Profile - The Solblist`;

    // 2. Sort completions by rank (hardest first)
    playerCompletions.sort((a, b) => a.rank - b.rank);

    // 3. Find hardest completion
    const hardestCompletion = playerCompletions.length > 0 ? playerCompletions[0] : null;

    // 4. Prepare HTML content for different sections
    const headerContainer = document.getElementById('profile-header');
    // const socialsContainer = document.getElementById('profile-socials'); // Removed
    const hardestContainer = document.getElementById('profile-hardest');
    const completionsContainer = document.getElementById('profile-completions');
    const loadingIndicator = contentContainer.querySelector('p'); // Find the loading <p>

    if (loadingIndicator) {
        loadingIndicator.style.display = 'none'; // Hide loading message
    }

    // Populate Header
    if (headerContainer) {
        headerContainer.innerHTML = `
            <h2 class="profile-name">${playerName}</h2>
            <p class="profile-stats">Total Points: <strong>${totalPoints.toFixed(2)}</strong> | Levels Completed: <strong>${playerCompletions.length} / ${totalLevels}</strong></p>
            <div class="stat-item progress-stat">
                <span class="stat-label">List Progress</span>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progressPercentage.toFixed(1)}%;"></div>
                    <span class="progress-percentage">${progressPercentage.toFixed(1)}%</span>
                </div>
            </div>
        `;
    }

    // Populate Hardest Completion
    if (hardestContainer && hardestCompletion) {
        hardestContainer.innerHTML = `
            <div class="hardest-completion">
                <h3>Hardest Completion</h3>
                <p>
                    <span class="hardest-rank">#${hardestCompletion.rank}</span> - 
                    <span class="hardest-name">${hardestCompletion.name}</span> 
                    (${hardestCompletion.points.toFixed(2)} pts)
                    ${hardestCompletion.completionUrl ? `<a href="${hardestCompletion.completionUrl}" target="_blank" rel="noopener noreferrer" class="completion-link">[Video]</a>` : ''}
                </p>
            </div>
            <hr class="profile-divider">
        `;
    }

    // Populate Completions List
    if (completionsContainer) {
        if (playerCompletions.length > 0) {
            let completionsHtml = '<h3>All Completions:</h3>';
            completionsHtml += '<ul class="completions-list">';
            // Use the already sorted playerCompletions
            playerCompletions.forEach(comp => {
                // Find the corresponding level in the main data to check for first victor
                const levelData = solblistData.find(level => level.rank === comp.rank);
                const isFirstVictor = levelData && levelData.victors.length > 0 && levelData.victors[0].name === playerName;
                const listItemClass = isFirstVictor ? 'first-victor-profile' : '';

                completionsHtml += `
                    <li class="${listItemClass}">
                        #${comp.rank} - ${comp.name} (${comp.points.toFixed(2)} pts)
                        ${comp.completionUrl ? `<a href="${comp.completionUrl}" target="_blank" rel="noopener noreferrer" class="completion-link">[Video]</a>` : ''}
                        ${comp.completionDate ? `<span class="completion-date">(${comp.completionDate})</span>` : ''}
                    </li>`;
            });
            completionsHtml += '</ul>';
            completionsContainer.innerHTML = completionsHtml;
        } else {
            // This case is already handled earlier, but keep for safety
            completionsContainer.innerHTML = '<p>No completions recorded on this list.</p>';
        }
    }

    // Error handling if containers are missing
    if (!headerContainer || !hardestContainer || !completionsContainer) { // Removed socialsContainer check
        console.error('Error: One or more profile content containers not found in profile.html.');
        // Ensure the main container shows an error if sub-containers are missing
        contentContainer.innerHTML = '<p class="error-message">Error displaying profile: Page structure is incorrect.</p>'; 
        if (loadingIndicator) loadingIndicator.style.display = 'none'; // Hide loading if error occurs
    }
}
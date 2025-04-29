// challenge.js
console.log("Challenge script loaded.");

document.addEventListener('DOMContentLoaded', async () => {
    const currentChallengeContainer = document.getElementById('current-challenge-container');
    const challengeArchiveContainer = document.getElementById('challenge-archive-container');

    // Ensure containers exist
    if (!currentChallengeContainer || !challengeArchiveContainer) {
        console.warn('Challenge containers not found on challenge.html');
        return;
    }

    try {
        // Fetch challenge data (assuming a function in common.js or define here)
        const challengeData = await loadChallengeData(); 

        // Ensure getYouTubeId is available if needed for video embeds
        if (typeof getYouTubeId === 'undefined') {
            console.warn('getYouTubeId function not found, using full URLs.');
            // Implement fallback or ensure common.js provides it
        }

        populateCurrentChallenge(currentChallengeContainer, challengeData.currentChallenge);
        populateChallengeArchive(challengeArchiveContainer, challengeData.archive);

    } catch (error) {
        currentChallengeContainer.innerHTML = `<p class="error-message">Error loading challenge data: ${error.message}. Is challenge.json accessible?</p>`;
        challengeArchiveContainer.innerHTML = ''; // Clear archive loading message too
        console.error('Error initializing challenge page:', error);
    }
});

// Function to fetch challenge data (can be moved to common.js if reused)
async function loadChallengeData() {
    try {
        const response = await fetch('challenge.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Challenge data loaded:", data);
        return data;
    } catch (error) {
        console.error('Failed to load challenge.json:', error);
        throw error; // Re-throw to be caught by the main handler
    }
}

// Function to populate the current challenge section
function populateCurrentChallenge(container, challenge) {
    container.innerHTML = ''; // Clear loading message

    if (!challenge) {
        container.innerHTML = '<p>No current challenge available.</p>';
        return;
    }

    // Video display removed as per request

    const challengeItem = document.createElement('div');
    challengeItem.className = 'challenge-item current-challenge'; // Add specific class if needed

    // Generate victors list HTML
    let victorsHtml = '';
    if (challenge.victors && challenge.victors.length > 0) {
        victorsHtml = `
            <div class="victors-section">
                <h4>Victors:</h4>
                <ul>
                    ${challenge.victors.map(victor => `<li>${victor}</li>`).join('')}
                </ul>
            </div>
        `;
    } else {
        victorsHtml = '<p>No victors yet!</p>';
    }

    challengeItem.innerHTML = `
        <h3>${challenge.month}: ${challenge.levelName}</h3>
        <p><strong>Creator:</strong> ${challenge.creator || 'N/A'}</p>
        <p><strong>Difficulty:</strong> ${challenge.difficulty || 'N/A'}</p>
        <p><strong>ID:</strong> ${challenge.id || 'N/A'}</p>
        <p>${challenge.description || 'No description provided.'}</p>
        ${victorsHtml}
    `;
    container.appendChild(challengeItem);
}

// Function to populate the challenge archive section
function populateChallengeArchive(container, archive) {
    container.innerHTML = ''; // Clear loading message

    if (!archive || archive.length === 0) {
        container.innerHTML = '<p>No archived challenges yet.</p>';
        return;
    }

    // Sort archive by date if necessary (assuming month string format is consistent or convert to dates)
    // For simplicity, we'll display in the order they appear in the JSON for now.

    archive.forEach(item => {
        const archiveItem = document.createElement('div');
        archiveItem.className = 'challenge-archive-item';

        // Generate victors list HTML for archive item
        let archiveVictorsHtml = '';
        if (item.victors && item.victors.length > 0) {
            archiveVictorsHtml = `
                <div class="victors-section archive-victors">
                    <strong>Victors:</strong>
                    <ul>
                        ${item.victors.map(victor => `<li>${victor}</li>`).join('')}
                    </ul>
                </div>
            `;
        } else {
            archiveVictorsHtml = '<p class="no-archive-victors">No victors for this challenge.</p>';
        }

        archiveItem.innerHTML = `
            <h4>${item.month}: ${item.levelName}</h4>
            <p>Creator: ${item.creator || 'N/A'} | Difficulty: ${item.difficulty || 'N/A'} | ID: ${item.id || 'N/A'}</p>
            ${item.description ? `<p class="archive-description">${item.description}</p>` : ''}
            ${archiveVictorsHtml}
        `;
        // Optionally add a link to view more details or the video if available
        container.appendChild(archiveItem);
    });
}

// Helper function (could be in common.js)
// Simple YouTube ID extractor (adjust if needed)
function getYouTubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}
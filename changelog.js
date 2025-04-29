// changelog.js
console.log("Changelog script loaded.");

document.addEventListener('DOMContentLoaded', async () => {
    const changelogContainer = document.getElementById('changelog-container');

    // Ensure container exists on this page before proceeding
    if (changelogContainer) {
        try {
            // Fetch the changelog data
            const changelogData = await loadChangelogData();
            populateChangelog(changelogContainer, changelogData);
        } catch (error) {
            changelogContainer.innerHTML = `<p class="error-message">Error loading changelog: ${error.message}. Is changelog.json accessible and common.js included?</p>`;
            console.error('Error initializing changelog:', error);
        }
    } else {
        console.warn('Could not find changelog container on changelog.html');
    }
});

// Function to fetch changelog data (assuming a similar function exists in common.js or is added)
async function loadChangelogData() {
    try {
        const response = await fetch('changelog.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Changelog data loaded successfully:", data);
        return data;
    } catch (error) {
        console.error('Failed to load changelog.json:', error);
        throw new Error('Could not fetch changelog data.'); // Re-throw for handling in the main listener
    }
}

// Function to populate the changelog container
function populateChangelog(container, data) {
    container.innerHTML = ''; // Clear loading message

    if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = '<p>No changelog entries found.</p>';
        return;
    }

    // Sort data by version descending (optional, assuming newest first)
    data.sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true, sensitivity: 'base' }));

    data.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'changelog-entry card'; // Use card style for consistency

        const header = document.createElement('h3');
        header.className = 'changelog-version';
        header.textContent = `Version ${entry.version}`; // Add 'Version' prefix

        const dateSpan = document.createElement('span');
        dateSpan.className = 'changelog-date text-secondary'; // Add secondary text style
        // Format date for better readability (optional)
        try {
            const date = new Date(entry.date + 'T00:00:00'); // Assume UTC or local based on input
            dateSpan.textContent = ` - ${date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`;
        } catch (e) {
             dateSpan.textContent = ` - ${entry.date}`; // Fallback to original date string
        }
       
        header.appendChild(dateSpan);

        const changesList = document.createElement('ul');
        changesList.className = 'changelog-changes';

        if (Array.isArray(entry.changes)) {
            entry.changes.forEach(change => {
                const listItem = document.createElement('li');
                listItem.textContent = change;
                changesList.appendChild(listItem);
            });
        }

        entryDiv.appendChild(header);
        entryDiv.appendChild(changesList);
        container.appendChild(entryDiv);
    });
}
// changelog.js
console.log("Changelog script loaded.");

document.addEventListener('DOMContentLoaded', async () => {
    const changelogContainer = document.getElementById('changelog-container');
    const listChangesContainer = document.getElementById('list-changes-container');

    // Ensure containers exist on this page before proceeding
    if (changelogContainer && listChangesContainer) {
        try {
            // Fetch the changelog data
            const changelogData = await loadChangelogData();
            populateChangelog(changelogContainer, changelogData);
            populateListChanges(listChangesContainer, changelogData); // Add this line
        } catch (error) {
            const errorMessage = `<p class="error-message">Error loading data: ${error.message}. Is changelog.json accessible and common.js included?</p>`;
            if (changelogContainer) changelogContainer.innerHTML = errorMessage;
            if (listChangesContainer) listChangesContainer.innerHTML = errorMessage;
            console.error('Error initializing changelog page:', error);
        }
    } else {
        if (!changelogContainer) console.warn('Could not find changelog container on changelog.html');
        if (!listChangesContainer) console.warn('Could not find list changes container on changelog.html');
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
        // Ensure the data has the expected structure
        if (!data || typeof data !== 'object' || !Array.isArray(data.versionChanges) || !Array.isArray(data.listChanges)) {
            console.error('Invalid changelog data structure:', data);
            throw new Error('Changelog data is not in the expected format (object with versionChanges and listChanges arrays).');
        }
        return data;
    } catch (error) {
        console.error('Failed to load changelog.json:', error);
        throw new Error('Could not fetch changelog data.'); // Re-throw for handling in the main listener
    }
}

// Function to populate the changelog container
function populateChangelog(container, data) {
    container.innerHTML = ''; // Clear loading message

    const versionChanges = data.versionChanges;

    if (!Array.isArray(versionChanges) || versionChanges.length === 0) {
        container.innerHTML = '<p>No changelog entries found.</p>';
        return;
    }

    // Sort data by version descending
    versionChanges.sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true, sensitivity: 'base' }));

    versionChanges.forEach(entry => {
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

// Function to populate the list changes container
function populateListChanges(container, data) {
    container.innerHTML = ''; // Clear loading/default message

    const listChanges = data.listChanges;

    if (!Array.isArray(listChanges) || listChanges.length === 0) {
        container.innerHTML = '<p>No list changes recorded yet.</p>';
        return;
    }

    // Sort list changes by date descending (newest first)
    listChanges.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Group changes by date for rendering
    const changesByDate = listChanges.reduce((acc, entry) => {
        let formattedDate = entry.date; // Fallback date
        try {
            const date = new Date(entry.date + 'T00:00:00'); // Assume date is YYYY-MM-DD
            formattedDate = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        } catch (e) {
            console.warn(`Failed to format date: ${entry.date}`, e);
        }

        if (!acc[formattedDate]) {
            acc[formattedDate] = [];
        }
        if (Array.isArray(entry.changes)) {
            acc[formattedDate].push(...entry.changes);
        }
        return acc;
    }, {});

    // Get sorted dates (newest first)
    const sortedDates = Object.keys(changesByDate).sort((a, b) => new Date(b) - new Date(a));

    sortedDates.forEach(formattedDate => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'changelog-entry card'; // Use the same class as version changes

        const dateHeader = document.createElement('p'); // Use a paragraph for the date header
        dateHeader.className = 'list-change-date-header text-secondary'; // New class for styling
        dateHeader.textContent = formattedDate;

        const changesList = document.createElement('ul');
        changesList.className = 'changelog-changes'; // Reuse class from version changes

        changesByDate[formattedDate].forEach(change => {
            const listItem = document.createElement('li');
            listItem.textContent = change;
            changesList.appendChild(listItem);
        });

        entryDiv.appendChild(dateHeader);
        entryDiv.appendChild(changesList);
        container.appendChild(entryDiv);
    });
}
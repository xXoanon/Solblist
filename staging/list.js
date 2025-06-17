// list.js
console.log("List script loaded.");

document.addEventListener('DOMContentLoaded', async () => {
    const listContainer = document.getElementById('solblist-container');

    // Ensure container exists on this page before proceeding
    if (listContainer) {
        try {
            // Wait for the data to be loaded from common.js
            await loadSolblistData();
            // Ensure getYouTubeId is also available
            if (typeof getYouTubeId !== 'undefined') {
                populateList(listContainer);
            } else {
                throw new Error('getYouTubeId function not found.');
            }
        } catch (error) {
            listContainer.innerHTML = `<p class="error-message">Error loading list data: ${error.message}. Is common.js included and data.json accessible?</p>`;
            console.error('Error initializing list:', error);
        }
    } else {
        console.warn('Could not find list container on index.html');
    }
});

// --- Function for index.html ---
function populateList(container) {
    container.innerHTML = ''; // Clear loading message
    // Ensure solblistData is sorted by rank
    const sortedList = [...solblistData].sort((a, b) => a.rank - b.rank);

    let legacyListStarted = false; // Flag to track if legacy list has started

    sortedList.forEach(level => {
        // Check if this is the first legacy level (rank 16)
        if (level.rank === 16 && !legacyListStarted) {
            // Add separator and heading before the first legacy item
            const separator = document.createElement('hr');
            separator.className = 'legacy-separator';
            container.appendChild(separator);

            const legacyHeading = document.createElement('h2');
            legacyHeading.className = 'legacy-heading';
            legacyHeading.textContent = 'Legacy List';
            // Create a container for the legacy section
            const legacyContainer = document.createElement('div');
            legacyContainer.id = 'legacy-list-container';
            // container.appendChild(legacyContainer); // Move this down

            // Add heading and toggle button *before* the container
            const headingContainer = document.createElement('div');
            headingContainer.className = 'legacy-heading-container'; // Add a class for styling
            // headingContainer.style.display = 'flex'; // Style in CSS instead
            // headingContainer.style.alignItems = 'center'; // Style in CSS instead
            // headingContainer.style.justifyContent = 'center'; // Remove inline centering
            headingContainer.style.marginBottom = '15px'; // Keep original heading margin

            legacyHeading.style.margin = '0'; // Remove margin from h2 itself
            headingContainer.appendChild(legacyHeading);

            const toggleButton = document.createElement('button');
            toggleButton.id = 'toggle-legacy-button';
            toggleButton.textContent = 'Show'; // Initial state is now 'Show'
            toggleButton.classList.add('button', 'button-small'); // Add some basic styling
            headingContainer.appendChild(toggleButton);

            // Append heading container *before* the legacy list container
            container.appendChild(headingContainer);
            // Now append the legacy list container itself
            container.appendChild(legacyContainer);

            // Hide the legacy list by default
            legacyContainer.classList.add('legacy-items-hidden');

            legacyListStarted = true; // Set the flag
        }

        // Determine the target container (main or legacy)
        const targetContainer = legacyListStarted ? document.getElementById('legacy-list-container') : container;

        const listItem = document.createElement('div');
        // Add 'legacy-item' class if rank > 15
        listItem.className = level.rank > 15 ? 'list-item legacy-item' : 'list-item';
        listItem.dataset.rank = level.rank; // Store rank for potential use

        // Only append legacy items to the legacy container
        // if (level.rank <= 15) {
        //     container.appendChild(listItem); // Append main list items directly to the main container
        // } else if (targetContainer) {
        //      // The rest of the item creation logic needs to happen *before* appending
        // } else {
        //     console.error("Legacy container not found when trying to append item.");
        //     return; // Skip this item if container isn't ready
        // }
        // --- Move appending logic after item is fully constructed ---

        const videoId = getYouTubeId(level.videoUrl);
        // Use a default placeholder if video ID is not found or invalid
        const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'placeholder.jpg';

        // Format victors string with links to profile pages ONLY, adding emphasis to the first
        const victorsHtml = level.victors.map((victor, index) => {
            const isFirstVictor = index === 0;
            const victorClass = isFirstVictor ? 'victor-profile-link first-victor' : 'victor-profile-link';
            const profileLink = `<a href="/staging/profile.html?player=${encodeURIComponent(victor.name)}" class="${victorClass}">${victor.name}</a>`;
            // Completion link removed from this view
            return profileLink;
        }).join(', ');

        // Determine the rank display text and wrap LEGACY in a span
        const rankDisplay = level.rank <= 15 ? `#${level.rank}` : '<span class="legacy-rank-text">LEGACY</span>';

        listItem.innerHTML = `
            <div class="video-thumbnail-container">
                 <img src="${thumbnailUrl}" alt="${level.name} Thumbnail" class="video-thumbnail">
                 <!-- Removed link and play button overlay as level page is gone -->
            </div>
            <div class="info-container">
                <h3 class="level-name">${rankDisplay} ${level.name}</h3>
                <p class="victors">VICTORS: ${victorsHtml || '<i>None yet</i>'}</p>
            </div>
        `;

        // Add click listener to open the modal
        listItem.addEventListener('click', (event) => {
            // Prevent profile links within the item from triggering the modal
            if (event.target.closest('.victor-profile-link')) {
                return;
            }
            openLevelModal(level.rank);
        });

        // Append the list item to the correct container *after* it's fully built
        if (level.rank <= 15) {
            container.appendChild(listItem); // Append main list items directly to the main container
        } else {
            const legacyContainer = document.getElementById('legacy-list-container');
            if (legacyContainer) {
                legacyContainer.appendChild(listItem); // Append legacy items to their container
            } else {
                 console.error("Legacy container not found when trying to append item rank:", level.rank);
            }
        }
    });

    // Add event listener for the toggle button *after* the loop
    const toggleButton = document.getElementById('toggle-legacy-button');
    const legacyListContent = document.getElementById('legacy-list-container'); // Get the container itself

    if (toggleButton && legacyListContent) {
        // Find all legacy items within the container to toggle them
        const legacyItems = legacyListContent.querySelectorAll('.legacy-item');
        const legacySeparator = document.querySelector('.legacy-separator'); // Find the separator before the container

        toggleButton.addEventListener('click', () => {
            const isHidden = legacyListContent.classList.toggle('legacy-items-hidden'); // Use the correct variable
            toggleButton.textContent = isHidden ? 'Show' : 'Hide';

            // Optionally hide the separator too when the list is hidden
            // if (legacySeparator) {
            //     // Ensure separator visibility matches list visibility
            //     legacySeparator.style.display = isHidden ? 'none' : '';
            // }
        });

        // Initially hide the separator if the list starts hidden
        // if (legacyListContent.classList.contains('legacy-items-hidden') && legacySeparator) {
        //     legacySeparator.style.display = 'none';
        // }
    } else {
        if (!toggleButton) console.error("Toggle button not found after list population.");
        if (!legacyListContent) console.error("Legacy list container not found after list population.");
    }
}

// --- Modal Functionality ---

const modal = document.getElementById('level-modal');
const modalTitle = document.getElementById('modal-level-title');
const modalVideoContainer = document.getElementById('modal-video-container');
const modalVictorsList = document.getElementById('modal-victors-list');
const modalLevelPoints = document.getElementById('modal-level-points'); // Added for points
const modalLevelId = document.getElementById('modal-level-id'); // Added for Level ID
const closeModalButton = modal ? modal.querySelector('.modal-close-button') : null;

function openLevelModal(rank) {
    if (!modal || !solblistData) return; // Ensure modal and data exist

    const level = solblistData.find(l => l.rank === rank);
    if (!level) {
        console.error(`Level with rank ${rank} not found.`);
        // Optionally show an error message to the user
        return;
    }

    // Populate Modal Title - Adjust for Legacy
    const modalRankDisplay = level.rank <= 15 ? `#${level.rank}` : '<span class="legacy-rank-text">LEGACY</span>';
    modalTitle.innerHTML = `${modalRankDisplay} ${level.name}`; // Use innerHTML to render the span
    const modalLevelId = document.getElementById('modal-level-id'); // Get the new element
    if (modalLevelId) {
        modalLevelId.textContent = `Level ID: ${level.levelId || 'N/A'}`;
    }

    // Populate Video
    const videoId = getYouTubeId(level.videoUrl);
    modalVideoContainer.innerHTML = ''; // Clear previous video
    if (videoId) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.title = `${level.name} Video Showcase`;
        iframe.frameborder = "0";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowfullscreen = true;
        modalVideoContainer.appendChild(iframe);
    } else {
        modalVideoContainer.innerHTML = '<p>Video not available.</p>';
    }

    // Populate Victors
    modalVictorsList.innerHTML = ''; // Clear previous list
    if (level.victors && level.victors.length > 0) {
        level.victors.forEach(victor => {
            const li = document.createElement('li');
            // Create a link to the victor's profile
            const profileLink = document.createElement('a');
            profileLink.href = `/staging/profile.html?player=${encodeURIComponent(victor.name)}`;
            profileLink.textContent = victor.name;
            profileLink.classList.add('victor-profile-link'); // Add a class for potential styling
            li.appendChild(profileLink);
            modalVictorsList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'None yet';
        modalVictorsList.appendChild(li);
    }

    // Populate List Points (assuming calculateListPoints is available from common.js)
    if (typeof calculateListPoints === 'function' && modalLevelPoints) {
        // Only calculate points for main list levels
        const points = level.rank <= 15 ? calculateListPoints(level.rank) : 0;
        // Format points to 2 decimal places, or indicate legacy
        modalLevelPoints.textContent = level.rank <= 15 ? `List Points: ${points.toFixed(2)}` : 'List Points: N/A (Legacy)';
    } else if (modalLevelPoints) {
        modalLevelPoints.textContent = 'List Points: Calculation unavailable.';
        console.warn('calculateListPoints function not found or points element missing.');
    }

    // Show the modal
    modal.style.display = 'flex'; // Use flex for centering
    setTimeout(() => modal.classList.add('visible'), 10); // Add class after display for transition

}

function closeLevelModal() {
    if (!modal) return;
    modal.classList.remove('visible');
    // Wait for transition before hiding completely
    modal.addEventListener('transitionend', () => {
        modal.style.display = 'none';
        // Stop video playback by removing the iframe src
        const iframe = modalVideoContainer.querySelector('iframe');
        if (iframe) {
            iframe.src = ''; // Or remove the iframe entirely
        }
    }, { once: true }); // Ensure listener only runs once
}

// Event Listeners for Closing Modal
if (closeModalButton) {
    closeModalButton.addEventListener('click', closeLevelModal);
}

if (modal) {
    // Close modal if user clicks on the overlay (outside the content)
    modal.addEventListener('click', (event) => {
        if (event.target === modal) { // Check if the click was directly on the overlay
            closeLevelModal();
        }
    });
}

// Add listener for Escape key to close modal
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal && modal.classList.contains('visible')) {
        closeLevelModal();
    }
});
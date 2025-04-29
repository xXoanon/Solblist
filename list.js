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

    sortedList.forEach(level => {
        const listItem = document.createElement('div');
        listItem.className = 'list-item';
        listItem.dataset.rank = level.rank; // Store rank for potential use

        const videoId = getYouTubeId(level.videoUrl);
        // Use a default placeholder if video ID is not found or invalid
        const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'placeholder.jpg'; 

        // Format victors string with links to profile pages ONLY, adding emphasis to the first
        const victorsHtml = level.victors.map((victor, index) => {
            const isFirstVictor = index === 0;
            const victorClass = isFirstVictor ? 'victor-profile-link first-victor' : 'victor-profile-link';
            const profileLink = `<a href="profile.html?player=${encodeURIComponent(victor.name)}" class="${victorClass}">${victor.name}</a>`;
            // Completion link removed from this view
            return profileLink;
        }).join(', ');

        listItem.innerHTML = `
            <div class="video-thumbnail-container">
                 <img src="${thumbnailUrl}" alt="${level.name} Thumbnail" class="video-thumbnail">
                 <!-- Removed link and play button overlay as level page is gone -->
            </div>
            <div class="info-container">
                <h3 class="level-name">#${level.rank} ${level.name}</h3>
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

        container.appendChild(listItem);
    });
}

// --- Modal Functionality ---

const modal = document.getElementById('level-modal');
const modalTitle = document.getElementById('modal-level-title');
const modalVideoContainer = document.getElementById('modal-video-container');
const modalVictorsList = document.getElementById('modal-victors-list');
const modalLevelPoints = document.getElementById('modal-level-points'); // Added for points
const closeModalButton = modal ? modal.querySelector('.modal-close-button') : null;

function openLevelModal(rank) {
    if (!modal || !solblistData) return; // Ensure modal and data exist

    const level = solblistData.find(l => l.rank === rank);
    if (!level) {
        console.error(`Level with rank ${rank} not found.`);
        // Optionally show an error message to the user
        return;
    }

    // Populate Modal Title
    modalTitle.textContent = `#${level.rank} ${level.name}`;

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
            profileLink.href = `profile.html?player=${encodeURIComponent(victor.name)}`;
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
        const points = calculateListPoints(level.rank);
        // Format points to 2 decimal places
        modalLevelPoints.textContent = `List Points: ${points.toFixed(2)}`; 
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
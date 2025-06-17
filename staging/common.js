// common.js
console.log("Common script loaded.");

// --- Theme Selector ---
const themeSelector = document.getElementById('theme-selector');
const THEME_STORAGE_KEY = 'solblist-theme';

// Define available themes (match data-theme values in CSS)
const themes = {
    'dark': 'Dark',
    'light': 'Light',
    'hell': 'Hell',
    'mechanical': 'Mechanical',
    'pastel-dream': 'Pastel', /* Renamed from saturated */
    'rainbow': 'Rainbow',
    'forest': 'Forest',
    'retro': 'Retro' // Added Retro theme
};

// Function to apply the selected theme
function applyTheme(theme) {
    if (themes[theme]) {
        document.documentElement.setAttribute('data-theme', theme);
        console.log(`Theme applied: ${theme}`);
    } else {
        console.warn(`Invalid theme selected: ${theme}. Applying default (dark).`);
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

// Function to populate the theme selector dropdown
function populateThemeSelector() {
    if (!themeSelector) return;

    Object.entries(themes).forEach(([value, text]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        themeSelector.appendChild(option);
    });
}

// Function to load and apply the saved theme, and set dropdown
function loadAndApplyInitialTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'dark'; // Default to dark
    applyTheme(savedTheme);
    if (themeSelector) {
        themeSelector.value = savedTheme; // Set dropdown to saved theme
    }
}

// --- Initialization ---

// Populate the selector as soon as the script runs (before DOMContentLoaded)
// This ensures options are available if the DOM loads quickly
populateThemeSelector();

// Load and apply the theme immediately
loadAndApplyInitialTheme();

// --- Footer Loading ---
async function loadFooter() {
    const footerElement = document.querySelector('footer'); // Select the footer element
    if (!footerElement) {
        console.warn('Footer element not found.');
        return;
    }

    try {
        const response = await fetch('/staging/footer.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const footerData = await response.json();

        // Clear existing footer content (optional, good practice)
        footerElement.innerHTML = '';

        // Create copyright paragraph
        const copyrightP = document.createElement('p');
        copyrightP.textContent = footerData.copyright;
        footerElement.appendChild(copyrightP);

        // Create navigation links
        if (footerData.links && footerData.links.length > 0) {
            const nav = document.createElement('nav');
            const ul = document.createElement('ul');
            footerData.links.forEach(link => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = link.url;
                a.textContent = link.text;
                li.appendChild(a);
                ul.appendChild(li);
            });
            nav.appendChild(ul);
            footerElement.appendChild(nav);
        }
        console.log("Footer loaded successfully.");

    } catch (error) {
        console.error('Error loading footer data:', error);
        footerElement.innerHTML = '<p>Error loading footer content.</p>'; // Display error in footer
    }
}

// --- Initialization ---

// Add event listener once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Re-select the element in case it wasn't ready initially
    const themeSelectorInstance = document.getElementById('theme-selector');
    if (themeSelectorInstance) {
        // Ensure the dropdown value matches the applied theme after DOM load
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        themeSelectorInstance.value = currentTheme;

        // Add the change event listener
        themeSelectorInstance.addEventListener('change', (event) => {
            const selectedTheme = event.target.value;
            applyTheme(selectedTheme);
            // Save the new theme preference to local storage
            localStorage.setItem(THEME_STORAGE_KEY, selectedTheme);
        });
    } else {
        console.warn('Theme selector element not found after DOM load.');
    }

    // Load the footer content
    loadFooter();
});

// --- Data Loading ---
let solblistData = []; // Initialize as empty, will be populated by fetch
let dataLoadedPromise = null;

async function loadSolblistData() {
    if (!dataLoadedPromise) {
        dataLoadedPromise = fetch('/staging/data.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                solblistData = data;
                console.log("Solblist data loaded successfully.");
                // Dispatch a custom event to signal data is ready
                document.dispatchEvent(new CustomEvent('solblistDataLoaded'));
                return solblistData; // Resolve the promise with the data
            })
            .catch(error => {
                console.error('Error loading solblist data:', error);
                // Optionally display an error message to the user on the page
                document.dispatchEvent(new CustomEvent('solblistDataError', { detail: error }));
                throw error; // Re-throw error so callers can handle it
            });
    }
    return dataLoadedPromise;
}

// --- Utility Functions ---

// --- Utility Functions ---
function getYouTubeId(url) {
    if (!url) return null;
    let ID = '';
    url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if (url[2] !== undefined) {
        ID = url[2].split(/[^0-9a-z_\-]/i);
        ID = ID[0];
    } else {
        // Handle cases where the input might just be the ID
        const potentialId = url.toString().split('/').pop().split('?')[0];
        if (potentialId && potentialId.length === 11) {
            return potentialId;
        }
        // Fallback if parsing failed unexpectedly
        console.warn("Could not parse YouTube ID from URL:", url);
        return null; // Indicate failure
    }
    // Ensure the extracted ID is valid
    if (typeof ID === 'string' && ID.length === 11) {
         return ID;
    }
    console.warn("Extracted YouTube ID is invalid:", ID, "from URL:", url);
    return null;
}

function calculateListPoints(rank) {
    if (rank < 1 || rank > 15) { // Updated rank check to include 16
        console.warn(`Invalid rank (${rank}) passed to calculateListPoints.`);
        return 0;
    }
    // Linear formula: Points = 18 - (8/7) * (Rank - 1)
    // Simplified: Points = (126 - 8 * (Rank - 1)) / 7
    // Further simplified: Points = (126 - 8*Rank + 8) / 7 = (134 - 8*Rank) / 7
    return (134 - 8 * rank) / 7;
}

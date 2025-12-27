// common.js
console.log("Common script loaded.");

// --- Theme Selector --- 
const themeSelector = document.getElementById('theme-selector');
const THEME_STORAGE_KEY = 'solblist-theme';

// Define available themes (match data-theme values in CSS)
// Organized into categories for the dropdown
const standardThemes = {
    'dark': 'Dark',
    'light': 'Light',
    'hell': 'Hell',
    'mechanical': 'Mechanical',
    'pastel-dream': 'Pastel',
    'rainbow': 'Rainbow',
    'forest': 'Forest',
    'retro': 'Retro'
};

const holidayThemes = {
    'christmas': '🎄 Christmas'
    // Future: 'halloween': '🎃 Halloween', etc.
};

// Combined themes object for validation
const themes = { ...standardThemes, ...holidayThemes };

// --- Christmas Click SFX ---
const sleighSfxFiles = ['SFX/sleigh1.mp3', 'SFX/sleigh2.mp3', 'SFX/sleigh3.mp3', 'SFX/sleigh4.mp3'];

function playChristmasClickSfx(event) {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'christmas') {
        // Pick a random sleigh sound
        const randomFile = sleighSfxFiles[Math.floor(Math.random() * sleighSfxFiles.length)];
        const sfx = new Audio(randomFile);
        sfx.volume = 0.3;
        sfx.play().catch(() => { });

        // If clicking a navigation link, delay the navigation so SFX can play
        const link = event.target.closest('a[href]');
        if (link && !link.href.startsWith('javascript:') && !link.target) {
            event.preventDefault();
            setTimeout(() => {
                window.location.href = link.href;
            }, 750); // 0.75 second delay for SFX to play
        }
    }
}

// Add global click listener for Christmas SFX
document.addEventListener('click', playChristmasClickSfx);

// --- tsParticles Snow Configuration ---
const snowConfig = {
    particles: {
        number: { value: 100, density: { enable: true, area: 800 } },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: { value: { min: 0.3, max: 0.8 } },
        size: { value: { min: 1, max: 5 } },
        move: {
            enable: true,
            speed: { min: 1, max: 3 },
            direction: "bottom",
            straight: false,
            outModes: { default: "out", top: "none" }
        },
        wobble: { enable: true, distance: 10, speed: 5 }
    },
    interactivity: { events: { onClick: { enable: false }, onHover: { enable: false } } },
    detectRetina: true,
    fullScreen: { enable: true, zIndex: 0 }
};

let snowInstance = null;

async function startSnow() {
    if (typeof tsParticles !== 'undefined' && !snowInstance) {
        snowInstance = await tsParticles.load("tsparticles", snowConfig);
        console.log('Snow started');
    }
}

function stopSnow() {
    if (snowInstance) {
        snowInstance.destroy();
        snowInstance = null;
        console.log('Snow stopped');
    }
}

// Function to apply the selected theme
function applyTheme(theme) {
    if (themes[theme]) {
        document.documentElement.setAttribute('data-theme', theme);
        console.log(`Theme applied: ${theme}`);

        // Handle snow effect for Christmas theme
        if (theme === 'christmas') {
            startSnow();
        } else {
            stopSnow();
        }
    } else {
        console.warn(`Invalid theme selected: ${theme}. Applying default (christmas).`);
        document.documentElement.setAttribute('data-theme', 'christmas');
        startSnow();
    }
}

// Function to populate the theme selector dropdown with grouped options
function populateThemeSelector() {
    if (!themeSelector) return;

    // Create Standard Themes group
    const standardGroup = document.createElement('optgroup');
    standardGroup.label = 'Standard Themes';
    Object.entries(standardThemes).forEach(([value, text]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        standardGroup.appendChild(option);
    });
    themeSelector.appendChild(standardGroup);

    // Create Holiday Themes group
    const holidayGroup = document.createElement('optgroup');
    holidayGroup.label = 'Holiday Themes';
    Object.entries(holidayThemes).forEach(([value, text]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        holidayGroup.appendChild(option);
    });
    themeSelector.appendChild(holidayGroup);
}

// Function to load and apply the saved theme, and set dropdown
function loadAndApplyInitialTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'christmas'; // Default to christmas
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
        const response = await fetch('footer.json');
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

    // Initialize AOS (Animate On Scroll) if available
    // Using offset -9999 to trigger all animations immediately on page load
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 600,
            easing: 'ease-out-cubic',
            once: true,
            offset: -9999,  // Animate all elements immediately
            delay: 0
        });
        console.log('AOS initialized.');
    }
});

// Start snow after all scripts are loaded (including tsParticles)
window.addEventListener('load', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'christmas' && typeof tsParticles !== 'undefined') {
        startSnow();
    }
});

// --- Data Loading --- 
let solblistData = []; // Initialize as empty, will be populated by fetch
let dataLoadedPromise = null;

async function loadSolblistData() {
    if (!dataLoadedPromise) {
        dataLoadedPromise = fetch('data.json')
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
    url = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
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
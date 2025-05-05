// profile.js
console.log("Profile script loaded.");

// Helper function to get computed style for CSS variables
function getThemeStyle(variable) {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

// Helper function to convert hex color to RGBA
function hexToRgba(hex, alpha) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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
                    // Initial theme application for chart if it exists
                    updateCompletionChartTheme();
                    // Observe theme changes
                    observeThemeChanges();
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
    // const totalLevels = solblistData.length; // Get total number of levels
    const mainListLevels = solblistData.filter(level => level.rank >= 1 && level.rank <= 15);
    const totalLevels = mainListLevels.length; // Count only main list levels

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

    // Filter completions to only include main list levels for stats display
    const mainListCompletions = playerCompletions.filter(comp => comp.rank >= 1 && comp.rank <= 15);
    const mainListCompletionsCount = mainListCompletions.length;

    // Calculate progress percentage based on main list
    const progressPercentage = totalLevels > 0 ? (mainListCompletionsCount / totalLevels) * 100 : 0;

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
            <p class="profile-stats">Total Points: <strong>${totalPoints.toFixed(2)}</strong> | Levels Completed (Main List): <strong>${mainListCompletionsCount} / ${totalLevels}</strong></p>
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

    // --- Add Completion Timeline Chart ---
    createCompletionTimelineChart(playerCompletions);
}

// --- Function to create the completion timeline chart ---
let completionChartInstance = null; // Store chart instance globally within the scope

function createCompletionTimelineChart(playerCompletions) {
    const chartContainer = document.getElementById('profile-timeline-chart-container');
    const canvas = document.getElementById('completionTimelineChart');

    if (!chartContainer || !canvas) {
        console.warn('Timeline chart container or canvas not found.');
        return;
    }

    // 1. Filter and sort completions with valid dates
    const datedCompletions = playerCompletions
        .filter(comp => {
            if (!comp.completionDate) return false;
            // Basic validation: YYYY-MM-DD
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(comp.completionDate)) return false;
            // Check if date is parseable
            const date = new Date(comp.completionDate + 'T00:00:00Z'); // Assume UTC
            return !isNaN(date.getTime());
        })
        .sort((a, b) => new Date(a.completionDate + 'T00:00:00Z') - new Date(b.completionDate + 'T00:00:00Z'));

    if (datedCompletions.length === 0) {
        chartContainer.innerHTML = '<p>No completions with valid dates found to display timeline.</p>';
        return;
    }

    // 2. Prepare data for Chart.js
    const chartData = datedCompletions.map(comp => ({
        x: new Date(comp.completionDate + 'T00:00:00Z').getTime(), // Use UTC timestamp for x-axis
        y: comp.rank > 15 ? 16 : comp.rank, // Map legacy ranks to 16
        levelName: comp.name,   // Store level name for tooltip
        isLegacy: comp.rank > 15 // Flag for legacy levels
    }));

    // Define colors
    const primaryColor = getThemeStyle('--accent-color') || '#007bff'; // Fallback color
    const primaryColorRgba = hexToRgba(primaryColor, 0.7);
    const legacyColor = getThemeStyle('--text-color-secondary') || '#888888'; // Use secondary text color for legacy
    const legacyColorRgba = hexToRgba(legacyColor, 0.7);

    // Destroy existing chart instance if it exists
    if (completionChartInstance) {
        completionChartInstance.destroy();
    }

    // 3. Create the chart
    const ctx = canvas.getContext('2d');
    completionChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Completions by Rank',
                data: chartData,
                // --- Conditional Styling --- 
                backgroundColor: context => context.raw && context.raw.isLegacy ? legacyColorRgba : primaryColorRgba,
                borderColor: context => context.raw && context.raw.isLegacy ? legacyColor : primaryColor,
                borderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.1 // Slight curve to the line
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month', // Adjust based on data range if needed
                        tooltipFormat: 'MMM d, yyyy', // Format for tooltips
                        displayFormats: {
                            month: 'MMM yyyy' // Format for axis labels
                        }
                    },
                    title: {
                        display: true,
                        text: 'Completion Date'
                    },
                    ticks: {
                        color: getThemeStyle('--text-color') // Use theme color
                    },
                    grid: {
                        color: getThemeStyle('--border-color-light') // Use theme color
                    }
                },
                y: {
                    type: 'linear', // Explicitly set type
                    title: {
                        display: true,
                        text: 'List Rank'
                    }, 
                    reverse: true, // Hardest rank (1) at the top
                    min: 1,        // Set minimum rank
                    max: 16,       // Set maximum rank (including LEGACY)
                    ticks: {
                        stepSize: 1, // Ensure ticks are generated for each integer rank
                        precision: 0, // Ensure integer labels
                        color: getThemeStyle('--text-color'), // Use theme color
                        callback: function(value, index, ticks) {
                            // Check if the value corresponds to the LEGACY rank
                            if (value === 16) {
                                return 'LEGACY'; // Show LEGACY for 16
                            }
                            // For values 1-15, return the integer value
                            // Check if it's an integer to avoid potential floating point issues
                            if (Number.isInteger(value) && value >= 1 && value <= 15) {
                                return value;
                            }
                            // Return null for non-integer values or values outside 1-16 range if they occur
                            return null; 
                        }
                    },
                    grid: {
                        display: true, // Explicitly enable grid lines
                        color: getThemeStyle('--border-color'), // Restore grid color
                        // Draw grid lines only for the integer ranks + LEGACY
                        drawOnChartArea: true // Ensure grid lines are drawn
                    }
                }
            },
            plugins: {
                legend: {
                    display: false // Hide legend as it's only one dataset
                },
                tooltip: {
                    backgroundColor: getThemeStyle('--background-color-tooltip') || 'rgba(0, 0, 0, 0.8)',
                    titleColor: getThemeStyle('--text-color-tooltip-title') || '#ffffff',
                    bodyColor: getThemeStyle('--text-color-tooltip-body') || '#ffffff',
                    callbacks: {
                        // --- Custom Tooltip Label --- 
                        title: function(tooltipItems) {
                            // Display the date as the title
                            const date = new Date(tooltipItems[0].parsed.x);
                            // Use toLocaleDateString for better formatting
                            return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
                        },
                        label: function(context) {
                            const rank = context.raw.isLegacy ? 'LEGACY' : `#${context.parsed.y}`;
                            const levelName = context.raw.levelName;
                            return `${rank}: ${levelName}`;
                        }
                    }
                }
            }
        }
    });

    // Make container visible
    chartContainer.style.display = 'block';
}

// --- Theme Handling for Chart --- 
function updateCompletionChartTheme() {
    if (!completionChartInstance) return;

    const textColor = getThemeStyle('--text-color');
    const accentColor = getThemeStyle('--accent-color');
    const borderColor = getThemeStyle('--border-color');
    const fontPrimary = getThemeStyle('--font-primary').split(',')[0].trim();
    const bgColorSecondary = getThemeStyle('--background-color-secondary');
    const textColorMuted = getThemeStyle('--text-color-muted');

    // Update scales
    completionChartInstance.options.scales.x.ticks.color = textColor;
    completionChartInstance.options.scales.y.ticks.color = textColor;
    completionChartInstance.options.scales.x.grid.color = borderColor;
    completionChartInstance.options.scales.y.grid.color = borderColor;
    completionChartInstance.options.scales.y.grid.display = true; // Ensure grid display is true after theme update
    if (completionChartInstance.options.scales.x.ticks.font) {
        completionChartInstance.options.scales.x.ticks.font.family = fontPrimary;
    }
    if (completionChartInstance.options.scales.y.ticks.font) {
        completionChartInstance.options.scales.y.ticks.font.family = fontPrimary;
    }

    // Update dataset
    completionChartInstance.data.datasets[0].borderColor = accentColor;

    // Update tooltips
    if (completionChartInstance.options.plugins.tooltip) {
        completionChartInstance.options.plugins.tooltip.backgroundColor = bgColorSecondary;
        completionChartInstance.options.plugins.tooltip.titleColor = textColor;
        completionChartInstance.options.plugins.tooltip.bodyColor = textColor;
        completionChartInstance.options.plugins.tooltip.footerColor = textColorMuted;
        if (completionChartInstance.options.plugins.tooltip.titleFont) {
            completionChartInstance.options.plugins.tooltip.titleFont.family = fontPrimary;
        }
        if (completionChartInstance.options.plugins.tooltip.bodyFont) {
            completionChartInstance.options.plugins.tooltip.bodyFont.family = fontPrimary;
        }
        if (completionChartInstance.options.plugins.tooltip.footerFont) {
            completionChartInstance.options.plugins.tooltip.footerFont.family = fontPrimary;
        }
        completionChartInstance.options.plugins.tooltip.borderColor = borderColor;
    }

    completionChartInstance.update();
}

// --- Function to observe theme changes --- 
function observeThemeChanges() {
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                console.log('Theme changed, updating completion chart...');
                updateCompletionChartTheme();
            }
        });
    });

    observer.observe(document.documentElement, {
        attributes: true //configure it to listen to attribute changes
    });
}

// Ensure Chart.js is loaded before trying to use it
if (typeof Chart === 'undefined') {
    console.error('Chart.js is not loaded. Cannot create charts.');
    // Optionally display an error message on the page
    const chartContainer = document.getElementById('profile-timeline-chart-container');
    if (chartContainer) {
        chartContainer.innerHTML = '<p class="error-message">Error: Chart library failed to load.</p>';
    }
}
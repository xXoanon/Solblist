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
            const parts = comp.completionDate.split('-');
            if (parts.length !== 3) return false;
            // Date.UTC expects month 0-11
            const utcTimestamp = Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            return !isNaN(utcTimestamp);
        })
        .sort((a, b) => {
            const partsA = a.completionDate.split('-');
            const partsB = b.completionDate.split('-');
            const dateA = Date.UTC(parseInt(partsA[0], 10), parseInt(partsA[1], 10) - 1, parseInt(partsA[2], 10));
            const dateB = Date.UTC(parseInt(partsB[0], 10), parseInt(partsB[1], 10) - 1, parseInt(partsB[2], 10));
            return dateA - dateB;
        });

    if (datedCompletions.length === 0) {
        chartContainer.innerHTML = '<p>No dated completions available for timeline.</p>';
        return;
    }

    // 2. Prepare chart data
    const labels = datedCompletions.map(comp => comp.completionDate);
    const dataPoints = datedCompletions.map((comp, index) => {
        const parts = comp.completionDate.split('-');
        const utcTimestamp = Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return {
            x: utcTimestamp, // Use UTC timestamp for x-axis
            y: index + 1, // Cumulative count for y-axis
            levelName: comp.name, // Store level name for tooltip
            levelRank: comp.rank // Store rank for tooltip
        };
    });

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
                label: 'Completions Over Time',
                data: dataPoints,
                fill: false,
                borderColor: getThemeStyle('--accent-color') || 'rgb(75, 192, 192)', // Use theme color or default
                tension: 0.1,
                pointRadius: 5, // Make points visible
                pointHoverRadius: 8 // Larger radius on hover
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month', // Adjust time unit as needed (e.g., 'day', 'week')
                        // tooltipFormat removed as title callback handles it
                        // Parser and adapters config removed to rely on default adapter behavior
                    },
                    title: {
                        display: true,
                        text: 'Completion Date'
                    },
                    ticks: {
                        color: getThemeStyle('--text-color') || '#000', // Use theme color or default
                        font: {
                            family: getThemeStyle('--font-primary').split(',')[0].trim() || 'sans-serif'
                        },
                        // Add callback to format axis ticks explicitly (similar to tooltip title)
                        callback: function(value, index, ticks) {
                            const date = new Date(value);
                            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                            // Use UTC methods to avoid timezone issues affecting the date parts
                            const month = months[date.getUTCMonth()];
                            const day = date.getUTCDate();
                            const year = date.getUTCFullYear();
                            // Only show year for the first tick of a new year for clarity
                            if (index > 0 && date.getUTCMonth() === 0 && new Date(ticks[index - 1].value).getUTCFullYear() !== year) {
                                return `${month} ${day}, ${year}`;
                            } else if (index === 0) {
                                return `${month} ${day}, ${year}`;
                            } else {
                                return `${month} ${day}`;
                            }
                        }
                    },
                    grid: {
                        color: getThemeStyle('--border-color') || '#ccc' // Use theme color or default
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cumulative Completions'
                    },
                    ticks: {
                        color: getThemeStyle('--text-color') || '#000', // Use theme color or default
                        stepSize: 1, // Ensure integer steps for count
                        font: {
                            family: getThemeStyle('--font-primary').split(',')[0].trim() || 'sans-serif'
                        }
                    },
                    grid: {
                        color: getThemeStyle('--border-color') || '#ccc' // Use theme color or default
                    }
                }
            },
            plugins: {
                tooltip: {
                    backgroundColor: getThemeStyle('--card-bg-color') || 'rgba(0, 0, 0, 0.8)',
                    titleColor: getThemeStyle('--heading-color') || '#ffffff',
                    bodyColor: getThemeStyle('--text-color') || '#dddddd',
                    borderColor: getThemeStyle('--border-color') || 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    callbacks: {
                        title: function(tooltipItems) {
                            // Use the parsed date from the first tooltip item
                            const date = new Date(tooltipItems[0].parsed.x);
                            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                            // Use UTC methods to avoid timezone issues affecting the date parts
                            const month = months[date.getUTCMonth()];
                            const day = date.getUTCDate();
                            const year = date.getUTCFullYear();
                            return `${month} ${day}, ${year}`; // Format as 'MMM d, yyyy'
                        },
                        label: function(context) {
                            const completion = datedCompletions[context.dataIndex];
                            return `Completed: #${completion.rank} ${completion.name}`;
                        },
                        footer: function(tooltipItems) {
                            // Add total completions up to that point
                            return `Total Completions: ${tooltipItems[0].parsed.y}`;
                        }
                    }
                },
                legend: {
                    display: false // Hide legend as it's not very useful here
                }
            }
        }
    });

    // Initial theme update for the newly created chart
    updateCompletionChartTheme();
}

// --- Function to update chart theme --- 
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
    completionChartInstance.options.scales.x.ticks.font.family = fontPrimary;
    completionChartInstance.options.scales.y.ticks.font.family = fontPrimary;

    // Update dataset
    completionChartInstance.data.datasets[0].borderColor = accentColor;

    // Update tooltips
    if (completionChartInstance.options.plugins.tooltip) {
        completionChartInstance.options.plugins.tooltip.backgroundColor = bgColorSecondary;
        completionChartInstance.options.plugins.tooltip.titleColor = textColor;
        completionChartInstance.options.plugins.tooltip.bodyColor = textColor;
        completionChartInstance.options.plugins.tooltip.footerColor = textColorMuted;
        completionChartInstance.options.plugins.tooltip.titleFont.family = fontPrimary;
        completionChartInstance.options.plugins.tooltip.bodyFont.family = fontPrimary;
        completionChartInstance.options.plugins.tooltip.footerFont.family = fontPrimary;
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
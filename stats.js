// stats.js
console.log("Stats script loaded.");

let topPlayersChartInstance = null; // Store chart instance globally

document.addEventListener('DOMContentLoaded', async () => {
    const statsContainer = document.getElementById('stats-content-container');

    // Ensure container exists
    if (statsContainer) {
        try {
            // Wait for data from common.js
            await loadSolblistData();
            // Ensure calculation function is available
            if (typeof calculateListPoints !== 'undefined') {
                populateStats(statsContainer);
                // Initial theme application
                updateChartTheme();
                // Observe theme changes
                observeThemeChanges();
            } else {
                throw new Error('calculateListPoints function not found.');
            }
        } catch (error) {
            statsContainer.innerHTML = `<p class="error-message">Error loading stats data: ${error.message}. Is common.js included and data.json accessible?</p>`;
            console.error('Error initializing stats page:', error);
        }
    } else {
        console.warn('Could not find stats container on stats.html');
    }
});

// Function to get computed style for CSS variables
function getThemeStyle(variable) {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

// Function to update chart based on current theme
function updateChartTheme() {
    if (!topPlayersChartInstance) return;

    const textColor = getThemeStyle('--text-color');
    const accentColor = getThemeStyle('--accent-color');
    const borderColor = getThemeStyle('--border-color');
    const fontPrimary = getThemeStyle('--font-primary').split(',')[0].trim(); // Get first font
    const fontMono = getThemeStyle('--font-mono').split(',')[0].trim();

    // Update chart options
    topPlayersChartInstance.options.scales.x.ticks.color = textColor;
    topPlayersChartInstance.options.scales.y.ticks.color = textColor;
    topPlayersChartInstance.options.scales.x.grid.color = borderColor;
    topPlayersChartInstance.options.scales.y.grid.color = borderColor;
    topPlayersChartInstance.options.scales.x.ticks.font.family = fontMono;
    topPlayersChartInstance.options.scales.y.ticks.font.family = fontPrimary;

    // --- Update dataset colors based on theme ---
    const currentTheme = document.documentElement.getAttribute('data-theme');
    let barBackgroundColor = accentColor + '99'; // Default with alpha
    let barBorderColor = accentColor;

    if (currentTheme === 'rainbow') {
        // Use white for bars in rainbow theme
        barBackgroundColor = '#ffffff'; // White
        barBorderColor = '#ffffff'; // White border for contrast
    } else if (currentTheme === 'light') {
        // Use the primary accent color for light theme
        barBackgroundColor = getThemeStyle('--accent-color') + '99';
        barBorderColor = getThemeStyle('--accent-color');
    }
    // For other themes, the default accentColor is already set

    topPlayersChartInstance.data.datasets[0].backgroundColor = barBackgroundColor;
    topPlayersChartInstance.data.datasets[0].borderColor = barBorderColor;
    // --- End theme-specific color update ---

    topPlayersChartInstance.update();
}

// Function to observe theme changes
function observeThemeChanges() {
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                console.log('Theme changed, updating chart...');
                updateChartTheme();
            }
        });
    });

    observer.observe(document.documentElement, {
        attributes: true //configure it to listen to attribute changes
    });
}


function populateStats(container) {
    container.innerHTML = ''; // Clear loading message

    // Ensure data is available
    if (typeof solblistData === 'undefined' || typeof calculateListPoints === 'undefined') {
        container.innerHTML = '<p class="error-message">Error: Required data or functions not loaded.</p>';
        console.error('solblistData or calculateListPoints not found in populateStats.');
        return;
    }

    // --- Calculate Statistics --- 

    const firstVictorCounts = {};

    const totalLevels = solblistData.length;
    let totalCompletions = 0;
    const victorCounts = {};
    let totalPointsPossible = 0; // Based on current list ranks
    let totalPointsAwarded = 0;

    solblistData.forEach(level => {
        totalCompletions += level.victors.length;
        const points = calculateListPoints(level.rank);
        totalPointsPossible += points; // Assuming one completion per level for max possible
        level.victors.forEach((victor, index) => {
            victorCounts[victor.name] = (victorCounts[victor.name] || 0) + 1;
            totalPointsAwarded += points;
            // Track first victors
            if (index === 0) {
                firstVictorCounts[victor.name] = (firstVictorCounts[victor.name] || 0) + 1;
            }
        });
    });

    const uniqueVictors = Object.keys(victorCounts).length;

    // Find most common victor(s) (Most Active)
    let maxCompletions = 0;
    let mostCommonVictors = [];
    for (const [name, count] of Object.entries(victorCounts)) {
        if (count > maxCompletions) {
            maxCompletions = count;
            mostCommonVictors = [name];
        } else if (count === maxCompletions) {
            mostCommonVictors.push(name);
        }
    }

    // Find most frequent first victor(s)
    let maxFirstVictories = 0;
    let mostFrequentFirstVictors = [];
    for (const [name, count] of Object.entries(firstVictorCounts)) {
        if (count > maxFirstVictories) {
            maxFirstVictories = count;
            mostFrequentFirstVictors = [name];
        } else if (count === maxFirstVictories) {
            mostFrequentFirstVictors.push(name);
        }
    }

    // Prepare data for Top Players Chart (Top 10)
    const sortedVictors = Object.entries(victorCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10); // Get top 10
    const topPlayerLabels = sortedVictors.map(([name]) => name);
    const topPlayerData = sortedVictors.map(([, count]) => count);

    // --- Generate HTML with CountUp.js targets --- 
    const avgCompletions = totalLevels > 0 ? (totalCompletions / totalLevels) : 0;

    let statsHtml = `
        <div class="stats-grid">
            <div class="stat-card" data-aos="fade-up" data-aos-delay="0">
                <h4>Total Completions</h4>
                <p><span id="count-completions">0</span></p>
            </div>
             <div class="stat-card" data-aos="fade-up" data-aos-delay="100">
                <h4>Total Points Awarded</h4>
                <p><span id="count-points">0</span></p>
            </div>
            <div class="stat-card" data-aos="fade-up" data-aos-delay="200">
                <h4>Most Active Player(s)</h4>
                <p>${mostCommonVictors.join(', ')} (<span id="count-max-completions">0</span> completions)</p>
            </div>
            <div class="stat-card" data-aos="fade-up" data-aos-delay="300">
                 <h4>Average Completions per Level</h4>
                 <p><span id="count-avg">0</span></p>
            </div>
            <div class="stat-card" data-aos="fade-up" data-aos-delay="400">
                <h4>Most Frequent First Victor</h4>
                <p>${mostFrequentFirstVictors.length > 0 ? `${mostFrequentFirstVictors.join(', ')} (<span id="count-first-victories">0</span> levels)` : 'N/A'}</p>
            </div>
        </div>
        <hr class="header-line section-line">
        <h3 class="subsection-title">Top Players by Completions</h3>
        <div class="chart-container">
             <canvas id="topPlayersChart"></canvas>
        </div>
    `;

    container.innerHTML = statsHtml;

    // --- Initialize CountUp animations ---
    if (typeof countUp !== 'undefined' && countUp.CountUp) {
        const options = { duration: 2, useEasing: true, useGrouping: true };

        new countUp.CountUp('count-completions', totalCompletions, options).start();
        new countUp.CountUp('count-points', totalPointsAwarded, { ...options, decimalPlaces: 2 }).start();
        new countUp.CountUp('count-max-completions', maxCompletions, options).start();
        new countUp.CountUp('count-avg', avgCompletions, { ...options, decimalPlaces: 2 }).start();
        if (maxFirstVictories > 0) {
            new countUp.CountUp('count-first-victories', maxFirstVictories, options).start();
        }
    }

    // Refresh AOS for dynamically added stat cards
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }

    // --- Create Chart --- 
    const ctx = document.getElementById('topPlayersChart')?.getContext('2d');
    if (ctx && topPlayerLabels.length > 0) {
        // Get initial theme styles for chart creation
        const initialTextColor = getThemeStyle('--text-color');
        const initialAccentColor = getThemeStyle('--accent-color');
        const initialBorderColor = getThemeStyle('--border-color');
        const initialFontPrimary = getThemeStyle('--font-primary').split(',')[0].trim();
        const initialFontMono = getThemeStyle('--font-mono').split(',')[0].trim();

        topPlayersChartInstance = new Chart(ctx, { // Assign to global variable
            type: 'bar',
            data: {
                labels: topPlayerLabels,
                datasets: [{
                    label: 'Total Completions',
                    data: topPlayerData,
                    backgroundColor: initialAccentColor + '99', // Use theme color with alpha
                    borderColor: initialAccentColor, // Use theme color
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y', // Display player names on the Y axis
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1, // Ensure whole numbers for completions
                            color: initialTextColor, // Use theme text color
                            font: {
                                family: initialFontMono // Use theme mono font
                            }
                        },
                        grid: {
                            color: initialBorderColor // Use theme border color
                        }
                    },
                    y: {
                        ticks: {
                            color: initialTextColor, // Use theme text color
                            font: {
                                family: initialFontPrimary // Use theme primary font
                            }
                        },
                        grid: {
                            color: initialBorderColor // Use theme border color
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false // Hide legend as title is clear
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    } else if (!ctx) {
        console.warn('Could not find canvas element for top players chart.');
    } else {
        // Handle case with no victors
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) chartContainer.innerHTML = '<p>No completion data available for chart.</p>';
    }
}
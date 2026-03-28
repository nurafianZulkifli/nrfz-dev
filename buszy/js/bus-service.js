/**
 * Bus Service Page
 * Loads service info from JSON and bus stops from API endpoints
 */

// Get service number from URL parameters or use default
function getServiceNumberFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('service') || '3'; // Default to service 3 if not specified
}

// Get base path for the application
function getBasePath() {
    // If PWAConfig is available, use it
    if (window.PWAConfig && window.PWAConfig.basePath) {
        return window.PWAConfig.basePath;
    }
    
    // Otherwise, derive from the current pathname
    // For GitHub Pages: /nrfz-dev/buszy/... -> /nrfz-dev/
    // For local: /buszy/... -> /
    const pathname = window.location.pathname;
    const parts = pathname.split('/').filter(p => p); // Remove empty strings
    
    // parts[0] should be the first directory level
    // If parts[0] is 'buszy', we're at the root level (localhost)
    // If parts[0] is something else and parts[1] is 'buszy', we're in a subdirectory (GitHub Pages)
    
    if (parts.length >= 2 && parts[1] === 'buszy') {
        // Format: /something/buszy/... -> /something/
        return '/' + parts[0] + '/';
    }
    
    // For local or simple paths
    return '/';
}

// Load bus service data from JSON
async function loadBusServiceData() {
    try {
        const basePath = getBasePath();
        const jsonPath = basePath + 'buszy/json/bus-service-data.json';
        const response = await fetch(jsonPath);
        if (!response.ok) {
            throw new Error(`Failed to load data: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading bus service data:', error);
        showErrorMessage('Failed to load bus service data. Please refresh the page.');
        return null;
    }
}

// Fetch enriched stop details from API for given stop codes
async function fetchEnrichedStopsFromAPI(serviceNumber, stopCodes) {
    try {
        const API_BASE = 'https://bat-lta-9eb7bbf231a2.herokuapp.com';
        
        console.log(`Fetching details for ${stopCodes.length} stops for service ${serviceNumber}`);
        
        // Fetch details for each stop code from /bus-stop-det
        const enrichedStops = [];
        for (const stopCode of stopCodes) {
            try {
                const stopResponse = await fetch(`${API_BASE}/bus-stop-det?BusStopCode=${stopCode}`);
                if (stopResponse.ok) {
                    const stopData = await stopResponse.json();
                    // Format: [code, RoadName, Description]
                    enrichedStops.push([
                        stopCode,
                        stopData.Description || stopCode,
                        stopData.RoadName || ''
                    ]);
                    console.log(`Fetched ${stopCode}: ${stopData.RoadName} | ${stopData.Description}`);
                } else {
                    console.warn(`Stop ${stopCode} not found in API`);
                    enrichedStops.push([stopCode, stopCode, '']);
                }
            } catch (error) {
                console.warn(`Failed to fetch stop ${stopCode}:`, error);
                enrichedStops.push([stopCode, stopCode, '']);
            }
        }
        
        return enrichedStops;
    } catch (error) {
        console.error('Error fetching enriched stops from API:', error);
        // Fallback: return stop codes only
        return stopCodes.map(code => [code, code, '']);
    }
}

// Display error message
function showErrorMessage(message) {
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = `
        <div class="alert alert-danger" style="margin-top: 2rem;">
            <i class="fa-solid fa-circle-exclamation"></i> ${message}
        </div>
    `;
}

// Populate page with service data (compact format)
async function populateServiceData(serviceNumber, service) {
    if (!service) {
        showErrorMessage('Service information not found. Please check the service number.');
        return;
    }

    // Update breadcrumb
    const breadcrumbElement = document.querySelector('#breadcrumb-service h2');
    if (breadcrumbElement) {
        breadcrumbElement.textContent = `${service.n}`;
    }

    // Update page title
    document.title = `Service ${service.n} | Buszy`;

    // Service header
    document.getElementById('service-number').textContent = service.n;
    document.getElementById('service-title').textContent = service.op ? `${service.op} ${service.t} Service ${service.n}` : `Service ${service.n}`;

    // Quick info cards
    document.getElementById('operating-hours').textContent = service.h;
    
    // Display frequency with time-based details if available
    if (service.freq_detail) {
        displayFrequencyDetails(service.freq_detail);
    } else {
        document.getElementById('frequency').textContent = service.f + ' mins';
    }
    
    document.getElementById('fare').textContent = service.c;

    // Route terminals
    document.getElementById('terminal-start').textContent = service.ts;
    document.getElementById('terminal-end').textContent = service.te;

    // Set looping point if available
    if (service.lp) {
        document.getElementById('terminal-loop').textContent = service.lp;
    } else {
        // If no looping point, hide the loop section and the first arrow before it
        const loopElement = document.querySelector('.loop');
        const arrows = document.querySelectorAll('.route-arrow');
        if (loopElement) loopElement.style.display = 'none';
        if (arrows.length > 0) {
            arrows[0].style.display = 'none'; // Hide first arrow (before loop)
        }
    }

    // Fetch and enrich bus stops from API, use JSON as source of truth
    let stopsToDisplay = service.st || [];
    if (stopsToDisplay.length > 0) {
        const enrichedStops = await fetchEnrichedStopsFromAPI(service.n, stopsToDisplay);
        populateBusStops(enrichedStops);
    }

    // Remarks section
    if (service.r) {
        document.getElementById('remarks-section').style.display = 'block';
        document.getElementById('remarks-content').innerHTML = `<p>${service.r}</p>`;
    }

    // Short Bus Service section (if applicable)
    if (service.sb && service.sb.length > 0) {
        document.getElementById('short-bus-section').style.display = 'block';
        populateShortBusService(service.sb);
    }

    // Parent Bus Service section (if applicable)
    if (service.pb && service.pb.length > 0) {
        document.getElementById('parent-bus-section').style.display = 'block';
        populateParentBusService(service.pb);
    }
}

// Display frequency details by time period (collapsible)
function displayFrequencyDetails(freqDetail) {
    const frequencyElement = document.getElementById('frequency');
    
    // Check if structure is nested (with day types) or flat (legacy)
    const isNested = freqDetail.weekdays || freqDetail.saturdays || freqDetail.sundays_holidays;
    
    // Detect if this is a departure times format (flat structure with non-frequency values)
    let isDepartureTimes = false;
    if (!isNested) {
        const values = Object.values(freqDetail);
        isDepartureTimes = values.some(val => {
            const isFrequency = /\d+$/.test(val) || val.includes('mins') || /\d+-\d+/.test(val);
            return !isFrequency;
        });
    }
    
    const summaryText = isDepartureTimes ? 'Departure Times' : 'Different frequencies by time';
    
    let html = `
        <div class="frequency-collapsible">
            <div class="frequency-header" onclick="toggleFrequencyDetails(event)">
                <span class="frequency-summary">
                    <i class="fa-regular fa-circle-info" style="margin-right: 0.5rem;"></i>
                    ${summaryText}
                </span>
                <i class="fa-regular fa-chevron-down"></i>
            </div>
            <div class="frequency-details" style="display: none;">
    `;
    
    if (isNested) {
        // Handle nested structure with day types
        const dayLabels = {
            'weekdays': 'Weekdays',
            'saturdays': 'Saturdays',
            'sundays_holidays': 'Sundays & Public Holidays'
        };
        
        for (const [dayType, times] of Object.entries(freqDetail)) {
            if (['weekdays', 'saturdays', 'sundays_holidays'].includes(dayType)) {
                html += `<div class="frequency-day-group">
                    <div class="day-label">${dayLabels[dayType]}</div>`;
                
                for (const [timeRange, frequency] of Object.entries(times)) {
                    html += `
                        <div class="frequency-item">
                            <span class="time-range">${timeRange}</span>
                            <span class="freq-value">${frequency} mins</span>
                        </div>
                    `;
                }
                html += '</div>';
            }
        }
    } else {
        // Handle flat structure (legacy or special cases like departure times)
        for (const [timeRange, value] of Object.entries(freqDetail)) {
            // Check if value is a frequency (ends with a number or contains "mins") or a note
            const isFrequency = /\d+$/.test(value) || value.includes('mins') || /\d+-\d+/.test(value);
            const displayValue = isFrequency ? `${value} mins` : value;
            
            html += `
                <div class="frequency-item">
                    <span class="time-range">${timeRange}</span>
                    <span class="freq-value">${displayValue}</span>
                </div>
            `;
        }
    }
    
    html += '</div></div>';
    frequencyElement.innerHTML = html;
    
    // Update the h3 header in the port-summary card
    const portSummaryCard = frequencyElement.closest('.port-summary');
    if (portSummaryCard) {
        const h3 = portSummaryCard.querySelector('h3');
        if (h3) {
            h3.textContent = isDepartureTimes ? 'Departure Times' : 'Frequency';
        }
    }
}

// Toggle frequency details visibility
function toggleFrequencyDetails(event) {
    const header = event.currentTarget;
    const details = header.nextElementSibling;
    const icon = header.querySelector('i');
    
    if (details.style.display === 'none') {
        details.style.display = 'flex';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    } else {
        details.style.display = 'none';
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    }
}

// Populate bus stops list (compact format: array of [code, name, description])
function populateBusStops(stops) {
    const container = document.getElementById('stops-container');
    const countElement = document.getElementById('stops-count');

    container.innerHTML = ''; // Clear existing content
    countElement.textContent = stops.length;

    stops.forEach((stop, index) => {
        const stopElement = document.createElement('div');
        stopElement.className = 'stop-item';
        stopElement.style.animationDelay = `${index * 0.05}s`;
        
        // Get base path for bus icon
        const basePath = getBasePath();
        const busIconPath = basePath + 'buszy/assets/bus-icon.png';
        
        stopElement.innerHTML = `
            <div class="bus-stop-info">
                <span class="bus-stop-code">
                    <img src="${busIconPath}" alt="Bus Icon">
                    <span class="bus-stop-code-text">${stop[0]}</span>
                </span>
                <div class="bus-stop-inline">
                    <span class="bus-stop-name">${stop[1]}</span>
                    <span class="bus-stop-description">${stop[2]}</span>
                </div>
            </div>
        `;

        // Make stop clickable to navigate to art.html
        stopElement.style.cursor = 'pointer';
        stopElement.addEventListener('click', () => {
            const basePath = getBasePath();
            const artPath = basePath + 'buszy/art.html?BusStopCode=' + stop[0];
            window.location.href = artPath;
        });

        container.appendChild(stopElement);
    });
}

// Populate short bus service links
function populateShortBusService(shortBusServices) {
    const container = document.getElementById('short-bus-content');
    container.innerHTML = '';

    const linkContainer = document.createElement('div');
    linkContainer.className = 'short-bus-links';

    shortBusServices.forEach((service, index) => {
        const link = document.createElement('a');
        link.href = `?service=${service}`;
        link.className = 'short-bus-button';
        link.innerHTML = `${service}`;
        link.style.animationDelay = `${index * 0.05}s`;
        linkContainer.appendChild(link);
    });

    container.appendChild(linkContainer);
}

// Populate parent bus service links
function populateParentBusService(parentBusServices) {
    const container = document.getElementById('parent-bus-content');
    container.innerHTML = '';

    const linkContainer = document.createElement('div');
    linkContainer.className = 'parent-bus-links';

    parentBusServices.forEach((service, index) => {
        const link = document.createElement('a');
        link.href = `?service=${service}`;
        link.className = 'parent-bus-button';
        link.innerHTML = `${service}`;
        link.style.animationDelay = `${index * 0.05}s`;
        linkContainer.appendChild(link);
    });

    container.appendChild(linkContainer);
}

// Initialize page
async function initializePage() {
    const serviceNumber = getServiceNumberFromURL();
    const data = await loadBusServiceData();

    if (data) {
        const service = data.find(s => s.n === serviceNumber);
        if (service) {
            await populateServiceData(serviceNumber, service);
        } else {
            const availableServices = data.map(s => s.n).join(', ');
            showErrorMessage(`Service ${serviceNumber} not found. Available services: ${availableServices}`);
        }
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    
    // Add scroll detection for frequency details scrollbar
    const frequencyDetails = document.querySelector('.frequency-details');
    if (frequencyDetails) {
        let scrollTimeout;
        
        frequencyDetails.addEventListener('scroll', () => {
            frequencyDetails.classList.add('scrolling');
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                frequencyDetails.classList.remove('scrolling');
            }, 1500);
        }, { passive: true });
    }
});

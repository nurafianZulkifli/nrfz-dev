/**
 * Bus Service Page
 * Loads service info from JSON and bus stops from API endpoints
 */

// Get service number from URL parameters or use default
function getServiceNumberFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('service') || '3'; // Default to service 3 if not specified
}

// Load bus service data from JSON
async function loadBusServiceData() {
    try {
        const response = await fetch('./json/bus-service-data.json');
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
    document.getElementById('breadcrumb-service').textContent = `Service ${service.n}`;

    // Update page title
    document.title = `Service ${service.n} | Buszy`;

    // Service header
    document.getElementById('service-number').textContent = service.n;
    document.getElementById('service-title').textContent = service.op ? `${service.op} ${service.n}` : `Service ${service.n}`;
    document.getElementById('service-type').textContent = service.t;

    // Quick info cards
    document.getElementById('operating-hours').textContent = service.h;
    document.getElementById('frequency').textContent = service.f + ' mins';
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
        const basePath = (window.PWAConfig ? window.PWAConfig.basePath : '/');
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
            window.location.href = `/buszy/art.html?BusStopCode=${stop[0]}`;
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
document.addEventListener('DOMContentLoaded', initializePage);

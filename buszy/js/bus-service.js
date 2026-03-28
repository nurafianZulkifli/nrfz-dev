/**
 * Bus Service Page
 * Loads and displays individual bus service information from JSON
 * Compact format: n=number, t=type, ts=terminal start, te=terminal end, h=hours, f=frequency, c=cost, r=remarks, st=stops, a=additional
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
function populateServiceData(serviceNumber, service) {
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
    document.getElementById('service-title').textContent = `Service ${service.n}`;
    document.getElementById('service-type').textContent = service.t;

    // Quick info cards
    document.getElementById('operating-hours').textContent = service.h;
    document.getElementById('frequency').textContent = service.f + ' mins';
    document.getElementById('fare').textContent = service.c;

    // Route terminals
    document.getElementById('terminal-start').textContent = service.ts;
    document.getElementById('terminal-end').textContent = service.te;

    // Bus stops
    populateBusStops(service.st);

    // Remarks section
    if (service.r) {
        document.getElementById('remarks-section').style.display = 'block';
        document.getElementById('remarks-content').innerHTML = `<p>${service.r}</p>`;
    }

    // Short Bus Service section
    if (service.sb && service.sb.length > 0) {
        document.getElementById('short-bus-section').style.display = 'block';
        populateShortBusService(service.sb);
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
        link.innerHTML = `<i class="fa-solid fa-arrow-right"></i> Service ${service}`;
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
        const service = data[serviceNumber];
        if (service) {
            populateServiceData(serviceNumber, service);
        } else {
            showErrorMessage(`Service ${serviceNumber} not found. Available services: ${Object.keys(data).join(', ')}`);
        }
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', initializePage);

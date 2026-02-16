// Bus First & Last Timings Page
document.addEventListener('DOMContentLoaded', async () => {
    let allBusStops = [];
    let filteredStops = [];
    let currentStopData = null;

    const busStopSearch = document.getElementById('busStopSearch');
    const busStopDropdown = document.getElementById('busStopDropdown');
    const contentSection = document.getElementById('contentSection');
    const servicesContainer = document.getElementById('servicesContainer');
    const clearSearch = document.getElementById('clearSearch');
    const resultsCount = document.getElementById('resultsCount');

    // Load bus stops from localStorage or fetch from API
    async function loadBusStops() {
        try {
            const cached = localStorage.getItem('allBusStops');
            if (cached) {
                allBusStops = JSON.parse(cached);
                console.log('Loaded bus stops from cache:', allBusStops.length);
            } else {
                // Fetch from API if not cached
                const response = await fetch('https://bat-lta-9eb7bbf231a2.herokuapp.com/bus-stops?$skip=0&$top=5000');
                const data = await response.json();
                allBusStops = data.value || [];
                console.log('Loaded bus stops from API:', allBusStops.length);
                localStorage.setItem('allBusStops', JSON.stringify(allBusStops));
            }

            populateDropdown(allBusStops);
        } catch (error) {
            console.error('Error loading bus stops:', error);
            busStopDropdown.innerHTML = '<option value="">Error loading bus stops</option>';
        }
    }

    // Populate dropdown with bus stops
    function populateDropdown(stops) {
        busStopDropdown.innerHTML = '<option value="">Select a bus stop...</option>';
        
        stops.forEach(stop => {
            const option = document.createElement('option');
            option.value = stop.BusStopCode;
            option.textContent = `${stop.BusStopCode} - ${stop.Description}`;
            busStopDropdown.appendChild(option);
        });
    }

    // Search functionality
    busStopSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query === '') {
            filteredStops = allBusStops;
            clearSearch.classList.remove('visible');
        } else {
            filteredStops = allBusStops.filter(stop =>
                stop.BusStopCode.toLowerCase().includes(query) ||
                stop.Description.toLowerCase().includes(query)
            );
            clearSearch.classList.add('visible');
        }

        // Update results count
        if (query !== '') {
            resultsCount.textContent = `${filteredStops.length} result${filteredStops.length !== 1 ? 's' : ''} found`;
        } else {
            resultsCount.textContent = '';
        }

        populateDropdown(filteredStops);
    });

    // Clear search
    clearSearch.addEventListener('click', () => {
        busStopSearch.value = '';
        busStopSearch.dispatchEvent(new Event('input'));
        busStopSearch.focus();
    });

    // Display bus stop data
    async function displayBusStop(busStopCode) {
        if (!busStopCode) {
            contentSection.classList.remove('active');
            return;
        }

        try {
            contentSection.classList.add('active');
            servicesContainer.classList.add('services-grid');
            servicesContainer.innerHTML = '<div class="loading" style="grid-column: 1/-1;"><div class="spinner"></div><p>Loading...</p></div>';

            // Fetch first/last bus data from the API
            // Use localhost:3000 for development, or relative path for production
            const hostname = window.location.hostname;
            const isLocalDev = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('127.');
            const apiBaseUrl = isLocalDev 
                ? 'http://localhost:3000' 
                : window.location.origin;
            const fetchUrl = `${apiBaseUrl}/first-last-bus?stop=${busStopCode}`;
            console.log('Fetching from:', fetchUrl);
            
            const response = await fetch(fetchUrl);
            
            if (!response.ok) {
                console.error('Response not OK:', response.status, response.statusText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('API Response:', data);

            if (data.error) {
                servicesContainer.innerHTML = `<div class="no-data" style="grid-column: 1/-1;">Unable to fetch bus timings for this stop: ${data.error}</div>`;
                return;
            }

            currentStopData = data;

            // Find the bus stop details for the title
            const stop = allBusStops.find(s => s.BusStopCode === busStopCode);
            const busStopTitle = document.getElementById('busStopTitle');
            // const busStopSubtitle = document.getElementById('busStopSubtitle');

            if (stop) {
                busStopTitle.textContent = `${busStopCode} - ${stop.Description}`;
            } else {
                busStopTitle.textContent = busStopCode;
            }
            // busStopSubtitle.textContent = `Last updated: ${new Date(data.scrapedAt).toLocaleDateString('en-SG')}`;

            // Display services
            servicesContainer.innerHTML = '';

            if (!data.busServices || data.busServices.length === 0) {
                servicesContainer.innerHTML = '<div class="no-data" style="grid-column: 1/-1;">No bus services found for this stop.</div>';
                return;
            }

            data.busServices.forEach((service, idx) => {
                const card = createServiceCard(service);
                servicesContainer.appendChild(card);
            });

        } catch (error) {
            console.error('Error fetching bus timings:', error);
            const errorMsg = error.message || 'Unknown error';
            servicesContainer.innerHTML = `<div class="no-data" style="grid-column: 1/-1;">Error loading bus timings: ${errorMsg}<br><small style="opacity: 0.7;">Check console for details.</small></div>`;
        }
    }

    // Helper function to capitalize each word
    function capitalizeWords(str) {
        return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    }

    // Create service card
    function createServiceCard(service) {
        const card = document.createElement('div');
        card.className = 'service-card';

        // Service number header
        const header = document.createElement('div');
        header.className = 'service-header';
        header.textContent = service.service || 'Unknown Service';
        card.appendChild(header);

        // Route name with "To" prefix
        const routeName = document.createElement('div');
        routeName.className = 'service-route';
        routeName.textContent = service.routeName ? `To ${capitalizeWords(service.routeName)}` : '';
        card.appendChild(routeName);

        // Timings
        const timings = service.timings || {};
        // console.log('Service timings:', timings);

        const dayTypes = [
            { key: 'Weekdays', label: 'Weekdays', data: timings.Weekdays },
            { key: 'Saturdays', label: 'Saturdays', data: timings.Saturdays },
            { key: 'Sundays & Public Holidays', label: 'Sun & Public Holidays', data: timings['Sundays & Public Holidays'] }
        ];

        dayTypes.forEach(day => {
            if (day.data && (day.data.firstBus || day.data.lastBus)) {
                const row = document.createElement('div');
                row.className = 'time-row';

                const dayLabel = document.createElement('div');
                dayLabel.className = 'day-label';
                dayLabel.textContent = day.label;

                const firstBusEl = document.createElement('div');
                firstBusEl.className = 'time-value first-bus';
                firstBusEl.textContent = day.data.firstBus || '--';

                const lastBusEl = document.createElement('div');
                lastBusEl.className = 'time-value last-bus';
                lastBusEl.textContent = day.data.lastBus || '--';

                row.appendChild(dayLabel);
                row.appendChild(firstBusEl);
                row.appendChild(lastBusEl);
                card.appendChild(row);
            }
        });

        return card;
    }

    // Dropdown change event
    busStopDropdown.addEventListener('change', (e) => {
        console.log('Bus stop selected:', e.target.value);
        displayBusStop(e.target.value);
    });

    // Initialize on page load
    console.log('Initializing First & Last Bus page...');
    loadBusStops();
});

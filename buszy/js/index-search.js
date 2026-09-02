(() => {
    const searchInput = document.getElementById('inline-search-input');
    const clearButton = document.getElementById('inline-search-clear');
    const filters = document.getElementById('inline-search-filters');
    const results = document.getElementById('inline-search-results');
    if (!searchInput || !results) return;

    let busStops = [];
    let services = [];
    let filter = 'all';
    let loaded = false;

    const escapeHtml = value => String(value || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/'/g, '&#039;');

    async function loadData() {
        if (loaded) return;
        results.innerHTML = '<p class="inline-search-status">Loading stops and services...</p>';
        try {
            const cached = JSON.parse(localStorage.getItem('allBusStops') || 'null');
            busStops = Array.isArray(cached) ? cached : (cached?.value || []);

            if (!busStops.length) {
                const stopsResponse = await fetch('https://bat-lta-9eb7bbf231a2.herokuapp.com/bus-stops?$skip=0');
                if (stopsResponse.ok) {
                    const stopsData = await stopsResponse.json();
                    busStops = stopsData.value || [];
                }
            }

            const servicesResponse = await fetch(new URL('./json/bus-service-data.json', window.location.href).href);
            if (servicesResponse.ok) services = await servicesResponse.json();
            loaded = true;
            results.innerHTML = '';
        } catch (error) {
            results.innerHTML = '<p class="inline-search-status">Search data is unavailable right now.</p>';
        }
    }

    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        clearButton.classList.toggle('show', Boolean(query));
        if (!query) {
            results.innerHTML = '';
            return;
        }
        if (!loaded) return;
        const matches = [];
        if (filter !== 'services') {
            busStops.filter(stop => `${stop.BusStopCode} ${stop.Description}`.toLowerCase().includes(query))
                .slice(0, 30).forEach(stop => matches.push({
                    type: 'stop', code: stop.BusStopCode, description: stop.Description, roadName: stop.RoadName
                }));
        }
        if (filter !== 'stops') {
            services.filter(service => Object.values(service).join(' ').toLowerCase().includes(query))
                .slice(0, 30).forEach(service => matches.push({
                    type: 'service', code: service.n, description: `${service.ts || 'N/A'} -> ${service.te || 'N/A'}`
                }));
        }
        results.innerHTML = matches.length ? matches.map(renderResult).join('') : '<p class="inline-search-status">No results found.</p>';
        results.querySelectorAll('[data-result-type]').forEach(result => {
            result.addEventListener('click', () => {
                const path = result.dataset.resultType === 'service'
                    ? `bus-service.html?service=${encodeURIComponent(result.dataset.resultCode)}`
                    : `art.html?BusStopCode=${encodeURIComponent(result.dataset.resultCode)}`;
                window.location.href = path;
            });
        });
    }

    function renderResult(result) {
        const description = result.type === 'stop'
            ? `${escapeHtml(result.description)}${result.roadName ? ` | ${escapeHtml(result.roadName)}` : ''}`
            : escapeHtml(result.description);
        return `<div class="bus-stop inline-search-result" data-result-type="${result.type}" data-result-code="${escapeHtml(result.code)}">
            <div class="bus-stop-main-row">
                <div class="bus-stop-info">
                    <div class="bus-stop-code-row">
                        <div class="bus-stop-code">
                            <img src="./assets/bus-icon.png" alt="Bus Icon">
                            <span class="bus-stop-code-text">${escapeHtml(result.code)}</span>
                        </div>
                    </div>
                    <div class="bus-stop-details">
                        <span class="bus-stop-description">${description}</span>
                    </div>
                </div>
            </div>
        </div>`;
    }

    searchInput.addEventListener('focus', loadData);
    searchInput.addEventListener('input', performSearch);
    searchInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') performSearch();
    });
    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        performSearch();
        searchInput.focus();
    });
    filters?.querySelectorAll('[data-filter]').forEach(button => {
        button.addEventListener('click', () => {
            filters.querySelector('.active')?.classList.remove('active');
            button.classList.add('active');
            filter = button.dataset.filter;
            performSearch();
        });
    });
})();

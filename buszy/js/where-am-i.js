const WHERE_AM_I_API = 'https://bat-lta-9eb7bbf231a2.herokuapp.com';
const ARRIVAL_REFRESH_MS = 30000;
const ARRIVAL_DISTANCE_METRES = 60;

let currentPosition = null;
let nearbyStops = [];
let selectedService = null;
let watchId = null;
let lastFetchPosition = null;
let lastArrivalFetch = 0;

const elements = {
    status: document.getElementById('location-status'), coordinates: document.getElementById('coordinates'),
    accuracy: document.getElementById('location-accuracy'), locate: document.getElementById('locate-button'),
    picker: document.getElementById('service-picker'), clear: document.getElementById('clear-service'),
    trackingCopy: document.getElementById('tracking-copy'), stops: document.getElementById('stops-list'), count: document.getElementById('stops-count')
};

function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

function distanceMetres(first, second) {
    const radians = value => value * Math.PI / 180;
    const earthRadius = 6371000;
    const deltaLatitude = radians(second.latitude - first.latitude);
    const deltaLongitude = radians(second.longitude - first.longitude);
    const a = Math.sin(deltaLatitude / 2) ** 2 + Math.cos(radians(first.latitude)) * Math.cos(radians(second.latitude)) * Math.sin(deltaLongitude / 2) ** 2;
    return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(distance) { return distance < 1000 ? `${Math.round(distance)} m` : `${(distance / 1000).toFixed(1)} km`; }

function updatePosition(position) {
    currentPosition = { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy };
    elements.coordinates.textContent = `${currentPosition.latitude.toFixed(5)}, ${currentPosition.longitude.toFixed(5)}`;
    elements.accuracy.textContent = currentPosition.accuracy ? `within ${Math.round(currentPosition.accuracy)} m` : '';
    elements.status.textContent = 'Location updating as you move.';
    const moved = !lastFetchPosition || distanceMetres(lastFetchPosition, currentPosition) > 25;
    if (moved || Date.now() - lastArrivalFetch > ARRIVAL_REFRESH_MS) loadNearbyStops();
    else render();
}

async function loadNearbyStops() {
    if (!currentPosition) return;
    elements.locate.disabled = true;
    try {
        const url = new URL(`${WHERE_AM_I_API}/nearby-bus-stops`);
        url.searchParams.set('latitude', currentPosition.latitude);
        url.searchParams.set('longitude', currentPosition.longitude);
        url.searchParams.set('radius', '1');
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const stops = await response.json();
        nearbyStops = await Promise.all(stops.map(async stop => ({ ...stop, services: await loadArrivals(stop.BusStopCode) })));
        if (nearbyStops[0]) {
            elements.coordinates.textContent = `Near ${nearbyStops[0].Description} · ${currentPosition.latitude.toFixed(5)}, ${currentPosition.longitude.toFixed(5)}`;
        }
        lastFetchPosition = { ...currentPosition };
        lastArrivalFetch = Date.now();
        render();
    } catch (error) {
        console.error('[where-am-i] Nearby stop lookup failed:', error);
        elements.status.textContent = 'Unable to load nearby stops. Check your connection and try again.';
        if (!nearbyStops.length) elements.stops.innerHTML = '<p class="empty-state">Nearby bus stops could not be loaded.</p>';
    } finally { elements.locate.disabled = false; }
}

async function loadArrivals(busStopCode) {
    try {
        const url = new URL(`${WHERE_AM_I_API}/bus-arrivals`);
        url.searchParams.set('BusStopCode', busStopCode);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return (data.Services || []).map(service => service.ServiceNo).filter(Boolean);
    } catch (error) { return []; }
}

function selectService(service) { selectedService = service; render(); }

function render() {
    const services = [...new Set(nearbyStops.flatMap(stop => stop.services))].sort((first, second) => first.localeCompare(second, undefined, { numeric: true }));
    elements.picker.innerHTML = services.length ? services.map(service => `<button class="service-chip${service === selectedService ? ' selected' : ''}" type="button" data-service="${escapeHtml(service)}">${escapeHtml(service)}</button>`).join('') : '<span class="tracking-copy">Arrival services will appear here shortly.</span>';
    elements.clear.hidden = !selectedService;

    let candidateStops = selectedService ? nearbyStops.filter(stop => stop.services.includes(selectedService)) : nearbyStops;
    candidateStops = candidateStops.map(stop => ({ ...stop, liveDistance: currentPosition ? distanceMetres(currentPosition, { latitude: stop.Latitude, longitude: stop.Longitude }) : stop.distance * 1000 })).sort((first, second) => first.liveDistance - second.liveDistance);
    const targetCode = candidateStops[0]?.BusStopCode;
    const hasArrived = candidateStops[0]?.liveDistance <= ARRIVAL_DISTANCE_METRES;
    elements.trackingCopy.textContent = selectedService ? (targetCode ? (hasArrived ? `You have arrived at the nearest stop served by ${selectedService}.` : `Following ${selectedService}. The nearest matching stop is highlighted below.`) : `No nearby stop is currently serving ${selectedService}.`) : 'Tap a nearby service to follow its next nearby stop.';
    elements.count.textContent = nearbyStops.length ? `${nearbyStops.length} stops` : '';

    elements.stops.innerHTML = nearbyStops.length ? candidateStops.map(stop => {
        const isTarget = stop.BusStopCode === targetCode;
        const state = isTarget ? (hasArrived ? 'arrived' : 'nearest') : '';
        const stateText = isTarget ? (hasArrived ? 'Arriving here' : selectedService ? `Next nearby stop for ${selectedService}` : 'Nearest bus stop') : '';
        const stopServices = stop.services.length ? stop.services.map(service => `<button class="stop-service${service === selectedService ? ' selected' : ''}" type="button" data-service="${escapeHtml(service)}">${escapeHtml(service)}</button>`).join('') : '<span class="stop-road">No live services found</span>';
        return `<article class="stop-card ${state}" data-stop-code="${escapeHtml(stop.BusStopCode)}"><div class="stop-topline"><div><h3 class="stop-name">${escapeHtml(stop.Description)}</h3><p class="stop-road">${escapeHtml(stop.RoadName)} · ${escapeHtml(stop.BusStopCode)}</p></div><span class="stop-distance">${formatDistance(stop.liveDistance)}</span></div>${stateText ? `<span class="stop-state">${stateText}</span>` : ''}<div class="stop-services">${stopServices}</div></article>`;
    }).join('') : '<p class="empty-state">No bus stops found within 1 km.</p>';
}

function startLocationTracking() {
    if (!navigator.geolocation) { elements.status.textContent = 'This browser does not support location services.'; return; }
    elements.status.textContent = 'Requesting your location...';
    navigator.geolocation.getCurrentPosition(updatePosition, handleLocationError, { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 });
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    watchId = navigator.geolocation.watchPosition(updatePosition, handleLocationError, { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 });
}

function handleLocationError(error) { elements.status.textContent = error.code === 1 ? 'Location permission is needed to track nearby stops.' : 'Your location is unavailable right now. Try again shortly.'; }

elements.locate.addEventListener('click', startLocationTracking);
elements.clear.addEventListener('click', () => selectService(null));
document.addEventListener('click', event => { const button = event.target.closest('[data-service]'); if (button) selectService(button.dataset.service); });
startLocationTracking();
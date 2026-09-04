const WHERE_AM_I_API = 'https://bat-lta-9eb7bbf231a2.herokuapp.com';
const ARRIVAL_REFRESH_MS = 30000;
const ARRIVAL_DISTANCE_METRES = 60;

let currentPosition = null;
let nearbyStops = [];
let selectedService = null;
let watchId = null;
let lastFetchPosition = null;
let lastArrivalFetch = 0;
let nextStops = null;
let localServiceDataPromise = null;
let routeRequestId = 0;
let routeCurrentStop = null;
let activeRouteStops = [];
let activeRouteIndex = -1;
let selectedNearbyStopCode = null;
let liveMap = null;
let livePositionMarker = null;
let liveAccuracyCircle = null;
let currentStopMarker = null;
let mapFollowsLocation = true;

const elements = {
    status: document.getElementById('location-status'), coordinates: document.getElementById('coordinates'),
    accuracy: document.getElementById('location-accuracy'), locate: document.getElementById('locate-button'),
    picker: document.getElementById('service-picker'), clear: document.getElementById('clear-service'),
    currentStop: document.getElementById('current-stop-control'), trackingCopy: document.getElementById('tracking-copy'),
    nextStops: document.getElementById('next-stops')
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

function initializeLiveMap() {
    const mapContainer = document.getElementById('live-map');
    if (!mapContainer || !window.L) return;

    liveMap = L.map(mapContainer, { zoomControl: true }).setView([1.3521, 103.8198], 12);
    L.tileLayer('https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png', {
        detectRetina: true,
        maxZoom: 19,
        minZoom: 11,
        attribution: '&copy; <a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a>'
    }).addTo(liveMap);
    liveMap.on('dragstart', () => { mapFollowsLocation = false; });
}

function updateLiveMapPosition() {
    if (!liveMap || !currentPosition) return;
    const latLng = [currentPosition.latitude, currentPosition.longitude];
    if (!livePositionMarker) {
        livePositionMarker = L.circleMarker(latLng, { radius: 9, color: '#fff', weight: 3, fillColor: '#e3244f', fillOpacity: 1 }).addTo(liveMap).bindPopup('Your live location');
    } else livePositionMarker.setLatLng(latLng);

    if (!liveAccuracyCircle) {
        liveAccuracyCircle = L.circle(latLng, { radius: currentPosition.accuracy || 0, color: '#1f84a2', weight: 1, fillColor: '#1f84a2', fillOpacity: .12 }).addTo(liveMap);
    } else {
        liveAccuracyCircle.setLatLng(latLng);
        liveAccuracyCircle.setRadius(currentPosition.accuracy || 0);
    }
}

function updateLiveMapStop() {
    const currentStop = getCurrentNearbyStop();
    if (!liveMap || !currentStop) return;
    const latitude = Number(currentStop.Latitude);
    const longitude = Number(currentStop.Longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

    const latLng = [latitude, longitude];
    if (!currentStopMarker) {
        currentStopMarker = L.circleMarker(latLng, { radius: 10, color: '#fff', weight: 3, fillColor: '#1f84a2', fillOpacity: 1 }).addTo(liveMap);
    } else currentStopMarker.setLatLng(latLng);
    currentStopMarker.bindPopup(`<strong>Current Bus Stop: ${escapeHtml(currentStop.BusStopCode)}</strong><br>${escapeHtml(currentStop.Description)}`);
    if (mapFollowsLocation) liveMap.setView(latLng, 17, { animate: true });
}

function updatePosition(position) {
    currentPosition = { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy };
    elements.coordinates.textContent = `${currentPosition.latitude.toFixed(5)}, ${currentPosition.longitude.toFixed(5)}`;
    elements.accuracy.textContent = currentPosition.accuracy ? `within ${Math.round(currentPosition.accuracy)} m` : '';
    elements.status.textContent = 'Location updating as you move.';
    updateLiveMapPosition();
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
        if (selectedService) loadNextStops(selectedService);
        render();
        updateLiveMapStop();
    } catch (error) {
        console.error('[where-am-i] Nearby stop lookup failed:', error);
        elements.status.textContent = 'Unable to load nearby stops. Check your connection and try again.';
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

function getCurrentStopForService(service) {
    const selectedStop = nearbyStops.find(stop => String(stop.BusStopCode) === selectedNearbyStopCode && stop.services.includes(service));
    if (selectedStop) return selectedStop;
    return nearbyStops.filter(stop => stop.services.includes(service)).map(stop => ({
        ...stop,
        liveDistance: currentPosition ? distanceMetres(currentPosition, { latitude: stop.Latitude, longitude: stop.Longitude }) : stop.distance * 1000
    })).sort((first, second) => first.liveDistance - second.liveDistance)[0] || null;
}

function getCurrentNearbyStop() {
    const selectedStop = nearbyStops.find(stop => String(stop.BusStopCode) === selectedNearbyStopCode);
    if (selectedStop) return selectedStop;
    return nearbyStops.map(stop => ({
        ...stop,
        liveDistance: currentPosition ? distanceMetres(currentPosition, { latitude: stop.Latitude, longitude: stop.Longitude }) : stop.distance * 1000
    })).sort((first, second) => first.liveDistance - second.liveDistance)[0] || null;
}

function parseRouteStops(serviceData) {
    let stops = serviceData.Stops;
    if (typeof stops === 'string') {
        try { stops = JSON.parse(stops); } catch (error) { return []; }
    }
    return Array.isArray(stops) ? stops.map(stop => String(typeof stop === 'string' ? stop : stop.BusStopCode)).filter(Boolean) : [];
}

async function getLocalServiceData() {
    if (!localServiceDataPromise) {
        localServiceDataPromise = fetch('json/bus-service-data.json').then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        });
    }
    return localServiceDataPromise;
}

async function getRouteStopsForCurrentStop(service, currentStopCode) {
    try {
        const response = await fetch(`${WHERE_AM_I_API}/bus-services?ServiceNo=${encodeURIComponent(service)}`);
        if (response.ok) {
            const services = (await response.json()).value || [];
            const matchingRoute = services.map(parseRouteStops).find(route => route.includes(currentStopCode));
            if (matchingRoute) return matchingRoute;
        }
    } catch (error) {
        console.warn('[where-am-i] Service route lookup failed:', error);
    }

    const services = await getLocalServiceData();
    const serviceData = services.find(item => String(item.n) === String(service));
    if (!serviceData?.direction_routes) return [];
    return Object.values(serviceData.direction_routes).map(route => route.st || []).find(route => route.map(String).includes(currentStopCode)) || [];
}

async function getStopDetails(stopCode) {
    try {
        const response = await fetch(`${WHERE_AM_I_API}/bus-stop-det?BusStopCode=${encodeURIComponent(stopCode)}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const stop = await response.json();
        return { code: stopCode, name: stop.Description || stopCode, road: stop.RoadName || '' };
    } catch (error) {
        return { code: stopCode, name: stopCode, road: '' };
    }
}

async function loadNextStops(service, currentStop = getCurrentStopForService(service)) {
    const requestId = ++routeRequestId;
    if (!currentStop) { activeRouteStops = []; activeRouteIndex = -1; nextStops = []; render(); return; }

    routeCurrentStop = { code: String(currentStop.BusStopCode || currentStop.code), name: currentStop.Description || currentStop.name || currentStop.BusStopCode || currentStop.code };
    nextStops = null;
    render();
    try {
        const routeStops = await getRouteStopsForCurrentStop(service, routeCurrentStop.code);
        const currentIndex = routeStops.map(String).indexOf(routeCurrentStop.code);
        const followingCodes = currentIndex === -1 ? [] : routeStops.slice(currentIndex + 1, currentIndex + 5);
        const stops = await Promise.all(followingCodes.map(getStopDetails));
        if (requestId === routeRequestId && service === selectedService) {
            activeRouteStops = routeStops;
            activeRouteIndex = currentIndex;
            nextStops = stops;
            render();
        }
    } catch (error) {
        console.error('[where-am-i] Next stop lookup failed:', error);
        if (requestId === routeRequestId && service === selectedService) { nextStops = []; render(); }
    }
}

function selectService(service) {
    selectedService = service;
    nextStops = null;
    routeCurrentStop = null;
    activeRouteStops = [];
    activeRouteIndex = -1;
    routeRequestId++;
    render();
    if (service) loadNextStops(service);
}

function selectCurrentStop(stopCode) {
    selectedNearbyStopCode = String(stopCode);
    selectedService = null;
    nextStops = null;
    routeCurrentStop = null;
    activeRouteStops = [];
    activeRouteIndex = -1;
    routeRequestId++;
    render();
    updateLiveMapStop();
}

async function stepRoute(step) {
    const nextIndex = activeRouteIndex + step;
    if (!selectedService || nextIndex < 0 || nextIndex >= activeRouteStops.length) return;
    const stopCode = activeRouteStops[nextIndex];
    const stop = await getStopDetails(stopCode);
    if (selectedService && activeRouteStops[nextIndex] === stopCode) loadNextStops(selectedService, stop);
}

function render() {
    const currentNearbyStop = getCurrentNearbyStop();
    const services = (currentNearbyStop?.services || []).sort((first, second) => first.localeCompare(second, undefined, { numeric: true }));
    elements.currentStop.innerHTML = currentNearbyStop ? `<label class="current-stop-label" for="current-stop-picker">Your Current Bus Stop</label><select id="current-stop-picker" class="current-stop-picker" aria-label="Your current bus stop">${nearbyStops.map(stop => `<option value="${escapeHtml(stop.BusStopCode)}"${String(stop.BusStopCode) === String(currentNearbyStop.BusStopCode) ? ' selected' : ''}>${escapeHtml(stop.Description)}</option>`).join('')}</select>` : '<p class="next-stops-loading">Finding your current bus stop...</p>';
    elements.picker.innerHTML = services.length ? services.map(service => `<button class="service-chip${service === selectedService ? ' selected' : ''}" type="button" data-service="${escapeHtml(service)}">${escapeHtml(service)}</button>`).join('') : '<span class="tracking-copy">Arrival services will appear here shortly.</span>';
    elements.clear.hidden = !selectedService;

    let candidateStops = selectedService ? nearbyStops.filter(stop => stop.services.includes(selectedService)) : nearbyStops;
    candidateStops = candidateStops.map(stop => ({ ...stop, liveDistance: currentPosition ? distanceMetres(currentPosition, { latitude: stop.Latitude, longitude: stop.Longitude }) : stop.distance * 1000 })).sort((first, second) => first.liveDistance - second.liveDistance);
    const targetCode = candidateStops[0]?.BusStopCode;
    const hasArrived = candidateStops[0]?.liveDistance <= ARRIVAL_DISTANCE_METRES;
    elements.trackingCopy.textContent = selectedService ? (targetCode ? (hasArrived ? `You have arrived at the nearest stop served by ${selectedService}.` : `Following ${selectedService}. Select a different nearby stop if needed.`) : `No nearby stop is currently serving ${selectedService}.`) : 'Tap a nearby service to follow its next nearby stop.';
    const hasPreviousStop = activeRouteIndex > 0;
    const hasFollowingStop = activeRouteIndex >= 0 && activeRouteIndex < activeRouteStops.length - 1;
    elements.nextStops.innerHTML = !selectedService ? '' : nextStops === null ? '<p class="next-stops-loading"><i class="fa-regular fa-spinner fa-spin"></i> Loading route...</p>' : nextStops.length ? `<div class="next-stops-header"><p class="next-stops-title">Current Stop: <strong>${escapeHtml(routeCurrentStop?.name || 'Unknown stop')}</strong></p><div class="route-step-controls"><button type="button" class="route-step-button" data-route-step="-1" title="Previous stop" aria-label="Previous stop"${hasPreviousStop ? '' : ' disabled'}><i class="fa-solid fa-chevron-up"></i></button><button type="button" class="route-step-button" data-route-step="1" title="Next stop" aria-label="Next stop"${hasFollowingStop ? '' : ' disabled'}><i class="fa-solid fa-chevron-down"></i></button></div></div><ul class="onboard-stops-list">${nextStops.map(stop => `<li>${escapeHtml(stop.name)}</li>`).join('')}</ul><a class="full-route-link" href="bus-service.html?service=${encodeURIComponent(selectedService)}&highlightStop=${encodeURIComponent(routeCurrentStop?.code || '')}">View full route <i class="fa-regular fa-arrow-right" aria-hidden="true"></i></a>` : '<p class="next-stops-loading">No following stops found for this route.</p>';
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
document.getElementById('current-location-btn').addEventListener('click', () => {
    mapFollowsLocation = true;
    startLocationTracking();
    updateLiveMapStop();
});
document.getElementById('recenter-map-btn').addEventListener('click', () => {
    if (!liveMap) return;
    mapFollowsLocation = true;
    updateLiveMapStop();
});
document.getElementById('collapse-map-btn').addEventListener('click', event => {
    const section = document.getElementById('live-map-section');
    const isCollapsed = section.classList.toggle('collapsed');
    event.currentTarget.title = isCollapsed ? 'Expand map' : 'Collapse map';
    event.currentTarget.setAttribute('aria-label', event.currentTarget.title);
    event.currentTarget.querySelector('i').className = isCollapsed ? 'fa-regular fa-expand' : 'fa-regular fa-close';
    if (!isCollapsed) setTimeout(() => liveMap?.invalidateSize(), 0);
});
document.addEventListener('click', event => { const button = event.target.closest('[data-service]'); if (button) selectService(button.dataset.service); });
document.addEventListener('click', event => {
    const button = event.target.closest('[data-route-step]');
    if (button) stepRoute(Number(button.dataset.routeStep));
});
document.addEventListener('change', event => {
    if (event.target.matches('#current-stop-picker')) selectCurrentStop(event.target.value);
});
initializeLiveMap();
startLocationTracking();
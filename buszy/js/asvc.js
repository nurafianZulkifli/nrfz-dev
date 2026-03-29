
// *****************************
// :: Bus Services Listing
// *****************************
let allServices = [];

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

document.addEventListener('DOMContentLoaded', function() {
    loadBusServices();
    setupSearchFilter();
});

function loadBusServices() {
    const API_BASE = 'https://bat-lta-9eb7bbf231a2.herokuapp.com';
    const basePath = getBasePath();
    const jsonPath = basePath + 'buszy/json/bus-service-data.json';
    
    console.log('Loading services from local JSON:', jsonPath);
    
    // First load local JSON
    fetch(jsonPath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load JSON: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            allServices = data;
            console.log('Loaded', allServices.length, 'services from local JSON');
            
            // Now try to fetch operator data from API
            console.log('Attempting to fetch operator data from API:', `${API_BASE}/bus-services`);
            return fetch(`${API_BASE}/bus-services`)
                .then(apiResponse => {
                    if (!apiResponse.ok) {
                        console.warn('API response not OK:', apiResponse.status);
                        return null;
                    }
                    return apiResponse.json();
                })
                .then(apiData => {
                    if (apiData) {
                        console.log('API data received:', apiData);
                        
                        // API response is expected to be an array
                        const apiArray = Array.isArray(apiData) ? apiData : (apiData.bus_services || apiData.services || apiData.data || []);
                        
                        if (Array.isArray(apiArray) && apiArray.length > 0) {
                            // Build operator map from API
                            const operatorMap = {};
                            apiArray.forEach(service => {
                                const serviceNo = service.ServiceNo || service.n;
                                operatorMap[serviceNo] = service.Operator || service.op;
                            });
                            
                            // Update local data with API operators
                            allServices.forEach(service => {
                                if (operatorMap[service.n]) {
                                    service.op = operatorMap[service.n];
                                }
                            });
                            
                            console.log('Updated operators from API:', operatorMap);
                        }
                    }
                })
                .catch(apiError => {
                    console.warn('API fetch failed - using local data only:', apiError);
                });
        })
        .then(() => {
            displayServices(allServices);
            const loadingMessage = document.getElementById('loading-message');
            if (loadingMessage) {
                loadingMessage.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error loading bus services:', error);
            const loadingMessage = document.getElementById('loading-message');
            if (loadingMessage) {
                loadingMessage.innerHTML = '<p style="color: red;"><i class="fa-regular fa-circle-exclamation"></i> Error loading bus services. Please try again later.</p>';
            }
        });
}

function displayServices(services) {
    const container = document.getElementById('services-container');
    
    if (services.length === 0) {
        container.innerHTML = '<div class="no-services"><p><i class="fa-regular fa-circle-info"></i> No bus services found.</p></div>';
        return;
    }
    
    container.innerHTML = services.map(service => createServiceCard(service)).join('');
}

function createServiceCard(service) {
    const operator = service.op || 'Transit';
    const type = service.t || 'Regular';
    const startTerminal = service.ts || 'N/A';
    const endTerminal = service.te || 'N/A';
    const loopPoint = service.lp ? ` / Loop: ${service.lp}` : '';
    const hours = service.h || 'N/A';
    const frequency = service.f || 'N/A';
    const fare = service.c || 'N/A';
    const remarks = service.r || '';
    
    // Build frequency display
    let frequencyDisplay = `${frequency} mins`;
    if (service.freq_detail) {
        frequencyDisplay = '<i class="fa-regular fa-circle-info" style="margin-right: 0.5rem;"></i>Different frequencies by time';
    }
    
    return `
        <a href="bus-service.html?service=${encodeURIComponent(service.n)}" style="text-decoration: none; color: inherit;">
            <div class="bus-service-card">
                <div class="service-header">
                    <div class="service-number">${service.n}</div>
                    <div class="service-type">${type}</div>
                    ${operator !== 'Transit' ? `<div class="service-type" style="background-color: #e0e0e0; color: #333;">${operator}</div>` : ''}
                </div>
                
                <div class="service-routes">
                    ${startTerminal} → ${endTerminal}${loopPoint}
                </div>
            </div>
        </a>
    `;
}

function setupSearchFilter() {
    const searchInput = document.getElementById('service-search');
    
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            
            const filtered = allServices.filter(service => {
                const serviceNum = (service.n || '').toLowerCase();
                const type = (service.t || '').toLowerCase();
                const start = (service.ts || '').toLowerCase();
                const end = (service.te || '').toLowerCase();
                const remarks = (service.r || '').toLowerCase();
                
                return serviceNum.includes(searchTerm) ||
                       type.includes(searchTerm) ||
                       start.includes(searchTerm) ||
                       end.includes(searchTerm) ||
                       remarks.includes(searchTerm);
            });
            
            displayServices(filtered);
        });
    }
}


// *******************************
// :: Hide Keyboard on Outside Tap
// *******************************
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('touchstart', (event) => {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.tagName === 'INPUT' && !activeElement.contains(event.target)) {
            activeElement.blur();
        }
    });
});


// ****************************
// :: Loading Messages Rotation
// ****************************
document.addEventListener('DOMContentLoaded', () => {
    const loadingMessages = [
        "Loading Bus Services...",
        "Fetching service data...",
        "Preparing routes...",
        "Almost done..."
    ];

    const loadingMessageElement = document.getElementById('loading-message');
    if (!loadingMessageElement) return;
    let messageIndex = 0;

    // Function to update the loading message
    const updateLoadingMessage = () => {
        loadingMessageElement.innerHTML = `
                <span class="spinner" role="status" style="margin-right: 0.5em;"></span>${loadingMessages[messageIndex]}
            `;
        messageIndex = (messageIndex + 1) % loadingMessages.length; // Cycle through messages
    };

    // Show the first message immediately
    updateLoadingMessage();

    // Change the message every 4 seconds
    setInterval(updateLoadingMessage, 4000);
});

// ****************************
// :: Mobile Swipe Navigation for Tabs
// ****************************

// Only enable swipe navigation for touches below the tabs and not when keyboard is shown
(function () {
    let touchStartX = 0;
    let touchEndX = 0;
    let isSwiping = false;
    const minSwipeDistance = 50; // Minimum px for swipe
    const tabLinks = Array.from(document.querySelectorAll('#scrollable-tabs a'));
    const tabsElem = document.getElementById('scrollable-tabs');
    const tabsContainer = tabsElem ? tabsElem.parentElement : null;
    if (!tabLinks.length || !tabsElem || !tabsContainer) return;

    // Add transition style to the container
    tabsContainer.style.transition = 'transform 0.25s cubic-bezier(0.4,0,0.2,1)';

    // Helper: check if an input or textarea is focused (keyboard likely open)
    function isKeyboardShown() {
        const active = document.activeElement;
        return active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
    }

    // Only respond to swipes below the tabs
    function isBelowTabs(y) {
        const rect = tabsElem.getBoundingClientRect();
        return y > rect.bottom;
    }

    function handleGesture() {
        if (touchEndX < touchStartX - minSwipeDistance) {
            // Swipe left: go to next tab
            const current = tabLinks.findIndex(link => link.classList.contains('active'));
            if (current !== -1 && current < tabLinks.length - 1) {
                animateSwipe(-1, () => {
                    window.location.href = tabLinks[current + 1].href;
                });
            }
        }
        if (touchEndX > touchStartX + minSwipeDistance) {
            // Swipe right: go to previous tab
            const current = tabLinks.findIndex(link => link.classList.contains('active'));
            if (current > 0) {
                animateSwipe(1, () => {
                    window.location.href = tabLinks[current - 1].href;
                });
            }
        }
    }

    function animateSwipe(direction, callback) {
        if (!tabsContainer) return callback();
        isSwiping = true;
        tabsContainer.style.transform = `translateX(${direction * 60}px)`;
        setTimeout(() => {
            tabsContainer.style.transform = '';
            isSwiping = false;
            callback();
        }, 250);
    }

    let swipeStartY = 0;

    document.addEventListener('touchstart', function (e) {
        if (e.touches.length === 1) {
            // Only start swipe if below tabs and keyboard is not shown
            swipeStartY = e.touches[0].clientY;
            if (isBelowTabs(swipeStartY) && !isKeyboardShown() && !isSwiping) {
                touchStartX = e.touches[0].clientX;
            } else {
                touchStartX = null;
            }
        }
    });
    document.addEventListener('touchend', function (e) {
        if (e.changedTouches.length === 1 && touchStartX !== null) {
            touchEndX = e.changedTouches[0].clientX;
            handleGesture();
        }
        touchStartX = null;
    });
})();
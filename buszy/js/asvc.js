
// *****************************
// :: Bus Services Listing
// *****************************
let allServices = [];

document.addEventListener('DOMContentLoaded', function() {
    loadBusServices();
    setupSearchFilter();
});

function loadBusServices() {
    fetch('json/bus-service-data.json')
        .then(response => response.json())
        .then(data => {
            allServices = data;
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
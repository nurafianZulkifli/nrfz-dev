// ****************************
// :: Bookmark (Pin) Management for Bus Stops
// ****************************
document.addEventListener('DOMContentLoaded', async () => {
    const bookmarksContainer = document.getElementById('bookmarks-container');

    // ── Drag state ───────────────────────────────────────────────
    let dragSrc     = null;
    let dragStartX  = 0, dragStartY = 0;
    let dragStartXForReorder = 0, dragStartYForReorder = 0;
    let longPressTimer = null;
    let dragging    = false;
    let dropTarget  = null;

    function clearDropHighlight() {
        if (dropTarget) {
            dropTarget.style.outline = '';
            dropTarget = null;
        }
    }

    function hideAllGrips() {
        document.querySelectorAll('span[title="Hold to reorder"]').forEach(grip => {
            grip.style.display = 'none';
        });
    }

    function hideGrip(item) {
        const gripEl = item.querySelector('span[title="Hold to reorder"]');
        if (gripEl) gripEl.style.display = 'none';
        item.style.transform = '';
    }

    // Hide grips when clicking/tapping anywhere
    document.addEventListener('click', (e) => {
        const listItem = e.target.closest('[data-bm-index]');
        
        // If clicking outside list items or on buttons, hide all grips
        if (!listItem || e.target.closest('button')) {
            hideAllGrips();
            document.querySelectorAll('a.bus-stop-info, .bus-stop-info a').forEach(link => {
                link.style.pointerEvents = '';
            });
        }
        // Also hide grips if clicking on the bus stop info link
        else if (e.target.closest('a')) {
            hideAllGrips();
            document.querySelectorAll('a.bus-stop-info, .bus-stop-info a').forEach(link => {
                link.style.pointerEvents = '';
            });
        }
    }, { capture: true });

    function endDrag(doSwap) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        if (dragSrc) {
            dragSrc.style.opacity = '';
            dragSrc.style.transform = '';
            const gripEl = dragSrc.querySelector('span[title="Hold to reorder"]');
            if (gripEl) gripEl.style.display = 'none';
            const linkEl = dragSrc.querySelector('a');
            if (linkEl) linkEl.style.pointerEvents = '';
        }
        if (doSwap && dragging && dropTarget && dropTarget !== dragSrc) {
            swapBookmarks(dragSrc, dropTarget);
        }
        clearDropHighlight();
        dragging = false;
        dragSrc  = null;
    }

    function onPointerMove(e) {
        if (!dragging) return;
        
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const target = el && el.closest('[data-bm-index]');
        if (target && target !== dragSrc) {
            if (target !== dropTarget) {
                clearDropHighlight();
                dropTarget = target;
                target.style.outline = '2px solid #007bff';
            }
        } else {
            clearDropHighlight();
        }
        
        // Auto-scroll while dragging if near edges (scroll window on desktop)
        const scrollThreshold = 100;
        const scrollSpeed = 10;
        const viewportHeight = window.innerHeight;
        
        if (e.clientY < scrollThreshold) {
            window.scrollBy(0, -scrollSpeed);
        } else if (e.clientY > viewportHeight - scrollThreshold) {
            window.scrollBy(0, scrollSpeed);
        }
    }

    function onPointerUp() { endDrag(true); }

    function swapBookmarks(srcEl, tgtEl) {
        const srcIdx = parseInt(srcEl.dataset.bmIndex);
        const tgtIdx = parseInt(tgtEl.dataset.bmIndex);
        if (isNaN(srcIdx) || isNaN(tgtIdx) || srcIdx === tgtIdx) return;
        const bookmarks = JSON.parse(localStorage.getItem('bookmarkedBusStops')) || [];
        [bookmarks[srcIdx], bookmarks[tgtIdx]] = [bookmarks[tgtIdx], bookmarks[srcIdx]];
        localStorage.setItem('bookmarkedBusStops', JSON.stringify(bookmarks));
        loadBookmarks();
    }

    // Function to switch to the "All" tab
    function switchToAllTab() {
        const allTabButton = document.querySelector('.category-tab[data-category="all"]');
        if (allTabButton) {
            allTabButton.click();
        }
    }

    // Function to navigate to settings
    function goToSettings() {
        window.location.href = './settings.html';
    }

    // Function to create the empty state message with Add and Import links
    function createEmptyMessage() {
        const messageContainer = document.createElement('p');
        messageContainer.className = 'pin-msg';
        
        const icon = document.createElement('i');
        icon.className = 'fa-kit fa-lta-bus-stop';
        messageContainer.appendChild(icon);
        
        const textNode = document.createTextNode(' No Pinned Bus Stop. ');
        messageContainer.appendChild(textNode);
        
        const linksWrapper = document.createElement('span');
        linksWrapper.className = 'action-links-wrapper';
        
        const addLink = document.createElement('a');
        addLink.href = '#';
        addLink.className = 'action-link add-link';
        addLink.textContent = 'Add';
        addLink.addEventListener('click', (e) => {
            e.preventDefault();
            switchToAllTab();
        });
        
        const separator = document.createTextNode(' or ');
        
        const importLink = document.createElement('a');
        importLink.href = '#';
        importLink.className = 'action-link import-link';
        importLink.textContent = 'Import';
        importLink.addEventListener('click', (e) => {
            e.preventDefault();
            goToSettings();
        });
        
        linksWrapper.appendChild(addLink);
        linksWrapper.appendChild(separator);
        linksWrapper.appendChild(importLink);
        
        messageContainer.appendChild(linksWrapper);
        
        return messageContainer;
    }

    // Function to load bookmarks from localStorage
    async function loadBookmarks() {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarkedBusStops')) || [];
        bookmarksContainer.innerHTML = '';

        // Check if there are no bookmarks
        if (bookmarks.length === 0) {
            bookmarksContainer.appendChild(createEmptyMessage());
            return;
        }

        try {
            // Show a "Re-fetching in progress" message
            bookmarksContainer.innerHTML = '<p class="pin-msg">Re-fetching Data In Progress, your pinned bus stops will show shortly...</p>';

            // Check if bus stops are already cached in localStorage
            let busStops = [];
            try {
                const cached = localStorage.getItem('allBusStops');
                busStops = cached ? JSON.parse(cached) : [];
                if (!Array.isArray(busStops)) {
                    busStops = [];
                }
            } catch (parseError) {
                console.warn('Failed to parse cached bus stops:', parseError);
                busStops = [];
            }
            if (busStops.length === 0) {
                // Fetch all bus stops from the /bus-stops endpoint if not cached
                let skip = 0;
                let hasMoreData = true;

                while (hasMoreData) {
                    const response = await fetch(`https://bat-lta-9eb7bbf231a2.herokuapp.com/bus-stops?$skip=${skip}`);
                    const data = await response.json();

                    if (data.value.length === 0) {
                        hasMoreData = false;
                    } else {
                        busStops = busStops.concat(data.value);
                        skip += 500; // Move to the next page
                    }
                }

                // Save the fetched bus stops to localStorage
                localStorage.setItem('allBusStops', JSON.stringify(busStops));
            }

            // Clear the "Re-fetching" message and display bookmarks
            bookmarksContainer.innerHTML = '';

            if (bookmarks.length > 0) {
                bookmarks.forEach((bookmark, index) => {
                    const busStop = Array.isArray(busStops) ? busStops.find(stop => stop.BusStopCode === bookmark.BusStopCode) : null;
                    
                    // Skip if bus stop not found
                    if (!busStop) {
                        console.warn('Bus stop not found:', bookmark.BusStopCode);
                        return;
                    }

                    const listItem = document.createElement('div');
                    listItem.className = 'list-group-item';
                    listItem.dataset.bmIndex = String(index);
                    listItem.style.display = 'flex';
                    listItem.style.justifyContent = 'space-between';
                    listItem.style.alignItems = 'center';
                    listItem.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
                    listItem.style.userSelect = 'none';
                    listItem.style.touchAction = 'pan-y';

                    // Grip handle — inline SVG, hidden by default
                    const grip = document.createElement('span');
                    grip.title = 'Hold to reorder';
                    grip.style.cssText = 'flex-shrink:0; display:none; align-items:center; justify-content:center; width:32px; min-height:44px; cursor:grab; margin-right:6px; touch-action:none; user-select:none;';
                    grip.innerHTML =
                        '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="18" viewBox="0 0 12 18">' +
                        '<circle cx="3" cy="3"  r="2" fill="#888"/>' +
                        '<circle cx="9" cy="3"  r="2" fill="#888"/>' +
                        '<circle cx="3" cy="9"  r="2" fill="#888"/>' +
                        '<circle cx="9" cy="9"  r="2" fill="#888"/>' +
                        '<circle cx="3" cy="15" r="2" fill="#888"/>' +
                        '<circle cx="9" cy="15" r="2" fill="#888"/>' +
                        '</svg>';

                    // Disable right-click context menu
                    listItem.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                    });

                    // Long press to activate grips and enable dragging
                    listItem.addEventListener('pointerdown', (e) => {
                        // Don't start if clicking on button
                        if (e.target.closest('button')) return;
                        
                        dragSrc    = listItem;
                        dragStartX = e.clientX;
                        dragStartY = e.clientY;
                        dragStartXForReorder = e.clientX;
                        dragStartYForReorder = e.clientY;
                        dragging   = false;
                        dropTarget = null;

                        // Long press timer to show grip and prepare for drag
                        longPressTimer = setTimeout(() => {
                            // Show grip handles
                            grip.style.display = 'inline-flex';
                            link.style.pointerEvents = 'none';
                        }, 400);
                    });

                    listItem.addEventListener('pointermove', (e) => {
                        // Cancel long press if user moves beyond threshold
                        if (longPressTimer && Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY) > 8) {
                            clearTimeout(longPressTimer);
                            longPressTimer = null;
                        }

                        // If grips are visible and user is moving, start drag
                        if (grip.style.display === 'inline-flex' && !dragging) {
                            const dx = Math.abs(e.clientX - dragStartXForReorder);
                            const dy = Math.abs(e.clientY - dragStartYForReorder);
                            
                            if (Math.hypot(dx, dy) > 8) {
                                // Start dragging
                                dragging = true;
                                listItem.style.opacity   = '0.5';
                                listItem.style.transform = 'scale(0.97)';
                                document.addEventListener('pointermove', onPointerMove, { passive: false });
                                document.addEventListener('pointerup', onPointerUp);
                            }
                        }
                    });

                    listItem.addEventListener('pointerup', () => {
                        if (!dragging) {
                            clearTimeout(longPressTimer);
                            longPressTimer = null;
                        }
                    });

                    // Make the bus stop details clickable
                    const link = document.createElement('a');
                    link.href = `art.html?BusStopCode=${encodeURIComponent(bookmark.BusStopCode)}`;
                    
                    // Build correct image path for GitHub Pages and Heroku
                    const basePath = (window.PWAConfig ? window.PWAConfig.basePath : '/');
                    const busIconPath = basePath + 'buszy/assets/bus-icon.png';
                    
                    link.innerHTML = `
                    <div class="bus-stop-info">
                        <span class="bus-stop-code">
                            <img src="${busIconPath}" alt="Bus Icon">
                            <span class="bus-stop-code-text">${busStop.BusStopCode}</span>
                        </span>
                        <span class="bus-stop-description">${busStop.Description}</span>
                    </div>
                `;
                    link.style.flexGrow = '1';
                    link.style.textDecoration = 'none';
                    link.style.color = 'inherit';

                    link.addEventListener('click', (e) => { 
                        if (dragging || grip.style.display === 'inline-flex') e.preventDefault(); 
                    });

                    // Remove Bookmark button
                    const removeButton = document.createElement('button');
                    removeButton.innerHTML = '<i class="fa-regular fa-thumbtack-angle-slash"></i>';
                    removeButton.className = 'btn btn-unpin btn-2';
                    removeButton.style.flexShrink = '0';
                    removeButton.addEventListener('click', (event) => {
                        event.stopPropagation(); // Prevent the click from triggering the link
                        event.preventDefault(); // Prevent default link behavior
                        confirmAndRemoveBookmark(bookmark.BusStopCode);
                    });

                    listItem.appendChild(grip);
                    listItem.appendChild(link);
                    listItem.appendChild(removeButton);
                    bookmarksContainer.appendChild(listItem);
                });
            } else {
                // If no bookmarks exist after re-fetching, show the message
                bookmarksContainer.appendChild(createEmptyMessage());
            }
            applyPinnedSearchFilter();
        } catch (error) {
            console.error('Error fetching bus stops:', error);
            bookmarksContainer.innerHTML = '<p class="error-msg">Error loading bus stop data.</p>';
        }
    }

    // Function to confirm and remove a bookmark
    function confirmAndRemoveBookmark(busStopCode) {
        const confirmation = confirm('Are you sure you want to unpin this bus stop?');
        if (confirmation) {
            removeBookmark(busStopCode);
        }
    }

    // Function to remove a bookmark
    function removeBookmark(busStopCode) {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarkedBusStops')) || [];
        const updatedBookmarks = bookmarks.filter((b) => b.BusStopCode !== busStopCode);
        localStorage.setItem('bookmarkedBusStops', JSON.stringify(updatedBookmarks));
        loadBookmarks(); // Refresh the displayed list
        alert('Bus Stop Unpinned.');
    }

    // Search filtering for pinned tab
    const searchInput = document.getElementById('bus-stop-search');

    function applyPinnedSearchFilter() {
        if (!searchInput) return;
        const query = searchInput.value.toLowerCase();
        bookmarksContainer.querySelectorAll('.list-group-item').forEach(item => {
            const code = item.querySelector('.bus-stop-code-text')?.textContent.toLowerCase() || '';
            const desc = item.querySelector('.bus-stop-description')?.textContent.toLowerCase() || '';
            item.style.display = (code.includes(query) || desc.includes(query)) ? 'flex' : 'none';
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyPinnedSearchFilter);
    }

    // Load bookmarks on page load
    loadBookmarks();
});
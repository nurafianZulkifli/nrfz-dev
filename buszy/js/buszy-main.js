// ****************************
// :: Bookmark (Pin) Management for Bus Stops
// ****************************
document.addEventListener('DOMContentLoaded', async () => {
    const bookmarksContainer = document.getElementById('bookmarks-container');
    let draggedElement = null; // Track the currently dragged element
    let touchStartElement = null; // Track touch start element
    let currentHighlightedElement = null; // Track highlighted element during touch drag

    // Function to load bookmarks from localStorage
    async function loadBookmarks() {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarkedBusStops')) || [];
        bookmarksContainer.innerHTML = '';

        // Check if there are no bookmarks
        if (bookmarks.length === 0) {
            bookmarksContainer.innerHTML = '<p class="pin-msg">Your Pinned Bus Stops will appear here.<br><small style="font-size: 0.85em; opacity: 0.8;">Tip: You can <a href="./settings.html" style="text-decoration: underline; color: inherit;">import data from Settings</a> if you have a backup.</small></p>';
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

            console.log('Fetched or Cached Bus Stops:', busStops); // Debugging: Log all fetched or cached bus stops

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
                    listItem.dataset.busStopCode = bookmark.BusStopCode;
                    listItem.dataset.index = index;
                    listItem.style.display = 'flex';
                    listItem.style.justifyContent = 'space-between';
                    listItem.style.alignItems = 'center';
                    listItem.style.cursor = 'grab';
                    listItem.style.userSelect = 'none';
                    listItem.style.transition = 'opacity 0.2s, background-color 0.2s, scale 0.1s';
                    listItem.style.touchAction = 'none'; // Prevent default touch behavior

                    // Add drag handle indicator
                    const dragHandle = document.createElement('div');
                    dragHandle.className = 'drag-handle';
                    dragHandle.setAttribute('data-grip-handle', 'true');
                    // Use ::before pseudo-element in CSS for the visual indicator
                    dragHandle.style.cssText = `
                        display: inline-flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        width: 32px !important;
                        height: 100% !important;
                        cursor: grab !important;
                        pointer-events: auto !important;
                        margin-right: 12px !important;
                        flex-shrink: 0 !important;
                        position: relative !important;
                    `;

                    // Make the bus stop details clickable
                    const link = document.createElement('a');
                    link.href = `./art.html?BusStopCode=${encodeURIComponent(bookmark.BusStopCode)}`;
                    
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
                    link.style.display = 'flex';
                    link.style.alignItems = 'center';
                    link.style.pointerEvents = 'auto'; // Keep link clickable

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

                    // ========== LONG-PRESS DRAG & DROP (Desktop + Mobile) ==========
                    let longPressTimeout = null;
                    let longPressStarted = false;
                    let dragStartY = 0;
                    let hasMovedSignificantly = false;

                    // Helper to cancel long-press
                    function cancelLongPress() {
                        if (longPressTimeout) {
                            clearTimeout(longPressTimeout);
                            longPressTimeout = null;
                        }
                        longPressStarted = false;
                        hasMovedSignificantly = false;
                        listItem.style.scale = '1';
                    }

                    // Start long-press (mouse or touch)
                    function startLongPress(clientY) {
                        dragStartY = clientY;
                        hasMovedSignificantly = false;

                        longPressTimeout = setTimeout(() => {
                            longPressStarted = true;
                            draggedElement = listItem;
                            listItem.style.opacity = '0.6';
                            listItem.style.scale = '0.98';
                            console.log('Long press activated on item', index);
                        }, 400); // 400ms long-press
                    }

                    // Shared move handler
                    function handleMove(clientY) {
                        if (!longPressStarted && !longPressTimeout) return;

                        // Cancel if moved too much before long-press
                        if (!longPressStarted && longPressTimeout) {
                            const yDiff = Math.abs(clientY - dragStartY);
                            if (yDiff > 10) {
                                console.log('Cancelled - moved before long-press');
                                cancelLongPress();
                            }
                            return;
                        }

                        // During drag: track vertical movement
                        const yDiff = Math.abs(clientY - dragStartY);
                        if (yDiff > 5) {
                            hasMovedSignificantly = true;
                        }

                        if (!hasMovedSignificantly) return;

                        // Find element below
                        const elementBelow = document.elementFromPoint(window.event?.clientX || dragStartY, clientY);
                        const targetItem = elementBelow?.closest('.list-group-item');

                        // Highlight the target item
                        if (targetItem && targetItem !== draggedElement) {
                            if (currentHighlightedElement !== targetItem) {
                                if (currentHighlightedElement) {
                                    currentHighlightedElement.style.backgroundColor = '';
                                    currentHighlightedElement.style.borderTop = '';
                                }
                                targetItem.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
                                targetItem.style.borderTop = '3px solid #007bff';
                                currentHighlightedElement = targetItem;
                            }
                        } else if (currentHighlightedElement) {
                            currentHighlightedElement.style.backgroundColor = '';
                            currentHighlightedElement.style.borderTop = '';
                            currentHighlightedElement = null;
                        }
                    }

                    // Shared release handler
                    function handleRelease() {
                        if (longPressStarted && currentHighlightedElement && currentHighlightedElement !== draggedElement && hasMovedSignificantly) {
                            console.log('Performing swap - dragged:', index, 'target:', currentHighlightedElement.dataset.index);
                            swapBookmarks(draggedElement, currentHighlightedElement);
                        } else {
                            // Clean up if no valid swap
                            listItem.style.opacity = '1';
                            listItem.style.scale = '1';
                            draggedElement = null;
                        }

                        // Clean up highlight
                        if (currentHighlightedElement) {
                            currentHighlightedElement.style.backgroundColor = '';
                            currentHighlightedElement.style.borderTop = '';
                            currentHighlightedElement = null;
                        }

                        cancelLongPress();
                    }

                    // Mouse/Pointer Events
                    listItem.addEventListener('pointerdown', (e) => {
                        // Accept grip handle for mouse, anywhere for touch
                        if (e.pointerType === 'mouse') {
                            const isGripHandle = e.target.closest('.drag-handle') || e.target.closest('i.fa-grip-vertical');
                            if (!isGripHandle) return;
                        }
                        startLongPress(e.clientY);
                    }, { passive: true });

                    listItem.addEventListener('pointermove', (e) => {
                        handleMove(e.clientY);
                    }, { passive: false });

                    listItem.addEventListener('pointerup', handleRelease, { passive: true });
                    listItem.addEventListener('pointerleave', cancelLongPress, { passive: true });

                    // Touch Events
                    listItem.addEventListener('touchstart', (e) => {
                        startLongPress(e.touches[0].clientY);
                    }, { passive: true });

                    listItem.addEventListener('touchmove', (e) => {
                        handleMove(e.touches[0].clientY);
                    }, { passive: false });

                    listItem.addEventListener('touchend', handleRelease, { passive: true });
                    listItem.addEventListener('touchcancel', cancelLongPress, { passive: true });

                    // Mark the drag handle for easier identification
                    dragHandle.setAttribute('data-grip-handle', 'true');

                    listItem.appendChild(dragHandle);
                    listItem.appendChild(link);
                    listItem.appendChild(removeButton);
                    bookmarksContainer.appendChild(listItem);
                });
            } else {
                // If no bookmarks exist after re-fetching, show the message
                bookmarksContainer.innerHTML = '<p class="pin-msg">Add a Bus Stop.</p>';
            }
        } catch (error) {
            console.error('Error fetching bus stops:', error);
            bookmarksContainer.innerHTML = '<p class="error-msg">Error loading bus stop data.</p>';
        }
    }

    // Function to swap bookmarks in the array and update localStorage
    function swapBookmarks(draggedItem, targetItem) {
        try {
            const draggedIndex = parseInt(draggedItem.dataset.index);
            const targetIndex = parseInt(targetItem.dataset.index);

            console.log('Attempting swap: draggedIndex=', draggedIndex, 'targetIndex=', targetIndex);

            if (isNaN(draggedIndex) || isNaN(targetIndex) || draggedIndex === targetIndex) {
                console.warn('Invalid indices for swap');
                return;
            }

            // Get bookmarks from localStorage
            const bookmarks = JSON.parse(localStorage.getItem('bookmarkedBusStops')) || [];

            console.log('Bookmarks before swap:', bookmarks);

            // Swap the bookmarks
            [bookmarks[draggedIndex], bookmarks[targetIndex]] = [bookmarks[targetIndex], bookmarks[draggedIndex]];

            console.log('Bookmarks after swap:', bookmarks);

            // Save updated bookmarks
            localStorage.setItem('bookmarkedBusStops', JSON.stringify(bookmarks));

            // Reload the bookmarks to reflect the new order
            loadBookmarks();
        } catch (error) {
            console.error('Error during swap:', error);
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

    // Load bookmarks on page load
    loadBookmarks();
});


// ****************************
// :: Dynamic Greeting Based on Time of Day
// ****************************
document.addEventListener('DOMContentLoaded', () => {
    const pinnedBusElement = document.querySelector('h2'); // Select the <h2> element

    // Function to determine the all-apps based on the current time
    function getGreeting() {
        const now = new Date();
        const hours = now.getHours();

        if (hours >= 5 && hours < 12) {
            return 'Good Morning!';
        } else if (hours >= 12 && hours < 18) {
            return 'Good Afternoon!';
        } else {
            return 'Good Evening!';
        }
    }

    // Update the <h2> element with the all-apps
    pinnedBusElement.textContent = getGreeting();
});


// ****************************
// :: Bus Stop Click Navigation
// ****************************
document.addEventListener('DOMContentLoaded', () => {
    const busStopElements = document.querySelectorAll('.bus-stop'); // Select all bus stop elements

    busStopElements.forEach((element) => {
        element.addEventListener('click', () => {
            const busStopCode = element.getAttribute('data-bus-stop-code'); // Get the bus stop code
            const busStopName = element.getAttribute('data-bus-stop-name'); // Optional: Get the bus stop name

            // Redirect to art.html with the bus stop code as a query parameter
            const url = new URL('./art.html', window.location.href);
            url.searchParams.set('BusStopCode', busStopCode);
            if (busStopName) {
                url.searchParams.set('BusStopName', busStopName); // Optional
            }
            window.location.href = url.toString();
        });
    });
});
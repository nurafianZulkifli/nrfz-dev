// ****************************
// :: Announcement Indicator Dot ::
// ****************************

/**
 * Check if there are any unread announcements
 * and show indicator dots on announcement links
 */
function updateAnnounceIndicatorDots() {
    const HAS_UNREAD_KEY = 'buszy_has_unread';
    
    // Get unread flag from localStorage
    const hasUnread = localStorage.getItem(HAS_UNREAD_KEY) === 'true';
    
    // Update indicator dots
    const dots = document.querySelectorAll('.ann-indicator-dot');
    dots.forEach(dot => {
        if (hasUnread) {
            dot.classList.add('show');
        } else {
            dot.classList.remove('show');
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateAnnounceIndicatorDots();
});

// Also initialize if DOM is already loaded
if (document.readyState !== 'loading') {
    updateAnnounceIndicatorDots();
}

// Watch for changes to localStorage (in case announcements page updates)
window.addEventListener('storage', function(e) {
    if (e.key === 'buszy_has_unread' || e.key === null) {
        updateAnnounceIndicatorDots();
    }
});

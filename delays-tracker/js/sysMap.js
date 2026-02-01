// Dark Mode Image Switching
function updateImagesForDarkMode() {
  const isDarkMode = document.body.classList.contains('dark-mode');
  
  // Get all images with data-light and data-dark attributes
  const images = document.querySelectorAll('img[data-light][data-dark]');
  images.forEach(img => {
    if (isDarkMode) {
      img.src = img.getAttribute('data-dark');
      img.alt = img.getAttribute('data-dark-alt') || img.alt;
    } else {
      img.src = img.getAttribute('data-light');
      img.alt = img.getAttribute('data-light-alt') || img.alt;
    }
  });
}

// Listen for dark mode changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
      updateImagesForDarkMode();
    }
  });
});

// Observe body for class changes (dark mode toggle)
observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  updateImagesForDarkMode();
  // Add click event to all images with data-light and data-dark
  document.querySelectorAll('img[data-light][data-dark]').forEach(img => {
    img.addEventListener('click', updateImagesForDarkMode);
  });

  // Add click event to the map <a> to open the correct PDF for the mode
  const mapLink = document.querySelector('.fr-view a[href$="system-map-lta.pdf"]');
  if (mapLink) {
    mapLink.addEventListener('click', function(e) {
      const isDarkMode = document.body.classList.contains('dark-mode');
      // If you have a dark PDF, swap here. Otherwise, just open the same PDF.
      const lightHref = 'assets/system-map-lta.pdf';
      const darkHref = 'assets/system-map-lta-dark.pdf';
      if (isDarkMode && darkHref !== lightHref) {
        e.preventDefault();
        window.open(darkHref, '_blank');
      } else if (!isDarkMode && lightHref !== darkHref) {
        e.preventDefault();
        window.open(lightHref, '_blank');
      }
      // If only one PDF exists, remove the above and let default happen
    });
  }
});
/* Dark Mode Functionality for Individual Pages */

// Check localStorage for dark mode preference
if (localStorage.getItem('dark-mode') === 'enabled') {
    document.body.classList.add('dark-mode');
    updateHrefForDarkMode();
}

const toggleButton = document.getElementById('dark-mode-toggle');
toggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    // Save the preference in localStorage
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('dark-mode', 'enabled');
    } else {
        localStorage.setItem('dark-mode', 'disabled');
    }
    updateHrefForDarkMode();
});

function updateHrefForDarkMode() {
    /* Banners */
    const pv5Page = document.getElementById('cv-pv5');

    /* Images */
    const gc1_link = document.getElementById('gc1');
    const gc1_img = document.getElementById('gc1-img');

    const gc2_link = document.getElementById('gc2');
    const gc2_img = document.getElementById('gc2-img');

    const isDarkMode = document.body.classList.contains('dark-mode');

    if (isDarkMode) {
        /* Banners */
        pv5Page.style.backgroundImage = "url(https://i.imgur.com/bOE19OL.png)";

        /* Images */
        gc1_link.href = 'https://i.imgur.com/Qm2oHBz.png';
        gc1_img.src = 'https://i.imgur.com/Qm2oHBz.png';

        gc2_link.href = 'https://i.imgur.com/3fUcmIB.png';
        gc2_img.src = 'https://i.imgur.com/3fUcmIB.png';


    } else {
        /* Banners */
        pv5Page.style.backgroundImage = "url(https://i.imgur.com/JfP4t5u.png)";

        /* Images */
        gc1_link.href = 'https://i.imgur.com/rZNeia0.png';
        gc1_img.src = 'https://i.imgur.com/rZNeia0.png';

        gc2_link.href = 'https://i.imgur.com/OkpOkHg.png';
        gc2_img.src = 'https://i.imgur.com/OkpOkHg.png';
    }


}

// Update the scroll indicator width based on scroll position
window.addEventListener("scroll", function () {
    const scrollIndicator = document.getElementById("scroll-indicator");
    const scrollTop = window.scrollY; // Current scroll position
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight; // Total scrollable height
    const scrollPercentage = (scrollTop / scrollHeight) * 100; // Calculate scroll percentage
    scrollIndicator.style.width = scrollPercentage + "%"; // Update the width of the indicator
});
/* Dark Mode Functionality for Individual Pages */

// Check localStorage for dark mode preference
if (localStorage.getItem('dark-mode') === 'enabled') {
    document.body.classList.add('dark-mode');
    updateThemeIcon('dark');
} else {
    updateThemeIcon('light');
}

// Get both toggle buttons
const toggleButtonDesktop = document.getElementById('dark-mode-toggle-desktop');
const toggleButtonMobile = document.getElementById('dark-mode-toggle-mobile');

// Function to toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    // Save the preference in localStorage
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('dark-mode', 'enabled');
        updateThemeIcon('dark');
    } else {
        localStorage.setItem('dark-mode', 'disabled');
        updateThemeIcon('light');
    }
}

// Add event listeners to both buttons if they exist
if (toggleButtonDesktop) {
    toggleButtonDesktop.addEventListener('click', toggleDarkMode);
}

if (toggleButtonMobile) {
    toggleButtonMobile.addEventListener('click', toggleDarkMode);
}
// Function to update the theme icon with animation
function updateThemeIcon(theme) {
    const themeIconDesktop = document.getElementById('theme-icon-desktop');
    const themeIconMobile = document.getElementById('theme-icon-mobile');

    // Add animation class to both icons
    if (themeIconDesktop) themeIconDesktop.classList.add('animate');
    if (themeIconMobile) themeIconMobile.classList.add('animate');

    // Update the icon based on the theme
    if (theme === 'dark') {
        if (themeIconDesktop) {
            themeIconDesktop.classList.remove('fa-sun-bright');
            themeIconDesktop.classList.add('fa-moon-stars');
        }
        if (themeIconMobile) {
            themeIconMobile.classList.remove('fa-sun-bright');
            themeIconMobile.classList.add('fa-moon-stars');
        }
    } else {
        if (themeIconDesktop) {
            themeIconDesktop.classList.remove('fa-moon-stars');
            themeIconDesktop.classList.add('fa-sun-bright');
        }
        if (themeIconMobile) {
            themeIconMobile.classList.remove('fa-moon-stars');
            themeIconMobile.classList.add('fa-sun-bright');
        }
    }

    // Remove the animation class after the animation ends
    setTimeout(() => {
        if (themeIconDesktop) themeIconDesktop.classList.remove('animate');
        if (themeIconMobile) themeIconMobile.classList.remove('animate');
    }, 300); // Match the duration of the CSS transition
}

function updateHrefForDarkMode() {
    /* Existing logic for updating banners, images, and videos */
    // const coverSect = document.getElementById('cv-img');

    // const tf_link = document.getElementById('logo-big');
    const logo_big_img = document.getElementById('logo-big-img');


    const isDarkMode = document.body.classList.contains('dark-mode');

    if (isDarkMode) {
        // coverSect.style.backgroundImage = "url('./img/cover-dark.png')";


        // tf_link.href = './img/typeface-dark.png';
        logo_big_img.src = './img/core-img/logo_big_dark.png';


    } else {
        // coverSect.style.backgroundImage = "url('./img/cover-light.png')";


        // tf_link.href = './img/typeface-light.png';
        logo_big_img.src = './img/core-img/logo_big_light.png';


    }
}

// Limit card description length to 280 characters
document.querySelectorAll('.card-text-ri').forEach(function(p) {
    const maxLen = 280;
    if (p.textContent.length > maxLen) {
        p.textContent = p.textContent.slice(0, maxLen).trim() + '...';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('a[href^="incident-history/incident-history.html#"]').forEach(function(link) {
        link.addEventListener('click', function(e) {
            // Let the default behavior happen (navigate)
            // Optionally, you could add analytics or other logic here
        });
    });
});

window.addEventListener('DOMContentLoaded', function() {
    if (window.location.hash) {
        var el = document.getElementById(window.location.hash.substring(1));
        if (el) el.scrollIntoView({behavior: "smooth"});
    }
});


    // JavaScript to handle the dropdown toggle
    // document.getElementById('delayFilter').addEventListener('change', function () {
    //     const selectedFilter = this.value;
    //     const cards = document.querySelectorAll('.delay-card');

    //     cards.forEach(card => {
    //         const delayStatus = card.getAttribute('data-delay-status');
    //         if (selectedFilter === 'all' || delayStatus === selectedFilter) {
    //             card.style.display = 'block';
    //         } else {
    //             card.style.display = 'none';
    //         }
    //     });
    // });

        document.getElementById('delayFilter').addEventListener('change', function () {
        const selectedValue = this.value;

        // Redirect based on the selected value
        if (selectedValue === 'reported') {
            window.location.href = 'index.html'; // Replace with the actual URL
        } else if (selectedValue === 'unreported') {
            window.location.href = 'index-ud.html'; // Replace with the actual URL
        }
    });


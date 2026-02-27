/* Dark Mode Functionality for Individual Pages */

// Check localStorage for dark mode preference, fall back to system preference
const _savedTheme = localStorage.getItem('dark-mode');
const _prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const _isDark = _savedTheme === 'enabled' || (_savedTheme === null && _prefersDark);

if (_isDark) {
    document.body.classList.add('dark-mode');
    updateThemeIcon('dark');
    updateHrefForDarkMode();
} else {
    updateThemeIcon('light');
}

// Follow system theme changes when no manual preference is stored
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (localStorage.getItem('dark-mode') === null) {
        if (e.matches) {
            document.body.classList.add('dark-mode');
            updateThemeIcon('dark');
            updateHrefForDarkMode();
        } else {
            document.body.classList.remove('dark-mode');
            updateThemeIcon('light');
            updateHrefForDarkMode();
        }
    }
});

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
    updateHrefForDarkMode();
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
    /* Banners */
    const coverSect = document.getElementById('cbus-img');
    const cdSect = document.getElementById('cd-img');


    /* Images */
    const psr1a_link = document.getElementById('psr1a');
    const psr1a_img = document.getElementById('psr1a-img');

    const psr2_link = document.getElementById('psr2');
    const psr2_img = document.getElementById('psr2-img');

    const psr3a_link = document.getElementById('psr3a');
    const psr3a_img = document.getElementById('psr3a-img');

    const psr3b_link = document.getElementById('psr3b');
    const psr3b_img = document.getElementById('psr3b-img');

    const psr5a_link = document.getElementById('psr5a');
    const psr5a_img = document.getElementById('psr5a-img');

    const cck1a_link = document.getElementById('cck1a');
    const cck1a_img = document.getElementById('cck1a-img');

    const cck2_link = document.getElementById('cck2');
    const cck2_img = document.getElementById('cck2-img');

    const cck3a_link = document.getElementById('cck3a');
    const cck3a_img = document.getElementById('cck3a-img');

    const cck4a_link = document.getElementById('cck4a');
    const cck4a_img = document.getElementById('cck4a-img');

    const cs_link = document.getElementById('cs');
    const cs_img = document.getElementById('cs-img');

    /* Videos */
    const vid9 = document.getElementById('eicw-vid9');
    const vid9Source = vid9.querySelector('source');

    const vid10 = document.getElementById('eicw-vid10');
    const vid10Source = vid10.querySelector('source');


    const isDarkMode = document.body.classList.contains('dark-mode');

    if (isDarkMode) {
        /* Banners */
        if (coverSect) coverSect.style.backgroundImage = "url('./img/cover-psr-dark.png')";
        if (cdSect) cdSect.style.backgroundImage = "url('./img/cdbus-dark.png')";


        /* Images */
        if (psr1a_link) psr1a_link.href = './img/psr-1a-dark.png';
        if (psr1a_img) psr1a_img.src = './img/psr-1a-dark.png';

        if (psr2_link) psr2_link.href = './img/psr-2-dark.png';
        if (psr2_img) psr2_img.src = './img/psr-2-dark.png';

        if (psr3a_link) psr3a_link.href = './img/psr-3a-dark.png';
        if (psr3a_img) psr3a_img.src = './img/psr-3a-dark.png';

        if (psr3b_link) psr3b_link.href = './img/psr-3b-dark.png';
        if (psr3b_img) psr3b_img.src = './img/psr-3b-dark.png';

        if (psr5a_link) psr5a_link.href = './img/psr5a-dark.png';
        if (psr5a_img) psr5a_img.src = './img/psr5a-dark.png';

        if (cck1a_link) cck1a_link.href = './img/cck-1a-dark.png';
        if (cck1a_img) cck1a_img.src = './img/cck-1a-dark.png';

        if (cck2_link) cck2_link.href = './img/cck-2-dark.png';
        if (cck2_img) cck2_img.src = './img/cck-2-dark.png';

        if (cck3a_link) cck3a_link.href = './img/cck-3a-dark.png';
        if (cck3a_img) cck3a_img.src = './img/cck-3a-dark.png';

        if (cck4a_link) cck4a_link.href = './img/cck-4a-dark.png';
        if (cck4a_img) cck4a_img.src = './img/cck-4a-dark.png';

        if (cs_link) cs_link.href = './img/cs-dark.png';
        if (cs_img) cs_img.src = './img/cs-dark.png';

        /* Videos */
        if (vid9Source) vid9Source.src = './img/eicw-vid9-dark.mp4';
        if (vid10Source) vid10Source.src = './img/eicw-vid10-dark.mp4';

    } else {
        /* Banners */
        if (coverSect) coverSect.style.backgroundImage = "url('./img/cover-psr-light.png')";
        if (cdSect) cdSect.style.backgroundImage = "url('./img/cdbus-light.png')";


        /* Images */
        if (psr1a_link) psr1a_link.href = './img/psr-1a-light.png';
        if (psr1a_img) psr1a_img.src = './img/psr-1a-light.png';

        if (psr2_link) psr2_link.href = './img/psr-2-light.png';
        if (psr2_img) psr2_img.src = './img/psr-2-light.png';

        if (psr3a_link) psr3a_link.href = './img/psr-3a-light.png';
        if (psr3a_img) psr3a_img.src = './img/psr-3a-light.png';

        if (psr3b_link) psr3b_link.href = './img/psr-3b-light.png';
        if (psr3b_img) psr3b_img.src = './img/psr-3b-light.png';

        if (psr5a_link) psr5a_link.href = './img/psr5a-light.png';
        if (psr5a_img) psr5a_img.src = './img/psr5a-light.png';

        if (cck1a_link) cck1a_link.href = './img/cck-1a-light.png';
        if (cck1a_img) cck1a_img.src = './img/cck-1a-light.png';

        if (cck2_link) cck2_link.href = './img/cck-2-light.png';
        if (cck2_img) cck2_img.src = './img/cck-2-light.png';

        if (cck3a_link) cck3a_link.href = './img/cck-3a-light.png';
        if (cck3a_img) cck3a_img.src = './img/cck-3a-light.png';

        if (cck4a_link) cck4a_link.href = './img/cck-4a-light.png';
        if (cck4a_img) cck4a_img.src = './img/cck-4a-light.png';

        if (cs_link) cs_link.href = './img/cs-light.png';
        if (cs_img) cs_img.src = './img/cs-light.png';

        /* Videos */
        if (vid9Source) vid9Source.src = './img/eicw-vid9-light.mp4';
        if (vid10Source) vid10Source.src = './img/eicw-vid10-light.mp4';

    }

    if (vid9) vid9.load();
    if (vid10) vid10.load();

}

// Update the scroll indicator width based on scroll position
window.addEventListener("scroll", function () {
    const scrollIndicator = document.getElementById("scroll-indicator");
    const scrollTop = window.scrollY; // Current scroll position
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight; // Total scrollable height
    const scrollPercentage = (scrollTop / scrollHeight) * 100; // Calculate scroll percentage
    scrollIndicator.style.width = scrollPercentage + "%"; // Update the width of the indicator
});

// Play videos only on hover, pause when mouse leaves
document.addEventListener('DOMContentLoaded', function () {
    var videos = document.querySelectorAll('video');

    videos.forEach(function (video) {
        video.setAttribute('title', 'Video Autoplays on Hover');
        video.style.cursor = 'pointer';

        setTimeout(function () {
            video.removeAttribute('title');
        }, 5000);

        video.addEventListener('mouseenter', function () {
            video.play().catch(function (error) {
                console.log('Autoplay was prevented:', error);
            });
        });

        video.addEventListener('mouseleave', function () {
            video.pause();
        });
    });
});
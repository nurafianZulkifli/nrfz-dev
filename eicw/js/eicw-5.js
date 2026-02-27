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
    const coverSect = document.getElementById('covccl-img');
    const platSect = document.getElementById('plat-img');
    const entSect = document.getElementById('ent-img');
    const concSect = document.getElementById('conc-img');

    /* Images */
    const cclDiag_link = document.getElementById('ccl-diag');
    const cclDiag_img = document.getElementById('ccl-diag-img');

    const arrow_link = document.getElementById('arrow');
    const arrow_img = document.getElementById('arrow-img');

    const wfp_link = document.getElementById('wfp');
    const wfp_img = document.getElementById('wfp-img');

    const wfm_link = document.getElementById('wfm');
    const wfm_img = document.getElementById('wfm-img');

    const evo3_link = document.getElementById('evo3');
    const evo3_img = document.getElementById('evo3-img');


    /* Videos */



    const isDarkMode = document.body.classList.contains('dark-mode');

    if (isDarkMode) {
        /* Banners */
        if (coverSect) coverSect.style.backgroundImage = "url('./img/cover-eicw-5-dark.png')";
        if (platSect) platSect.style.backgroundImage = "url('./img/plat-dark.png')";
        if (entSect) entSect.style.backgroundImage = "url('./img/ent-dark.png')";
        if (concSect) concSect.style.backgroundImage = "url('./img/conc-dark.png')";


        /* Images */
        if (cclDiag_link) cclDiag_link.href = './img/ccl-diag-dark.png';
        if (cclDiag_img) cclDiag_img.src = './img/ccl-diag-dark.png';

        if (arrow_link) arrow_link.href = './img/arrow-dark.png';
        if (arrow_img) arrow_img.src = './img/arrow-dark.png';

        if (wfm_link) wfm_link.href = './img/ccl6-7aD.png';
        if (wfm_img) wfm_img.src = './img/ccl6-7aD.png';

        if (wfp_link) wfp_link.href = './img/ccl6-7D.png';
        if (wfp_img) wfp_img.src = './img/ccl6-7D.png';

        if (evo3_link) evo3_link.href = './img/ccl6-overview-dark.png';
        if (evo3_img) evo3_img.src = './img/ccl6-overview-dark.png';

        /* Videos */


    } else {
        /* Banners */
        if (coverSect) coverSect.style.backgroundImage = "url('./img/cover-eicw-5-light.png')";
        if (platSect) platSect.style.backgroundImage = "url('./img/plat-light.png')";
        if (entSect) entSect.style.backgroundImage = "url('./img/ent-light.png')";
        if (concSect) concSect.style.backgroundImage = "url('./img/conc-light.png')";


        /* Images */
        if (cclDiag_link) cclDiag_link.href = './img/ccl-diag-light.png';
        if (cclDiag_img) cclDiag_img.src = './img/ccl-diag-light.png';

        if (arrow_link) arrow_link.href = './img/arrow-light.png';
        if (arrow_img) arrow_img.src = './img/arrow-light.png';

        if (wfm_link) wfm_link.href = './img/ccl6-7aL.png';
        if (wfm_img) wfm_img.src = './img/ccl6-7aL.png';

        if (wfp_link) wfp_link.href = './img/ccl6-7.png';
        if (wfp_img) wfp_img.src = './img/ccl6-7.png';

        if (evo3_link) evo3_link.href = './img/ccl6-overview-light.png';
        if (evo3_img) evo3_img.src = './img/ccl6-overview-light.png';


        /* Videos */


    }



}

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

// document.addEventListener('contextmenu', function(e) {
//     if (e.target.tagName === 'IMG') {
//         e.preventDefault();
//     }
// });

// Update the scroll indicator width based on scroll position
window.addEventListener("scroll", function () {
    const scrollIndicator = document.getElementById("scroll-indicator");
    const scrollTop = window.scrollY; // Current scroll position
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight; // Total scrollable height
    const scrollPercentage = (scrollTop / scrollHeight) * 100; // Calculate scroll percentage
    scrollIndicator.style.width = scrollPercentage + "%"; // Update the width of the indicator
});


/* Audio Elements */
// Only attach handlers once DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    var ccl = document.getElementById("chimes");
    if (ccl) {
        ccl.addEventListener('mousedown', handleChimesClick);
        ccl.addEventListener('touchstart', handleChimesTap);
    }
});

let clickCount = 0;
let clickTimer = null;
let tapCount = 0;
let tapTimer = null;

// Single click/tap to play normal chime, triple click/tap to play alternate chime
function handleChimesClick(event) {
    if (event.button !== 0) return; // Only left mouse button
    clickCount++;
    if (clickCount === 3) {
        clearTimeout(clickTimer);
        playAltAudio();
        clickCount = 0;
    } else {
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => {
            if (clickCount === 1) playAudio();
            clickCount = 0;
        }, 400);
    }
}

function handleChimesTap(event) {
    tapCount++;
    if (tapCount === 3) {
        clearTimeout(tapTimer);
        playAltAudio();
        tapCount = 0;
    } else {
        clearTimeout(tapTimer);
        tapTimer = setTimeout(() => {
            if (tapCount === 1) playAudio();
            tapCount = 0;
        }, 500);
    }
}

function playAudio() {
    const audio = document.getElementById('chimes-audio');
    const altAudio = document.getElementById('chimes-alt');
    if (audio) {
        // Stop and reset both audios before playing
        if (altAudio) {
            altAudio.pause();
            altAudio.currentTime = 0;
        }
        audio.pause();
        audio.currentTime = 0;
        audio.play();
    }
}

function playAltAudio() {
    const audio = document.getElementById('chimes-audio');
    const altAudio = document.getElementById('chimes-alt');
    if (altAudio) {
        // Stop and reset both audios before playing
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
        altAudio.pause();
        altAudio.currentTime = 0;
        altAudio.play();
    }
}

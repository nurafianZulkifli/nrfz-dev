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
    /* Existing logic for updating banners, images, and videos */
    const coverSect = document.getElementById('cv-img');
    const eiaSect = document.getElementById('eia-img');

    const tf_link = document.getElementById('tf');
    const tf_img = document.getElementById('tf-img');

    const pl_link = document.getElementById('pl');
    const pl_img = document.getElementById('pl-img');

    const pl2_link = document.getElementById('pl2');
    const pl2_img = document.getElementById('pl2-img');

    const evo_link = document.getElementById('evo');
    const evo_img = document.getElementById('evo-img');

    const es_link = document.getElementById('es');
    const es_img = document.getElementById('es-img');

    const cp_link = document.getElementById('cp');
    const cp_img = document.getElementById('cp-img');

    const ls_link = document.getElementById('ls');
    const ls_img = document.getElementById('ls-img');

    const wf1_link = document.getElementById('wf1');
    const wf1_img = document.getElementById('wf1-img');

    const wf2_link = document.getElementById('wf2');
    const wf2_img = document.getElementById('wf2-img');

    const isDarkMode = document.body.classList.contains('dark-mode');

    if (isDarkMode) {
        if (coverSect) coverSect.style.backgroundImage = "url('./img/cover-dark.png')";
        if (eiaSect) eiaSect.style.backgroundImage = "url('./img/eia-dark.png')";

        if (tf_link) tf_link.href = './img/typeface-dark.png';
        if (tf_img) tf_img.src = './img/typeface-dark.png';

        if (pl_link) pl_link.href = './img/palettes-dark.png';
        if (pl_img) pl_img.src = './img/palettes-dark.png';

        if (pl2_link) pl2_link.href = './img/palettes-dark2.png';
        if (pl2_img) pl2_img.src = './img/palettes-dark2.png';

        if (evo_link) evo_link.href = './img/evo-dark.png';
        if (evo_img) evo_img.src = './img/evo-dark.png';

        if (es_link) es_link.href = './img/es-dark.png';
        if (es_img) es_img.src = './img/es-dark.png';

        if (cp_link) cp_link.href = './img/cp-dark.png';
        if (cp_img) cp_img.src = './img/cp-dark.png';

        if (ls_link) ls_link.href = './img/ls-dark.png';
        if (ls_img) ls_img.src = './img/ls-dark.png';

        if (wf1_link) wf1_link.href = './img/wf1-dark.png';
        if (wf1_img) wf1_img.src = './img/wf1-dark.png';

        if (wf2_link) wf2_link.href = './img/wf2-dark.png';
        if (wf2_img) wf2_img.src = './img/wf2-dark.png';


    } else {
        if (coverSect) coverSect.style.backgroundImage = "url('./img/cover-light.png')";
        if (eiaSect) eiaSect.style.backgroundImage = "url('./img/eia-light.png')";

        if (tf_link) tf_link.href = './img/typeface-light.png';
        if (tf_img) tf_img.src = './img/typeface-light.png';

        if (pl_link) pl_link.href = './img/palettes-light.png';
        if (pl_img) pl_img.src = './img/palettes-light.png';

        if (pl2_link) pl2_link.href = './img/palettes-light2.png';
        if (pl2_img) pl2_img.src = './img/palettes-light2.png';

        if (evo_link) evo_link.href = './img/evo-light.png';
        if (evo_img) evo_img.src = './img/evo-light.png';

        if (es_link) es_link.href = './img/es-light.png';
        if (es_img) es_img.src = './img/es-light.png';

        if (cp_link) cp_link.href = './img/cp-light.png';
        if (cp_img) cp_img.src = './img/cp-light.png';

        if (ls_link) ls_link.href = './img/ls-light.png';
        if (ls_img) ls_img.src = './img/ls-light.png';

        if (wf1_link) wf1_link.href = './img/wf1-light.png';
        if (wf1_img) wf1_img.src = './img/wf1-light.png';

        if (wf2_link) wf2_link.href = './img/wf2-light.png';
        if (wf2_img) wf2_img.src = './img/wf2-light.png';
    }
}


// Update the scroll indicator width on scroll
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercentage = (scrollTop / docHeight) * 100;
    document.getElementById('scroll-indicator').style.width = scrollPercentage + '%';
});

// Update the scroll indicator width on scroll
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercentage = Math.min((scrollTop / docHeight) * 100, 100); // Cap at 100%
    document.getElementById('scroll-indicator').style.width = scrollPercentage + '%';
});
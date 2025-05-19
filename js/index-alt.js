/* Dark Mode Functionality for Individual Pages */

// Check localStorage for dark mode preference
if (localStorage.getItem('dark-mode') === 'enabled') {
    document.body.classList.add('dark-mode');
    updateThemeIcon('dark');
    updateHrefForDarkMode();
} else {
    updateThemeIcon('light');
}

const toggleButton = document.getElementById('dark-mode-toggle');
toggleButton.addEventListener('click', () => {
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
});

// Function to update the theme icon with animation
function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');

    // Add animation class
    themeIcon.classList.add('animate');

    // Update the icon based on the theme
    if (theme === 'dark') {
        themeIcon.classList.remove('fa-sun-bright');
        themeIcon.classList.add('fa-moon-stars');
    } else {
        themeIcon.classList.remove('fa-moon-stars');
        themeIcon.classList.add('fa-sun-bright');
    }

    // Remove the animation class after the animation ends
    setTimeout(() => {
        themeIcon.classList.remove('animate');
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
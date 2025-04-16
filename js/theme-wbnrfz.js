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
    const eicwPage = document.getElementById('cv-eicw');
    const tdcPage = document.getElementById('cv-tdc');

    const isDarkMode = document.body.classList.contains('dark-mode');

    if (isDarkMode) {
        /* Banners */
        eicwPage.style.backgroundImage = "url('../eicw/img/cover-dark.png')";
        tdcPage.style.backgroundImage = "url('https://i.imgur.com/5I39ojc.png')";



    } else {
        /* Banners */
        eicwPage.style.backgroundImage = "url('../eicw/img/cover-light.png')";
        tdcPage.style.backgroundImage = "url('https://i.imgur.com/5I39ojc.png')";
    }


}
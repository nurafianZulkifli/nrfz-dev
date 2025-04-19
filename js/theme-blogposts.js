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
    const wayfind1Page = document.getElementById('cv-wf1');
    const wayfind2Page = document.getElementById('cv-wf2');
    const pv4Page = document.getElementById('cv-pv4');

    const isDarkMode = document.body.classList.contains('dark-mode');

    if (isDarkMode) {
        /* Banners */
        wayfind1Page.style.backgroundImage = "url(https://i.imgur.com/HmJURmV.jpg)";
        wayfind2Page.style.backgroundImage = "url(https://i.imgur.com/LMu9vuD.png)";
        pv4Page.style.backgroundImage = "url(https://i.imgur.com/XfoBdpk.png";


    } else {
        /* Banners */
        wayfind1Page.style.backgroundImage = "url(https://i.imgur.com/HmJURmV.jpg)";
        wayfind2Page.style.backgroundImage = "url(https://i.imgur.com/LMu9vuD.png)";
        pv4Page.style.backgroundImage = "url(https://i.imgur.com/XfoBdpk.png)";
    }


}
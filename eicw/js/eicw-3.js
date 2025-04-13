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
    const coverSect = document.getElementById('cv-img');
    const iuSect = document.getElementById('iu-img');

    /* Images */
    const cs_link = document.getElementById('cs');
    const cs_img = document.getElementById('cs-img');

    const wfs_link = document.getElementById('wfs');
    const wfs_img = document.getElementById('wfs-img');

    const wfs2_link = document.getElementById('wfs2');
    const wfs2_img = document.getElementById('wfs2-img');

    /* Videos */



    const isDarkMode = document.body.classList.contains('dark-mode');

    if (isDarkMode) {
        /* Banners */
        coverSect.style.backgroundImage = "url('img/eicw/cover-dark.png')";
        iuSect.style.backgroundImage = "url('img/eicw/iu-dark.png')";


        /* Images */
        cs_link.href = 'img/eicw/cs-dark.png';
        cs_img.src = 'img/eicw/cs-dark.png';

        wfs_link.href = 'img/eicw/wfs-dark.png';
        wfs_img.src = 'img/eicw/wfs-dark.png';

        wfs2_link.href = 'img/eicw/wfs2-dark.png';
        wfs2_img.src = 'img/eicw/wfs2-dark.png';


        /* Videos */


    } else {
        /* Banners */
        coverSect.style.backgroundImage = "url('img/eicw/cover-light.png')";
        iuSect.style.backgroundImage = "url('img/eicw/iu-light.png')";
 

        /* Images */
        cs_link.href = 'img/eicw/cs-light.png';
        cs_img.src = 'img/eicw/cs-light.png';

        wfs_link.href = 'img/eicw/wfs-light.png';
        wfs_img.src = 'img/eicw/wfs-light.png';

        wfs2_link.href = 'img/eicw/wfs2-light.png';
        wfs2_img.src = 'img/eicw/wfs2-light.png';


        /* Videos */


    }


}

document.addEventListener('DOMContentLoaded', function () {
    var videos = document.querySelectorAll('video');
    videos.forEach(function (video) {
        video.play().catch(function (error) {
            console.log('Autoplay was prevented:', error);
        });
    });
});

document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});
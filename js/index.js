const darkThemeOptions = {
    scales: {
        x: {
            ticks: {
                color: '#ffffff' // X-axis labels color
            },
            grid: {
                color: '#444444' // X-axis grid lines color
            }
        },
        y: {
            ticks: {
                color: '#ffffff' // Y-axis labels color
            },
            grid: {
                color: '#444444' // Y-axis grid lines color
            }
        }
    },
    plugins: {
        legend: {
            labels: {
                color: '#ffffff' // Legend labels color
            }
        },
        tooltip: {
            backgroundColor: '#333333', // Tooltip background color
            titleColor: '#ffffff', // Tooltip title color
            bodyColor: '#ffffff' // Tooltip body color
        }
    }
};

const doverview24sm = document.getElementById('delays-overview-sm-24').getContext('2d');
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            beginAtZero: true
        }
    },
    plugins: {
        legend: {
            display: true
        }
    }
};

const doverviewsm24 = new Chart(doverview24sm, {
    type: 'line', // or 'bar', 'pie', etc.
    data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [{
            label: "SMRT Trains",
            data: [2, 2, 3, 3, 1],
            borderColor: 'rgb(207, 61, 61)',
            fill: true,
            backgroundColor: 'rgba(207, 61, 61,0.05)',
            borderWidth: 3
        },
        {
            label: "SBS Transit",
            data: [0, 1, 0, 0,0],
            borderColor: 'rgb(130, 71, 148)',
            fill: true,
            backgroundColor: 'rgba(130, 71, 148,0.05)',
            borderWidth: 3
        }]
    },
    options: chartOptions
});

function updateChartOptions(chart, isDarkMode) {
    const options = isDarkMode ? darkThemeOptions : {
        scales: {
            x: {
                ticks: {
                    color: '#000000' // X-axis labels color
                },
                grid: {
                    color: '#e0e0e0' // X-axis grid lines color
                }
            },
            y: {
                ticks: {
                    color: '#000000' // Y-axis labels color
                },
                grid: {
                    color: '#e0e0e0' // Y-axis grid lines color
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#000000' // Legend labels color
                }
            },
            tooltip: {
                backgroundColor: '#ffffff', // Tooltip background color
                titleColor: '#000000', // Tooltip title color
                bodyColor: '#000000' // Tooltip body color
            }
        }
    };
    chart.options = {
        ...chart.options,
        ...options
    };
    chart.update();
}



/* Dark Mode Functionality for Individual Pages */

// Check localStorage for dark mode preference
if (localStorage.getItem('dark-mode') === 'enabled') {
    document.body.classList.add('dark-mode');
    updateThemeIcon('dark');
    updateHrefForDarkMode();
    updateChartOptions(doverviewsm24, true);
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
    updateChartOptions(doverviewsm24, isDarkMode);

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
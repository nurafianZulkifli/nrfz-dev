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


/* ------------------------------------------ MKBF Data ------------------------------------------ */
/* SMRT - MRT */
const smrtMRT = document.getElementById('mkbf-smrt-mrt').getContext('2d');

const linesmrt = new Chart(smrtMRT, {
  type: 'line', // or 'bar', 'pie', etc.
  data: {
    labels: ["Sep-24", "Oct-24", "Nov-24", "Dec-24", "Jan-25", "Feb-25", "Mar-25", "Apr-25", "May-25", "Jun-25", "Jul-25", "Aug-25"],
    datasets: [{
      label: "NSL",
      data: [1418000, 1985000, 2483000, 2485000, 2480000, 2475000, 1981000, 1650000, 1413000, 1237000, 1413000, 1648000],
      borderColor: 'rgb(207, 61, 61)',
      fill: true,
      backgroundColor: 'rgba(207, 61, 61,0.05)',
      borderWidth: 3
    },

    {
      label: "EWL",
      data: [2024000, 1686000, 1687000, 1687000, 1444000, 1441000, 1682000, 1262000, 1441000, 1443000, 2021000, 1684000],
      borderColor: 'rgb(0, 154, 68)',
      fill: true,
      backgroundColor: 'rgba(0, 154, 68,0.05)',
      borderWidth: 3
    },

    {
      label: "CCL",
      data: [1040000, 1218000, 1221000, 919000, 921000, 1057000, 1063000, 1243000, 1067000, 1069000, 1067000, 1245000],
      borderColor: 'rgb(255, 160, 16)',
      fill: true,
      backgroundColor: 'rgba(255, 160, 16,0.05)',
      borderWidth: 3
    }]//
  },
  options: chartOptions
});


/* SMRT - LRT */
const smrtLRT = document.getElementById('mkbf-smrt-lrt').getContext('2d');

const lineslrt = new Chart(smrtLRT, {
  type: 'line', // or 'bar', 'pie', etc.
  data: {
labels: ["Sep-24", "Oct-24", "Nov-24", "Dec-24", "Jan-25", "Feb-25", "Mar-25", "Apr-25", "May-25", "Jun-25", "Jul-25", "Aug-25"],
    datasets: [{
      label: "BPLRT",
      data: [189000, 176000, 230000, 232000, 335000, 394000, 398000, 269000, 244000, 247000, 192000, 209000],
      borderColor: 'rgb(112, 133, 115)',
      fill: true,
      backgroundColor: 'rgba(112, 133, 115,0.05)',
      borderWidth: 3

    }],
  },
  options: chartOptions
});


/* SBST - MRT */
const sbstMRT = document.getElementById('mkbf-sbst-mrt').getContext('2d');

const linesbst = new Chart(sbstMRT, {
  type: 'line',
  data: {
labels: ["Sep-24", "Oct-24", "Nov-24", "Dec-24", "Jan-25", "Feb-25", "Mar-25", "Apr-25", "May-25", "Jun-25", "Jul-25", "Aug-25"],
    datasets: [{
      label: "NEL",
      data: [2050000, 2048000, 4091000, 4101000, 4110000, 4116000, 4136000, 4166000, 4191000, 4229000, 4262000, 2142000],
      borderColor: 'rgb(135, 24, 157)',
      fill: true,
      backgroundColor: 'rgba(135, 24, 157,0.05)',
      borderWidth: 3
    },

    {
      label: "DTL",
      data: [8112000, 8117000, 8120000, 8131000, 8139000, 8128000, 8156000, 2727000, 4100000, 4118000, 4131000, 2760000],
      borderColor: 'rgb(0, 87, 184)',
      fill: true,
      backgroundColor: 'rgba(0, 87, 184,0.05)',
      borderWidth: 3
    }],

  },
  options: chartOptions
});


/* SBST - LRT */
const sbstLRT = document.getElementById('mkbf-sbst-lrt').getContext('2d');

const lineslrt2 = new Chart(sbstLRT, {
  type: 'line',
  data: {
labels: ["Sep-24", "Oct-24", "Nov-24", "Dec-24", "Jan-25", "Feb-25", "Mar-25", "Apr-25", "May-25", "Jun-25", "Jul-25", "Aug-25"],
    datasets: [{
      label: "SKPG",
      data: [612000, 614000, 547000, 549000, 619000, 825000, 827000, 829000, 998000, 1252000, 1256000, 840000],
      borderColor: 'rgb(112, 133, 115)',
      fill: true,
      backgroundColor: 'rgba(112, 133, 115,0.05)',
      borderWidth: 3
    }],
  },
  options: chartOptions
});

/* ------------------------------------------ */

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

const allCharts = [linesmrt, lineslrt, linesbst, lineslrt2];

function isDarkModeEnabled() {
    return document.body.classList.contains('dark-mode');
}

function updateAllChartsTheme() {
    const dark = isDarkModeEnabled();
    allCharts.forEach(chart => updateChartOptions(chart, dark));
}

// Check localStorage for dark mode preference
if (localStorage.getItem('dark-mode') === 'enabled') {
    document.body.classList.add('dark-mode');
    updateThemeIcon('dark');
} else {
    document.body.classList.remove('dark-mode');
    updateThemeIcon('light');
}
updateAllChartsTheme();

// Get both toggle buttons
const toggleButtonDesktop = document.getElementById('dark-mode-toggle-desktop');
const toggleButtonMobile = document.getElementById('dark-mode-toggle-mobile');

// Function to toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const dark = isDarkModeEnabled();
    if (dark) {
        localStorage.setItem('dark-mode', 'enabled');
        updateThemeIcon('dark');
    } else {
        localStorage.setItem('dark-mode', 'disabled');
        updateThemeIcon('light');
    }
    updateAllChartsTheme(); // Update charts when theme changes
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
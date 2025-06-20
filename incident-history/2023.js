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
  ...darkThemeOptions,
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


/* ------------------------------------------ 2023 DO ------------------------------------------ */
/* SMRT - DO_23 */
const doverview23sm = document.getElementById('delays-overview-sm-23').getContext('2d');

const doverviewsm23 = new Chart(doverview23sm, {
  type: 'line', // or 'bar', 'pie', etc.
  data: {
    labels: ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [{
      label: "No. of Delays",
      data: [3,4,1,2,0,1,1,0,2,2],
      borderColor: 'rgb(207, 61, 61)',
      fill: true,
      backgroundColor: 'rgba(207, 61, 61,0.05)',
      borderWidth: 3
    }]//
  },
  options: chartOptions
});


/* SBST - DO_23 */
const doverview23sb = document.getElementById('delays-overview-sb-23').getContext('2d');

const doverviewsb23 = new Chart(doverview23sb, {
  type: 'line', // or 'bar', 'pie', etc.
  data: {
    labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [{
      label: "No. of Delays",
      data: [0,1,0,0,0,0,0,0,0],
      borderColor: 'rgb(130, 71, 148)',
      fill: true,
      backgroundColor: 'rgba(130, 71, 148,0.05)',
      borderWidth: 3
    }]//
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

// Check localStorage for dark mode preference
if (localStorage.getItem('dark-mode') === 'enabled') {
  document.body.classList.add('dark-mode');
  updateChartOptions(doverviewsm23, true);
  updateChartOptions(doverviewsb23, true);
}

const toggleButton = document.getElementById('dark-mode-toggle');
toggleButton.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');
  updateChartOptions(doverviewsm23, isDarkMode);
  updateChartOptions(doverviewsb23, isDarkMode);
  // Save the preference in localStorage
  if (isDarkMode) {
    localStorage.setItem('dark-mode', 'enabled');
  } else {
    localStorage.setItem('dark-mode', 'disabled');
  }
});
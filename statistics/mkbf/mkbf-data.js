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
    labels: ["2020", "2021", "2022", "2023", "Oct '23 - Sep '24"],
    datasets: [{
      label: "NSL",
      data: [1082000, 1976000, 1651000, 1409000, 1418000],
      borderColor: 'rgb(207, 61, 61)',
      fill: true,
      backgroundColor: 'rgba(207, 61, 61,0.05)',
      borderWidth: 3
    },

    {
      label: "EWL",
      data: [1258000, 1454000, 2038000, 3363000, 2027000],
      borderColor: 'rgb(0, 154, 68)',
      fill: true,
      backgroundColor: 'rgba(0, 154, 68,0.05)',
      borderWidth: 3
    },

    {
      label: "CCL",
      data: [1733000, 1826000, 1840000, 1209000, 1040000],
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
    labels: ["2020", "2021", "2022", "2023", "Oct '23 - Sep '24"],
    datasets: [{
      label: "BPLRT",
      data: [111000, 224000, 222000, 248000, 189000],
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
    labels: ["2020", "2021", "2022", "2023", "Oct '23 - Sep '24"],
    datasets: [{
      label: "NEL",
      data: [2040000,2064000,2064000,2063000,2050000],
      borderColor: 'rgb(135, 24, 157)',
      fill: true,
      backgroundColor: 'rgba(135, 24, 157,0.05)',
      borderWidth: 3
    },

    {
      label: "DTL",
      data: [2090000,4188000,4050000,8124000,8112000],
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
    labels: ["2020", "2021", "2022", "2023", "Oct '23 - Sep '24"],
    datasets: [{
      label: "SKPG",
      data: [426000,341000,438000,1217000,612000],
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

// Check localStorage for dark mode preference
if (localStorage.getItem('dark-mode') === 'enabled') {
  document.body.classList.add('dark-mode');
  updateChartOptions(linesmrt, true);
  updateChartOptions(lineslrt, true);
  updateChartOptions(linesbst, true);
  updateChartOptions(lineslrt2, true);
}

const toggleButton = document.getElementById('dark-mode-toggle');
toggleButton.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');
  updateChartOptions(linesmrt, isDarkMode);
  updateChartOptions(lineslrt, isDarkMode);
  updateChartOptions(linesbst, isDarkMode);
  updateChartOptions(lineslrt2, isDarkMode);
  // Save the preference in localStorage
  if (isDarkMode) {
    localStorage.setItem('dark-mode', 'enabled');
  } else {
    localStorage.setItem('dark-mode', 'disabled');
  }
});
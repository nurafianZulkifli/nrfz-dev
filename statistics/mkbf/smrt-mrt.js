
const smrtMRT = document.getElementById('mkbf-smrt-mrt').getContext('2d');

const linesmrt = new Chart(smrtMRT, {
  type: 'line',
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
      data: [1258000,1454000,2038000,3363000,2027000],
      borderColor: 'rgb(0, 154, 68)',
      fill: true,
      backgroundColor: 'rgba(0, 154, 68,0.05)',
      borderWidth: 3
    },

    {
      label: "CCL",
      data: [1733000,1826000,1840000,1209000,1040000],
      borderColor: 'rgb(255, 160, 16)',
      fill: true,
      backgroundColor: 'rgba(255, 160, 16,0.05)',
      borderWidth: 3
    }]//
  },




  options: {
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
      },
    }
  }
});
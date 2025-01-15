
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
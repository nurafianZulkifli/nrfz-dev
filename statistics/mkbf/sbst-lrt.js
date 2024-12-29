
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
        display: false
      },
    }
  }
});
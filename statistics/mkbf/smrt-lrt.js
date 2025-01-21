
const smrtLRT = document.getElementById('mkbf-smrt-lrt').getContext('2d');

const lineslrt = new Chart(smrtLRT, {
  type: 'line',
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
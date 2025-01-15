
const doverview25sb = document.getElementById('delays-overview-sb-25').getContext('2d');

const doverviewsb25 = new Chart(doverview25sb, {
  type: 'line',
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [{
      label: "No. of Delays",
      data: [0],
      borderColor: 'rgb(130, 71, 148)',
      fill: true,
      backgroundColor: 'rgba(130, 71, 148,0.05)',
      borderWidth: 3
    }]//
  },



  options: {
    responsive: true,
    maintainAspectRatio: false,
    
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
    }
  }
});
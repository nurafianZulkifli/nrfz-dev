
const doverview23sm = document.getElementById('delays-overview-sm-23').getContext('2d');

const doverviewsm23 = new Chart(doverview23sm, {
  type: 'line',
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
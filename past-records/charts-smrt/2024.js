
const doverview24sm = document.getElementById('delays-overview-sm-24').getContext('2d');

const doverviewsm24 = new Chart(doverview24sm, {
  type: 'line',
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [{
      label: "No. of Delays",
      data: [1,1,2,1,1,1,2,2,9,3,0,6],
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
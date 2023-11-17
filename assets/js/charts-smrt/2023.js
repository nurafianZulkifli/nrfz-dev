// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'DM Sans';
Chart.defaults.global.defaultFontColor = '#858796';



// Area Chart Example
var ctx = document.getElementById("delays-overview");
var myLineChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
    datasets: [{
      label: "Number of Delays",
      lineTension: 0.3,
      backgroundColor: "rgba(193, 205, 236, 0.05)",
      borderColor: "rgba(193, 205, 236, 1)",
      pointRadius: 3,
      pointBackgroundColor: "rgba(193, 205, 236, 1)",
      pointBorderColor: "rgba(193, 205, 236, 1)",
      pointHoverRadius: 3,
      pointHoverBackgroundColor: "rgba(193, 205, 236, 1)",
      pointHoverBorderColor: "rgba(193, 205, 236, 1)",
      pointHitRadius: 10,
      pointBorderWidth: 2,
      data: [3, 4, 1, 2, 0, 1, 1, 0, 2],
    }],
  },
  options: {
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 10,
        right: 25,
        top: 25,
        bottom: 0
      }
    },
    scales: {
      xAxes: [{
        time: {
          unit: 'date'
        },
        gridLines: {
          display: false,
          drawBorder: false
        },
        ticks: {
          maxTicksLimit: 12,
        }
      }],
      yAxes: [{
        gridLines: {
          color: "rgb(234, 236, 244)",
          zeroLineColor: "rgb(234, 236, 244)",
          drawBorder: false,
          borderDash: [2],
          zeroLineBorderDash: [2]
        },
        ticks: {
          stepSize: 1,
          beginAtZero: true,
        }
      }],
    },
    legend: {
      display: false
    },
    tooltips: {
      backgroundColor: "rgb(255,255,255)",
      bodyFontColor: "#858796",
      titleMarginBottom: 10,
      titleFontColor: '#6e707e',
      titleFontSize: 14,
      borderColor: '#dddfeb',
      borderWidth: 1,
      xPadding: 15,
      yPadding: 15,
      displayColors: false,
      intersect: false,
      mode: 'index',
      caretPadding: 10,
    }
  }
});

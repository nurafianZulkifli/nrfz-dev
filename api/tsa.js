

// Example: Fetching Train Service Alerts using fetch (for Node.js or server-side)
fetch('http://localhost:3000/api/tsa')
    .then(response => response.json())
.then(data => {
    const firstAlert = data.value && data.value[0];
    let alertDiv = document.createElement('div');
    alertDiv.classList.add('alert', 'wow', 'fadeInUp');
    alertDiv.setAttribute('data-wow-delay', '100ms');
    alertDiv.setAttribute('role', 'alert');
    alertDiv.style.marginBottom = '2em';
    alertDiv.style.cursor = 'default';

    if (firstAlert && firstAlert.Message && firstAlert.Message.trim() !== "") {
        alertDiv.classList.add('alert-danger');
        alertDiv.innerHTML = '<i class="fa-solid fa-circle-info"></i>&nbsp; <b>' + firstAlert.Message + '</b>';
    } else {
        alertDiv.classList.add('alert-success');
        alertDiv.innerHTML = '<i class="fa-solid fa-circle-info"></i>&nbsp; <b>Train service is running normally.</b>';
    }

    // Insert at the top of .row-lrd
    const rowLrd = document.querySelector('.row-lrd');
    if (rowLrd) {
        rowLrd.insertBefore(alertDiv, rowLrd.firstChild);
    }
})
.catch(error => {
    console.error('Error fetching train service alerts:', error);
});

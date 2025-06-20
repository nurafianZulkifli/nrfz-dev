

// Example: Fetching Train Service Alerts using fetch (for Node.js or server-side)
fetch('https://tsa-proxy-nurafian-b8e19d1412f4.herokuapp.com/api/tsa')
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
            alertDiv.classList.add('alert-warning');
            alertDiv.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>&nbsp; <b>' + firstAlert.Message + '</b>';

            // Map line codes to their card classes
            const lineMap = {
                'NSL': '.card-nsl .h5.font-weight-bold',
                'EWL': '.card-ewl .h5.font-weight-bold',
                'NEL': '.card-nel .h5.font-weight-bold',
                'CCL': '.card-ccl .h5.font-weight-bold',
                'DTL': '.card-dtl .h5.font-weight-bold',
                'TEL': '.card-tel .h5.font-weight-bold',
                'BPLRT': '.card-bplrt .h5.font-weight-bold',
                'SLRT': '.card-slrt .h5.font-weight-bold'
            };

            // Check each line code in the message and update the card if found
            Object.keys(lineMap).forEach(line => {
                if (firstAlert.Message.includes(line)) {
                    const statusElem = document.querySelector(lineMap[line]);
                    if (statusElem) {
                        statusElem.textContent = 'Degraded Service';
                        statusElem.classList.add('text-warning');
                    }
                }
            });
        } else {
            alertDiv.classList.add('alert-success');
            alertDiv.innerHTML = '<i class="fa-solid fa-circle-check"></i>&nbsp; <b>Train service is running normally.</b>';
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
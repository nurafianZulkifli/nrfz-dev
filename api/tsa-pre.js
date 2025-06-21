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
                'SKPGLRT': '.card-skpglrt .h5.font-weight-bold'
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













        // Define start and end times for each line
        const lineStartTimes = {
            'NSL': { hour: 5, minute: 30 },
            'EWL': { hour: 5, minute: 30 },
            'NEL': { hour: 5, minute: 45 },
            'CCL': { hour: 5, minute: 30 },
            'DTL': { hour: 5, minute: 45 },
            'TEL': { hour: 5, minute: 45 },
            'BPLRT': { hour: 5, minute: 30 },
            'SKPGLRT': { hour: 5, minute: 30 }
        };

        const lineEndTimes = {
            'NSL': { hour: 0, minute: 17 },
            'EWL': { hour: 0, minute: 25 },
            'NEL': { hour: 23, minute: 25 },
            'CCL': { hour: 23, minute: 0 },
            'DTL': { hour: 23, minute: 35 },
            'TEL': { hour: 0, minute: 6 },
            'BPLRT': { hour: 23, minute: 30 },
            'SKPGLRT': { hour: 0, minute: 50 }
        };

        const now = new Date();
        let allEnded = true;
        let allNotStarted = true;

        Object.keys(lineEndTimes).forEach(line => {
            const selector = `.card-${line.toLowerCase()} .h5.font-weight-bold`;
            const elem = document.querySelector(selector);
            if (elem) {
                const start = lineStartTimes[line];
                const end = lineEndTimes[line];

                // Build start and end times for today
                let startTime = new Date(now);
                startTime.setHours(start.hour, start.minute, 0, 0);
                let endTime = new Date(now);
                endTime.setHours(end.hour, end.minute, 0, 0);

                // If end time is before start time, endTime is next day
                if (endTime <= startTime) {
                    endTime.setDate(endTime.getDate() + 1);
                }

                if (now < startTime) {
                    elem.textContent = 'Train Service Not Started';
                    elem.classList.remove('text-warning', 'text-muted');
                    elem.classList.add('text-secondary');
                    allEnded = false;
                } else if (now >= endTime) {
                    elem.textContent = 'Train Service Ended';
                    elem.classList.remove('text-warning', 'text-secondary');
                    elem.classList.add('text-muted');
                    allNotStarted = false;
                } else {
                    // Service is running
                    allEnded = false;
                    allNotStarted = false;
                }
            }
        });

        // Show alert based on overall service status
        if (allEnded) {
            alertDiv.classList.add('alert-secondary');
            alertDiv.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>&nbsp; <b>Train services have ended for today.</b>';
        } else if (firstAlert && firstAlert.Message && firstAlert.Message.trim() !== "") {
            alertDiv.classList.add('alert-warning');
            alertDiv.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>&nbsp; <b>' + firstAlert.Message + '</b>';
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
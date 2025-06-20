

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

        // Insert at the top of .row-lrd
        const rowLrd = document.querySelector('.row-lrd');
        if (rowLrd) {
            rowLrd.insertBefore(alertDiv, rowLrd.firstChild);
        }

        // ---- Move the end time logic here ----
        const lineEndTimes = {
            'NSL': { hour: 0, minute: 17 },    // 12:17 AM
            'EWL': { hour: 0, minute: 25 },    // 12:25 AM
            'NEL': { hour: 23, minute: 25 },   // 11:25 PM
            'CCL': { hour: 23, minute: 0 },    // 11:00 PM
            'DTL': { hour: 23, minute: 35 },   // 11:35 PM
            'TEL': { hour: 0, minute: 6 },     // 12:06 AM
            'BPLRT': { hour: 23, minute: 30 }, // 11:30 PM
            'SKPGLRT': { hour: 0, minute: 50 }    // 12:50 AM
        };

        const now = new Date();
        Object.keys(lineEndTimes).forEach(line => {
            const selector = `.card-${line.toLowerCase()} .h5.font-weight-bold`;
            const elem = document.querySelector(selector);
            if (elem && elem.textContent.trim() === 'Normal Service') {
                const end = lineEndTimes[line];

                // Build end time for today
                let endTime = new Date(now);
                endTime.setHours(end.hour, end.minute, 0, 0);

                // If the end time is before now, mark as ended
                // Also, if the end time is before midnight (hour >= 12), and now is after midnight, mark as ended
                if (
                    now >= endTime ||
                    (end.hour >= 12 && now.getHours() < 12 && (
                        now.getTime() >= (new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)).getTime()
                    ))
                ) {
                    elem.textContent = 'Train Service Ended';
                    elem.classList.remove('text-warning');
                    elem.classList.add('text-muted');
                }
            }
        });
    })
    .catch(error => {
        console.error('Error fetching train service alerts:', error);
    });


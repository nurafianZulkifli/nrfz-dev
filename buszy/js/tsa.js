// Fetch train service alerts and update status icons (handles LTA API structure)
fetch('https://bat-lta-9eb7bbf231a2.herokuapp.com/train-service-alerts')
	.then(response => response.json())
	.then(data => {
		if (!data || !data.value || !Array.isArray(data.value)) return;
		// Map line names to codes used in your HTML
		const lineMap = {
			'North South Line': 'NSL',
			'East West Line': 'EWL',
			'Circle Line': 'CCL',
			'Downtown Line': 'DTL',
			'Thomson-East Coast Line': 'TEL',
			'North East Line': 'NEL',
			'Light Rail Transit': 'LRT'
		};
		data.value.forEach(alert => {
			if (alert.Status === 1) {
				// Try to extract line name from message content
				let foundLine = null;
				if (alert.Message && Array.isArray(alert.Message) && alert.Message.length > 0) {
					const msg = alert.Message[0].Content || '';
					for (const [lineName, code] of Object.entries(lineMap)) {
						if (msg.includes(lineName) || msg.includes(code)) {
							foundLine = code;
							break;
						}
					}
				}
				if (foundLine) {
					const items = document.querySelectorAll('.custom-list-item');
					items.forEach(item => {
						const label = item.querySelector('.line-label');
						if (label && label.textContent.trim() === foundLine) {
							const icon = item.querySelector('.status-icon');
							if (icon) {
								icon.style.background = '#ffb300'; // amber
								icon.innerHTML = '&#9888;'; // warning sign
							}
						}
					});
				}
			}
		});
	})
	.catch(err => { /* Optionally handle error */ });

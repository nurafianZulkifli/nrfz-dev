// Example data: 1 = up, 0 = down (customize as needed)
const uptimeData90 = [

    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, /* 18 Feb to 28 Feb */

    /* 1 Mar to 31 Mar */
    1, 1, 1, 1, 0, 1, 1, 1, 1, 1,
    1, 0, 1, 0, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,

    /* 1 Apr to 30 Apr */
    1, 1, 1, 0, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 0, 1, 1, 1, 1,
    1, 1, 0, 1, 1, 1, 1, 1, 1, 1,

    /* 1 May to 18 May */
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    0, 1, 1, 1, 1, 1, 1, 1, 1
];
const uptimeData30 = uptimeData90.slice(-30);

function renderUptimeBars(containerSelector, data, startDate) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    container.innerHTML = '';
    let date = new Date(startDate);

    // Example: Array of URLs for each day (must match uptimeData90.length)
    const incidentUrls = [
        '', '', '', '', '', '', '', '', '', '', // 18 Feb to 28 Feb (all up)
        '', // 28 Feb

        // 1 Mar to 31 Mar
        '', '', '', '', 'https://x.com/SMRT_Singapore/status/1897197246871167416', '', '', '', '', '',
        '', 'https://x.com/SMRT_Singapore/status/1899576519300899093', '', 'https://x.com/SMRT_Singapore/status/1900502980346143157', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '', '', '',

        // 1 Apr to 30 Apr
        '', '', '', 'https://x.com/SMRT_Singapore/status/1897197246871167419', '', '', '', '', '', '',
        '', '', '', '', '', 'https://x.com/SMRT_Singapore/status/1897197246871167420', '', '', '', '',
        '', '', 'https://x.com/SMRT_Singapore/status/1914816349135888488', '', '', '', '', '', '',

        // 1 May to 18 May
        '', '', '', '', '', '', '', '', '', '',
        'https://x.com/SMRT_Singapore/status/1921451426167062994', '', '', '', '', '', '', '', ''
    ];
    // Make sure incidentUrls.length === uptimeData90.length

    data.forEach((status, i) => {
        // Format date as DD/MM/YYYY
        const d = new Date(date);
        d.setDate(date.getDate() + i);
        const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        const isUp = status === 1;

        // Create the bar
        const bar = document.createElement('div');
        bar.className = 'uptime-bar ' + (isUp ? 'up' : 'down');
        bar.tabIndex = 0;

        if (!isUp) {
            // Only wrap "down" bars in a link
            const link = document.createElement('a');
            // Use the external URL for this bar, or fallback to a default
            link.href = incidentUrls[i] || `https://external.site/incident/${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.title = `${dateStr}: Incident`;
            link.style.display = 'flex';
            link.style.flex = '1 1 0';
            link.style.minWidth = '0';
            link.appendChild(bar);
            container.appendChild(link);
        } else {
            // "Up" bars are just divs, but still flex items
            bar.style.flex = '1 1 0';
            bar.style.minWidth = '0';
            container.appendChild(bar);
        }
    });
}

// Get the start date from the data-date attribute in the HTML
const dataDateElem = document.querySelector('[data-date]');
let startDate90;
if (dataDateElem && dataDateElem.getAttribute('data-date')) {
    // Set start date to 89 days before the data-date (so the last bar is the data-date)
    const endDate = new Date(dataDateElem.getAttribute('data-date'));
    startDate90 = new Date(endDate);
    startDate90.setDate(endDate.getDate() - (uptimeData90.length - 1));
} else {
    // Fallback: use today
    startDate90 = new Date();
    startDate90.setDate(startDate90.getDate() - (uptimeData90.length - 1));
}

// Usage example:
renderUptimeBars('.uptime-bars-90', uptimeData90, startDate90);
renderUptimeBars('.uptime-bars-30', uptimeData30, new Date(startDate90.getTime() + (uptimeData90.length - uptimeData30.length) * 24 * 60 * 60 * 1000));

document.addEventListener('DOMContentLoaded', function () {
    renderUptimeBars('.uptime-bars-90', uptimeData90, startDate90);
    renderUptimeBars('.uptime-bars-30', uptimeData30, new Date(today.setDate(today.getDate() - 29)));

    // Responsive label for "days ago"
    function updateDaysLabel() {
        const label = document.getElementById('uptime-days-label');
        if (!label) return;
        if (window.innerWidth <= 600) {
            label.textContent = '30 days ago';
        } else {
            label.textContent = '90 days ago';
        }
    }
    updateDaysLabel();
    window.addEventListener('resize', updateDaysLabel);
});

const uptimeData90 = [
    // 90 values: 1 for up, 0 for down, oldest to newest (first = 89 days ago, last = today or data-date)
    1,1,1,1,1,1,1,1,1,1, // 10
    1,1,1,1,0,1,1,1,1,1, // 20 (15th is down)
    1,0,1,0,1,1,1,1,1,1, // 30 (21st, 23rd down)
    1,1,1,1,1,1,1,1,1,1, // 40
    1,1,1,0,1,1,1,1,1,1, // 50 (44th down)
    1,1,1,1,1,0,1,1,1,1, // 60 (55th down)
    1,1,0,1,1,1,1,1,1,1, // 70 (62nd down)
    1,1,1,1,1,1,1,1,1,1, // 80
    0,1,1,1,1,1,1,1,1,1  // 90 (81st down)
];
const uptimeData30 = uptimeData90.slice(-30);

function renderUptimeBars(containerSelector, data, startDate) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    container.innerHTML = '';
    let date = new Date(startDate);

const incidentUrls = [
    // 90 values: '' for up days, URL for down days, order matches uptimeData90
    '', '', '', '', '', '', '', '', '', '', // 10
    '', '', '', '', 'https://x.com/SMRT_Singapore/status/1897197246871167416', '', '', '', '', '', // 20
    '', 'https://x.com/SMRT_Singapore/status/1899576519300899093', '', 'https://x.com/SMRT_Singapore/status/1900502980346143157', '', '', '', '', '', '', // 30
    '', '', '', '', '', '', '', '', '', '', // 40
    '', '', '', 'https://x.com/SMRT_Singapore/status/1908029621167382639', '', '', '', '', '', '', // 50
    '', '', '', '', '', 'https://x.com/SMRT_Singapore/status/1912346685872988215', '', '', '', '', // 60
    '', '', 'https://x.com/SMRT_Singapore/status/1914816349135888488', '', '', '', '', '', '', '', // 70
    '', '', '', '', '', '', '', '', '', '', // 80
    'https://x.com/SMRT_Singapore/status/1921451426167062994', '', '', '', '', '', '', '', '', ''  // 90
];


data.forEach((status, i) => {
    // Always use a fresh date object for each bar, and add i days
    const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
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
    // Set start date so the last bar is the data-date
    const endDate = new Date(dataDateElem.getAttribute('data-date'));
    startDate90 = new Date(endDate);
    startDate90.setDate(endDate.getDate() - uptimeData90.length + 2);
} else {
    // Fallback: use today
    startDate90 = new Date();
    startDate90.setDate(startDate90.getDate() - uptimeData90.length + 2);
}

// Calculate start date for 30-day chart
let startDate30 = new Date(startDate90);
startDate30.setDate(startDate90.getDate() + (uptimeData90.length - uptimeData30.length));

// Only render once DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    renderUptimeBars('.uptime-bars-90', uptimeData90, startDate90);
    renderUptimeBars('.uptime-bars-30', uptimeData30, startDate30);

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
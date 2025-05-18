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

    /* 1 Apr to 18 May */
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    0, 1, 1, 1, 1, 1, 1, 1, 1
];
const uptimeData30 = uptimeData90.slice(-30);

function renderUptimeBars(containerSelector, data, startDate) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    container.innerHTML = '';
    let date = new Date(startDate);
    data.forEach((status, i) => {
        // Format date as DD/MM/YYYY
        const d = new Date(date);
        d.setDate(date.getDate() + i);
        const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        const isUp = status === 1;
        const bar = document.createElement('div');
        bar.className = 'uptime-bar ' + (isUp ? 'up' : 'down');
        bar.tabIndex = 0;
        const tooltip = document.createElement('span');
        tooltip.className = 'uptime-tooltip';
        tooltip.textContent = `${dateStr}: ${isUp ? '100% uptime' : 'Delays Reported'}`;
        bar.appendChild(tooltip);
        container.appendChild(bar);
    });
}

// Set your start date (90 days ago)
const today = new Date();
const startDate90 = new Date(today);
startDate90.setDate(today.getDate() - 89);

document.addEventListener('DOMContentLoaded', function () {
    renderUptimeBars('.uptime-bars-90', uptimeData90, startDate90);
    renderUptimeBars('.uptime-bars-30', uptimeData30, new Date(today.setDate(today.getDate() - 29)));
});

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
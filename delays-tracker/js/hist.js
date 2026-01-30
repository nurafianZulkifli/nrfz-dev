

// Load disruption cards

let disruptionsData = [];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function renderMonthLabel() {
  const monthLabel = document.getElementById('month-label');
  const date = new Date(currentYear, currentMonth);
  monthLabel.textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

function renderDisruptionsByMonth() {
  const container = document.getElementById('disruption-cards');
  container.innerHTML = '';
  disruptionsData
          .filter(item => {
            const startDate = new Date(item.start);
            return startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear;
          })
    .forEach(item => {
      const card = document.createElement('div');
      card.className = 'disruption-card';
      // Determine status icon and class based on item.title
      let statusIcon = '';
      let statusClass = '';
      if (item.title && item.title.toLowerCase().includes('major')) {
        statusIcon = '<i class="fa-solid fa-diamond-exclamation"></i>';
        statusClass = 'status-major';
      } else if (item.title && item.title.toLowerCase().includes('minor')) {
        statusIcon = '<i class="fa-solid fa-triangle-exclamation"></i>';
        statusClass = 'status-minor';
      } else {
        statusIcon = '<i class="fa-solid fa-triangle-exclamation"></i>';
        statusClass = 'status-minor';
      }
      // Status icon for resolved/ongoing
      let resolvedIcon = '';
      if (item.status === 'Resolved') {
        resolvedIcon = '<i class="fa-regular fa-circle-check"></i>';
      } else {
        resolvedIcon = '<i class="fa-solid fa-circle fa-beat"></i>';
      }
      // Prepare from-to pairs for multiple routes
      let fromArr = Array.isArray(item.from) ? item.from : [item.from];
      let toArr = Array.isArray(item.to) ? item.to : [item.to];
      let routeBadges = '';
      for (let i = 0; i < Math.max(fromArr.length, toArr.length); i++) {
        let from = fromArr[i] || '';
        let to = toArr[i] || '';
        routeBadges += `
          <span class="route-badge">
            <span class="line-badge line-label ${item.line ? item.line.toLowerCase() : ''}">${item.line}</span>
            <span class="route">${from} ⇄ ${to}</span>
          </span>
        `;
      }
      card.innerHTML = `
        <div class="card-header">
          <span class="${statusClass}">${statusIcon}</span>
          <span class="type">${item.type}</span>
          <span class="status ${item.status === 'Resolved' ? 'resolved' : 'ongoing'}">${resolvedIcon} ${item.status}</span>
        </div>
        <div class="card-title">${item.title}</div>
        <div class="card-details-multi">${routeBadges}</div>
        <div class="card-time">
          ${new Date(item.start).toLocaleDateString()} - ${new Date(item.end).toLocaleDateString()}
        </div>
        <div class="card-tags">
          ${(item.tags || []).map(tag => `<span class="card-tag tag-${tag.toLowerCase().replace(/\s+/g, '-')}">${tag}</span>`).join(' ')}
        </div>
      `;
      container.appendChild(card);
    });
}

function changeMonth(offset) {
  currentMonth += offset;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderMonthLabel();
  renderDisruptionsByMonth();
}

document.addEventListener('DOMContentLoaded', function() {
  fetch('delays.json')
    .then(response => response.json())
    .then(data => {
      disruptionsData = data;
      renderMonthLabel();
      renderDisruptionsByMonth();
    });

  document.getElementById('prev-month').addEventListener('click', function() {
    changeMonth(-1);
  });
  document.getElementById('next-month').addEventListener('click', function() {
    changeMonth(1);
  });
});
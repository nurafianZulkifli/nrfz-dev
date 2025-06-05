 // Incident data: { 'YYYY-MM-DD': { line: 'NSL'|'CCL', url: '...', desc: '...' } }
  const incidentData = {
    '2025-05-11': { line: 'NSL', url: 'https://x.com/SMRT_Singapore/status/1921451426167062994', desc: 'NSL: Track point fault' },
    '2025-05-16': { line: 'NSL', url: 'https://x.com/SMRT_Singapore/status/1912346685872988215', desc: 'NSL: Track fault' },
    '2025-05-20': { line: 'CCL', url: 'https://x.com/SMRT_Singapore/status/1924622824381325381', desc: 'CCL: Train fault' },
    // Example for previous month
    '2025-04-23': { line: 'EWL', url: 'https://x.com/SMRT_Singapore/status/1914816349135888488', desc: 'EWL: Track point fault' },
    '2025-04-16': { line: 'NSL', url: 'https://x.com/SMRT_Singapore/status/1912346685872988215', desc: 'NSL: Track fault' },
    // Add more as needed
  };

  // Badge color by line
  const lineBadge = {
    'NSL': 'bg-danger',
    'CCL': 'bg-warning text-dark',
    'EWL': 'bg-success',
    'NEL': 'bg-purple text-light',
    'DTL': 'bg-info text-dark',
    'TEL': 'bg-brown text-light',
    'LRT': 'bg-secondary'
  };

  // Calendar state
  let calendarMonth = 4; // 0-based: 4 = May
  let calendarYear = 2025;

  function renderCalendar(month, year) {
    const tbody = document.querySelector('#incident-calendar tbody');
    tbody.innerHTML = '';
    const monthLabel = document.getElementById('calendar-month-label');
    const date = new Date(year, month, 1);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    monthLabel.textContent = `${monthNames[month]} ${year}`;

    const firstDay = date.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let row = document.createElement('tr');
    // Fill initial empty cells
    for (let i = 0; i < firstDay; i++) {
      row.appendChild(document.createElement('td'));
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement('td');
      cell.style.height = '';
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cell.textContent = day;
      if (incidentData[dateStr]) {
        const incident = incidentData[dateStr];
        const badgeClass = lineBadge[incident.line] || 'bg-secondary';
        cell.innerHTML = `${day}<br>
          <a href="${incident.url}" title="${incident.desc}">
            <span class="badge ${badgeClass}">${incident.line}</span>
          </a>`;
      }
      row.appendChild(cell);
      // If Saturday, start new row
      if ((firstDay + day - 1) % 7 === 6) {
        tbody.appendChild(row);
        row = document.createElement('tr');
      }
    }
    // Fill trailing empty cells
    if (row.children.length > 0) {
      while (row.children.length < 7) {
        row.appendChild(document.createElement('td'));
      }
      tbody.appendChild(row);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderCalendar(calendarMonth, calendarYear);

    document.getElementById('calendar-prev').addEventListener('click', function () {
      calendarMonth--;
      if (calendarMonth < 0) {
        calendarMonth = 11;
        calendarYear--;
      }
      renderCalendar(calendarMonth, calendarYear);
    });

    document.getElementById('calendar-next').addEventListener('click', function () {
      calendarMonth++;
      if (calendarMonth > 11) {
        calendarMonth = 0;
        calendarYear++;
      }
      renderCalendar(calendarMonth, calendarYear);
    });
  });
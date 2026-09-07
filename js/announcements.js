// Render announcements shared by Buszy and Rail Buddy.
(function loadSharedAnnouncements() {
    const list = document.querySelector('.announcements-list');
    if (!list) return;

    const app = window.location.pathname.includes('/rail-buddy/') ? 'rail-buddy' : 'buszy';

    fetch('../announcements.json')
        .then(response => {
            if (!response.ok) throw new Error(`Announcements request failed: ${response.status}`);
            return response.json();
        })
        .then(announcements => {
            list.replaceChildren();

            announcements
                .filter(announcement => !announcement.audiences || announcement.audiences.includes(app))
                .forEach(announcement => {
                const item = document.createElement('a');
                item.href = announcement.href;
                item.className = 'list-group-item list-group-item-action flex-column align-items-start';
                item.dataset.annId = announcement.id;
                item.dataset.annDate = announcement.date;

                const headingRow = document.createElement('div');
                headingRow.className = 'd-flex';
                const headingContent = document.createElement('div');
                const heading = document.createElement('h5');
                heading.className = 'lg-ann';
                const icon = document.createElement('i');
                icon.className = announcement.icon;
                heading.append(icon, ` ${announcement.title}`);

                const badge = document.createElement('span');
                badge.className = 'ann-badge-container';
                heading.appendChild(badge);
                headingContent.appendChild(heading);

                const date = document.createElement('small');
                date.className = 'lg-date';
                date.textContent = announcement.dateLabel;
                headingContent.appendChild(date);
                headingRow.appendChild(headingContent);

                const body = document.createElement('p');
                body.className = 'mb-1';
                body.style.cursor = 'pointer';
                body.textContent = announcement.body;

                item.append(headingRow, body);
                list.appendChild(item);
            });

            document.dispatchEvent(new CustomEvent('sharedAnnouncementsLoaded'));
        })
        .catch(error => {
            console.error('Failed to load shared announcements:', error);
            list.innerHTML = '<div class="fetch">Unable to load announcements. Please try again later.</div>';
        });
})();

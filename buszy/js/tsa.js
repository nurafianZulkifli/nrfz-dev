// Ensure DOM is loaded before running script
document.addEventListener('DOMContentLoaded', function() {
  fetch('https://bat-lta-9eb7bbf231a2.herokuapp.com/train-service-alerts')
    .then(response => response.json())
    .then(data => {
      if (!data || !data.value) return;
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
      // Support both array and object for value
      let alerts = [];
      if (Array.isArray(data.value)) {
        alerts = data.value;
      } else if (typeof data.value === 'object') {
        alerts = [data.value];
      }
      alerts.forEach(alert => {
        if (alert.Status === 1) {
          let foundLine = null;
          let foundMsg = '';
          if (alert.Message && Array.isArray(alert.Message) && alert.Message.length > 0) {
            const msg = alert.Message[0].Content || '';
            foundMsg = msg;
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
                  icon.style.color = '#000';
                }
                // Show alert message below the item if not already present
                if (foundMsg && !item.nextElementSibling?.classList.contains('alert-message-box')) {
                  const msgBox = document.createElement('div');
                  msgBox.className = 'alert-message-box';
                  msgBox.innerHTML = `<span class="alert-message-content">${foundMsg.replace(/\n/g, '<br>')}</span>`;
                  item.parentNode.insertBefore(msgBox, item.nextSibling);
                }
              }
            });
          }
        }
      });
    // Add styles for alert message box
    const style = document.createElement('style');
    style.innerHTML = `
    .alert-message-box {
      background: #fff;
      border-radius: 28px;
      margin: 0 0 32px 0;
      padding: 24px 28px;
      font-size: 1.08em;
      color: #222;
      box-shadow: 0 2px 8px 0 rgba(0,0,0,0.04);
      max-width: 90vw;
      word-break: break-word;
    }
    .alert-message-content {
      display: block;
      white-space: pre-line;
    }
    `;
    document.head.appendChild(style);
    })
    .catch(err => { /* Optionally handle error */ });
});

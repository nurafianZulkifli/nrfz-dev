document.querySelectorAll('.uptime-bar').forEach(bar => {
    bar.addEventListener('mouseenter', function () {
        const tooltip = bar.querySelector('.uptime-tooltip');
        if (!tooltip) return;

        // Reset to default
        tooltip.style.left = '50%';
        tooltip.style.right = '';
        tooltip.style.transform = 'translateX(-50%)';

        // Wait for tooltip to render
        setTimeout(() => {
            const rect = tooltip.getBoundingClientRect();
            const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);

            // If tooltip goes off the left edge
            if (rect.left < 4) {
                tooltip.style.left = '0';
                tooltip.style.right = '';
                tooltip.style.transform = 'translateX(0)';
            }
            // If tooltip goes off the right edge
            else if (rect.right > vw - 4) {
                tooltip.style.left = '';
                tooltip.style.right = '0';
                tooltip.style.transform = 'translateX(0)';
            }
        }, 10);
    });

    // Reset on mouseleave/focusout
    bar.addEventListener('mouseleave', function () {
        const tooltip = bar.querySelector('.uptime-tooltip');
        if (!tooltip) return;
        tooltip.style.left = '50%';
        tooltip.style.right = '';
        tooltip.style.transform = 'translateX(-50%)';
    });
    bar.addEventListener('focusout', function () {
        const tooltip = bar.querySelector('.uptime-tooltip');
        if (!tooltip) return;
        tooltip.style.left = '50%';
        tooltip.style.right = '';
        tooltip.style.transform = 'translateX(-50%)';
    });
});
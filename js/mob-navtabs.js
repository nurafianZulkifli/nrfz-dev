        // (part of Version 7 Redesign) Collapse desktop navigation labels on scroll down.
        (function () {
            var navbar = document.querySelector('.navbar-container');
            if (!navbar) return;
            var lastScrollY = window.scrollY;

            function updateNavbar() {
                var currentScrollY = window.scrollY;
                if (currentScrollY <= 50 || currentScrollY < lastScrollY - 4) {
                    navbar.classList.remove('scrolled');
                } else if (currentScrollY > lastScrollY + 4) {
                    navbar.classList.add('scrolled');
                }
                lastScrollY = currentScrollY;
            }

            updateNavbar();
            window.addEventListener('scroll', updateNavbar, { passive: true });
        })();

      // (part of Version 7 Redesign) Collapse mobile navigation labels based on scroll direction.
        (function () {
            var lastScrollY = window.scrollY;
            var nav = document.querySelector('.mobile-bottom-nav');
            var ticking = false;

            function onScroll() {
                var currentScrollY = window.scrollY;
                if (!nav) return;
                if (window.innerWidth > 994) return;
                if (currentScrollY > lastScrollY + 4) {
                    // Scrolling down
                    nav.classList.add('labels-hidden');
                } else if (currentScrollY < lastScrollY - 4) {
                    // Scrolling up
                    nav.classList.remove('labels-hidden');
                }
                lastScrollY = currentScrollY;
            }

            window.addEventListener('scroll', function () {
                if (!ticking) {
                    window.requestAnimationFrame(function () {
                        onScroll();
                        ticking = false;
                    });
                    ticking = true;
                }
            });

            // Reset nav position on resize
            window.addEventListener('resize', function () {
                if (window.innerWidth > 994 && nav) {
                    nav.classList.remove('labels-hidden');
                }
            });
        })();

        // Toggle .at-top class based on scroll position
        function updateBreadcrumbAtTop() {
            var bc = document.getElementById('floating-breadcrumb');
            if (!bc) return;
            if (window.scrollY <= 0) {
                bc.classList.add('at-top');
            } else {
                bc.classList.remove('at-top');
            }
        }
        window.addEventListener('scroll', updateBreadcrumbAtTop);
        window.addEventListener('DOMContentLoaded', updateBreadcrumbAtTop);

// Haptic feedback on tap for interactive elements (mobile only)
(function () {
    if (!navigator.vibrate) return;

    const HAPTIC_SHORT = 8;   // buttons, links
    const HAPTIC_MEDIUM = 18; // nav items, dropdowns

    const selector = [
        'a',
        'button',
        '[role="button"]',
        '.nav-link',
        '.mobile-bottom-nav a',
        '.eicw-nav-btn',
        '.eicw-nav-menu a',
        'summary',
        '.list-group-item',
        '.eicw-collapsible summary',
    ].join(',');

    document.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'touch') return;
        const target = e.target.closest(selector);
        if (!target) return;

        const isMedium =
            target.closest('.mobile-bottom-nav') ||
            target.classList.contains('eicw-nav-btn') ||
            target.tagName === 'SUMMARY';

        navigator.vibrate(isMedium ? HAPTIC_MEDIUM : HAPTIC_SHORT);
    }, { passive: true });
})();
//script for tabs
jQuery().ready(function () {
    initTabs($(".tabs"));
});

function initTabs(tabs) {
    shiftSelector(tabs);

    $(window).resize(function () {
        shiftSelector(tabs);
    });

    tabs.on("click", "a", function (e) {
        e.preventDefault();
        tabs.find("a").removeClass("active");
        $(this).addClass("active");

        shiftSelector(tabs);
    });
}

function shiftSelector(tabs) {
    let activeItem = tabs.find(".active");
    let activeWidth = activeItem.innerWidth();
    let activeHeight = activeItem.innerHeight();
    let itemPos = activeItem.position();
    tabs.find(".selector").css({
        left: itemPos.left + "px",
        width: activeWidth + "px",
        height: activeHeight + "px",
        top: itemPos.top + "px"
    });

    let activeBody = $(".tabs .active").attr("data-body");
    $(".tab-body > section").hide();
    $("." + activeBody).show(); // Replaced fadeIn() with show() to remove animation
}


document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('nav.tabs a');

    tabs.forEach(tab => {
        tab.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default anchor behavior
            const href = tab.getAttribute('href');
            const dataBody = tab.getAttribute('data-body');

            // Redirect to the href or data-body if available
            if (dataBody) {
                window.location.href = dataBody;
            } else if (href) {
                window.location.href = href;
            }
        });
    });
});


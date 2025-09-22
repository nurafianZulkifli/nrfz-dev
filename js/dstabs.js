const tabsBox = document.querySelector(".tabs-box"),
allTabs = tabsBox.querySelectorAll(".tab"),
arrowIcons = document.querySelectorAll(".icon i");
let isDragging = false, startX, startScrollLeft;

const handleIcons = (scrollVal) => {
    let maxScrollableWidth = tabsBox.scrollWidth - tabsBox.clientWidth;
    arrowIcons[0].parentElement.style.display = scrollVal <= 0 ? "none" : "flex";
    arrowIcons[1].parentElement.style.display = maxScrollableWidth - scrollVal <= 1 ? "none" : "flex";
};

arrowIcons.forEach(icon => {
    icon.addEventListener("click", () => {
        // if clicked icon is left, reduce 350 from tabsBox scrollLeft else add
        let scrollWidth = tabsBox.scrollLeft += icon.id === "left" ? -340 : 340;
        handleIcons(scrollWidth);
    });
});

allTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabsBox.querySelector(".active").classList.remove("active");
        tab.classList.add("active");
    });
});

const dragging = (e) => {
    if (!isDragging) return;
    tabsBox.classList.add("dragging");
    const movementX = e.type === "mousemove" ? e.movementX : e.touches[0].clientX - startX;
    tabsBox.scrollLeft -= movementX;
    startX = e.type === "touchmove" ? e.touches[0].clientX : startX;
    handleIcons(tabsBox.scrollLeft);
};

const dragStart = (e) => {
    isDragging = true;
    tabsBox.classList.add("dragging");
    startX = e.type === "mousedown" ? e.pageX : e.touches[0].clientX;
    startScrollLeft = tabsBox.scrollLeft;
};

const dragStop = () => {
    isDragging = false;
    tabsBox.classList.remove("dragging");
};

tabsBox.addEventListener("mousedown", dragStart);
tabsBox.addEventListener("mousemove", dragging);
document.addEventListener("mouseup", dragStop);

// Add touch event listeners for mobile
tabsBox.addEventListener("touchstart", dragStart);
tabsBox.addEventListener("touchmove", dragging);
tabsBox.addEventListener("touchend", dragStop);
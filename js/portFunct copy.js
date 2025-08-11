document.addEventListener("DOMContentLoaded", function () {
        // Initialize Isotope
    const portfolioContainer = document.querySelector(".pw-portfolio");
    const iso = new Isotope(portfolioContainer, {
        itemSelector: ".single_gallery_item",
        layoutMode: "fitRows",
        getSortData: {
            year: function (itemElem) {
                const dateStr = itemElem.getAttribute("data-date");
                if (!dateStr) return 0;
                const parts = dateStr.split("-");
                if (parts.length !== 2) return 0;
                return parseInt(parts[0] + parts[1]);
            },
            title: ".hover-content-blog h4",
        },
        percentPosition: true // Add this line for better grid alignment
    });

    // Recalculate Isotope layout after images load
    imagesLoaded(portfolioContainer, function () {
        iso.arrange(); // Use arrange instead of layout for full recalculation
    });

    // Recalculate Isotope layout after window resize
    $(window).on('resize', function () {
        iso.arrange();
    });

    // Filter functionality
    const filterButtons = document.querySelectorAll(".btn-filter");
    filterButtons.forEach((button) => {
        button.addEventListener("click", function () {
            // Remove active class from all buttons
            filterButtons.forEach((btn) => btn.classList.remove("active"));
            // Add active class to the clicked button
            this.classList.add("active");

            // Get the filter value from the button
            const filterValue = this.getAttribute("data-filter");
            // Apply the filter
            iso.arrange({ filter: filterValue });
        });
    });

    // Sort functionality
    const sortSelect = document.getElementById("sort-options");
    if (sortSelect) {
        sortSelect.addEventListener("change", function () {
            const sortValue = this.value;

            if (sortValue === "newest") {
                iso.arrange({ sortBy: "year", sortAscending: false }); // Sort by year descending
            } else if (sortValue === "oldest") {
                iso.arrange({ sortBy: "year", sortAscending: true }); // Sort by year ascending
            } else if (sortValue === "alphabetical") {
                iso.arrange({ sortBy: "title", sortAscending: true }); // Sort by title alphabetically
            } else {
                iso.arrange({ sortBy: "original-order" }); // Default order
            }
        });

        // Show newest items on load
        sortSelect.value = "newest";
        iso.arrange({ sortBy: "year", sortAscending: false });
    }
});

//Dynamic Title Update
document.addEventListener("DOMContentLoaded", function () {
    const filterButtons = document.querySelectorAll(".btn-filter");
    const titleElement = document.getElementById("filter-title");

    filterButtons.forEach((button) => {
        button.addEventListener("click", function () {
            // Get the filter text from the button
            const filterText = this.textContent.trim();
            // Update the title
            titleElement.textContent = filterText;
        });
    });
});
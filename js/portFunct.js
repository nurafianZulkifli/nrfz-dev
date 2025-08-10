document.addEventListener("DOMContentLoaded", function () {
    // Initialize Isotope
    const portfolioContainer = document.querySelector(".pw-portfolio");
    const iso = new Isotope(portfolioContainer, {
        itemSelector: ".single_gallery_item",
        layoutMode: "fitRows",
        getSortData: {
            year: "[data-year] parseInt", // Sort by year (numeric value from data-year attribute)
            title: ".hover-content-blog h4", // Sort by title (text inside h4 in hover-content-blog)
        },
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
    }
});

// Sort portfolio items by data-year and data-date on page load
$(document).ready(function () {
    var $portfolio = $('.pw-portfolio');
    var $items = $portfolio.find('.single_gallery_item');

    $items.sort(function (a, b) {
        // Get year and date, fallback to 0 if missing
        var yearA = parseInt($(a).data('year')) || 0;
        var yearB = parseInt($(b).data('year')) || 0;
        var dateA = $(a).data('date') ? parseInt($(a).data('date').replace('-', '')) : 0;
        var dateB = $(b).data('date') ? parseInt($(b).data('date').replace('-', '')) : 0;

        // Sort by year descending, then date descending
        if (yearB !== yearA) {
            return yearB - yearA;
        }
        return dateB - dateA;
    }).appendTo($portfolio);
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
document.addEventListener("DOMContentLoaded", function () {
    // Initialize Isotope
    const portfolioContainer = document.querySelector(".pw-portfolio");
    const iso = new Isotope(portfolioContainer, {
      itemSelector: ".single_gallery_item",
      layoutMode: "fitRows",
      getSortData: {
        year: "[data-year] parseInt", // Sort by year
        title: ".hover-content h4", // Sort by title
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

        // Get the filter value and apply it
        const filterValue = this.getAttribute("data-filter");
        iso.arrange({ filter: filterValue });
      });
    });

    // Sort functionality
    const sortSelect = document.getElementById("sort-options");
    sortSelect.addEventListener("change", function () {
      const sortValue = this.value;
      let sortBy = "original-order"; // Default sorting

      if (sortValue === "newest") {
        sortBy = "year";
        iso.arrange({ sortBy, sortAscending: false }); // Descending order
      } else if (sortValue === "oldest") {
        sortBy = "year";
        iso.arrange({ sortBy, sortAscending: true }); // Ascending order
      } else if (sortValue === "alphabetical") {
        sortBy = "title";
        iso.arrange({ sortBy, sortAscending: true }); // Alphabetical order
      }
    });
  });

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
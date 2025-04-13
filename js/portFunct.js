document.addEventListener("DOMContentLoaded", function () {
    // Initialize Isotope for filtering
    const portfolioGrid = document.querySelector(".pw-portfolio");
    const iso = new Isotope(portfolioGrid, {
        itemSelector: ".single_gallery_item",
        layoutMode: "fitRows",
    });

    // Filter functionality
    const filterButtons = document.querySelectorAll(".portfolio-filter .btn");
    filterButtons.forEach((button) => {
        button.addEventListener("click", function () {
            // Remove active class from all buttons
            filterButtons.forEach((btn) => btn.classList.remove("active"));
            // Add active class to the clicked button
            this.classList.add("active");
            // Filter items
            const filterValue = this.getAttribute("data-filter");
            iso.arrange({ filter: filterValue });
        });
    });

    // Sort functionality
    const sortDropdown = document.getElementById("sort-options");
    sortDropdown.addEventListener("change", function () {
        const sortValue = this.value;

        // Sort items based on the selected value
        iso.arrange({
            sortBy: sortValue === "alphabetical" ? "name" : "original-order",
            sortAscending: sortValue === "oldest" || sortValue === "alphabetical",
        });
    });

    // Add custom sort data for alphabetical sorting
    iso.items.forEach((item) => {
        const name = item.element.querySelector(".hover-content h4").textContent.trim();
        item.element.setAttribute("data-name", name.toLowerCase());
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
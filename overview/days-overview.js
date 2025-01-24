document.addEventListener("DOMContentLoaded", function () {
    // Select all elements with the class 'days'
    const daysElements = document.querySelectorAll('.days');

    // Iterate over each element
    daysElements.forEach(element => {
        // Get the date of the last delay from the 'data-last-delay' attribute
        const lastDelayDate = new Date(element.getAttribute('data-last-delay'));
        // Get the current date
        const currentDate = new Date();
        // Calculate the difference in time between the current date and the last delay date
        const timeDifference = currentDate - lastDelayDate;
        // Convert the time difference from milliseconds to days
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

        // Update the text content of the element to display the number of days since the last delay
        element.textContent = `${daysDifference} Days`;
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Select the element with the ID 'data-date'
    const dateElement = document.getElementById('data-date');
    // Get the current date
    const currentDate = new Date();
    // Define options for formatting the date
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    // Format the current date into a human-readable string
    const formattedDate = currentDate.toLocaleDateString('en-UK', options);

    // Update the text content of the element to display the current date
    dateElement.textContent = `Data as of ${formattedDate}`;
});

window.setTimeout(function() {
    $(".alert-do").fadeTo(500, 0).slideUp(500, function(){
        $(this).remove(); 
    });
}, 6000);
document.addEventListener("DOMContentLoaded", function () {
    // Get the reference date from #data-date, or fallback to today
    const dateElement = document.getElementById('data-date');
    const dataDateAttr = dateElement ? dateElement.getAttribute('data-date') : null;
    const currentDate = dataDateAttr ? new Date(dataDateAttr) : new Date();

    // Format and display the reference date
    const options = { year: 'numeric', month: 'long', day: '2-digit' };
    const formattedDate = currentDate.toLocaleDateString('en-UK', options);
    if (dateElement) dateElement.textContent = formattedDate;

    // Update "days since last delay" using the reference date
    const daysElements = document.querySelectorAll('.days');
    daysElements.forEach(element => {
        const lastDelayDate = new Date(element.getAttribute('data-last-delay'));
        const timeDifference = currentDate - lastDelayDate;
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        element.textContent = `${daysDifference} Days`;
    });

    // Format and display last delay dates in UK format if needed
    const delaySpans = document.querySelectorAll('span[data-last-delay]');
    delaySpans.forEach(function (span) {
        const lastDelay = span.getAttribute('data-last-delay');
        const date = new Date(lastDelay);
        const ukFormattedDate = date.toLocaleDateString('en-GB');
        span.textContent = ukFormattedDate;
    });
});
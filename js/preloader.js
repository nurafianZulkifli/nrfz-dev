// Dynamic Preloader Text
document.addEventListener("DOMContentLoaded", () => {
    const preloaderText = document.getElementById("preloader-text");
    const messages = ["Fetching Image from Database...", "Almost there...", "Anytime Now..."];
    let index = 0;

    // Disable scrolling while preloader is visible
    const preloader = document.getElementById("preloader");
    if (preloader) {
        document.body.style.overflow = "hidden";
    }

    const interval = setInterval(() => {
        preloaderText.textContent = messages[index];
        index = (index + 1) % messages.length;
    }, 1090);

    // Simulate loading completion
    setTimeout(() => {
        clearInterval(interval);
        if (preloader) {
            preloader.style.display = "none";
        }
        // Restore scrolling
        document.body.style.overflow = "";
    }, 5000); // Adjust time as needed
});
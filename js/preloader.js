// Dynamic Preloader Text
document.addEventListener("DOMContentLoaded", () => {
    const preloaderText = document.getElementById("preloader-text");
    const messages = ["Fetching Image from Database...","Almost there...", "Anytime Now..."];
    let index = 0;

    // Prevent scrolling while preloader is visible
    document.body.style.overflow = "hidden";

    const interval = setInterval(() => {
      preloaderText.textContent = messages[index];
      index = (index + 1) % messages.length;
    }, 1090);

    // Simulate loading completion
    setTimeout(() => {
      clearInterval(interval);
      document.getElementById("preloader").style.display = "none";
      // Restore scrolling
      document.body.style.overflow = "";
    }, 5000); // Adjust time as needed
});
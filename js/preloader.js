// Dynamic Preloader Text
document.addEventListener("DOMContentLoaded", () => {
    const preloaderText = document.getElementById("preloader-text");
    const messages = ["Loading...", "Just a moment...", "Almost there...", "Anytime Now..."];
    let index = 0;
  
    const interval = setInterval(() => {
      preloaderText.textContent = messages[index];
      index = (index + 1) % messages.length;
    }, 2000);
  
    // Simulate loading completion
    setTimeout(() => {
      clearInterval(interval);
      document.getElementById("preloader").style.display = "none";
    }, 8000); // Adjust time as needed
  });
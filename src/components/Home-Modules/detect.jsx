// detect.js
export const detectScroll = () => {
  // Function to handle the scroll event
  window.addEventListener('scroll', () => {
    const topBar = document.querySelector('.top-bar');
    const box = document.querySelector('.box');
    
    // Check if page has been scrolled down by at least 10px
    if (window.scrollY > 10) {
      if (topBar && box) {
        topBar.classList.add('scrolled');
        box.classList.add('scrolled');
      }
    } else {
      if (topBar && box) {
        topBar.classList.remove('scrolled');
        box.classList.remove('scrolled');
      }
    }
  });
};

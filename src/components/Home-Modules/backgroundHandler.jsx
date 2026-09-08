const updateBackgroundSize = () => {
    const homeBackground = document.querySelector('.home-background');
  
    if (homeBackground) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
  
        homeBackground.style.width = '100%';
  
        if (viewportHeight > 962) {
            homeBackground.style.height = '100vh';
        } else {
            homeBackground.style.height = 'auto';
        }
  
        homeBackground.style.backgroundSize = 'cover';
        homeBackground.style.overflowX = 'hidden';  // Prevent horizontal overflow
    }
  };
  
  // Export the function
  export default updateBackgroundSize;
  
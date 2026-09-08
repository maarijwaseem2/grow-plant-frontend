const updateBackgroundSize = () => {
    const homeBackground = document.querySelector('.home-background');

    if (homeBackground) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Set width to cover full viewport width
        homeBackground.style.width = '100%';

        // Set height based on viewport height
        if (viewportHeight > 962) {
            homeBackground.style.height = '100vh'; // Cover full height of the viewport
        } else {
            homeBackground.style.height = 'auto'; // Adjust to content height for smaller viewports
        }

        // Set background size to cover
        homeBackground.style.backgroundSize = 'cover'; // Maintain aspect ratio without zooming

        // Ensure no horizontal scrollbar
        homeBackground.style.overflowX = 'hidden'; // Prevent horizontal overflow
    }
};

// Attach event listeners to handle resizing
window.addEventListener('resize', updateBackgroundSize);

// Call the function on initial load
updateBackgroundSize();

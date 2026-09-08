// backgroundBelowGlobeHandler.js

const updateBackgroundBelowGlobeSize = () => {
    const backgroundDiv = document.querySelector('.background-below-globe');

    if (backgroundDiv) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Debug logs
        console.log(`Viewport Width: ${viewportWidth}, Height: ${viewportHeight}`);

        // Set width to cover full viewport width
        backgroundDiv.style.width = '100%';

        // Set height based on viewport height
        if (viewportHeight > 962) {
            backgroundDiv.style.height = '100vh'; // Cover full height of the viewport
        } else {
            backgroundDiv.style.height = 'auto'; // Adjust to content height for smaller viewports
        }

        // Set background size to cover
        backgroundDiv.style.backgroundSize = 'cover'; // Maintain aspect ratio without zooming

        // Ensure no horizontal scrollbar
        backgroundDiv.style.overflowX = 'hidden'; // Prevent horizontal overflow
    }
};

// Attach event listeners to handle resizing
window.addEventListener('resize', updateBackgroundBelowGlobeSize);

// Call the function on initial load
updateBackgroundBelowGlobeSize();

export default updateBackgroundBelowGlobeSize; // Export the function if needed elsewhere

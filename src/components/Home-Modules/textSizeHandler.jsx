const setFixedTextSize = () => {
    const heading = document.querySelector('.elementor-heading-title');
    const memoryText = document.querySelector('.memory-text');
    const belowText = document.querySelector('.below-background-text'); // Select the new text

    if (heading && memoryText && belowText) {
        // Set your desired fixed sizes for the heading and memory text
        const minHeadingSize = 140; // Maximum size for heading in px
        const minMemoryTextSize = 40; // Maximum size for memory text in px
        const minBelowTextSize = 60; // Maximum size for below text in px

        // Apply the fixed sizes initially
        heading.style.fontSize = `${minHeadingSize}px`;
        memoryText.style.fontSize = `${minMemoryTextSize}px`;
        belowText.style.fontSize = `${minBelowTextSize}px`; // Set initial size for below text

        // Check the width of the heading and adjust size if necessary
        const headingWidth = heading.offsetWidth;
        const viewportWidth = window.innerWidth;

        // Set a threshold (e.g., 80% of the viewport width)
        const thresholdWidth = viewportWidth * 0.8;

        // Calculate scaling factor based on heading size
        let scalingFactor = 1;

        if (headingWidth >= thresholdWidth) {
            scalingFactor = thresholdWidth / headingWidth;
            const newSize = Math.max(scalingFactor * minHeadingSize, 30); // Minimum size of 30px for heading
            heading.style.fontSize = `${newSize}px`;
        }

        // Adjust memory text size based on the same scaling factor
        const newMemorySize = Math.max(scalingFactor * minMemoryTextSize, 20); // Minimum size of 20px for memory text
        memoryText.style.fontSize = `${newMemorySize}px`;

        // Adjust below text size based on the same scaling factor
        const newBelowSize = Math.max(scalingFactor * minBelowTextSize, 30); // Minimum size of 30px for below text
        belowText.style.fontSize = `${newBelowSize}px`; // Apply new size to below text

        // Keep line heights consistent
        heading.style.lineHeight = '1.2';
        memoryText.style.lineHeight = '1.2'; // Use a relative line height for consistency
        belowText.style.lineHeight = '1.4'; // Set line height for below text
    }
};

// Attach event listeners to handle resizing
window.addEventListener('resize', setFixedTextSize);

// Call the function on initial load
setFixedTextSize();

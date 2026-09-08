const lockPositions = () => {
    const growText = document.querySelector('.grow-text');
    const anyText = document.querySelector('.any-text');
    const whereText = document.querySelector('.where-text');
    const glassBox = document.querySelector('.glass-box'); // Get the glass box
    const leftArrow = document.querySelector('.arrow-btn.left'); // Select the left arrow button
    const rightArrow = document.querySelector('.arrow-btn.right'); // Select the right arrow button

    // Get the width and height of the glass box
    const glassBoxWidth = glassBox ? glassBox.offsetWidth : 0;

    // Set positions for text
    const growTextOffsetY = 150; // Vertical positioning for growText
    const anyTextOffsetY = 300; // Vertical positioning for anyText
    const whereTextOffsetY = 450; // Vertical positioning for whereText
    
    if (growText) {
        const growTextPosition = glassBoxWidth - (growText.offsetWidth + 3); // Adjust for padding if necessary
        growText.style.left = `${growTextPosition}px`;
        growText.style.top = `${growTextOffsetY}px`; // Move up
        growText.style.transform = 'translateX(0)'; // Remove centering
    }
    if (anyText) {
        const anyTextPosition = glassBoxWidth - (anyText.offsetWidth + 90); // Adjust for padding if necessary
        anyText.style.left = `${anyTextPosition}px`;
        anyText.style.top = `${anyTextOffsetY}px`; // Move up
        anyText.style.transform = 'translateX(0)'; // Remove centering
    }
    if (whereText) {
        const whereTextPosition = glassBoxWidth - (whereText.offsetWidth + -8); // Adjust for padding if necessary
        whereText.style.left = `${whereTextPosition}px`;
        whereText.style.top = `${whereTextOffsetY}px`; // Move up
        whereText.style.transform = 'translateX(0)'; // Remove centering
    }

    // Position the arrow buttons in the center horizontally and at the bottom vertically
    const arrowOffsetY = glassBox ? glassBox.getBoundingClientRect().bottom - 40 : 0; // Adjust vertical position above the bottom
    const arrowCenterX = glassBox ? glassBox.getBoundingClientRect().left + (glassBoxWidth / 2) : 0; // Center position based on glass box width

    if (leftArrow) {
        leftArrow.style.left = `${arrowCenterX - 40}px`; // Position left arrow to the left of center
        leftArrow.style.top = `${arrowOffsetY}px`; // Set vertical position
        leftArrow.style.transform = 'translateX(0)'; // Remove centering
    }
    if (rightArrow) {
        rightArrow.style.left = `${arrowCenterX + 40}px`; // Position right arrow to the right of center
        rightArrow.style.top = `${arrowOffsetY}px`; // Set vertical position
        rightArrow.style.transform = 'translateX(0)'; // Remove centering
    }
};

// Export the function
export default lockPositions;

// Lock positions on load
window.onload = lockPositions;

// Lock positions on resize
window.onresize = lockPositions;

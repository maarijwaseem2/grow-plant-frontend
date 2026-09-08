import { useEffect } from 'react';

const LockImagePosition = () => {
    useEffect(() => {
        const updateImagePosition = () => {
            const treeImage = document.querySelector('.tree-image');
            if (treeImage) {
                // Get the parent container's width
                const containerWidth = treeImage.parentElement.offsetWidth;
                // Center the image by setting the left position to half the container width minus half the image width
                treeImage.style.position = 'absolute';
                treeImage.style.left = `${(containerWidth / 2) - (treeImage.offsetWidth / 2)}px`;
                treeImage.style.top = 'auto'; // Maintain the default top value
            }
        };

        // Initial position update
        updateImagePosition();

        // Update position on window resize
        window.addEventListener('resize', updateImagePosition);
        
        return () => {
            window.removeEventListener('resize', updateImagePosition);
        };
    }, []);

    return null; // This component does not render anything
};

export default LockImagePosition;

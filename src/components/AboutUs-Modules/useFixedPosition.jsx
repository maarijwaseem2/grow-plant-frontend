// useLockImagePosition.js
import { useEffect } from 'react';

const useFixedPosition = (imageRef) => {
    useEffect(() => {
        const handleResize = () => {
            if (imageRef.current) {
                const imageElement = imageRef.current;

                // Set fixed position properties
                imageElement.style.position = 'fixed'; // Fix the image position
                imageElement.style.top = '50%'; // Center it vertically
                imageElement.style.left = '50%'; // Center it horizontally
                imageElement.style.transform = 'translate(-50%, -50%)'; // Adjust for centering
            }
        };

        handleResize(); // Initial call to set position
        window.addEventListener('resize', handleResize); // Add resize event listener

        return () => {
            window.removeEventListener('resize', handleResize); // Clean up on unmount
        };
    }, [imageRef]);
};

export default useFixedPosition;

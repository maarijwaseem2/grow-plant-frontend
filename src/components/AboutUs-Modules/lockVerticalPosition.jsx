import { useEffect } from 'react';

const useLockVerticalPosition = (textRef, backgroundRef) => {
    useEffect(() => {
        const handleResize = () => {
            if (textRef.current && backgroundRef.current) {
                const textElement = textRef.current;
                const backgroundElement = backgroundRef.current;

                // Set the background image properties
                backgroundElement.style.position = 'relative'; // Keep the background in normal flow
                backgroundElement.style.top = '0';
                backgroundElement.style.left = '0';
                backgroundElement.style.width = '100vw'; // Full width
                backgroundElement.style.height = '100vh'; // Full height
                backgroundElement.style.zIndex = '-1'; // Ensure background is behind the text
                backgroundElement.style.backgroundSize = 'cover'; // Maintain aspect ratio
                backgroundElement.style.backgroundPosition = 'center'; // Center the image
            }
        };

        handleResize(); // Initial call to set position
        window.addEventListener('resize', handleResize); // Add resize event listener

        return () => {
            window.removeEventListener('resize', handleResize); // Clean up on unmount
        };
    }, [textRef, backgroundRef]);
};

export default useLockVerticalPosition;

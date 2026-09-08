import React, { useEffect, useRef, useState } from 'react';
import './AboutUs.css';
import './AboutUs-Modules/mobiledevices.css';
import { detectScroll } from './Home-Modules/detect';
import useLockVerticalPosition from './AboutUs-Modules/lockVerticalPosition';
import bgImage1 from '../modules/Design/billion-trees.jpg';
import bgImage2 from '../modules/Design/billion-trees1.jpg';
import bgImage3 from '../modules/Design/billion-trees2.jpg';
import bgImage4 from '../modules/Design/billion-trees3.jpg';
import Mission from './AboutUs-Modules/Mission'; // Import the Mission component

const AboutUs = () => {
    const textRef = useRef(null);
    const backgroundRef = useRef(null);
    const [backgroundImage, setBackgroundImage] = useState(bgImage1);

    const backgrounds = [bgImage1, bgImage2, bgImage3, bgImage4];

    useEffect(() => {
        detectScroll();
    }, []);

    useLockVerticalPosition(textRef, backgroundRef);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setBackgroundImage((prev) => {
                const currentIndex = backgrounds.indexOf(prev);
                const nextIndex = (currentIndex + 1) % backgrounds.length;
                return backgrounds[nextIndex];
            });
        }, 10000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="main-container">
            <div
                className="full-screen-background bg-cover bg-center"
                ref={backgroundRef}
                style={{ backgroundImage: `url(${backgroundImage})` }}
            >
                <div className="text-content text-center p-8" ref={textRef}>
                    <h1 className="text-white text-6xl md:text-7xl font-bold">
                        LET'S MAKE
                    </h1>
                    <h1 className="text-white text-4xl md:text-6xl font-bold">
                        <span
                            className="text-4xl md:text-5xl font-hand font-thin"
                            style={{ fontSize: '0.5em' }} // Additional size adjustment for "A"
                        >
                            A
                        </span>{' '}
                        BETTER PLANET
                    </h1>
                    <p className="text-white mt-4 text-xl md:text-2xl">
                        Creating a sustainable future together.
                    </p>
                </div>
            </div>
            {/* Include the Mission component */}
            <Mission /> 
        </div>
    );
};

export default AboutUs;

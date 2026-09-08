import React, { useEffect, useState } from 'react';
import './Home.css';
import './Home-Modules/screensizes.css';
import './Home-Modules/BoxLayout.css';
import colors from './Home-Modules/colors';
import updateBackgroundSize from './Home-Modules/backgroundHandler';
import op1 from '../modules/background/op-1.jpg';
import po from '../modules/background/po.jpg';
import globe from '../modules/Pictures/globe.png'; // Import the globe image
import updateBackgroundBelowGlobeSize from './Home-Modules/backgroundBelowGlobeHandler';
import ReforestationPage from './Home-Modules/ReforestationPage'; 

// Import images directly using ES Modules
import bg1 from '../Modules/background/bg.jpg';
import bg2 from '../Modules/background/gh.jpg';
import bg3 from '../Modules/background/op.jpg';

const Home = () => {
  const [bgImage, setBgImage] = useState(op1); // Set initial image as imported
  const images = [op1, po]; // Use the imported images
  const [textColor, setTextColor] = useState('#ffffff');
  const [bgBelowGlobeImage, setBgBelowGlobeImage] = useState(bg1); // Use imported bg1 as default

  // Use the imported images instead of require()
  const belowGlobeImages = [bg1, bg2, bg3];
  const textBackgroundImages = [bg1, bg2, bg3];

  const [currentBelowGlobeIndex, setCurrentBelowGlobeIndex] = useState(0);
  const [currentTextBackgroundIndex, setCurrentTextBackgroundIndex] = useState(0);

  // Handle background image switching
  useEffect(() => {
    const interval = setInterval(() => {
      setBgImage((prevImage) => (prevImage === images[0] ? images[1] : images[0]));
    }, 20000);
    return () => clearInterval(interval);
  }, [images]);
  
  useEffect(() => {
    updateBackgroundBelowGlobeSize(); 
  }, []);

  useEffect(() => {
    const colorInterval = setInterval(() => {
      setTextColor((prevColor) => {
        const currentIndex = colors.indexOf(prevColor);
        const nextIndex = (currentIndex + 1) % colors.length;
        return colors[nextIndex];
      });
    }, 2000);
    return () => clearInterval(colorInterval);
  }, []);

  useEffect(() => {
    updateBackgroundSize();
    window.addEventListener('resize', updateBackgroundSize);
    return () => window.removeEventListener('resize', updateBackgroundSize);
  }, []);

  const changeBelowGlobeImage = (direction) => {
    setCurrentBelowGlobeIndex(prevIndex => {
        const newIndex = (prevIndex + direction + belowGlobeImages.length) % belowGlobeImages.length;
        return newIndex;
    });

    setCurrentTextBackgroundIndex(prevIndex => {
        const newIndex = (prevIndex + direction + textBackgroundImages.length) % textBackgroundImages.length;
        return newIndex;
    });
  };

  useEffect(() => {
    setBgBelowGlobeImage(belowGlobeImages[currentBelowGlobeIndex]);
  }, [currentBelowGlobeIndex]);

  return (
    <div className="main-container">
      <div
        className="home-background relative w-full h-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="header-blur" />
        <div className="centered-text">
          <h2 className="elementor-heading-title text-gap" style={{ color: textColor }}>
            <div className="line-one">
              <span className="plant-text">PLANT</span>
              <span className="a-text">A</span>
              <span className="tree-text">TREE</span>
            </div>
            <div className="line-two">
              <span className="together-text">TOGETHER</span>
            </div>
          </h2>
          <h4 className="memory-text text-white mt-4">
            Make a memory, and leave <br />
            your mark on the world
          </h4>
        </div>
      </div>
      <div className="below-background-text text-center my-8">
        <p className="nature-bring text-lg md:text-xl">
          Bring Nature Into Your Space - For Peace, <br />Balance, and Growth.
        </p>
      </div>

      {/* Image below the below-background-text */}
      <div className="tree-globe flex justify-center mt-6">
        <img 
          src={globe} // Use the imported globe image
          alt="Tree" 
          className="tree-image" 
        />
      </div>
      <div 
        className="background-below-globe flex flex-col relative" 
        style={{ backgroundImage: `url(${bgBelowGlobeImage})` }}
      >
      <div className="glass-box">
        <div className="glass-box-text flex flex-col items-start h-full">
          <span 
            className="grow-text text-uppercase text-4xl sm:text-5xl md:text-6xl lg:text-7xl" 
            style={{ backgroundImage: `url(${textBackgroundImages[currentTextBackgroundIndex]})` }}
          >
            GROW
          </span>
          <span 
            className="any-text text-uppercase text-4xl sm:text-5xl md:text-6xl lg:text-7xl" 
            style={{ backgroundImage: `url(${textBackgroundImages[currentTextBackgroundIndex]})` }}
          >
            ANY
          </span>
          <span 
            className="where-text text-uppercase text-4xl sm:text-5xl md:text-6xl lg:text-7xl" 
            style={{ backgroundImage: `url(${textBackgroundImages[currentTextBackgroundIndex]})` }}
          >
            WHERE
          </span>
        </div>
      </div>
        {/* Slider Controls */}
          <div className="slider-controls flex justify-end mb-4">
            <button 
              className="arrow-btn left text" 
              onClick={() => changeBelowGlobeImage(-1)}
            >
              &#8592;
            </button>
            <button 
              className="arrow-btn right text" 
              onClick={() => changeBelowGlobeImage(1)}
            >
              &#8594;
            </button>
          </div>
      </div>
      {/* Add the ReforestationPage component here */}
      <ReforestationPage />
    </div>
  );
};

export default Home;

import React from 'react';
import './Mission.css'; // Import the custom CSS file
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap globally
import treeImage from '../../Modules/Design/billion-trees7.jpg';
import treeImage2 from '../../Modules/Design/billion-trees8.jpg';
import treeVideo from '../../Modules/Videos/billion-trees-video.mp4';

const Mission = () => {
  return (
    <div className="missionWrapper container text-center py-5">
      <h2 className="textTitle text-[1rem] sm:text-[1.3rem] md:text[1.6rem] lg:text-[2rem]">
        ABOUT US
      </h2>

      <h1 className="text-[1.5rem] font-extrabold mt-3 sm:text-[2rem] md:text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem]">
        GO GREEN
      </h1>

      <p className="text-sm sm:text-base md:text-lg lg:text-xl mt-3">
        A mission-driven movement dedicated to reforesting our planet and nurturing a greener tomorrow
      </p>

      {/* Flexbox Row with Images and Video */}
      <div className="mission-row mt-6">
        <div className="media-item">
          <img src={treeImage} alt="Tree Image" />
        </div>
        <div className="media-item">
          <video autoPlay loop muted>
            <source src={treeVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="media-item">
          <img src={treeImage2} alt="Tree Image 2" />
        </div>
      </div>

      {/* About Description (aligned with row) */}
      <div className="mt-6">
        <p className="textDescription text-xs sm:text-sm md:text-base lg:text-sm xl:text-base">
          Go Green is committed to making it easy for anyone to positively impact the environment. Through a seamless donation process and a global presence, we’re 
        </p>
        <p className="textDescription text-xs sm:text-sm md:text-base lg:text-sm xl:text-base">
          driving meaningful change, one tree at a time.
        </p>
      </div>
    </div>
  );
};

export default Mission;

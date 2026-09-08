import React, { useState } from 'react';
import './Service.css';
// Import the video file and background image
import videoFile from '../Modules/Videos/planting-tree.mp4';
import backgroundImage from '../Modules/background/home-services-background.jpg'; // Update with the actual image path

const HomeService = () => {
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [address, setAddress] = useState('');

  const handleBackgroundClick = () => {
    setIsVideoVisible((prevState) => !prevState); // Toggle between image and video
  };

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  return (
    <div>
      {/* Main Home Services Section */}
      <div className="homeservices-container relative w-full">
        {/* Conditionally render background image or video */}
        {!isVideoVisible ? (
          <div
            className="background-image w-full"
            style={{ backgroundImage: `url(${backgroundImage})` }}
            onClick={handleBackgroundClick} // Toggle on image click
          >
            {/* Text overlay with gently curved text */}
            <div className="text-overlay">
              <svg
                viewBox="0 0 1000 200"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto max-w-5xl"
              >
                <path
                  id="curvePath"
                  d="M100,140 C300,100 700,100 900,140"
                  fill="transparent"
                />
                <text
                  fontSize="80"
                  fill="transparent" /* Make the text fill transparent */
                  stroke="white" /* Add white outline to make text visible */
                  strokeWidth="2" /* Control the thickness of the stroke */
                  letterSpacing="0.1em"
                  dominantBaseline="middle"
                  style={{ fontFamily: "'Lora', serif" }} // Apply Lora font family
                >
                  <textPath
                    href="#curvePath"
                    textAnchor="middle"
                    startOffset="45%" // Slightly adjust startOffset
                  >
                    HOME SERVICES
                  </textPath>
                </text>
              </svg>
            </div>
          </div>
        ) : (
          <div
            className="absolute top-0 left-0 w-full"
            onClick={handleBackgroundClick} // Toggle on video click
          >
            <video
              src={videoFile}
              autoPlay
              loop
              muted
              playsInline
              className="video-background object-cover w-full"
            />
          </div>
        )}
      </div>

      {/* New Container Below the First */}
      <div className="services-container w-full">
        <div className="content">
          <h2 className="text-3xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-left">
            <span className="select-word text-inherit mr-5">Select</span>
            <span className="services-word text-inherit">Services</span>
          </h2>
          <p className="discover-services text-left" style={{ fontSize: '1.3rem' }}>
            Discover the services you need and guide us to your location!
          </p>

          {/* Container for Location and Address boxes */}
          <div className="input-row">
            {/* Location Selection Box */}
            <div className="location-box">
              <select
                id="location"
                value={selectedLocation}
                onChange={handleLocationChange}
                className="location-dropdown"
              >
                <option value="">-- Choose Location --</option>
                <option value="new-york">New York</option>
                <option value="los-angeles">Los Angeles</option>
                <option value="chicago">Chicago</option>
                <option value="san-francisco">San Francisco</option>
                {/* Add more options as needed */}
              </select>
            </div>

            {/* Address Input Box */}
            <div className="address-box">
              <input
                type="text"
                id="address"
                value={address}
                onChange={handleAddressChange}
                placeholder="Enter your address"
                className="address-input"
              />
            </div>

            {/* Submit Button */}
            <div className="select-box">
              <button className="select-btn">Select</button>
            </div>
          </div>

          {/* New Box Below the Input Row */}
          <div className="additional-box">
            {/* Flex container for two columns */}
            <div className="column-container">
              <div className="column-1">
                <p className='plant-varietytext'>Plant Varieties</p>
              </div>
              <div className="column-2">
                <p>This is the second column, taking up 30% of the width.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeService;

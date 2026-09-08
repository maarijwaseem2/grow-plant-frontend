import React, { useState } from "react";
import "./Contact.css"; // Keep the existing CSS file
import JarImage from "../Modules/images/jar.png";
import Image from "../Modules/images/Plant5.png";

function ContactUs() {
  // State for email box
  const [isEmailBoxExpanded, setIsEmailBoxExpanded] = useState(false);

  // Function to handle email box click
  const handleEmailBoxClick = () => {
    setIsEmailBoxExpanded((prev) => !prev); // Toggle the state
  };

  return (
    <>
      <div className="contact-container h-screen flex items-center justify-center">
        {/* Combined Content */}
        <div className="flex flex-col sm:flex-row items-center sm:justify-center text-center sm:text-left">
          <h1 className="plant-treetext text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl sm:mr-16 md:mr-24 lg:mr-28 mb-4 sm:mb-0 font-semibold sm:items-start">
            Plant a tree, <br /> save a life
          </h1>
          <img
            src={JarImage}
            alt="Centered Image"
            className="w-[350px] h-auto sm:ml-12 md:ml-16 lg:ml-24 rounded-lg"
          />
        </div>
      </div>

      {/* Updated additional-info-container with no padding or margin */}
      <div className="w-full additional-info-container mt-0 px-0">
        <div className="flex flex-col md:flex-row justify-start">
          {/* Column One */}
          <div className="flex flex-[16%] min-h-[872px] justify-center items-center md:justify-start">
            <p className="sideways-text text-6xl font-semibold">Greenery</p>  {/* Updated font size to text-4xl */}
          </div>

          {/* Column Two with custom background color */}
          <div className="flex flex-[34%] min-h-[872px] my-6 md:my-0 bg-[rgb(240,238,238)] bottom-align">
            <img
              src={Image}
              className="object-cover tree-plant max-h-[700px]"
              style={{ width: '900px'}} // Adjust width as needed
              />
          </div>

          {/* Column Three */}
          <div className="flex-[50%] min-h-[872px] flex flex-col items-center md:items-start text-center md:text-left space-y-4 px-6 md:px-12">
            <h2 className="contact-us-heading text-2xl md:text-3xl font-semibold tracking-[2px]">Contact Us</h2>
            <div className="design-underline w-16 h-1 border-t-2 border-dashed border-black mb-4"></div> {/* Added margin-bottom */}
            <p className="hear-text text-sm md:text-base sm:text-left"> {/* Decreased text size */}
              We would love to hear from you! Feel free to reach out to us for any inquiries or collaboration opportunities.
            </p>
            <div
              className={`info-box cursor-pointer py-2 px-4 transition-all duration-300 ease-in-out ${
                isEmailBoxExpanded ? 'w-[250px]' : 'w-[130px]'
              }`}
              onClick={handleEmailBoxClick}
            >
              <p className="m-0 p-1 text-center">
                {isEmailBoxExpanded ? 'gogreen@gmail.com' : 'Email'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ContactUs;

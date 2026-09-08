import React from "react";
import headerImage from "../assets/asset-3.jpg";
import "../App.css";

const Header = () => {
  return (
    <header className="header-plant w-full h-64 md:h-80 mt-3 mb-3 flex justify-center items-center bg-gray-100 ">
      <div className="w-full h-auto header-image">
        <img
          src={headerImage} //999 x 289
          alt="Shop Now: Your Perfect Plant Awaits"
          className="w-full h-full object-cover -mt-3 "
        />
      </div>
    </header>
  );
};

export default Header;

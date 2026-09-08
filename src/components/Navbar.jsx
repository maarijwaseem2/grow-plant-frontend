import React, { useState, useContext } from "react";
import { Heart, Bell, ShoppingCart, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";
import { CartContext } from "../context/CartContext";
import "./Navbar.css";
import NotificationBell from './NotificationBell';

const Navbar = ({ favoriteCount }) => {
  const { cartCount } = useContext(CartContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isServicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleServicesDropdown = () => {
    setServicesDropdownOpen(!isServicesDropdownOpen);
  };

  const closeServicesDropdown = () => {
    setServicesDropdownOpen(false);
  };

  return (
    <header className="p-3 bg-gray-700">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <a href="/" className="flex items-center text-white text-decoration-none">
            <img src={logo} alt="Logo" className="h-8 mr-2" />
            <span className="text-xl font-bold">Grow Green</span>
          </a>

          {/* Mobile Hamburger Menu */}
          <button
            className="lg:hidden text-white"
            onClick={toggleMobileMenu}
          >
            <Menu size={24} />
          </button>

          {/* Links */}
          <nav
            className={`${
              isMobileMenuOpen ? "block" : "hidden"
            } lg:flex lg:items-center lg:space-x-6 lg:static absolute bg-gray-700 w-full lg:w-auto left-0 top-full z-10 lg:z-auto`}
          >
            <ul className="flex flex-col lg:flex-row lg:items-center lg:space-x-4">
              <li>
                <a href="/" className="nav-link px-2 py-1 text-white hover:text-gray-300">
                  Home
                </a>
              </li>
              <li className="relative">
                <button
                  onClick={toggleServicesDropdown}
                  className="nav-link px-2 py-1 text-white hover:text-gray-300"
                >
                  Services
                </button>
                {isServicesDropdownOpen && (
                  <ul className="absolute left-0 mt-1 w-48 bg-gray-700 text-white rounded-md shadow-lg z-10">
                    <li>
                      <button
                        onClick={() => {
                          navigate("/plants");
                          closeServicesDropdown();
                        }}
                        className="block px-4 py-2 hover:bg-gray-900 w-full text-left"
                      >
                        Buy Plants
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          navigate("/donation");
                          closeServicesDropdown();
                        }}
                        className="block px-4 py-2 hover:bg-gray-900 w-full text-left"
                      >
                        Donate Anywhere
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          navigate("/plant-services");
                          closeServicesDropdown();
                        }}
                        className="block px-4 py-2 hover:bg-gray-900 w-full text-left"
                      >
                        Plant Services
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          navigate("/home-services");
                          closeServicesDropdown();
                        }}
                        className="block px-4 py-2 hover:bg-gray-900 w-full text-left"
                      >
                        Home Services
                      </button>
                    </li>
                  </ul>
                )}
              </li>
              <li>
                <a href="/contact" className="nav-link px-2 py-1 text-white hover:text-gray-300">
                  Contact
                </a>
              </li>
              <li>
                <a href="/about-us" className="nav-link px-2 py-1 text-white hover:text-gray-300">
                  About Us
                </a>
              </li>
            </ul>
          </nav>

          {/* Right Section */}
          <NotificationBell />
          <div className="hidden lg:flex items-center space-x-4">
            <button
              type="button"
              className="btn border bg-yellow-500 border-white text-white text-sm"
            >
              Login
            </button>
            <button
              type="button"
              className="btn bg-yellow-500 text-white text-sm"
            >
              Sign-up
            </button>
            <button
              type="button"
              className="relative text-white hover:text-gray-300 mr-2"
            >
              <Heart />
              {favoriteCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {favoriteCount}
                </span>
              )}
            </button>
            <button type="button" className="relative text-white hover:text-gray-300 mr-2">
              <Bell />
            </button>
            <button
              type="button"
              className="relative text-white hover:text-gray-300"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

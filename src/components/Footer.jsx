import React from "react";
import {
  FaCcMastercard,
  FaCcVisa,
  FaFacebook,
  FaTwitter,
  FaYoutube,
  FaLinkedin,
  FaInstagramSquare,
} from "react-icons/fa";
import "./Footer.css";
const Footer = () => {
  return (
    <footer className="bg-white text-gray-600 py-8 border-t border-gray-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-green-500">
                  Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-500">
                  Return & Refund Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-500">
                  Shipping
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-500">
                  FAQs
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-green-500">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-500">
                  Find Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-500">
                  Affiliate
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-500">
                  Career
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Business</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-green-500">
                  Our Press
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-500">
                  Check Out
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-500">
                  Shop
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Call us 24/7</h3>
            <p className="text-2xl font-bold text-green-500 mb-2">03111220022</p>
            <p className="mb-2 text-gray-700">Grow.Green Gulshan e Iqbal Karachi</p>
            <p className="mb-4 text-gray-700">contact@grow.green</p>
            <div className="flex space-x-4">
              <a href="#" className="text-blue-600 hover:text-blue-800">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-blue-400 hover:text-blue-600">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-red-600 hover:text-red-800">
                <FaYoutube size={20} />
              </a>
              <a href="#" className="text-blue-700 hover:text-blue-900">
                <FaLinkedin size={20} />
              </a>
              <a href="#" className="text-pink-600 hover:text-pink-800">
                <FaInstagramSquare size={20} />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-300 flex flex-col sm:flex-row justify-between items-center">
          <p className="mb-4 sm:mb-0 text-gray-700">
            © 2024 Grow.Green. All Rights Reserved
          </p>
          <div className="flex items-center">
            <span className="mr-2">We Are Using Safe Payment For</span>
            <FaCcMastercard className="h-8 w-8 text-orange-500" />
            <FaCcVisa className="h-8 w-8 ml-2 text-blue-600" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

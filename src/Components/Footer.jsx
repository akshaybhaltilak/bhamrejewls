import React from 'react';
import { Link } from 'react-router-dom';
import { GiGoldBar } from 'react-icons/gi';
import { FaFacebook, FaInstagram, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-6">
              <GiGoldBar className="text-yellow-400 text-4xl mr-3" />
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200">
                Bhamare Jewellers
              </h3>
            </div>
            <p className="text-gray-300 text-lg mb-6 max-w-2xl">
              Since 1985, we've been crafting exquisite gold jewellery in Akola with unmatched purity and traditional craftsmanship. 
              Each piece tells a story of heritage and trust.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-300 hover:text-yellow-300 transition text-2xl">
                <FaFacebook />
              </a>
              <a href="#" className="text-gray-300 hover:text-yellow-300 transition text-2xl">
                <FaInstagram />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-semibold mb-6 pb-2 border-b border-yellow-600/30">Visit Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-yellow-400 mt-1 mr-4 flex-shrink-0 text-lg" />
                <span className="text-gray-300">
                  Jayhind Chowk, Near Gandhi Statue,<br />
                  Akola, Maharashtra - 444001
                </span>
              </li>
              <li className="flex items-center">
                <FaPhone className="text-yellow-400 mr-4 text-lg" />
                <a href="tel:+918668722207" className="text-gray-300 hover:text-yellow-300 transition">
                  +91 8668722207
                </a>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-yellow-400 mr-4 text-lg" />
                <a href="mailto:info@bhamarejewellers.com" className="text-gray-300 hover:text-yellow-300 transition">
                  info@bhamarejewellers.com
                </a>
              </li>
              <li className="flex items-center">
                <FaClock className="text-yellow-400 mr-4 text-lg" />
                <span className="text-gray-300">10:00 AM - 8:00 PM (Daily)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} Bhamare Jewellers, Akola. All Rights Reserved.
          </p>
          <p className="mt-2 text-gray-500 text-sm">
            Crafted with passion by <a href="https://webreich.com" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300">Webreich Technologies</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
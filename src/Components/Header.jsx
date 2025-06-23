import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdOutlineMenu, MdClose } from 'react-icons/md';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="logogold.png" alt="Bhamare Jewellers Logo" className='h-10 w-10' />
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Bhamare Jewellers</h1>
              <p className="text-xs text-purple-200">The most trendy jewellery outlet</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="hover:text-yellow-300 transition font-medium text-lg px-3 py-2 rounded hover:bg-gray-800"
            >
              Home
            </Link>
            <Link 
              to="/Product" 
              className="hover:text-yellow-300 transition font-medium text-lg px-3 py-2 rounded hover:bg-gray-800"
            >
              Product
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMenu} 
            className="md:hidden p-2 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <MdClose className="text-2xl text-yellow-300" />
            ) : (
              <MdOutlineMenu className="text-2xl" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-800 px-4 py-3 mt-2 rounded-lg">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/" 
                onClick={toggleMenu}
                className="py-3 px-3 text-lg rounded hover:bg-gray-700 hover:text-yellow-300 transition"
              >
                Home
              </Link>
              <Link 
                to="/Product" 
                onClick={toggleMenu}
                className="py-3 px-3 text-lg rounded hover:bg-gray-700 hover:text-yellow-300 transition"
              >
                Product
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
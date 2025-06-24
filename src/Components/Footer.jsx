import React from 'react';
import { Link } from 'react-router-dom';
import { GiGoldBar } from 'react-icons/gi';
import { FaFacebook, FaInstagram, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaYoutube, FaWhatsapp } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Footer = () => {
  const socialLinks = [
    { icon: <FaFacebook />, url: "https://www.facebook.com/people/Bhamare-jewellers-Akola/100083327421534/" },
    { icon: <FaInstagram />, url: "https://www.instagram.com/bhamarejewellers_akola/?hl=en" },
    { icon: <FaYoutube />, url: "#" },
    { icon: <FaWhatsapp />, url: "https://wa.me/919881096439" }
  ];

  const contactItems = [
    { 
      icon: <FaMapMarkerAlt />, 
      content: <>
        Jayhind Chowk, Near Raj Rajeshower Mandir,<br />
        Akola, Maharashtra - 444001
      </> 
    },
    { 
      icon: <FaPhone />, 
      content: <a href="tel:+918668722207">+91 9881096439</a> 
    },
    { 
      icon: <FaEnvelope />, 
      content: <a href="mailto:info@bhamarejewellers.com">info@bhamarejewellers.com</a> 
    },
    { 
      icon: <FaClock />, 
      content: "10:00 AM - 8:00 PM (Daily)" 
    }
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white pt-20 pb-10 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <p className="absolute top-1/4 left-10 text-yellow-300 text-4xl animate-pulse" />
        <GiGoldBar className="absolute bottom-1/3 right-20 text-yellow-400 text-5xl rotate-45" />
        <p className="absolute top-10 right-1/4 text-yellow-200 text-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex items-center mb-6"
            >
              <img 
                src="logogold.png" 
                alt="logo" 
                className='h-14 w-14 mr-3 object-contain animate-float' 
              />
              <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 tracking-wider">
                Bhamare Jewellers
              </h3>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-gray-300 text-lg mb-8 max-w-2xl leading-relaxed"
            >
              Since 1985, we've been crafting exquisite gold jewellery in Akola with unmatched purity and traditional craftsmanship. 
              Each piece tells a story of heritage and trust.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex space-x-6"
            >
              {socialLinks.map((item, index) => (
                <a 
                  key={index}
                  href={item.url} 
                  className="text-gray-300 hover:text-yellow-300 transition-all duration-300 text-2xl transform hover:scale-110"
                >
                  {item.icon}
                </a>
              ))}
            </motion.div>
          </div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold mb-8 pb-3 border-b border-yellow-600/30 relative">
              Visit Us
              <span className="absolute bottom-0 left-0 w-16 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600"></span>
            </h3>
            <ul className="space-y-5">
              {contactItems.map((item, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start group"
                >
                  <span className="text-yellow-400 mt-1 mr-4 flex-shrink-0 text-lg group-hover:text-yellow-300 transition-colors duration-300">
                    {item.icon}
                  </span>
                  <span className="text-gray-300 group-hover:text-yellow-100 transition-colors duration-300">
                    {item.content}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="border-t border-gray-700 pt-8 text-center"
        >
          <p className="text-gray-400 font-light">
            &copy; {new Date().getFullYear()} Bhamare Jewellers, Akola. All Rights Reserved.
          </p>
          <p className="mt-3 text-gray-500 text-sm">
            Crafted with <span className="text-yellow-400">♥</span> by{' '}
            <a 
              href="https://webreich.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-orange-400 hover:text-orange-300 transition-colors duration-300 font-medium"
            >
              Webreich Technologies
            </a>
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
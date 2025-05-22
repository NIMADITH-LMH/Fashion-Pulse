import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-gray-300 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div>
            <h1 className="text-2xl font-bold mb-4">Fashion Pulse</h1>
            <p className="text-sm">
              Discover the best in fashion and style. Shop new arrivals and timeless classics.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:underline">Tops & Upper Wear</a></li>
              <li><a href="#" className="hover:underline">Accessories</a></li>
              <li><a href="#" className="hover:underline">New Arrivals</a></li>
              <li><a href="#" className="hover:underline">Best Sellers</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:underline">Contact Us</a></li>
              <li><a href="#" className="hover:underline">Shipping & Returns</a></li>
              <li><a href="#" className="hover:underline">FAQs</a></li>
              <li><a href="#" className="hover:underline">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" aria-label="Instagram" className="hover:text-white">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" aria-label="Facebook" className="hover:text-white">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" aria-label="Twitter" className="hover:text-white">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" aria-label="Pinterest" className="hover:text-white">
                <i className="fab fa-pinterest"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Fashion Pulse. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

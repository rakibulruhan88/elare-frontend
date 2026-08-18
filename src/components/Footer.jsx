import { Link } from 'react-router-dom';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] text-white pt-16 pb-8 font-sans border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* 1. Brand Info */}
          <div>
            <h3 className="text-2xl font-serif tracking-widest uppercase mb-6">ELARE</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Redefining modern elegance. Premium quality apparel and accessories crafted for the modern individual who values both comfort and style.
            </p>
            <div className="flex gap-6 text-sm font-bold tracking-widest text-gray-400">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-300">IG</a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-300">FB</a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-300">TT</a>
              <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-300">PIN</a>
            </div>
          </div>

          {/* 2. Shop Links */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase mb-6 text-gray-100">Shop</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/category/men" className="hover:text-white transition-colors duration-300">Men's Collection</Link></li>
              <li><Link to="/category/women" className="hover:text-white transition-colors duration-300">Women's Collection</Link></li>
              <li><Link to="/category/accessories" className="hover:text-white transition-colors duration-300">Accessories</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors duration-300">View All Products</Link></li>
            </ul>
          </div>

          {/* 3. Customer Care */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase mb-6 text-gray-100">Support</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/contact" className="hover:text-white transition-colors duration-300">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors duration-300">FAQs</Link></li>
              <li><Link to="/shipping-returns" className="hover:text-white transition-colors duration-300">Shipping & Returns</Link></li>
              <li><Link to="/size-guide" className="hover:text-white transition-colors duration-300">Size Guide</Link></li>
            </ul>
          </div>

          {/* 4. Contact Info */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase mb-6 text-gray-100">Get in Touch</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-center gap-3">
                <MdEmail className="text-lg" /> support@elare.com
              </li>
              <li className="flex items-center gap-3">
                <MdPhone className="text-lg" /> +880 1712-345678
              </li>
              <li className="flex flex-start gap-3">
                <MdLocationOn className="text-lg shrink-0 mt-0.5" /> 
                <span>Banani, Dhaka - 1213<br/>Bangladesh</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar (Copyright & Legal) */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-medium tracking-wide">
          <p>&copy; {new Date().getFullYear()} ELARE. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="hover:text-white transition-colors duration-300">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-white transition-colors duration-300">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
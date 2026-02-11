import React, { useState } from 'react';
import { socialLinks } from '../data/mock';
import { Coffee, Instagram, Facebook, Twitter, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for subscribing to our newsletter!');
    setEmail('');
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#3E2723] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Coffee className="h-8 w-8 text-[#D4AF37]" />
              <span className="text-2xl font-bold">Nescafe Restaurant</span>
            </div>
            <p className="text-[#FFF8E1]">
              Serving premium coffee and creating memorable moments since 2012.
            </p>
            <div className="flex space-x-4">
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-2 rounded-full hover:bg-[#D4AF37] transition-colors duration-300"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-2 rounded-full hover:bg-[#D4AF37] transition-colors duration-300"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-2 rounded-full hover:bg-[#D4AF37] transition-colors duration-300"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-[#D4AF37]">Quick Links</h3>
            <ul className="space-y-2">
              {['menu', 'about', 'gallery', 'contact'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => scrollToSection(item)}
                    className="text-[#FFF8E1] hover:text-[#D4AF37] transition-colors capitalize"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-[#D4AF37]">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span className="text-[#FFF8E1] text-sm">123 Coffee Street, Downtown</span>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="h-5 w-5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span className="text-[#FFF8E1] text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-2">
                <Mail className="h-5 w-5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span className="text-[#FFF8E1] text-sm">hello@nescaferestaurant.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-[#D4AF37]">Newsletter</h3>
            <p className="text-[#FFF8E1] mb-4 text-sm">
              Subscribe to get special offers and updates!
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
              <button
                type="submit"
                className="w-full bg-[#D4AF37] text-[#3E2723] py-2 rounded-lg font-semibold hover:bg-[#c19d2f] transition-colors duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-[#FFF8E1] text-sm mb-4 md:mb-0 font-mono">
           // Made with ❤️, ☕, and a bit of code
          </p>
          <div className="flex space-x-6 text-sm">
            <button className="text-[#FFF8E1] hover:text-[#D4AF37] transition-colors">
              Privacy Policy
            </button>
            <button className="text-[#FFF8E1] hover:text-[#D4AF37] transition-colors">
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

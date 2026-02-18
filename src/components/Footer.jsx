import React from 'react';
import nescafeLogo from '../assets/logos/nescafe-logo.png';
import { socialLinks, contactInfo } from '../data/mock';
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#3E2723] text-white pt-8 sm:pt-10 md:pt-16 pb-6 sm:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-10 md:mb-12">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-full border-2 border-[#D4AF37] bg-white p-0.5">
                <img
                  src={nescafeLogo}
                  alt="Nescafe Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-xl sm:text-2xl font-bold tracking-tight">Nescafe<span className="text-[#D4AF37]">IITPKD</span></span>
            </div>
            <p className="text-[#FFF8E1] text-sm sm:text-base">
              Serving premium coffee and creating memorable moments since 2025.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-2 rounded-full hover:bg-[#D4AF37] transition-colors duration-300"
              >
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-2 rounded-full hover:bg-[#D4AF37] transition-colors duration-300"
              >
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-2 rounded-full hover:bg-[#D4AF37] transition-colors duration-300"
              >
                <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a
                href={`https://wa.me/${contactInfo.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-1 rounded-full hover:bg-[#25D366] transition-colors duration-300 flex items-center justify-center overflow-hidden"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5 fill-current" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L.054 23.486a.5.5 0 0 0 .609.61l5.7-1.494A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.956 9.956 0 0 1-5.193-1.453l-.372-.22-3.853 1.01 1.028-3.758-.242-.386A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-[#D4AF37]">Quick Links</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {['menu', 'about', 'gallery', 'contact'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => scrollToSection(item)}
                    className="text-[#FFF8E1] hover:text-[#D4AF37] transition-colors capitalize text-sm sm:text-base"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-[#D4AF37]">Contact Info</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span className="text-[#FFF8E1] text-xs sm:text-sm">123 Coffee Street, Downtown</span>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span className="text-[#FFF8E1] text-xs sm:text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-2">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span className="text-[#FFF8E1] text-xs sm:text-sm">hello@nescaferestaurant.com</span>
              </li>
            </ul>
          </div>


        </div>

        <div className="border-t border-white/10 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#FFF8E1] text-xs sm:text-sm font-mono text-center md:text-left">
           // Made with a bit of code and a lots of ☕.
          </p>
          <div className="flex space-x-4 sm:space-x-6 text-xs sm:text-sm">
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

import React, { useState, useEffect } from 'react';
import nescafeLogo from '../assets/logos/nescafe-logo.png';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(prev => (prev !== isScrolled ? isScrolled : prev));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || isMobileMenuOpen
        ? 'bg-white/90 backdrop-blur-md shadow-md py-3'
        : 'bg-transparent py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div
            className="flex items-center space-x-3 cursor-pointer group z-50 relative"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="relative h-12 w-12 md:h-16 md:w-16 overflow-hidden rounded-full border-2 border-[#D4AF37] bg-white p-1 shadow-lg transition-transform duration-300 group-hover:scale-105">
              <img
                src={nescafeLogo}
                alt="Nescafe Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <span className={`text-xl md:text-2xl font-bold tracking-tight ${(scrolled || isMobileMenuOpen) ? 'text-[#3E2723]' : 'text-white'}`}>
              Nescafe<span className="text-[#D4AF37]">IITPKD</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {['menu', 'about', 'gallery', 'contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className={`capitalize font-medium transition-colors duration-200 ${scrolled
                  ? 'text-[#3E2723] hover:text-[#D4AF37]'
                  : 'text-white hover:text-[#FFF8E1]'
                  }`}
              >
                {item === 'contact' ? "Let's Talk" : item}
              </button>
            ))}
            <button
              onClick={() => scrollToSection('menu')}
              className="bg-[#D4AF37] text-[#3E2723] px-6 py-2 rounded-full font-semibold hover:bg-[#c19d2f] transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              I'm In
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden z-50">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-full transition-colors ${scrolled || isMobileMenuOpen ? 'text-[#3E2723]' : 'text-white'
                }`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col items-center justify-center space-y-8 ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
          }`}
      >
        <div className="flex flex-col items-center space-y-6 w-full px-8">
          {['menu', 'about', 'gallery', 'contact'].map((item, index) => (
            <button
              key={item}
              onClick={() => scrollToSection(item)}
              className="capitalize text-2xl font-bold text-[#3E2723] hover:text-[#D4AF37] transition-all w-full text-center py-2 border-b border-gray-100 last:border-0"
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              {item === 'contact' ? "Let's Talk" : item}
            </button>
          ))}
          <button
            onClick={() => scrollToSection('menu')}
            className="bg-[#D4AF37] text-[#3E2723] px-8 py-3 rounded-full font-bold text-xl hover:bg-[#c19d2f] transition-all duration-300 w-full shadow-lg mt-4"
          >
            I'm In
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

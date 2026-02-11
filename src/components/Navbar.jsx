import React, { useState, useEffect } from 'react';
import { Coffee } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(prev => (prev !== isScrolled ? isScrolled : prev));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/90 backdrop-blur-md shadow-md py-3'
        : 'bg-transparent py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <Coffee className={`h-8 w-8 ${scrolled ? 'text-[#3E2723]' : 'text-white'}`} />
            <span className={`text-2xl font-bold ${scrolled ? 'text-[#3E2723]' : 'text-white'}`}>
              Nescafe Restaurant
            </span>
          </div>

          <div className="hidden md:flex space-x-8">
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
          </div>

          <button
            onClick={() => scrollToSection('menu')}
            className="bg-[#D4AF37] text-[#3E2723] px-6 py-2 rounded-full font-semibold hover:bg-[#c19d2f] transition-all duration-300 hover:scale-105"
          >
            I'm In
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

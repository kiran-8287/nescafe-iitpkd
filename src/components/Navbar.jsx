import React, { useState, useEffect } from 'react';
import nescafeLogo from '../assets/logos/nescafe-logo.png';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { cartCount, toggleCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleOutside = (e) => {
      if (!e.target.closest('#mobile-menu') && !e.target.closest('#hamburger-btn')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isMobileMenuOpen]);

  const scrollToSection = (id) => {
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const navItems = [
    { id: 'menu', label: 'Menu' },
    { id: 'about', label: 'About' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'contact', label: "Let's Talk" },
  ];

  return (
    <>
      {/* ── Main Navbar bar ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">

            {/* Logo + Brand */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 group"
            >
              <div className="h-9 w-9 sm:h-11 sm:w-11 md:h-14 md:w-14 overflow-hidden rounded-full border-2 border-[#D4AF37] bg-white p-0.5 shadow-md transition-transform duration-300 group-hover:scale-105">
                <img src={nescafeLogo} alt="Nescafe Logo" className="h-full w-full object-contain" />
              </div>
              <span className={`text-base sm:text-lg md:text-2xl font-bold tracking-tight transition-colors duration-300 ${scrolled ? 'text-[#3E2723]' : 'text-white'}`}>
                Nescafe<span className="text-[#D4AF37]">IITPKD</span>
              </span>
            </button>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`font-medium transition-colors duration-200 hover:text-[#D4AF37] ${scrolled ? 'text-[#3E2723]' : 'text-white'
                    }`}
                >
                  {item.label}
                </button>
              ))}

              {/* Cart Button with Badge */}
              <button
                onClick={toggleCart}
                className={`relative p-2 transition-all duration-300 hover:scale-110 ${scrolled ? 'text-[#3E2723]' : 'text-white'}`}
              >
                <ShoppingBag size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-[#3E2723] text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => scrollToSection('menu')}
                className="bg-[#D4AF37] text-[#3E2723] px-5 py-2 rounded-full font-semibold hover:bg-[#c19d2f] transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                I'm In
              </button>
            </div>

            {/* Mobile — hamburger icon (right side) */}
            <button
              id="hamburger-btn"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
              className={`md:hidden p-2 rounded-lg transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center ${scrolled ? 'text-[#3E2723]' : 'text-white'
                }`}
            >
              {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile dropdown popup ── */}
      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Dropdown panel — slides down from top */}
      <div
        id="mobile-menu"
        className={`fixed top-0 left-0 right-0 z-40 md:hidden bg-white shadow-xl transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
          }`}
      >
        {/* Top row: logo + close button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-[#D4AF37] bg-white p-0.5">
              <img src={nescafeLogo} alt="Nescafe Logo" className="h-full w-full object-contain" />
            </div>
            <span className="text-base font-bold text-[#3E2723]">
              Nescafe<span className="text-[#D4AF37]">IITPKD</span>
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-[#3E2723] min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Nav links */}
        <div className="px-4 py-2">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="w-full text-left px-3 py-4 text-[#3E2723] font-semibold text-base border-b border-gray-100 last:border-0 hover:text-[#D4AF37] hover:bg-[#FFF8E1] rounded-lg transition-all duration-200 min-h-[52px] flex items-center"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              {item.label}
            </button>
          ))}

          {/* I'm In CTA */}
          <div className="py-4">
            <button
              onClick={() => scrollToSection('menu')}
              className="w-full bg-[#D4AF37] text-[#3E2723] py-3 rounded-full font-bold text-base hover:bg-[#c19d2f] transition-all duration-300 shadow-md min-h-[48px]"
            >
              I'm In ☕
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;

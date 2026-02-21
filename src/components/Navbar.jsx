import React, { useState, useEffect } from 'react';
import nescafeLogo from '../assets/logos/nescafe-logo.png';
import { Menu as MenuIcon, X, ShoppingCart, User, ClipboardList } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ activeSection, onHome, onNavigate }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartCount, toggleCart } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    if (onNavigate) {
      onNavigate(id);
    } else {
      setTimeout(() => {
        if (document.getElementById(id)) {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        } else if (onHome) {
          onHome();
          setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }, 150);
    }
  };

  const navItems = [
    { id: 'menu', label: 'Menu' },
    { id: 'about', label: 'About' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'orders', label: 'Orders', isRoute: '/order-history', icon: ClipboardList, desktopOnly: true },
  ];

  return (
    <>
      {/* ── Main Navbar bar ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans bg-white shadow-md py-2"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">

            {/* Logo + Brand */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (onHome) onHome();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 group"
            >
              <div className="h-9 w-9 sm:h-11 sm:w-11 md:h-14 md:w-14 overflow-hidden rounded-full border-2 border-[#D4AF37] bg-white p-0.5 shadow-md transition-transform duration-300 group-hover:scale-105">
                <img src={nescafeLogo} alt="Nescafe Logo" className="h-full w-full object-contain" />
              </div>
              <span className="text-base sm:text-lg md:text-2xl font-bold tracking-tight text-[#3E2723]">
                NESCAFE<span className="text-[#D4AF37]">IITPKD</span>
              </span>
            </button>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => item.isRoute ? navigate(item.isRoute) : scrollToSection(item.id)}
                  className={`font-black uppercase text-sm tracking-widest transition-all duration-300 hover:text-[#D4AF37] relative group ${activeSection === item.id
                    ? 'text-[#D4AF37]'
                    : 'text-[#3E2723]'
                    }`}
                >
                  {item.label}
                  <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-[#D4AF37] transition-transform duration-300 ${activeSection === item.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`} />
                </button>
              ))}

              {/* Cart Button with Badge */}
              <button
                id="desktop-cart-icon"
                onClick={toggleCart}
                className="relative p-2 transition-all duration-300 hover:scale-110 text-[#3E2723]"
              >
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-[#3E2723] text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Profile/Login Button */}
              <button
                onClick={() => navigate(user ? '/dashboard' : '/login')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-gray-100 text-[#3E2723] hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-sm"
              >
                <div className="relative">
                  <User size={20} className={user ? 'text-[#D4AF37]' : ''} />
                  {user && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <span className="text-xs font-black uppercase tracking-wider">
                  {user ? 'Profile' : 'Login'}
                </span>
              </button>
            </div>

            {/* Mobile — hamburger icon (right side) */}
            <button
              id="hamburger-btn"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
              className="md:hidden p-2 rounded-lg transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#3E2723]"
            >
              {isMobileMenuOpen ? <X size={26} /> : <MenuIcon size={26} />}
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
            <span className="text-base font-bold text-[#3E2723]" onClick={() => { if (onHome) onHome(); setIsMobileMenuOpen(false); window.scrollTo(0, 0); }}>
              NESCAFE<span className="text-[#D4AF37]">IITPKD</span>
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
          {navItems.filter(item => !item.desktopOnly).map((item, index) => (
            <button
              key={item.id}
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (item.isRoute) navigate(item.isRoute);
                else scrollToSection(item.id);
              }}
              className={`w-full text-left px-4 py-4 font-bold text-base border-b border-gray-50 last:border-0 transition-all duration-200 min-h-[52px] flex items-center justify-between group ${activeSection === item.id
                ? 'text-[#D4AF37] bg-[#FFF8E1]'
                : 'text-[#3E2723] hover:bg-gray-50'
                }`}
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <span className="flex items-center gap-2">{item.icon && <item.icon size={16} />}{item.label}</span>
              {activeSection === item.id && <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />}
            </button>
          ))}

          {/* Member Profile/Login CTA */}
          <div className="py-4">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate(user ? '/dashboard' : '/login');
              }}
              className="w-full bg-[#3E2723] text-white py-4 rounded-full font-bold text-base hover:bg-[#5D4037] transition-all duration-300 shadow-md min-h-[48px] flex items-center justify-center gap-2"
            >
              <User size={18} /> {user ? 'My Profile' : 'Member Login'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;

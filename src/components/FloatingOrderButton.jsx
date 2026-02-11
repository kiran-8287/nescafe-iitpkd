import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const FloatingOrderButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const shouldShow = window.pageYOffset > 300;
      setIsVisible(prev => (prev !== shouldShow ? shouldShow : prev));
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-[#D4AF37] text-[#3E2723] p-4 rounded-full shadow-2xl hover:bg-[#c19d2f] transition-all duration-300 hover:scale-110 z-40 flex items-center gap-2 group"
          style={{
            animation: 'slideInRight 0.5s ease-out'
          }}
        >
          <ArrowUp className="h-6 w-6" />
          <span className="hidden group-hover:inline-block font-semibold pr-2">Back to reality</span>
        </button>
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default FloatingOrderButton;

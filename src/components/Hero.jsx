import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const HEADLINES = [
  "Where Semicolons Meet Espresso Shots",
  "Compiling Dreams, One Cup at a Time",
  "404: Sleep Not Found. Coffee Located.",
  "The Only Breakpoint You'll Enjoy",
  "Fueling All-Nighters Since 2015"
];

const Hero = () => {
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // Start fading out
      setTimeout(() => {
        setCurrentHeadline((prev) => (prev + 1) % HEADLINES.length);
        setFade(true); // Fade back in after text change
      }, 500); // 500ms fade out duration
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pb-8 sm:pb-12">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1629991848910-2ab88d9cc52f?q=80&w=2000')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#3E2723]/90 to-[#5D4037]/70"></div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <div className="animate-fadeIn">
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight min-h-[80px] sm:min-h-[100px] md:min-h-[160px] flex flex-col justify-center">
            <span className={`transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
              {HEADLINES[currentHeadline]}
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-2xl text-[#FFF8E1] mb-6 sm:mb-8 md:mb-12 max-w-2xl mx-auto px-2 sm:px-4">
            The official unofficial hub of IITPKD - <br className="hidden sm:block" />
            Where ideas brew, friendships form, and deadlines are conquered, all over great coffee
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full sm:w-auto px-4 sm:px-6 md:px-0">
            <button
              onClick={scrollToMenu}
              className="bg-[#D4AF37] text-[#3E2723] px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 w-full sm:w-auto rounded-full font-bold text-sm sm:text-base md:text-lg hover:bg-[#c19d2f] transition-all duration-300 hover:scale-105 hover:shadow-xl min-h-[44px]"
            >
              Feed my curiosity!
            </button>
            <button
              onClick={() => {
                scrollToMenu();
                // Simple logic to simulate "Surprise Me" - just finding a random item could be added later
                // For now, just scroll
              }}
              className="bg-transparent border-2 border-white text-white px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 w-full sm:w-auto rounded-full font-bold text-sm sm:text-base md:text-lg hover:bg-white hover:text-[#3E2723] transition-all duration-300 hover:scale-105 min-h-[44px]"
            >
              Surprise Me
            </button>
          </div>

          <div className="mt-8 sm:mt-12 flex flex-col items-center gap-1 sm:gap-2 animate-bounce cursor-pointer opacity-80 hover:opacity-100 transition-opacity" onClick={scrollToMenu}>
            <span className="text-[#FFF8E1] text-xs sm:text-sm font-light tracking-widest uppercase">Scroll for enlightenment</span>
            <ChevronDown className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }
      `}</style>
    </section>
  );
};

export default Hero;

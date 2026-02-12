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
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
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
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight min-h-[160px] flex flex-col justify-center">
            <span className={`transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
              {HEADLINES[currentHeadline]}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-[#FFF8E1] mb-12 max-w-2xl mx-auto">
            The official unofficial hub of IITPKD - <br />
            Where ideas brew, friendships form, and deadlines are conquered,all over great coffee <br />
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={scrollToMenu}
              className="bg-[#D4AF37] text-[#3E2723] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#c19d2f] transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Show Me the Goods
            </button>
            <button
              onClick={() => {
                scrollToMenu();
                // Simple logic to simulate "Surprise Me" - just finding a random item could be added later
                // For now, just scroll
              }}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-[#3E2723] transition-all duration-300 hover:scale-105"
            >
              Surprise Me
            </button>
          </div>

          <div className="mt-12 flex flex-col items-center gap-2 animate-bounce cursor-pointer opacity-80 hover:opacity-100 transition-opacity" onClick={scrollToMenu}>
            <span className="text-[#FFF8E1] text-sm font-light tracking-widest uppercase">Scroll for enlightenment</span>
            <ChevronDown className="h-8 w-8 text-white" />
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

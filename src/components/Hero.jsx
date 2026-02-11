import React from 'react';
import { ChevronDown } from 'lucide-react';

const Hero = () => {
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
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Where Every Cup
            <br />
            <span className="text-[#D4AF37]">Tells a Story</span>
          </h1>

          <p className="text-xl md:text-2xl text-[#FFF8E1] mb-12 max-w-2xl mx-auto">
            Experience the finest Nescafe coffee and artisanal treats in a warm, inviting atmosphere
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={scrollToMenu}
              className="bg-[#D4AF37] text-[#3E2723] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#c19d2f] transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              View Menu
            </button>
            <button
              onClick={scrollToMenu}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-[#3E2723] transition-all duration-300 hover:scale-105"
            >
              Order Now
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-10 w-10 text-white cursor-pointer" onClick={scrollToMenu} />
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

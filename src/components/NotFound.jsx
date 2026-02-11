import React from 'react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-[#3E2723] flex items-center justify-center text-center p-4">
            <div className="max-w-2xl">
                <h1 className="text-6xl md:text-8xl font-bold text-[#D4AF37] mb-4 font-mono">
                    Error 404
                </h1>
                <h2 className="text-2xl md:text-3xl text-[#FFF8E1] mb-8 font-semibold">
                    Page Not Found
                </h2>

                <div className="bg-[#4E342E] p-8 rounded-xl border-2 border-[#D4AF37] mb-8 shadow-2xl transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                    <p className="text-xl md:text-2xl text-[#FFF8E1] italic mb-4">
                        "This page is more lost than a first-year looking for the EEE block on day 1"
                    </p>
                    <p className="text-[#D4AF37] font-mono">
                        But hey, you found our café! That's what really matters ☕
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="/"
                        className="bg-[#D4AF37] text-[#3E2723] px-8 py-3 rounded-full font-bold hover:bg-[#c19d2f] transition-all duration-300 hover:scale-105"
                    >
                        Return Home
                    </a>
                    <button
                        onClick={() => window.location.href = '/#menu'}
                        className="bg-transparent border-2 border-[#D4AF37] text-[#D4AF37] px-8 py-3 rounded-full font-bold hover:bg-[#D4AF37] hover:text-[#3E2723] transition-all duration-300 hover:scale-105"
                    >
                        Check Menu Instead
                    </button>
                </div>

                <p className="mt-12 text-[#8D6E63] font-mono text-sm">
          // Fun fact: This 404 page has been visited 127 times. You're not alone!
                </p>
            </div>
        </div>
    );
};

export default NotFound;

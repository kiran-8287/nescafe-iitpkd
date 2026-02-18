import React, { useState, useEffect } from 'react';
import nescafeLogo from '../assets/logos/nescafe-logo.png';
import iitPkdLogo from '../assets/logos/IIT_PKD_long logo_RGB.jpg';

const LoadingScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [currentMessage, setCurrentMessage] = useState(0);

    const messages = [
        "Initializing café experience...",
        "// Brewing something special",
        "// Loading good vibes",
        "// Preparing your digital coffee"
    ];

    useEffect(() => {
        // Progress bar animation
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setTimeout(onComplete, 500); // Small delay before unmounting
                    return 100;
                }
                // Random increment for more realistic feel
                return prev + Math.random() * 2;
            });
        }, 50);

        return () => clearInterval(timer);
    }, [onComplete]);

    useEffect(() => {
        // Message cycling
        const messageTimer = setInterval(() => {
            setCurrentMessage((prev) => (prev + 1) % messages.length);
        }, 800);

        return () => clearInterval(messageTimer);
    }, []);

    return (
        <div className="fixed inset-0 bg-[#2b1d1a] z-[100] flex flex-col items-center justify-center text-[#faebd7]">
            <div className="w-full max-w-md px-4 sm:px-6">
                <div className="flex items-center justify-center gap-4 sm:gap-8 mb-8 sm:mb-12">
                    <div className="h-16 w-16 sm:h-24 sm:w-24 bg-white rounded-full p-2 border-2 border-[#D4AF37] shadow-xl overflow-hidden shrink-0">
                        <img src={nescafeLogo} alt="Nescafe" className="h-full w-full object-contain" />
                    </div>
                    <div className="h-16 w-32 sm:h-24 sm:w-48 bg-white rounded-xl p-2 border-2 border-[#D4AF37] shadow-xl overflow-hidden shrink-0">
                        <img src={iitPkdLogo} alt="IIT Palakkad" className="h-full w-full object-contain" />
                    </div>
                </div>

                <div className="mb-2 font-mono text-[#D4AF37] text-sm sm:text-base md:text-lg h-8">
                    &gt; {messages[currentMessage]}
                </div>

                <div className="w-full bg-[#4e342e] h-4 rounded-full overflow-hidden border border-[#5d4037]">
                    <div
                        className="h-full bg-[#D4AF37] transition-all duration-100 ease-out relative"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                </div>

                <div className="mt-2 text-right font-mono text-sm text-[#8d6e63]">
                    {Math.min(Math.round(progress), 100)}%
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;

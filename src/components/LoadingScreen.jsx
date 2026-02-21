import React, { useState, useEffect } from 'react';
import landingVideo from '../videos/landing-coffee.mp4';

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
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setTimeout(onComplete, 500);
                    return 100;
                }
                return prev + Math.random() * 2;
            });
        }, 50);
        return () => clearInterval(timer);
    }, [onComplete]);

    useEffect(() => {
        const messageTimer = setInterval(() => {
            setCurrentMessage((prev) => (prev + 1) % messages.length);
        }, 800);
        return () => clearInterval(messageTimer);
    }, []);

    return (
        <div className="fixed inset-0 bg-[#2b1d1a] z-[100] flex flex-col items-center justify-center text-[#faebd7]">
            <div className="w-full max-w-md px-4 sm:px-6 flex flex-col items-center">

                {/* Video with circular mask and progress ring */}
                <div className="relative mb-8 sm:mb-12 flex items-center justify-center">

                    {/* Animated SVG progress ring behind the video */}
                    <svg
                        className="absolute"
                        width="200"
                        height="200"
                        viewBox="0 0 200 200"
                    >
                        {/* Track ring */}
                        <circle
                            cx="100" cy="100" r="92"
                            fill="none"
                            stroke="#4e342e"
                            strokeWidth="6"
                        />
                        {/* Progress ring */}
                        <circle
                            cx="100" cy="100" r="92"
                            fill="none"
                            stroke="#D4AF37"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 92}`}
                            strokeDashoffset={`${2 * Math.PI * 92 * (1 - progress / 100)}`}
                            transform="rotate(-90 100 100)"
                            style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
                        />
                        {/* Glowing dot at progress tip */}
                        <circle
                            cx={100 + 92 * Math.cos((progress / 100 * 360 - 90) * Math.PI / 180)}
                            cy={100 + 92 * Math.sin((progress / 100 * 360 - 90) * Math.PI / 180)}
                            r="5"
                            fill="#D4AF37"
                            style={{ filter: 'drop-shadow(0 0 6px #D4AF37)' }}
                        />
                    </svg>

                    {/* Circular video */}
                    <div
                        className="relative overflow-hidden rounded-full"
                        style={{
                            width: 168,
                            height: 168,
                            boxShadow: '0 0 30px rgba(212,175,55,0.25)',
                        }}
                    >
                        <video
                            src={landingVideo}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover scale-110"
                        />
                        {/* Subtle dark vignette overlay */}
                        <div
                            className="absolute inset-0 rounded-full"
                            style={{
                                background: 'radial-gradient(circle, transparent 50%, rgba(43,29,26,0.45) 100%)',
                            }}
                        />
                    </div>
                </div>

                {/* Brand name */}
                <div className="font-serif text-2xl font-bold tracking-tight text-[#D4AF37] mb-5 uppercase">
                    NESCAFE BANGARAM
                </div>

                {/* Terminal message */}
                <div className="mb-3 font-mono text-[#D4AF37] text-sm sm:text-base h-6 w-full text-center">
                    &gt; {messages[currentMessage]}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#4e342e] h-3 rounded-full overflow-hidden border border-[#5d4037]">
                    <div
                        className="h-full bg-[#D4AF37] transition-all duration-100 ease-out relative"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                </div>

                <div className="mt-2 text-right w-full font-mono text-sm text-[#8d6e63]">
                    {Math.min(Math.round(progress), 100)}%
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;

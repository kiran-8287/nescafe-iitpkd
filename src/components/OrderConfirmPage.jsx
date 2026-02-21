import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, MapPin, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import coffeeVideo from '../videos/coffee.mp4';

const OrderConfirmPage = () => {
    const { clearCart } = useCart();
    const location = useLocation();

    // Get State from navigation
    const { orderMode, hostelDetails } = location.state || { orderMode: 'pickup', hostelDetails: null };

    const orderId = `#BNC-${Math.floor(1000 + Math.random() * 9000)}`;

    useEffect(() => {
        // Clear cart on mount
        clearCart();

        // Trigger Confetti
        const duration = 2000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#3E2723', '#D4AF37', '#FFF8E1']
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#3E2723', '#D4AF37', '#FFF8E1']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();

        // Haptic - use vibration if available
        if (navigator.vibrate) try { navigator.vibrate([10, 50, 10]); } catch (e) { }

    }, []);

    return (
        <div className="min-h-screen bg-[#3E2723] text-[#FAF6F1] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#5D4037 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            {/* Video & Checkmark Container */}
            <div className="relative mb-8 z-10">
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 150, damping: 15 }}
                    className="w-48 h-48 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl relative"
                >
                    <video
                        src={coffeeVideo}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover scale-125"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                </motion.div>

                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
                    className="absolute -bottom-2 -right-2 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-xl border-4 border-[#3E2723]"
                >
                    <Check size={28} className="text-white" strokeWidth={4} />
                </motion.div>
            </div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-black mb-2 font-serif"
            >
                Order Confirmed!
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white/80 mb-8 max-w-xs mx-auto font-medium"
            >
                {orderMode === 'delivery'
                    ? "Order placed. Now go touch grass. Just kidding — finish that assignment."
                    : "Your order is being prepared. Please collect it from the counter."}
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full max-w-sm mb-8 border border-white/10"
            >
                <div className="flex justify-between mb-4 pb-4 border-b border-white/10">
                    <span className="text-white/60 text-sm font-bold uppercase tracking-wider">Order ID</span>
                    <span className="font-mono font-black text-[#D4AF37]">{orderId}</span>
                </div>

                {/* Context Aware Info */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <span className="text-white/60 text-sm font-bold flex items-center gap-2 uppercase tracking-wider"><Clock size={16} /> Est. Time</span>
                        <span className="font-black text-[#D4AF37]">
                            {orderMode === 'delivery' ? '~20-30 mins' : '~10-15 mins'}
                        </span>
                    </div>

                    {orderMode === 'delivery' && hostelDetails && (
                        <div className="flex justify-between items-start text-left">
                            <span className="text-white/60 text-sm font-bold flex items-center gap-2 shrink-0 uppercase tracking-wider"><MapPin size={16} /> Delivering To</span>
                            <span className="font-black text-white text-right text-sm">
                                {hostelDetails.block}<br />
                                <span className="text-white/60 font-medium">Room {hostelDetails.room}</span>
                            </span>
                        </div>
                    )}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex flex-col gap-4 w-full max-w-sm relative z-10"
            >
                <div className="flex flex-col gap-2">
                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest text-center">
                        Explore some fun facts while your order is being prepared ;)
                    </p>
                    <Link
                        to="/fun-facts"
                        className="w-full bg-[#D4AF37] text-[#3E2723] py-4 rounded-2xl font-black hover:bg-[#c19d2f] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                    >
                        Fun Facts Time!
                    </Link>
                </div>
                <Link
                    to="/"
                    className="w-full bg-white text-[#3E2723] py-4 rounded-2xl font-black hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                >
                    Back to Menu <ArrowRight size={18} />
                </Link>
            </motion.div>
        </div>
    );
};

export default OrderConfirmPage;

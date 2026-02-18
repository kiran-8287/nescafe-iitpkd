import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const MiniCartBar = () => {
    const { cartCount, cartTotal, toggleCart } = useCart();

    return (
        <AnimatePresence>
            {cartCount > 0 && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-[76px] left-0 right-0 z-40 px-4 md:hidden"
                >
                    <button
                        onClick={toggleCart}
                        className="w-full bg-[#3E2723] text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between group active:scale-95 transition-transform"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-[#D4AF37] p-2 rounded-xl text-[#3E2723]">
                                <ShoppingBag size={20} />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Your Cart</p>
                                <p className="text-sm font-black">{cartCount} {cartCount === 1 ? 'Item' : 'Items'} • ${cartTotal.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 font-bold text-sm">
                            View Cart
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MiniCartBar;

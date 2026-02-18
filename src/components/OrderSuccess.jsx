import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, ExternalLink, Coffee } from 'lucide-react';

const OrderSuccess = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-[#3E2723]/80 backdrop-blur-md pointer-events-auto"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-[40px] z-[110] shadow-2xl p-6 sm:p-8 overflow-hidden text-center pointer-events-auto"
                        >
                            {/* Success Animation */}
                            <div className="relative mb-6 flex justify-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                                    className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center"
                                >
                                    <CheckCircle size={48} className="text-green-500" />
                                </motion.div>

                                {/* Confetti-like particles */}
                                {[...Array(6)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1, x: (i % 2 === 0 ? 1 : -1) * (Math.random() * 60 + 40), y: -Math.random() * 60 - 40 }}
                                        transition={{ delay: 0.3 + (i * 0.05), duration: 0.5 }}
                                        className={`absolute w-3 h-3 rounded-full ${i % 2 === 0 ? 'bg-[#D4AF37]' : 'bg-green-400'}`}
                                    />
                                ))}
                            </div>

                            <h2 className="text-2xl font-black text-[#3E2723] mb-2 uppercase tracking-tight">Order Proceeded!</h2>
                            <p className="text-gray-500 text-sm leading-relaxed mb-8">
                                We've redirected you to WhatsApp to finalize your order. Our team will confirm your pick-up time shortly.
                            </p>

                            <div className="bg-gray-50 rounded-3xl p-6 mb-8 text-left space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="bg-white p-2 rounded-xl shadow-sm text-[#D4AF37]">
                                        <ExternalLink size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-[#3E2723]">WhatsApp Redirect</h4>
                                        <p className="text-xs text-gray-400">Clicking "Send" in WhatsApp is the final step.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-white p-2 rounded-xl shadow-sm text-[#D4AF37]">
                                        <Coffee size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-[#3E2723]">Pick-up Counter</h4>
                                        <p className="text-xs text-gray-400">Please show your WhatsApp confirmation at the counter.</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full bg-[#3E2723] text-white py-4 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-transform"
                            >
                                Back to Menu
                            </button>

                            <button
                                onClick={onClose}
                                className="mt-4 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-[#3E2723] transition-colors"
                            >
                                Wait, I forgot something
                            </button>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default OrderSuccess;

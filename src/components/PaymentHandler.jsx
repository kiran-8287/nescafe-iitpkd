import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Smartphone, CheckCircle, ShieldCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentHandler = ({ amount, onPaymentSuccess, onCancel }) => {
    const [step, setStep] = useState('choice'); // choice, upi, success
    const [isProcessing, setIsProcessing] = useState(false);

    const handleUPIPayment = () => {
        setIsProcessing(true);
        // Simulate a delay for the UPI app to open and process
        setTimeout(() => {
            setIsProcessing(false);
            setStep('success');
            setTimeout(() => {
                onPaymentSuccess();
            }, 2000);
        }, 3000);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-end sm:items-center justify-center p-4">
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                className="bg-white w-full max-w-sm rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl"
            >
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black text-[#3E2723]">Payment</h2>
                        <button onClick={onCancel} className="text-gray-300 hover:text-red-500 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 'choice' && (
                            <motion.div
                                key="choice"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="bg-[#FFF8E1] p-4 rounded-3xl mb-6">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                                    <p className="text-4xl font-black text-[#3E2723]">₹{amount.toFixed(2)}</p>
                                </div>

                                <button
                                    onClick={() => setStep('upi')}
                                    className="w-full flex items-center justify-between p-5 bg-white border-2 border-gray-100 rounded-3xl hover:border-[#D4AF37] transition-all group active:scale-95"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-blue-50 text-blue-500 p-3 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                            <Smartphone size={24} />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black text-[#3E2723]">Pay via UPI</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">GPay, PhonePe, Paytm</p>
                                        </div>
                                    </div>
                                    <ShieldCheck size={20} className="text-green-500" />
                                </button>

                                <button
                                    disabled
                                    className="w-full flex items-center justify-between p-5 bg-gray-50 border-2 border-transparent rounded-3xl opacity-50 cursor-not-allowed grayscale"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-orange-50 text-orange-500 p-3 rounded-2xl">
                                            <CreditCard size={24} />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black text-gray-400">Card Payment</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Disabled in demo</p>
                                        </div>
                                    </div>
                                </button>
                            </motion.div>
                        )}

                        {step === 'upi' && (
                            <motion.div
                                key="upi"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="text-center py-8"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-20 h-20 border-4 border-[#3E2723] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                                        <h3 className="text-xl font-black text-[#3E2723] mb-2">Connecting to UPI...</h3>
                                        <p className="text-gray-400 text-sm">Please approve the request in your preferred UPI app.</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500">
                                            <Smartphone size={40} />
                                        </div>
                                        <h3 className="text-xl font-black text-[#3E2723] mb-6">Unlock to Pay</h3>
                                        <button
                                            onClick={handleUPIPayment}
                                            className="w-full bg-[#3E2723] text-white py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all"
                                        >
                                            Open UPI App
                                        </button>
                                    </>
                                )}
                            </motion.div>
                        )}

                        {step === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <div className="bg-green-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg">
                                    <CheckCircle size={40} strokeWidth={3} />
                                </div>
                                <h3 className="text-2xl font-black text-[#3E2723] mb-2">Payment Verified</h3>
                                <p className="text-gray-400 text-sm">Redirecting to confirmation...</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentHandler;

import React from 'react';
import { motion } from 'framer-motion';
import { coffeeFacts } from '../data/mock';
import { ArrowLeft, Coffee, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const FunFacts = () => {
    return (
        <div className="min-h-screen bg-[#FFF8E1] pt-20 pb-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        to="/"
                        className="p-2 hover:bg-[#3E2723]/10 rounded-full transition-colors"
                    >
                        <ArrowLeft className="text-[#3E2723]" />
                    </Link>
                    <h1 className="text-3xl sm:text-4xl font-black text-[#3E2723] font-serif">
                        Coffee Curiosities
                    </h1>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {coffeeFacts.map((fact, index) => (
                        <motion.div
                            key={fact.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-6 rounded-3xl shadow-lg border border-[#3E2723]/5 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/10 rounded-bl-full -mr-12 -mt-12 transition-all duration-500 group-hover:bg-[#D4AF37]/20" />

                            <div className="flex items-start gap-4 relative z-10">
                                <div className="bg-[#3E2723] text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
                                    {index + 1}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[#3E2723] mb-3 leading-tight">
                                        {fact.title}
                                    </h3>
                                    <p className="text-[#5D4037] leading-relaxed font-medium">
                                        {fact.content}
                                    </p>
                                </div>
                            </div>

                            <div className="absolute bottom-4 right-6 text-[#D4AF37]/20 group-hover:text-[#D4AF37]/40 transition-colors">
                                <Coffee size={40} strokeWidth={1.5} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-12 text-center"
                >
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 bg-[#3E2723] text-white px-8 py-4 rounded-full font-black text-lg hover:bg-[#5D4037] transition-all hover:scale-105 shadow-xl"
                    >
                        Back to Home
                    </Link>
                    <p className="mt-4 text-[#8D6E63] font-medium">
                        Your caffeine is being optimized. Hang tight! ☕
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default FunFacts;

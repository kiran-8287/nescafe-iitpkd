import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { coffeeFacts } from '../data/mock';
import { ArrowLeft, Coffee, Soup } from 'lucide-react';
import { Link } from 'react-router-dom';

const maggieFacts = [
    {
        id: 13,
        title: "Maggi was invented for working women",
        content: "Julius Maggi created it in 1884 specifically to give overworked factory women in Switzerland a fast, nutritious meal. It was the original \"convenience food\" — born from a social problem."
    },
    {
        id: 14,
        title: "Two-minute noodles take at least 4 minutes",
        content: "The \"2-minute\" claim refers to cooking time after boiling water. Factor in boiling time and you're looking at 8–10 minutes minimum. The most successful lie in food marketing history."
    },
    {
        id: 15,
        title: "India eats more Maggi than anywhere else on earth",
        content: "India consumes roughly 4.5 billion packs per year — making it by far Maggi's largest market globally, despite a complete nationwide ban in 2015."
    },
    {
        id: 16,
        title: "The 2015 ban made people love it more",
        content: "When India banned Maggi over lead concerns, the country went into genuine mourning. Students stockpiled it. Memes flooded the internet. When it came back 5 months later, it sold out within hours — and recaptured 57% market share within a year."
    },
    {
        id: 17,
        title: "Maggi sauce came before Maggi noodles",
        content: "Most people don't know Maggi started as a liquid seasoning sauce in 1886 — not noodles. The iconic Maggi Sauce (the dark bottle) is older than the noodles by nearly a century."
    },
    {
        id: 18,
        title: "The tastemaker is the real product",
        content: "Blind taste tests consistently show that people enjoy plain boiled noodles significantly more when the Maggi tastemaker is added versus other seasoning packets. Nestlé guards the tastemaker formula like a state secret."
    },
    {
        id: 19,
        title: "Maggi noodles aren't actually noodles",
        content: "Technically they're steamed and dehydrated wheat cakes, not traditional noodles. The \"noodle\" shape is achieved by a specific industrial cutting and drying process — closer to instant ramen than pasta."
    },
    {
        id: 20,
        title: "College hostels run on Maggi economics",
        content: "Studies of Indian hostel food consumption show Maggi accounts for 30–40% of all late-night food purchases in college dormitories — more than any other single food item. It is empirically the fuel of academic survival."
    }
];

const TABS = [
    { key: 'coffee', label: 'Coffee Curiosities', icon: Coffee, facts: coffeeFacts, accent: '#3E2723', light: '#D4AF37' },
    { key: 'maggie', label: 'Magic Maggie', icon: Soup, facts: maggieFacts, accent: '#C62828', light: '#FF8F00' },
];

const FunFacts = () => {
    const [activeTab, setActiveTab] = useState('coffee');
    const tab = TABS.find(t => t.key === activeTab);

    return (
        <div className="min-h-screen bg-[#FFF8E1] pt-20 pb-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">

                {/* Back + Title */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        to="/"
                        className="p-2 hover:bg-[#3E2723]/10 rounded-full transition-colors"
                    >
                        <ArrowLeft className="text-[#3E2723]" />
                    </Link>
                    <h1 className="text-3xl sm:text-4xl font-black text-[#3E2723] font-serif">
                        Fun Facts
                    </h1>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-3 mb-8 p-1.5 bg-white rounded-2xl shadow-sm border border-[#3E2723]/10 w-fit">
                    {TABS.map(t => {
                        const Icon = t.icon;
                        const isActive = activeTab === t.key;
                        return (
                            <button
                                key={t.key}
                                onClick={() => setActiveTab(t.key)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${isActive
                                    ? 'text-white shadow-lg scale-[1.02]'
                                    : 'text-[#5D4037] hover:bg-[#FFF8E1]'
                                    }`}
                                style={isActive ? { backgroundColor: t.accent } : {}}
                            >
                                <Icon size={16} />
                                {t.label}
                            </button>
                        );
                    })}
                </div>

                {/* Facts Grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.25 }}
                        className="grid gap-6 md:grid-cols-2"
                    >
                        {tab.facts.map((fact, index) => {
                            const Icon = tab.icon;
                            return (
                                <motion.div
                                    key={fact.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.06 }}
                                    className="bg-white p-6 rounded-3xl shadow-lg border border-[#3E2723]/5 relative overflow-hidden group"
                                >
                                    <div
                                        className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-12 -mt-12 transition-all duration-500"
                                        style={{ backgroundColor: `${tab.light}1A` }}
                                    />

                                    <div className="flex items-start gap-4 relative z-10">
                                        <div
                                            className="text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 shadow-md"
                                            style={{ backgroundColor: tab.accent }}
                                        >
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

                                    <div
                                        className="absolute bottom-4 right-6 transition-colors"
                                        style={{ color: `${tab.light}33` }}
                                    >
                                        <Icon size={40} strokeWidth={1.5} />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>

                {/* Footer CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 text-center"
                >
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 bg-[#3E2723] text-white px-8 py-4 rounded-full font-black text-lg hover:bg-[#5D4037] transition-all hover:scale-105 shadow-xl"
                    >
                        Back to Home
                    </Link>
                    <p className="mt-4 text-[#8D6E63] font-medium">
                        Your order is being optimized. Hang tight!
                    </p>
                </motion.div>

            </div>
        </div>
    );
};

export default FunFacts;

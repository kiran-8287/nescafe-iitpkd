import React from 'react';
import {
    Zap,
    Wifi,
    Clock,
    Armchair,
    Coffee,
    BookOpen
} from 'lucide-react';

const features = [
    {
        icon: Wifi,
        title: "100 Mbps. No, really.",
        subtitle: "Stream without buffering",
        description: "\"The only thing faster than our coffee service\""
    },
    {
        icon: Zap,
        title: "Charge everything",
        subtitle: "Even your hopes",
        description: "\"Power strips at every table. We promise.\""
    },
    {
        icon: Clock,
        title: "We're open more than the library",
        subtitle: "Late night crunch mode",
        description: "\"Because deadlines don't sleep, neither do we\""
    },
    {
        icon: Armchair,
        title: "Comfy chairs that don't judge",
        subtitle: "Your posture safe zone",
        description: "\"Sit straight or slouch, just be comfortable\""
    },
    {
        icon: Coffee,
        title: "Liquid motivation",
        subtitle: "Caffeine level: Infinite",
        description: "\"Debugging fuel loaded with espresso shots\""
    },
    {
        icon: BookOpen,
        title: "Free knowledge exchange",
        subtitle: "Book swap corner",
        description: "\"Leave a book, take a book, spread wisdom\""
    }
];

const Features = () => {
    return (
        <section className="py-20 bg-[#3E2723] text-[#FFF8E1]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Campus Essentials
                        <span className="text-[#D4AF37]">.init()</span>
                    </h2>
                    <p className="text-xl opacity-90 max-w-2xl mx-auto font-mono">
            // Everything you need to survive the semester
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className="bg-[#4E342E] p-6 rounded-xl hover:bg-[#5D4037] transition-all duration-300 hover:-translate-y-1 group border border-[#5D4037] hover:border-[#D4AF37]"
                            >
                                <div className="mb-4 inline-block p-3 rounded-lg bg-[#3E2723] group-hover:bg-[#D4AF37] transition-colors duration-300">
                                    <Icon className="h-6 w-6 text-[#D4AF37] group-hover:text-[#3E2723]" />
                                </div>

                                <h3 className="text-xl font-bold mb-1">{feature.title}</h3>
                                <p className="text-[#D4AF37] text-sm font-semibold mb-3">{feature.subtitle}</p>
                                <p className="text-gray-300 italic text-sm border-l-2 border-[#8D6E63] pl-3">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Features;

import {
    Clock,
    Armchair,
    Coffee,
    BookOpen
} from 'lucide-react';

const features = [
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
        <section id="features" className="py-12 md:py-20 bg-[#3E2723] text-[#FFF8E1]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8 sm:mb-12 md:mb-16">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                        Campus Essentials
                        <span className="text-[#D4AF37]">.init()</span>
                    </h2>
                    <p className="text-sm sm:text-base md:text-xl opacity-90 max-w-2xl mx-auto font-mono">
            // Everything you need to survive the semester
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className="bg-[#4E342E] p-4 sm:p-5 md:p-6 rounded-xl hover:bg-[#5D4037] transition-all duration-300 hover:-translate-y-1 group border border-[#5D4037] hover:border-[#D4AF37]"
                            >
                                <div className="mb-3 sm:mb-4 inline-block p-2 sm:p-3 rounded-lg bg-[#3E2723] group-hover:bg-[#D4AF37] transition-colors duration-300">
                                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#D4AF37] group-hover:text-[#3E2723]" />
                                </div>

                                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1">{feature.title}</h3>
                                <p className="text-[#D4AF37] text-xs sm:text-sm font-semibold mb-2 sm:mb-3">{feature.subtitle}</p>
                                <p className="text-gray-300 italic text-xs sm:text-sm border-l-2 border-[#8D6E63] pl-3">
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

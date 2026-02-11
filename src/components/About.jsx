import React from 'react';
import { stats } from '../data/mock';
import { Award, Coffee, Users } from 'lucide-react';

const About = () => {
  const statsData = [
    {
      icon: Award,
      value: stats.yearsInBusiness,
      label: 'Years in Business',
      suffix: '+'
    },
    {
      icon: Coffee,
      value: stats.cupsServed,
      label: 'Cups Served',
      suffix: ''
    },
    {
      icon: Users,
      value: stats.happyCustomers,
      label: 'Happy Customers',
      suffix: ''
    }
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-[#3E2723]">
              Our Story
            </h2>
            <div className="w-20 h-1 bg-[#D4AF37]"></div>
            <p className="text-lg text-[#5D4037] leading-relaxed">
              For over a decade, Nescafe Restaurant has been the heart of our community,
              serving premium coffee and creating memorable moments. Our partnership with
              Nescafe ensures every cup is crafted with the finest beans and expertise.
            </p>
            <p className="text-lg text-[#5D4037] leading-relaxed">
              We believe in more than just great coffee – we create an atmosphere where
              friends meet, ideas flourish, and every visit feels like coming home. Our
              skilled baristas pour their passion into every cup, making each experience unique.
            </p>

            <div className="grid grid-cols-3 gap-6 pt-6">
              {statsData.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-3">
                      <IconComponent className="h-10 w-10 text-[#D4AF37]" />
                    </div>
                    <div className="text-3xl font-bold text-[#3E2723] mb-1">
                      {stat.value}{stat.suffix}
                    </div>
                    <div className="text-sm text-[#8D6E63]">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1684006997322-6a5128f44816?q=80&w=800"
                  alt="Café interior"
                  className="rounded-2xl shadow-xl w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                />
                <img
                  src="https://images.unsplash.com/photo-1638882267964-0d9764607947?q=80&w=800"
                  alt="Modern setup"
                  className="rounded-2xl shadow-xl w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="space-y-4 pt-8">
                <img
                  src="https://images.unsplash.com/photo-1648808694138-6706c5efc80a?q=80&w=800"
                  alt="Seating area"
                  className="rounded-2xl shadow-xl w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
                <img
                  src="https://images.unsplash.com/photo-1725859685127-c723ea1d32a1?q=80&w=800"
                  alt="Cozy ambiance"
                  className="rounded-2xl shadow-xl w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-[#D4AF37]/20 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

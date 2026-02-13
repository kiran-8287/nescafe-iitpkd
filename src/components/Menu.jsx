import React, { useState } from 'react';
import { menuItems } from '../data/mock';
import { Search } from 'lucide-react';

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState('Debug Drinks');
  const [searchTerm, setSearchTerm] = useState('');

  const categoryMap = [
    { label: 'All', value: 'All' },
    { label: 'Debug Drinks', value: 'Hot Coffee' },
    { label: 'Byte-Sized Bites', value: 'Snacks' },
    { label: 'Tea.break()', value: 'Desserts' },
    { label: 'Add-Ons & Extras', value: 'Extras' }
  ];

  const filteredItems = menuItems.filter(item => {
    const activeCategory = categoryMap.find(c => c.label === selectedCategory)?.value || 'All';
    const matchesCategory = selectedCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="menu" className="py-12 md:py-20 bg-[#FFF8E1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-[#3E2723] mb-4">
            Fuel Your Everything
          </h2>
          <p className="text-lg text-[#5D4037] max-w-2xl mx-auto font-mono">
            while(alive) &#123; drink(coffee); &#125;
          </p>
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2 justify-center md:pl-8">
            {categoryMap.map((category) => (
              <button
                key={category.label}
                onClick={() => setSelectedCategory(category.label)}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${selectedCategory === category.label
                  ? 'bg-[#3E2723] text-white'
                  : 'bg-white text-[#3E2723] hover:bg-[#8D6E63] hover:text-white'
                  }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8D6E63] h-5 w-5" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border-2 border-[#8D6E63] focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <p className="text-white text-sm">{item.description}</p>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-[#3E2723]">{item.name}</h3>
                  <span className="text-2xl font-bold text-[#D4AF37]">${item.price}</span>
                </div>
                <p className="text-[#8D6E63] text-sm mb-4">{item.category}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-[#8D6E63]">No items found matching your search.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default Menu;

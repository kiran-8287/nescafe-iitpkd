import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { menuItems } from '../data/mock';
import { Search, Plus, Minus, Info, Flame, Leaf, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import ItemBottomSheet from './ItemBottomSheet';
import MenuSkeleton from './MenuSkeleton';

const Menu = ({ onViewFullMenu }) => {
  const { cartItems, addItem, updateQuantity } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Hot Coffee');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [flyingItems, setFlyingItems] = useState([]);

  const categoryContainerRef = useRef(null);
  const categories = ['Hot Coffee', 'Cold Beverages', 'Snacks', 'Desserts'];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const getItemQuantity = (id) => {
    return cartItems.filter(i => i.id === id).reduce((sum, i) => sum + i.quantity, 0);
  };

  const triggerFlyAnimation = (e, imageUrl) => {
    const id = Date.now();
    const startX = e.clientX;
    const startY = e.clientY;
    const endX = window.innerWidth / 2 + 50;
    const endY = window.innerHeight - 40;
    setFlyingItems(prev => [...prev, { id, x: startX, y: startY, imageUrl }]);
    setTimeout(() => {
      setFlyingItems(prev => prev.filter(item => item.id !== id));
    }, 1000);
  };

  const handleUpdateQty = (e, item, newQty) => {
    e.stopPropagation();
    const existingIndex = cartItems.findIndex(i => i.id === item.id);
    if (newQty > getItemQuantity(item.id)) {
      if (existingIndex === -1) {
        addItem(item);
        triggerFlyAnimation(e, item.image);
        toast.success(`${item.name} added!`, { icon: '☕' });
      } else {
        updateQuantity(existingIndex, newQty);
      }
    } else {
      updateQuantity(existingIndex, newQty);
    }
  };

  const filteredItems = menuItems.filter(item =>
    (item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(debouncedSearch.toLowerCase())) &&
    (debouncedSearch !== '' || item.category === activeCategory)
  );

  const renderBadge = (badge) => {
    switch (badge?.toLowerCase()) {
      case 'bestseller': return <span className="flex items-center bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"><Star size={10} className="mr-1 fill-current" /> Bestseller</span>;
      case 'new': return <span className="flex items-center bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"><Flame size={10} className="mr-1 fill-current" /> New</span>;
      case 'fresh': return <span className="flex items-center bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"><Leaf size={10} className="mr-1 fill-current" /> Fresh</span>;
      default: return null;
    }
  };

  return (
    <section id="menu" className="py-12 md:py-20 bg-[#FFF8E1] min-h-[600px] pb-24 relative overflow-hidden">
      {/* Fly-to-Cart Overlay */}
      <AnimatePresence>
        {flyingItems.map(item => (
          <motion.div
            key={item.id}
            initial={{ x: item.x - 20, y: item.y - 20, scale: 1, opacity: 1 }}
            animate={{
              x: [item.x - 20, item.x + 50, window.innerWidth / 2 + 50],
              y: [item.y - 20, item.y - 100, window.innerHeight - 40],
              scale: [1, 1.2, 0.2],
              opacity: [1, 1, 0]
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed pointer-events-none z-[100] w-12 h-12 rounded-full border-4 border-white shadow-2xl overflow-hidden"
          >
            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#3E2723] mb-3 uppercase tracking-tighter">
            Choose Your Vibes
          </h2>
          <p className="text-[#5D4037] font-mono text-xs sm:text-sm">
            // selection is the key to happiness
          </p>
        </div>

        {isLoading ? (
          <MenuSkeleton />
        ) : (
          <>
            <div className="sticky top-16 z-30 bg-[#FFF8E1]/95 backdrop-blur-md py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search current selection..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border-2 border-transparent focus:border-[#D4AF37] rounded-2xl py-3 pl-12 pr-4 shadow-md transition-all outline-none"
                />
              </div>

              <div ref={categoryContainerRef} className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide snap-x items-center">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`snap-center px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-300 border-2 ${activeCategory === cat
                      ? 'bg-[#3E2723] border-[#3E2723] text-white shadow-lg'
                      : 'bg-white border-gray-100 text-[#3E2723] hover:border-[#D4AF37]'
                      }`}
                  >
                    {cat}
                  </button>
                ))}

                <div className="h-8 w-[2px] bg-gray-200 mx-2 flex-shrink-0" />

                <button
                  onClick={onViewFullMenu}
                  className="snap-center px-6 py-2 rounded-full font-black text-sm whitespace-nowrap transition-all duration-300 border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#3E2723] flex items-center gap-2"
                >
                  FULL MENU <Star size={12} className="fill-current" />
                </button>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center gap-4 mb-6">
                <h3 className="text-xl sm:text-2xl font-black text-[#3E2723] uppercase tracking-tighter">
                  {debouncedSearch !== '' ? 'Search Results' : activeCategory}
                </h3>
                <div className="h-0.5 flex-1 bg-gradient-to-r from-[#D4AF37]/30 to-transparent"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredItems.map((item) => {
                  const qty = getItemQuantity(item.id);
                  return (
                    <div key={item.id} onClick={() => { setSelectedItem(item); setIsSheetOpen(true); }} className="bg-white rounded-3xl p-3 sm:p-4 flex gap-4 shadow-sm hover:shadow-xl transition-all border border-gray-50 group relative cursor-pointer active:scale-[0.98]">
                      <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        {item.isVeg && <div className="absolute top-2 left-2 bg-white/90 p-1 rounded-md border border-green-500"><div className="w-2 h-2 rounded-full bg-green-500"></div></div>}
                      </div>
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-[#3E2723] text-base sm:text-lg truncate">{item.name}</h4>
                            {renderBadge(item.badge)}
                          </div>
                          <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-2">{item.description}</p>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-lg sm:text-xl font-black text-[#3E2723]">₹{item.price}</span>
                          {qty === 0 ? (
                            <button onClick={(e) => { if (window.navigator.vibrate) window.navigator.vibrate(15); handleUpdateQty(e, item, 1); }} className="bg-white border-2 border-[#D4AF37] text-[#3E2723] font-bold px-6 py-1.5 rounded-xl hover:bg-[#D4AF37] transition-all shadow-sm active:scale-95">ADD</button>
                          ) : (
                            <div className="flex items-center bg-[#3E2723] text-white rounded-xl p-1 shadow-md">
                              <button onClick={(e) => { if (window.navigator.vibrate) window.navigator.vibrate(10); handleUpdateQty(e, item, qty - 1); }} className="p-1 hover:bg-white/10 rounded-lg transition-colors"><Minus size={18} /></button>
                              <span className="w-8 text-center font-bold text-sm">{qty}</span>
                              <button onClick={(e) => { if (window.navigator.vibrate) window.navigator.vibrate(10); handleUpdateQty(e, item, qty + 1); }} className="p-1 hover:bg-white/10 rounded-lg transition-colors"><Plus size={18} /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* View Full Menu CTA */}
              {debouncedSearch === '' && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={onViewFullMenu}
                    className="flex items-center gap-3 bg-[#3E2723] text-white px-8 py-4 rounded-full font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 group"
                  >
                    <span>VIEW ALL ITEMS</span>
                    <Star size={20} className="text-[#D4AF37] fill-[#D4AF37] group-hover:rotate-180 transition-transform duration-500" />
                  </button>
                </div>
              )}

              {filteredItems.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                  <Search size={48} className="text-gray-200 mx-auto mb-4" />
                  <p className="text-xl font-bold text-[#3E2723]">No items here!</p>
                  <p className="text-gray-400 text-sm mt-1">Maybe try the "Full Menu" for more options?</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <ItemBottomSheet item={selectedItem} isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default Menu;
